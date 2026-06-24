"use client";

import Script from "next/script";

interface AdBannerProps {
  className?: string;
  slot?: string;
}

export default function AdBanner({ className }: AdBannerProps) {
  return (
    <>
      <div className={`w-full flex justify-center py-4 ${className || ""}`}>
        <div id="container-0ca87c6725efd36f0ac4fa29a35bfc55" />
      </div>
      <Script
        src="https://pl29885130.effectivecpmnetwork.com/0c/a8/7c/0ca87c6725efd36f0ac4fa29a35bfc55.js"
        strategy="afterInteractive"
        data-cfasync="false"
      />
    </>
  );
}
