"use client";

import { useEffect } from "react";

/**
 * @deprecated Client-side title/description mutation is no longer needed and
 * caused title instability (server title flipped after hydration). Every route
 * now provides its title, description, canonical and Open Graph tags in the
 * server HTML via `buildMetadata` (src/lib/seo.ts), which is what search
 * engines and link unfurlers read. Kept as a no-op so existing call sites
 * keep compiling without touching tool components.
 */
export function usePageMeta(_title: string, _description: string) {
  useEffect(() => {
    /* intentionally empty — see comment above */
  }, []);
}
