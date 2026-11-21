/**
 * Site-wide factual constants.
 *
 * Every count shown to users or search engines (tool totals, trial files, file
 * limits, ad policy) must be derived from here — never hard-coded in a page.
 * `src/__tests__/siteFacts.test.ts` guards the values against drift.
 */
import { FREE_TOOL_COUNT, PREMIUM_TOOL_COUNT } from "./toolCatalog";

/** Number of free, unlimited core PDF tools (derived from the tool catalog). */
export const CORE_TOOL_COUNT = FREE_TOOL_COUNT;

/** Number of professional / Premium tools (derived from the tool catalog). */
export const PROFESSIONAL_TOOL_COUNT = PREMIUM_TOOL_COUNT;

/** Core + professional, i.e. every advertised tool route. */
export const TOTAL_TOOL_COUNT = CORE_TOOL_COUNT + PROFESSIONAL_TOOL_COUNT;

/** Free-plan per-file limit, formatted for copy. */
export const FREE_FILE_LIMIT_LABEL = "10MB";

/** Premium per-file limit, formatted for copy. */
export const PREMIUM_FILE_LIMIT_LABEL = "100MB";

/**
 * Advertising policy — the site serves no advertising and loads no ad-network
 * scripts. Copy on pricing cards, footers and FAQs must say this consistently.
 */
export const AD_POLICY = {
  servesAds: false,
  /** Short claim used in feature lists and badges. */
  claim: "Zero advertising, zero third-party ad scripts",
  /** Longer claim used on pricing cards. */
  pricingClaim: "100% Privacy-First & Zero Ad Tracking",
} as const;

/** Standard footer trust line, rendered on every page by `Footer`. */
export const FOOTER_PRIVACY_LINE =
  "No advertising, no third-party ad scripts, and no ad tracking. Core PDF tools run 100% client-side in your browser — files are never uploaded to our servers.";

/** Shortest accurate tool-count sentence used in metadata descriptions. */
export const TOOL_COUNT_SENTENCE =
  `${CORE_TOOL_COUNT} free core PDF tools and ${PROFESSIONAL_TOOL_COUNT} professional tools`;
