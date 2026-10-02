"use server";



import dns from "node:dns/promises";

import net from "node:net";



import { revalidatePath } from "next/cache";



import { prisma } from "@/lib/db/prisma";
import { requireAdminSession } from "@/lib/auth/require-admin";





const REQUEST_TIMEOUT_MS =

  8000;



const MAX_REDIRECTS =

  5;



const CONCURRENCY =

  5;





type HealthResult =

  | "SUCCESS"

  | "FAILED"

  | "STALE";





function isValidHttpUrl(

  value: string | null

) {

  if (!value) {

    return false;

  }





  try {

    const url =

      new URL(value);



    return (

      url.protocol === "http:" ||

      url.protocol === "https:"

    );

  } catch {

    return false;

  }

}





function isPrivateIpv4(

  ip: string

) {

  const parts =

    ip

      .split(".")

      .map(Number);





  if (parts.length !== 4) {

    return true;

  }





  const [

    a,

    b,

  ] = parts;





  if (a === 10) {

    return true;

  }





  if (

    a === 127

  ) {

    return true;

  }





  if (

    a === 169 &&

    b === 254

  ) {

    return true;

  }





  if (

    a === 172 &&

    b >= 16 &&

    b <= 31

  ) {

    return true;

  }





  if (

    a === 192 &&

    b === 168

  ) {

    return true;

  }





  if (

    a === 100 &&

    b >= 64 &&

    b <= 127

  ) {

    return true;

  }





  if (

    a === 0

  ) {

    return true;

  }





  return false;

}





function isPrivateIpv6(

  ip: string

) {

  const normalized =

    ip.toLowerCase();





  if (

    normalized === "::1" ||

    normalized === "::"

  ) {

    return true;

  }





  if (

    normalized.startsWith(

      "fc"

    ) ||

    normalized.startsWith(

      "fd"

    )

  ) {

    return true;

  }





  if (

    normalized.startsWith(

      "fe8"

    ) ||

    normalized.startsWith(

      "fe9"

    ) ||

    normalized.startsWith(

      "fea"

    ) ||

    normalized.startsWith(

      "feb"

    )

  ) {

    return true;

  }





  /*

   * IPv4-mapped IPv6.

   */



  if (

    normalized.startsWith(

      "::ffff:"

    )

  ) {

    const ipv4 =

      normalized.replace(

        "::ffff:",

        ""

      );



    return isPrivateIpv4(

      ipv4

    );

  }





  return false;

}





function isPrivateIp(

  ip: string

) {

  const version =

    net.isIP(ip);





  if (version === 4) {

    return isPrivateIpv4(

      ip

    );

  }





  if (version === 6) {

    return isPrivateIpv6(

      ip

    );

  }





  return true;

}





async function assertSafeDestination(

  url: URL

) {

  if (

    url.protocol !==

      "http:" &&

    url.protocol !==

      "https:"

  ) {

    throw new Error(

      "Unsupported protocol"

    );

  }





  const hostname =

    url.hostname

      .toLowerCase()

      .replace(

        /^\[|\]$/g,

        ""

      );





  /*

   * Block obvious local/internal hosts.

   */



  if (

    hostname ===

      "localhost" ||

    hostname.endsWith(

      ".localhost"

    ) ||

    hostname.endsWith(

      ".local"

    ) ||

    hostname ===

      "0.0.0.0"

  ) {

    throw new Error(

      "Private destination blocked"

    );

  }





  /*

   * If hostname itself is an IP,

   * validate it directly.

   */



  if (

    net.isIP(hostname)

  ) {

    if (

      isPrivateIp(

        hostname

      )

    ) {

      throw new Error(

        "Private IP blocked"

      );

    }



    return;

  }





  /*

   * Resolve hostname and reject it if

   * any address points to a private or

   * local network.

   */



  const addresses =

    await dns.lookup(

      hostname,

      {

        all: true,

        verbatim: true,

      }

    );





  if (

    addresses.length === 0

  ) {

    throw new Error(

      "Hostname did not resolve"

    );

  }





  for (

    const address

    of addresses

  ) {

    if (

      isPrivateIp(

        address.address

      )

    ) {

      throw new Error(

        "Private network destination blocked"

      );

    }

  }

}





function classifyStatusCode(

  status: number

): HealthResult {

  /*

   * Normal success.

   */



  if (

    status >= 200 &&

    status < 400

  ) {

    return "SUCCESS";

  }





  /*

   * These often mean the merchant exists

   * but blocks automated requests.

   */



  if (

    status === 401 ||

    status === 403 ||

    status === 405 ||

    status === 429

  ) {

    return "SUCCESS";

  }





  /*

   * Strong indication that the destination

   * itself is gone.

   */



  if (

    status === 404 ||

    status === 410

  ) {

    return "FAILED";

  }





  /*

   * Server errors are often temporary.

   */



  if (

    status >= 500

  ) {

    return "STALE";

  }





  return "STALE";

}





