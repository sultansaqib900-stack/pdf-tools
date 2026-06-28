import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const pages = [
  {
    file: "src/app/ilovepdf-alternative/page.tsx",
    insertAfter: 'import ArticleJsonLd from "@/components/ArticleJsonLd";\n',
    importLine: 'import AdBanner from "@/components/AdBanner";\n',
    beforeLine: '      <div className="border border-[var(--card-border)] rounded-xl p-6 text-center">',
    adJsx: '      <AdBanner className="mb-8" />\n\n',
  },
  {
    file: "src/app/adobe-acrobat-alternative/page.tsx",
    insertAfter: 'import ArticleJsonLd from "@/components/ArticleJsonLd";\n',
    importLine: 'import AdBanner from "@/components/AdBanner";\n',
    beforeLine: '      <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl p-6 mb-8">',
    adJsx: '      <AdBanner className="mb-8" />\n\n',
  },
  {
    file: "src/app/smallpdf-alternative/page.tsx",
    insertAfter: 'import type { Metadata } from "next";\n',
    importLine: 'import AdBanner from "@/components/AdBanner";\n',
    beforeLine: '      <div className="border border-[var(--card-border)] rounded-xl p-6 text-center">',
    adJsx: '      <AdBanner className="mb-8" />\n\n',
  },
  {
    file: "src/app/best-free-pdf-editor/page.tsx",
    insertAfter: 'import type { Metadata } from "next";\n',
    importLine: 'import AdBanner from "@/components/AdBanner";\n',
    beforeLine: '      <div className="bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800 rounded-xl p-6 mb-10">',
    adJsx: '      <AdBanner className="mb-8" />\n\n',
  },
  {
    file: "src/app/about/page.tsx",
    insertAfter: '', // prepend since file has no imports
    importLine: 'import AdBanner from "@/components/AdBanner";\n\nexport default function AboutPage() {',
    stringToReplace: 'export default function AboutPage() {',
    beforeLine: '    </div>',
    adJsx: '      <AdBanner className="mb-8" />\n',
  },
  {
    file: "src/app/pdf-tools-for-students/page.tsx",
    insertAfter: 'import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";\n',
    importLine: 'import AdBanner from "@/components/AdBanner";\n',
    beforeLine: '      <div className="bg-indigo-50 dark:bg-indigo-950/20 border-2 border-indigo-500 rounded-xl p-6 text-center">',
    adJsx: '      <AdBanner className="mb-8" />\n\n',
  },
  {
    file: "src/app/pdf-tools-for-business/page.tsx",
    insertAfter: 'import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";\n',
    importLine: 'import AdBanner from "@/components/AdBanner";\n',
    beforeLine: '      <div className="bg-indigo-50 dark:bg-indigo-950/20 border-2 border-indigo-500 rounded-xl p-6 text-center">',
    adJsx: '      <AdBanner className="mb-8" />\n\n',
  },
  {
    file: "src/app/ultimate-guide-to-pdf-editing/page.tsx",
    insertAfter: 'import ArticleJsonLd from "@/components/ArticleJsonLd";\n',
    importLine: 'import AdBanner from "@/components/AdBanner";\n',
    beforeLine: '      <div className="bg-indigo-50 dark:bg-indigo-950/20 border-2 border-indigo-500 rounded-xl p-6 text-center">',
    adJsx: '      <AdBanner className="mb-8" />\n\n',
  },
];

for (const p of pages) {
  const fullPath = path.resolve(root, p.file);
  let content = fs.readFileSync(fullPath, "utf-8");

  // Add import
  if (!content.includes('import AdBanner from "@/components/AdBanner"')) {
    if (p.stringToReplace) {
      // For files with no existing imports (e.g. about page)
      content = content.replace(p.stringToReplace, p.importLine);
    } else {
      content = content.replace(p.insertAfter, p.insertAfter + p.importLine);
    }
  }

  // Add JSX
  if (!content.includes("<AdBanner")) {
    content = content.replace(p.beforeLine, p.adJsx + p.beforeLine);
  }

  fs.writeFileSync(fullPath, content);
  console.log(`✓ ${p.file}`);
}

console.log("\nAll 8 pages updated.");
