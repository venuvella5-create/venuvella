import Image from "next/image";

/**
 * Venuvella logo: the emblem next to the wordmark.
 * The emblem uses a deeper bronze than the gold on the dark brand artwork,
 * so it stays readable on the site's light background.
 * (For dark backgrounds use /logo-mark.png or /logo-full-gold.png.)
 */
export function Logo() {
  return (
    <span className="inline-flex items-center gap-3">
      <Image
        src="/logo-mark-light.png"
        alt=""
        width={144}
        height={146}
        priority
        className="h-9 w-auto"
      />

      <span className="tracking-[0.22em] text-[15px] font-semibold">
        VENUVELLA
      </span>
    </span>
  );
}
