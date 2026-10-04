"use client";

import {
  useEffect,
  useRef,
} from "react";

import type {
  ReactNode,
} from "react";


export function ProductImpressionTracker({
  articleSlug,
  productId,
  placementKey,
  placementType,
  position,
  children,
}: {
  articleSlug:
    string;

  productId:
    string;

  placementKey:
    string;

  placementType:
    "single" |
    "grid";

  position:
    number;

  children:
    ReactNode;
}) {
  const elementRef =
    useRef<HTMLDivElement | null>(
      null
    );

  const sentRef =
    useRef(
      false
    );


  useEffect(() => {
    const element =
      elementRef.current;

    if (
      !element ||
      sentRef.current
    ) {
      return;
    }


    let visibilityTimer:
      ReturnType<typeof setTimeout> |
      null =
        null;


    const sendImpression =
      () => {
        if (
          sentRef.current
        ) {
          return;
        }

        sentRef.current =
          true;

        const params =
          new URLSearchParams(
            window.location.search
          );

        void fetch(
          "/api/analytics/product-impression",
          {
            method:
              "POST",

            headers: {
              "content-type":
                "application/json",
            },

            body:
              JSON.stringify({
                articleSlug,
                productId,
                placementKey,
                placementType,
                position,
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
              }),

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
      };


    const observer =
      new IntersectionObserver(
        (
          entries
        ) => {
          const entry =
            entries[0];

          if (
            entry.isIntersecting &&
            entry.intersectionRatio >=
              0.5
          ) {
            if (
              visibilityTimer
            ) {
              clearTimeout(
                visibilityTimer
              );
            }

            visibilityTimer =
              setTimeout(
                sendImpression,
                500
              );
          } else if (
            visibilityTimer
          ) {
            clearTimeout(
              visibilityTimer
            );

            visibilityTimer =
              null;
          }
        },
        {
          threshold: [
            0,
            0.5,
            1,
          ],
        }
      );


    observer.observe(
      element
    );


    return () => {
      observer.disconnect();

      if (
        visibilityTimer
      ) {
        clearTimeout(
          visibilityTimer
        );
      }
    };
  }, [
    articleSlug,
    productId,
    placementKey,
    placementType,
    position,
  ]);


  return (
    <div ref={elementRef}>
      {children}
    </div>
  );
}
