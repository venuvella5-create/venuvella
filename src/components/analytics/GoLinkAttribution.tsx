"use client";

import { useEffect } from "react";

const TRACKING_KEYS = [
  "article",
  "placement",
  "campaign",
  "utm_source",
  "utm_medium",
  "utm_campaign",
];

/**
 * Keeps product pages fast.
 *
 * Product pages are cached and served instantly, so they can't read the
 * visitor's address-bar parameters (?article=..., ?utm_source=...) on the
 * server. Instead, once the page has loaded, this copies those tracking
 * parameters onto every "/go/..." buy link so attribution still works.
 */
export function GoLinkAttribution() {
  useEffect(() => {
    const incoming = new URLSearchParams(window.location.search);
    const extra = new URLSearchParams();

    for (const key of TRACKING_KEYS) {
      const value = incoming.get(key);
      if (value) extra.set(key, value);
    }

    if (extra.size === 0) return;

    document
      .querySelectorAll<HTMLAnchorElement>('a[href^="/go/"]')
      .forEach((link) => {
        const url = new URL(link.getAttribute("href") ?? "", window.location.origin);
        extra.forEach((value, key) => url.searchParams.set(key, value));
        link.setAttribute("href", `${url.pathname}${url.search}`);
      });
  }, []);

  return null;
}
