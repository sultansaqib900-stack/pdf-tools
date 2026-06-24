"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import AdBanner from "@/components/AdBanner";
import ToolInfo from "@/components/ToolInfo";
import UsageBar from "@/components/UsageBar";
import PremiumUpsell, { usePremiumUpsell } from "@/components/PremiumUpsell";
import { isPremium, getClientId } from "@/lib/premium";
import { useUsage } from "@/hooks/useUsage";
import SoftwareAppJsonLd from "@/components/SoftwareAppJsonLd";

interface Message {
  role: "user" | "assistant";
  text: string;
}

const ChatIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    <path d="M8 10h.01" strokeWidth="2"/><path d="M12 10h.01" strokeWidth="2"/><path d="M16 10h.01" strokeWidth="2"/>
  </svg>
);

const RobotIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="10" rx="2"/>
    <circle cx="12" cy="5" r="2"/>
    <path d="M12 7v4"/>
    <line x1="8" y1="16" x2="8" y2="16" strokeWidth="2.5"/><line x1="16" y1="16" x2="16" y2="16" strokeWidth="2.5"/>
  </svg>
);

export default function ChatPDFPage() {
  const usage = useUsage();
  const upsell = usePremiumUpsell();
  const [file, setFile] = useState<File | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [extractError, setExtractError] = useState("");
  const [pdfText, setPdfText] = useState("");
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [answering, setAnswering] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [chatRemaining, setChatRemaining] = useState<number | null>(null);
  const [ocrRunning, setOcrRunning] = useState(false);
  const [pdfPages, setPdfPages] = useState<number>(0);
  const [aiMode, setAiMode] = useState<string>("qna");
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchChatRemaining();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchChatRemaining = async () => {
    try {
      const clientId = getClientId();
      const res = await fetch(`/api/chat-pdf/remaining?clientId=${encodeURIComponent(clientId)}`);
      const data = await res.json();
      setChatRemaining(data.remaining);
    } catch {
      setChatRemaining(3);
    }
  };

  const handleFile = useCallback(async (f: File | null) => {
    if (!f || f.type !== "application/pdf") return;
    if (f.size > 20 * 1024 * 1024) { upsell.showUpsell("file-size"); return; }
    setFile(f);
    setPdfText("");
    setMessages([]);
    setExtractError("");
    setExtracting(true);
    setPdfPages(0);

    try {
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

      const bytes = await f.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;
      setPdfPages(pdf.numPages);
      let fullText = "";

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items.map((item: unknown) => (item as { str: string }).str).join(" ");
        fullText += `[Page ${i}] ${pageText}\n\n`;
      }

      if (!fullText.trim()) {
        setExtractError("No text found. This PDF may be a scanned document (image-based). Use AI OCR to read it.");
        setPdfText("__no_text__");
        setMessages([{ role: "assistant", text: "This PDF contains no selectable text. It may be a scanned document or image-based. Click the button below to use AI OCR to extract text from the images." }]);
      } else {
        setPdfText(fullText);
        setMessages([{ role: "assistant", text: `I've read "${f.name}" (${pdf.numPages} pages). Ask me anything about it!` }]);
        setExtractError("");
      }
    } catch (e) {
      setExtractError("Failed to extract text. The file may be corrupted or image-based.");
      setPdfText("__error__");
      setMessages([{ role: "assistant", text: "Failed to extract text from this PDF. Click the button below to try AI OCR." }]);
    }
    setExtracting(false);
  }, []);

  const runOcr = useCallback(async () => {
    if (!file || ocrRunning) return;
    setOcrRunning(true);
    setMessages((prev) => [...prev, { role: "assistant", text: `Running AI OCR on ${file.name}... This may take a moment.` }]);

    try {
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

      const bytes = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;
      const scale = 2;
      const pageImages: string[] = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d")!;
        await page.render({ canvas: canvas, viewport }).promise;
        pageImages.push(canvas.toDataURL("image/jpeg", 0.85).split(",")[1]);
      }

      const res = await fetch("/api/chat-pdf/ocr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pages: pageImages, fileName: file.name }),
      });
      const data = await res.json();

      if (data.ok && data.text) {
        setPdfText(data.text);
        setExtractError("");
        const ocrMsg = `AI OCR extracted text from all ${pdf.numPages} pages. You can now ask questions about the document.`;
        setMessages((prev) => [...prev, { role: "assistant", text: ocrMsg }]);
      } else {
        setMessages((prev) => [...prev, { role: "assistant", text: data.error || "OCR failed to read this PDF." }]);
      }
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", text: "OCR processing failed. Try a different PDF." }]);
    }
    setOcrRunning(false);
  }, [file, ocrRunning]);

  const askQuestion = useCallback(async (overrideMode?: string) => {
    const mode = overrideMode || aiMode;
    const needsQuestion = mode === "qna";
    if (needsQuestion && (!question.trim() || !pdfText || answering || extractError)) return;
    const q = question.trim();
    if (needsQuestion) setQuestion("");
    setMessages((prev) => [...prev, { role: "user", text: needsQuestion ? q : `${mode === "summarize" ? "Summarize" : mode === "rewrite" ? "Simplify" : "Translate to Urdu"} this document` }]);
    setAnswering(true);

    try {
      const res = await fetch("/api/chat-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: pdfText,
          question: needsQuestion ? q : "",
          history: messages.map((m) => ({ role: m.role, text: m.text })),
          mode,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setMessages((prev) => [...prev, { role: "assistant", text: data.answer }]);
      } else {
        setMessages((prev) => [...prev, { role: "assistant", text: data.error || "Failed to get answer." }]);
      }
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", text: "Connection error. Check internet and try again." }]);
    }
    setAnswering(false);

    if (!isPremium()) {
      const clientId = getClientId();
      try {
        const res = await fetch("/api/chat-pdf/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ clientId }),
        });
        const data = await res.json();
        setChatRemaining(data.remaining);
        if (data.remaining <= 0) {
          upsell.showUpsell("daily-limit", "You've used all 3 free AI chat questions today. Upgrade to Premium for unlimited questions.");
        }
      } catch {}
    }
  }, [question, pdfText, answering, messages, extractError, aiMode]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); askQuestion(); }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <SoftwareAppJsonLd
        name="Chat with PDF - Free AI PDF Assistant"
        description="Upload a PDF and ask AI questions about its content. Free daily limit, no signup required."
        url="https://allaboutpdfediting.xyz/chat-pdf"
      />
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">Chat with PDF</h1>
        <p className="text-[var(--muted)]">Upload a PDF and ask questions about its content using AI.</p>
      </div>

      <ToolInfo
        name="Chat with PDF"
        description="Your file stays private. Text is extracted in your browser using PDF.js. Only extracted text is sent to the AI API — your actual PDF file is never uploaded."
      />

      <AdBanner className="mb-8" />

      {!pdfText && (
        <div
          onDrop={(e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          className={`border-2 border-dashed rounded-xl p-10 text-center transition mb-6 ${
            dragging ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30" : "border-[var(--card-border)] bg-[var(--card)]"
          }`}
        >
          <input type="file" accept="application/pdf" onChange={(e) => handleFile(e.target.files?.[0] ?? null)} className="hidden" id="fileInput" />
            <label htmlFor="fileInput" className="cursor-pointer flex flex-col items-center gap-3">
            <span className="text-indigo-500"><RobotIcon /></span>
            <span className="text-indigo-500 font-medium hover:underline">
              {file ? file.name : "Upload a PDF to start chatting"}
            </span>
            {file && <span className="text-sm text-[var(--muted)]">{(file.size / 1024).toFixed(1)} KB</span>}
            {!file && <span className="text-xs text-[var(--muted)]">PDF up to 20MB</span>}
          </label>
        </div>
      )}

      {extracting && (
        <div className="flex items-center justify-center gap-2 py-8 text-[var(--muted)] text-sm">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
          Extracting text from PDF...
        </div>
      )}

      {pdfText && (
        <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-[var(--card-border)] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-indigo-500"><ChatIcon /></span>
              <span className="font-medium text-sm text-[var(--foreground)]">{file?.name}</span>
            </div>
            <div className="flex items-center gap-3">
              {!isPremium() && chatRemaining !== null && (
                <span className="text-xs text-[var(--muted)]">{chatRemaining}/3 questions left</span>
              )}
              <button
                onClick={() => { setPdfText(""); setMessages([]); setFile(null); }}
                className="text-xs text-[var(--muted)] hover:text-red-500 transition"
              >
                New PDF
              </button>
            </div>
          </div>

          <div className="h-96 overflow-y-auto p-5 space-y-4 bg-[var(--background)]">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] rounded-xl px-4 py-2.5 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-indigo-600 text-white"
                    : "bg-[var(--card)] border border-[var(--card-border)] text-[var(--foreground)]"
                }`}>
                  <div className="whitespace-pre-wrap">{msg.text}</div>
                </div>
              </div>
            ))}
            {answering && (
              <div className="flex justify-start">
                <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl px-4 py-2.5 text-sm text-[var(--muted)]">
                  <span className="flex items-center gap-1">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                    Thinking...
                  </span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {extractError && (
            <div className="mx-4 mb-3 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <div className="flex items-center gap-2 text-xs text-amber-700 dark:text-amber-300 mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                {extractError}
              </div>
              <button
                onClick={runOcr}
                disabled={ocrRunning}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                {ocrRunning ? (
                  <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Running OCR...</>
                ) : (
                  <><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>Extract with AI OCR</>
                )}
              </button>
            </div>
          )}

          <div className="border-t border-[var(--card-border)] p-4 space-y-3">
            <div className="flex gap-1.5 flex-wrap">
              {[
                { key: "qna", label: "Q&A", icon: "💬" },
                { key: "summarize", label: "Summarize", icon: "📋" },
                { key: "rewrite", label: "Simplify", icon: "✏️" },
                { key: "translate", label: "Urdu", icon: "🇵🇰" },
              ].map((m) => (
                <button
                  key={m.key}
                  onClick={() => {
                    setAiMode(m.key);
                    if (m.key !== "qna") askQuestion(m.key);
                  }}
                  disabled={answering}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition border ${
                    aiMode === m.key
                      ? "bg-indigo-100 dark:bg-indigo-900/30 border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300"
                      : "border-[var(--card-border)] text-[var(--muted)] hover:text-[var(--foreground)] hover:border-indigo-300"
                  }`}
                >
                  <span>{m.icon}</span>
                  <span>{m.label}</span>
                </button>
              ))}
            </div>
            {aiMode === "qna" && (
              <div className="flex gap-3">
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    extractError
                      ? "No text available to ask about"
                      : chatRemaining !== null && chatRemaining <= 0 && !isPremium()
                      ? "Daily limit reached. Upgrade to Premium."
                      : "Ask a question about the PDF..."
                  }
                  disabled={!!extractError || (chatRemaining !== null && chatRemaining <= 0 && !isPremium())}
                  rows={2}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-[var(--card-border)] bg-[var(--background)] text-[var(--foreground)] text-sm outline-none focus:border-indigo-500 transition resize-none"
                />
                <button
                  onClick={() => askQuestion()}
                  disabled={!question.trim() || answering || !!extractError || (chatRemaining !== null && chatRemaining <= 0 && !isPremium())}
                  className="px-5 py-2.5 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition shrink-0 self-end"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
                </button>
              </div>
            )}
            {aiMode !== "qna" && (
              <p className="text-xs text-[var(--muted)] text-center">
                Result will appear in the chat above.
              </p>
            )}
            {!isPremium() && chatRemaining !== null && chatRemaining <= 0 && (
              <p className="text-center text-xs text-[var(--muted)]">
                Free limit reached.{ " " }
                <a href="/premium" className="text-indigo-500 font-medium hover:underline">Upgrade for unlimited AI</a>
              </p>
            )}
          </div>
        </div>
      )}

      <AdBanner className="mt-8" />

      <div className="max-w-3xl mx-auto mt-12 pt-8 border-t border-[var(--card-border)]">
        <h2 className="text-xl font-bold text-[var(--foreground)] mb-3">About Chat with PDF</h2>
        <div className="text-sm text-[var(--muted)] space-y-3 leading-relaxed">
          <p>Chat with any PDF document using AI. Upload a PDF — a research paper, contract, book, report — and ask questions about its content. The AI reads the document and answers based only on what's in the file.</p>
          <p>Free users get 3 questions per day. <a href="/premium" className="text-indigo-500 underline">Premium subscribers</a> get unlimited questions, larger PDF support, and priority processing.</p>
          <p>Keywords: chat with PDF, AI PDF assistant, ask PDF questions, PDF chatbot, AI document reader, PDF analyzer.</p>
        </div>
      </div>
      <PremiumUpsell
        show={upsell.state.show}
        mode={upsell.state.mode}
        message={upsell.state.message}
        onClose={upsell.hideUpsell}
      />
    </div>
  );
}
