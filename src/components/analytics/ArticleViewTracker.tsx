"use client";

import {
  useEffect,
} from "react";


export function ArticleViewTracker({
  slug,
}: {
  slug: string;
}) {
  useEffect(() => {
    const params =
      new URLSearchParams(
        window.location.search
      );

    const payload = {
      slug,
      referrer:
        document.referrer ||
        null,
      utmSource:
        params.get(
          "utm_source"
        ),
      utmMedium:
        params.get(
          "utm_medium"
        ),
      utmCampaign:
        params.get(
          "utm_campaign"
        ),
    };


    void fetch(
      "/api/analytics/article-view",
      {
        method:
          "POST",

        headers: {
          "content-type":
            "application/json",
        },

        body:
          JSON.stringify(
            payload
          ),

        keepalive:
          true,
      }
    ).catch(
      () => {
        /*
         * Analytics must never interrupt
         * the reading experience.
         */
      }
    );
  }, [
    slug,
  ]);


  return null;
}
