export default function FaqPageJsonLd() {
  const json = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Are my files uploaded to a server?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No. All PDF processing happens entirely in your browser using WebAssembly. Your files never leave your device. We cannot access, store, or see your documents.",
        },
      },
      {
        "@type": "Question",
        name: "Do I need to create an account?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No account or signup required. All tools are free and work instantly without registration.",
        },
      },
      {
        "@type": "Question",
        name: "What is the maximum file size?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Free users can process files up to 10MB. Premium users get up to 100MB file support with faster processing.",
        },
      },
      {
        "@type": "Question",
        name: "Is there a limit on how many files I can process?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Free users can process one file at a time. Premium subscribers get batch processing with up to 20 files simultaneously.",
        },
      },
      {
        "@type": "Question",
        name: "What premium features are available?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Premium includes PDF comparison, certificate generation, PDF-to-audio, form data extraction, bulk rename, booklet creator, search & redact, color inverter, secure vault, QR code stamp, and metadata sanitizer.",
        },
      },
      {
        "@type": "Question",
        name: "Which browsers are supported?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "PDFTools works on Chrome, Firefox, Safari, and Edge on both desktop and mobile devices.",
        },
      },
      {
        "@type": "Question",
        name: "How is PDFTools free?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "We display non-intrusive ads to cover costs. Premium subscriptions remove ads and unlock advanced features for users who want an ad-free experience.",
        },
      },
    ],
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }} />;
}
