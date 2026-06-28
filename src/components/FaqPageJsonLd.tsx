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
    question: "Which browsers are supported?",
    answer: "PDFTools works on Chrome, Firefox, Safari, and Edge on both desktop and mobile devices.",
  },
  {
    question: "How is PDFTools free?",
    answer: "We display non-intrusive ads to cover costs. Premium subscriptions remove ads and unlock advanced features.",
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
