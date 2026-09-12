"use client";

import RecipeRunner from "@/components/RecipeRunner";
import SoftwareAppJsonLd from "@/components/SoftwareAppJsonLd";
import HowToJsonLd from "@/components/HowToJsonLd";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import FaqPageJsonLd from "@/components/FaqPageJsonLd";
import ToolInfo from "@/components/ToolInfo";

const recipesFaqs = [
  {
    question: "What are PDF Recipes?",
    answer: "PDF Recipes are multi-step macro automation sequences. Instead of manually applying watermarks, page numbers, PII redactions, and compression in 4 separate tools, a recipe executes all operations sequentially in 1 click.",
  },
  {
    question: "Can I create custom automation workflows?",
    answer: "Yes! Use the Custom Recipe Builder tab to select your own sequence of operations, give it a name, and save it directly in your browser for recurring daily tasks.",
  },
  {
    question: "Do files get uploaded to the cloud when executing macros?",
    answer: "No. All recipe steps execute client-side inside your browser using WebAssembly and high-performance PDF manipulation libraries. Your confidential files stay on your machine.",
  },
];

export default function RecipesPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <SoftwareAppJsonLd
        name="PDF Recipes - 1-Click Multi-Step PDF Macro Automations"
        description="The Zapier for PDFs. Execute multi-step chained PDF workflows (redact, bates stamp, watermark, flatten, compress) in 1 click."
        url="https://allaboutpdfediting.xyz/recipes"
      />
      <HowToJsonLd
        name="Run Multi-Step PDF Recipes"
        description="Execute chained PDF operations in 1 click"
        steps={[
          { name: "Pick Recipe", text: "Choose a pre-built industry recipe (Court E-Filing, Executive Signoff) or build a custom macro" },
          { name: "Upload Files", text: "Select your PDF document" },
          { name: "Execute Chained Pipeline", text: "Click Run Recipe to execute all operations sequentially without re-uploading" },
        ]}
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", item: "https://allaboutpdfediting.xyz" },
          { name: "PDF Recipes", item: "https://allaboutpdfediting.xyz/recipes" },
        ]}
      />
      <FaqPageJsonLd questions={recipesFaqs} />

      <div className="mb-8 text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-extrabold uppercase tracking-wider mb-4 shadow-sm">
          <span>⚡</span> The &quot;Zapier for PDFs&quot;
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--foreground)] tracking-tight mb-3">
          1-Click PDF Automation Recipes
        </h1>
        <p className="text-sm sm:text-base text-[var(--muted)]">
          Chain repetitive operations (Bates stamping, PII redaction, watermarking, flattening, &amp; compression) into instant 1-click workflows.
        </p>
      </div>

      <ToolInfo
        name="PDF Recipes &amp; Macros"
        description="Why repeat the same 4 steps manually? Choose a pre-built legal, corporate, or academic recipe or create custom macro sequences that execute in seconds locally."
      />

      <div className="my-10">
        <RecipeRunner />
      </div>

      {/* Feature matrix */}
      <div className="mt-16 pt-12 border-t border-[var(--card-border)] space-y-8">
        <div className="text-center max-w-xl mx-auto">
          <h2 className="text-2xl font-extrabold text-[var(--foreground)] mb-2">
            Automate Hours of Tedious PDF Prep
          </h2>
          <p className="text-xs sm:text-sm text-[var(--muted)]">
            Designed for paralegals, finance analysts, executive assistants, and university researchers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-6 rounded-3xl border border-[var(--card-border)] bg-[var(--card)] space-y-3">
            <span className="text-3xl">⚖️</span>
            <h3 className="text-base font-bold text-[var(--foreground)]">Legal &amp; Court E-Filing</h3>
            <p className="text-xs text-[var(--muted)] leading-relaxed">
              Auto-redact client SSNs, append Bates numbering, flatten form fields, and compress to court portal upload thresholds in 1 click.
            </p>
          </div>

          <div className="p-6 rounded-3xl border border-[var(--card-border)] bg-[var(--card)] space-y-3">
            <span className="text-3xl">🏢</span>
            <h3 className="text-base font-bold text-[var(--foreground)]">Executive Board Prep</h3>
            <p className="text-xs text-[var(--muted)] leading-relaxed">
              Stamp diagonal confidential watermarks, generate standardized footer page numbers, strip metadata, and encrypt with AES passwords.
            </p>
          </div>

          <div className="p-6 rounded-3xl border border-[var(--card-border)] bg-[var(--card)] space-y-3">
            <span className="text-3xl">🎓</span>
            <h3 className="text-base font-bold text-[var(--foreground)]">Blind Peer-Review Prep</h3>
            <p className="text-xs text-[var(--muted)] leading-relaxed">
              Remove author and institution tags, add sequential line and page numbers, and optimize fonts for journal submission.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
