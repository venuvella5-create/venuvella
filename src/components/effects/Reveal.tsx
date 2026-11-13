"use client";

import { useLayoutEffect, useRef } from "react";

export type RevealDirection = "left" | "right" | "up" | "down";

/**
 * Slides and fades its content in from a chosen direction the first time it
 * scrolls into view. Content that is already on screen when the page opens
 * is left alone, and visitors who prefer reduced motion see no animation.
 * Without JavaScript the content is simply visible.
 *
 * The animation itself is in globals.css ([data-reveal]).
 */
export function Reveal({
  children,
  direction = "up",
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  direction?: RevealDirection;
  /** Milliseconds to wait before starting (use it to stagger a row). */
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const element = ref.current;

    if (
      !element ||
      typeof IntersectionObserver === "undefined" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    // Already visible on arrival: no need to hide it and bring it back.
    if (element.getBoundingClientRect().top < window.innerHeight) {
      return;
    }

    element.dataset.reveal = "hidden";

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          element.dataset.reveal = "shown";
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={ref}
      data-direction={direction}
      style={{ "--reveal-delay": `${delay}ms` } as React.CSSProperties}
      className={className}
    >
      {children}
    </div>
  );
}
