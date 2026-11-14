"use client";

import React from "react";
import { useSlipImage } from "../hooks/useSlipImage";

/** Small slip thumbnail; protected slips are loaded with the user's token. */
export function SlipThumb({ url, className = "h-7 w-7" }: { url: string; className?: string }) {
  const { src } = useSlipImage(url);
  if (!src) {
    return <span className={`${className} inline-block rounded bg-neutral-100 border border-neutral-100 flex-shrink-0 animate-pulse`} />;
  }
  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src={src}
      alt="Slip"
      className={`${className} rounded object-cover border border-neutral-100 flex-shrink-0`}
      onError={(e) => {
        (e.currentTarget as HTMLElement).style.display = "none";
      }}
    />
  );
}
