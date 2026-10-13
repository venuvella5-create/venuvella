"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";

/**
 * Impact (impact.com) Universal Tracking Tag, as supplied by the Adidas
 * affiliate program. It is loaded on public pages only (never in the admin).
 *
 * To turn it off, remove <ImpactTracking /> from src/app/layout.tsx.
 */
const IMPACT_TAG_URL =
  "https://utt.impactcdn.com/P-A7942752-13ff-4cfa-9050-cac29421adb61.js";

const SNIPPET = `(function(i,m,p,a,c,t){c.ire_o=p;c[p]=c[p]||function(){(c[p].a=c[p].a||[]).push(arguments)};t=a.createElement(m);var z=a.getElementsByTagName(m)[0];t.async=1;t.src=i;z.parentNode.insertBefore(t,z)})('${IMPACT_TAG_URL}','script','impactStat',document,window);impactStat('transformLinks');impactStat('trackImpression');`;

export function ImpactTracking() {
  const pathname = usePathname();

  if (pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <Script
      id="impact-utt"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{ __html: SNIPPET }}
    />
  );
}
