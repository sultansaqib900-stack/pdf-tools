interface QA {
  question: string;
  answer: string;
}

interface Props {
  questions?: QA[];
}

const defaultQuestions: QA[] = [
  {
    question: "Are my files uploaded to a server?",
    answer: "No. All PDF processing happens entirely in your browser using WebAssembly. Your files never leave your device. We cannot access, store, or see your documents.",
  },
  {
    question: "Do I need to create an account?",
    answer: "No account or signup required. All tools are free and work instantly without registration.",
  },
  {
    question: "What is the maximum file size?",
    answer: "Free users can process files up to 10MB. Premium users get up to 100MB file support with faster processing.",
  },
  {
    question: "Which tools are free and unlimited?",
    answer: "Every basic tool - Compress, Merge, Split, Delete Pages, Rotate, Crop, Resize, Extract Text, Image to PDF, PDF to Images, PDF to Word, Word to PDF, Protect, Unlock, Sign, Watermark, Add Page Numbers, Annotate, Fill Forms, Flatten, Reverse, Insert Blank Pages, Metadata editing, and more - is free with no daily or monthly cap.",
  },
  {
    question: "How does the free trial for professional tools work?",
    answer: "Professional tools (PDF Studio, PDF Diff, Bates Numbering, Certificate Generator, and the rest of the Premium suite) include a one-time trial of 5 files. The allowance is lifetime and shared across all professional tools - not per tool, per day, or per month. Failed or invalid files never consume the allowance.",
  },
  {
    question: "Which browsers are supported?",
    answer: "PDFTools works on Chrome, Firefox, Safari, and Edge on both desktop and mobile devices.",
  },
  {
    question: "How is PDFTools free?",
    answer: "Core tools have a free tier, while Premium subscriptions fund development and unlock larger limits and advanced workflows. No advertising scripts are currently loaded.",
  },
];

export default function FaqPageJsonLd({ questions }: Props) {
  const qas = questions || defaultQuestions;
  const json = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: qas.map((qa) => ({
      "@type": "Question",
      name: qa.question,
      acceptedAnswer: { "@type": "Answer", text: qa.answer },
    })),
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }} />;
}
