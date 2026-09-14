"use client";

import { Mascot } from "page-mascot";

export function PageMascot() {
  return (
    <Mascot
      directions="/mascots/ballerina-directions.webp"
      reactions="/mascots/ballerina-reactions.webp"
      size={120}
      label="Mila"
      className="focus-ring rounded-full"
    />
  );
}
