export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-[var(--foreground)] mb-6">Privacy Policy</h1>
      <div className="text-sm text-[var(--muted)] space-y-5 leading-relaxed">

        <h2 className="text-lg font-semibold text-[var(--foreground)] pt-2">1. File Processing (100% Client-Side)</h2>
        <p>
          PDFTools processes all files entirely in your browser using <strong>pdf-lib</strong> and <strong>WebAssembly</strong>.
          Files are <strong>never uploaded</strong> to any server. All reading, editing, and rendering happens locally on your device.
        </p>
        <p>
          Your documents never leave your computer. We cannot access, view, store, or retrieve any file you process.
          Once you close the page or download the result, the data is gone from browser memory.
        </p>

        <h2 className="text-lg font-semibold text-[var(--foreground)] pt-2">2. Data Retention</h2>
        <p>
          We do not collect, store, or retain any user files. No uploads means no data to delete.
          No logs of file content are kept. The only data we track is anonymous usage counts (e.g.,
          &quot;total files processed&quot;) for our live stats counter.
        </p>

        <h2 className="text-lg font-semibold text-[var(--foreground)] pt-2">3. Personal Information</h2>
        <p>
          We do not require accounts or signups. We do not collect names, email addresses, or
          any personally identifiable information unless you voluntarily subscribe to our email
          newsletter (via Buttondown) — and even then, we only store your email for sending
          tool updates.
        </p>
        <p>
          Premium subscribers&apos; email addresses are stored securely via Upstash Redis (our KV
          database) solely for the purpose of verifying premium status. Payment data is handled
          entirely by Lemon Squeezy — we never see or store credit card details.
        </p>

        <h2 className="text-lg font-semibold text-[var(--foreground)] pt-2">4. Cookies & Tracking</h2>
        <p>
          We use <strong>Google AdSense</strong> to serve ads. AdSense may use cookies for
          personalized advertising based on your browsing history. You can manage ad preferences
          at <a href="https://adssettings.google.com" className="text-indigo-500 underline" target="_blank" rel="noopener noreferrer">Google&apos;s Ad Settings</a>.
        </p>
        <p>
          We also use <strong>Google Analytics (GA4)</strong> for anonymous usage analytics
          (page views, tool usage). This data helps us improve the site. No file content or
          personal data is sent to analytics.
        </p>
        <p>
          A <strong>client ID</strong> (random UUID) is stored in your browser&apos;s localStorage
          to track daily usage limits. This ID is anonymous and contains no personal information.
          Premium status is also stored in localStorage for fast display.
        </p>
        <p>
          No essential cookies are required for the core PDF tools to function.
        </p>

        <h2 className="text-lg font-semibold text-[var(--foreground)] pt-2">5. Chat with PDF &amp; AI Features</h2>
        <p>
          Our Chat with PDF and AI OCR features send <strong>extracted text or page images</strong> to
          Google&apos;s Gemini API for processing. The original PDF file is never transmitted — only
          the text content (or rendered page images for OCR) that already exists in your browser.
        </p>
        <p>
          AI responses are generated in real-time and not stored. We track anonymous usage counts
          (questions asked per day) via Upstash Redis to enforce free-tier limits. No conversation
          history is retained on our servers.
        </p>

        <h2 className="text-lg font-semibold text-[var(--foreground)] pt-2">6. User Feedback</h2>
        <p>
          If you submit feedback via our feedback form, your name, role, rating, and comments are
          stored in Upstash Redis and displayed publicly on the homepage. No email or contact
          information is collected. You can request removal by emailing us.
        </p>

        <h2 className="text-lg font-semibold text-[var(--foreground)] pt-2">7. Third-Party Services</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>Vercel</strong> — Hosting and CDN. May capture standard server logs (IP, user agent, timestamps).</li>
          <li><strong>Upstash Redis</strong> — Serverless KV store for premium verification and usage counters.</li>
          <li><strong>Lemon Squeezy</strong> — Payment processing for premium subscriptions.</li>
          <li><strong>Buttondown</strong> — Email newsletter delivery.</li>
          <li><strong>Adsterra</strong> — Native banner ads (effectivecpmnetwork.com). May use cookies for ad targeting.</li>
          <li><strong>Gemini API (Google AI)</strong> — Used for Chat with PDF and AI OCR features. Only the text you explicitly submit or extracted page images are sent to Google&apos;s API for processing. No raw PDF files are transmitted.</li>
        </ul>

        <h2 className="text-lg font-semibold text-[var(--foreground)] pt-2">8. Your Rights</h2>
        <p>
          You have the right to request deletion of any data associated with your client ID or
          email. Contact us at saqibbostan83@gmail.com and we will respond within 7 days.
        </p>

        <h2 className="text-lg font-semibold text-[var(--foreground)] pt-2">9. Contact</h2>
        <p>
          For privacy questions or concerns, email <strong>saqibbostan83@gmail.com</strong>.
        </p>

        <p className="text-xs text-[var(--muted)] pt-4 border-t border-[var(--card-border)]">
          Last updated: June 2026
        </p>
      </div>
    </div>
  );
}
