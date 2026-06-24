const isLocalhost =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

export const ADSENSE_CONFIG = {
  publisherId: "ca-pub-6315496314477761",

  adUnits: {
    banner: "6779975428",
    sidebar: "6779975428",
    inArticle: "6779975428",
  },

  enabled: !isLocalhost,

  testEmails: ["saqibbostan83@gmail.com"],
};

/*
  ⚠️ All ad units currently use the same slot ID "6779975428".
  For proper monetization, create distinct ad units in Google AdSense:
    - Banner: 6779975428 (already created)
    - Sidebar: Create new → update sidebar slot ID
    - In-Article: Create new → update inArticle slot ID
    - In-Feed: Create new → add to config
*/