async function fetchWithSafety(

  initialUrl: string,

  method:

    | "HEAD"

    | "GET"

): Promise<HealthResult> {

  let currentUrl =

    new URL(

      initialUrl

    );





  for (

    let redirectCount = 0;

    redirectCount <=

      MAX_REDIRECTS;

    redirectCount++

  ) {

    await assertSafeDestination(

      currentUrl

    );





    const controller =

      new AbortController();





    const timeout =

      setTimeout(

        () => {

          controller.abort();

        },

        REQUEST_TIMEOUT_MS

      );





    try {

      const response =

        await fetch(

          currentUrl.toString(),

          {

            method,



            redirect:

              "manual",



            signal:

              controller.signal,



            headers: {

              "User-Agent":

                "Venuvella-Link-Health/1.0",



              Accept:

                "text/html,application/xhtml+xml,*/*;q=0.8",



              ...(method ===

              "GET"

                ? {

                    Range:

                      "bytes=0-1024",

                  }

                : {}),

            },



            cache:

              "no-store",

          }

        );





      /*

       * Handle redirects ourselves so

       * every redirect destination receives

       * the same SSRF/private-network checks.

       */



      if (

        response.status >=

          300 &&

        response.status <

          400

      ) {

        const location =

          response.headers.get(

            "location"

          );





        if (!location) {

          return "STALE";

        }





        currentUrl =

          new URL(

            location,

            currentUrl

          );





        continue;

      }





      return classifyStatusCode(

        response.status

      );



    } finally {



      clearTimeout(

        timeout

      );



    }

  }





  /*

   * Excessive redirect chains are suspicious

   * or broken.

   */



  return "FAILED";

}





async function checkLiveUrl(

  url: string

): Promise<HealthResult> {

  try {

    /*

     * HEAD first because it avoids downloading

     * the merchant page when supported.

     */



    const headResult =

      await fetchWithSafety(

        url,

        "HEAD"

      );





    /*

     * If HEAD produced a clear result,

     * use it.

     */



    if (

      headResult ===

      "SUCCESS" ||

      headResult ===

      "FAILED"

    ) {

      return headResult;

    }





    /*

     * Some providers do not respond properly

     * to HEAD requests. Perform a small GET

     * as a fallback.

     */



    return await fetchWithSafety(

      url,

      "GET"

    );



  } catch (error) {



    /*

     * Network errors, DNS failures and

     * timeouts may be temporary.

     *

     * They become STALE rather than FAILED.

     */



    console.warn(

      "Provider health check failed:",

      url,

      error instanceof Error

        ? error.message

        : error

    );





    return "STALE";

  }

}





async function processInBatches<T>(

  items: T[],

  worker: (

    item: T

  ) => Promise<void>

) {

  for (

    let index = 0;

    index <

    items.length;

    index +=

      CONCURRENCY

  ) {

    const batch =

      items.slice(

        index,

        index +

          CONCURRENCY

      );





    await Promise.all(

      batch.map(

        worker

      )

    );

  }

}





export async function runProviderHealthCheck(): Promise<void> {

    await requireAdminSession();

const mappings =

    await prisma.providerProduct.findMany({

      include: {

        provider: {

          select: {

            status: true,

          },

        },

      },

    });





  const now =

    new Date();





  /*

   * Check mappings in small batches so

   * we do not send a large burst of

   * requests at once.

   */



  await processInBatches(

    mappings,



    async (

      mapping

    ) => {

      const affiliateUrl =

        isValidHttpUrl(

          mapping.affiliateUrl

        )

          ? mapping.affiliateUrl

          : null;





      const productUrl =

        isValidHttpUrl(

          mapping.productUrl

        )

          ? mapping.productUrl

          : null;





      /*

       * No valid destination means this

       * mapping is definitely unusable.

       */



      if (

        !affiliateUrl &&

        !productUrl

      ) {

        await prisma.providerProduct.update({

          where: {

            id:

              mapping.id,

          },



          data: {

            syncStatus:

              "FAILED",



            lastSyncedAt:

              now,

          },

        });



        return;

      }





      /*

       * Do not make live requests for an

       * intentionally inactive provider.

       */



      if (

        mapping.provider

          .status ===

        "INACTIVE"

      ) {

        await prisma.providerProduct.update({

          where: {

            id:

              mapping.id,

          },



          data: {

            syncStatus:

              "STALE",



            lastSyncedAt:

              now,

          },

        });



        return;

      }





      /*

       * Prefer the affiliate URL because that

       * is the actual monetization destination.

       *

       * If none exists, test productUrl.

       */



      const destination =

        affiliateUrl ??

        productUrl;





      if (!destination) {

        return;

      }





      const result =

        await checkLiveUrl(

          destination

        );





      await prisma.providerProduct.update({

        where: {

          id:

            mapping.id,

        },



        data: {

          syncStatus:

            result,



          lastSyncedAt:

            now,

        },

      });

    }

  );





  /*

   * Refresh admin screens.

   */



  revalidatePath(

    "/admin/affiliate-ops"

  );





  revalidatePath(

    "/admin/products"

  );





  revalidatePath(

    "/admin/providers"

  );

}