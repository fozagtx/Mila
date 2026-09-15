"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";
import { Mascot } from "page-mascot";

//  0ms  lockup is on screen, wordmark already readable
//  0ms  mascot springs in beside Mila
// 720ms she blinks once, delighted you showed up

const TIMING = {
  welcomeBoopMs: 720,
} as const;

export function PageMascot() {
  const reduce = useReducedMotion();
  const lockupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reduce) return;
    const id = window.setTimeout(() => {
      lockupRef.current?.querySelector("button")?.click();
    }, TIMING.welcomeBoopMs);
    return () => window.clearTimeout(id);
  }, [reduce]);

  return (
    <div ref={lockupRef} className="flex items-center gap-2.5">
      <div className="mascot-stage shrink-0">
        <div className="mascot-idle">
          <Mascot
            directions="/mascots/ballerina-directions.webp"
            reactions="/mascots/ballerina-reactions.webp"
            size={72}
            label="Mila"
            className="focus-ring rounded-full motion-safe:transition-transform motion-safe:duration-150 motion-safe:ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-[1.05] active:scale-[0.97]"
          />
        </div>
      </div>
      <div className="min-w-0">
        <h1 className="font-display text-[1.85rem] italic leading-none tracking-tight text-navy md:text-[2rem]">
          Mila
        </h1>
        <p className="mt-1 text-sm leading-snug text-navy">
          An AI employee for negotiating your deals.
        </p>
      </div>
    </div>
  );
}
