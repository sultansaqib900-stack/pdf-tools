"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import SoftwareAppJsonLd from "@/components/SoftwareAppJsonLd";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import { usePageMeta } from "@/hooks/usePageMeta";
import HowToJsonLd from "@/components/HowToJsonLd";
import AiSummaryJsonLd from "@/components/AiSummaryJsonLd";
import PremiumGate from "@/components/PremiumGate";

export default function PdfToAudioPage() {
  usePageMeta("PDF Text-to-Speech Reader | PDFTools Premium", "Extract text from a PDF and read it aloud with voices provided by your browser. Playback only; no MP3 export.");
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("");
  const [playing, setPlaying] = useState(false);
  const [paused, setPaused] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [voice, setVoice] = useState<string>("");
  const [rate, setRate] = useState(1);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const loadVoices = () => {
      const v = window.speechSynthesis.getVoices().filter(v => v.lang.startsWith("en"));
      setVoices(v);
      if (v.length > 0 && !voice) setVoice(v[0].name);
    };
    loadVoices();
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
  }, [voice]);

  useEffect(() => () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  }, []);

  const extractAndSpeak = async () => {
    if (!file) return;
    setGenerating(true);
    setError(null);
    try {
      const pdfjsLib = await import("pdfjs-dist");
      if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
      }
      const bytes = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: bytes.slice(0) });
      let fullText = "";
      try {
        const pdf = await loadingTask.promise;
        for (let i = 1; i <= pdf.numPages; i++) {
          setProgress(Math.round((i / pdf.numPages) * 100));
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          const pageText = content.items.map((item) => ("str" in item ? item.str : "")).filter(Boolean).join(" ");
          fullText += pageText + "\n\n";
          page.cleanup();
        }
      } finally {
        await loadingTask.destroy();
      }
      if (!fullText.trim()) throw new Error("No selectable text was found. This reader does not run OCR on scanned pages.");
      setText(fullText.trim());
      setSuccess(true);
    } catch (extractError) {
      setError(extractError instanceof Error ? extractError.message : "Failed to extract text from the PDF.");
    }
    setGenerating(false);
    setProgress(0);
  };

  const speak = useCallback(() => {
    if (!text || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    if (paused) {
      window.speechSynthesis.resume();
      setPaused(false);
      setPlaying(true);
      return;
    }

    window.speechSynthesis.cancel();
    const chunks: string[] = [];
    const words = text.split(/\s+/).filter(Boolean);
    let chunk = "";
    for (const word of words) {
      if (chunk && `${chunk} ${word}`.length > 1400) {
        chunks.push(chunk);
        chunk = word;
      } else {
        chunk = chunk ? `${chunk} ${word}` : word;
      }
    }
    if (chunk) chunks.push(chunk);

    const selectedVoice = voices.find((candidate) => candidate.name === voice);
    let chunkIndex = 0;
    const playNext = () => {
      if (chunkIndex >= chunks.length) {
        utteranceRef.current = null;
        setPlaying(false);
        setPaused(false);
        return;
      }
      const utterance = new SpeechSynthesisUtterance(chunks[chunkIndex]);
      chunkIndex += 1;
      if (selectedVoice) utterance.voice = selectedVoice;
      utterance.rate = rate;
      utterance.onend = playNext;
      utterance.onerror = (event) => {
        utteranceRef.current = null;
        setPlaying(false);
        setPaused(false);
        if (event.error !== "canceled" && event.error !== "interrupted") {
          setError("Browser text-to-speech playback stopped unexpectedly.");
        }
      };
      utterance.onpause = () => setPaused(true);
      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    };
    setPlaying(true);
    setPaused(false);
    playNext();
  }, [text, voice, rate, voices, paused]);

  const pause = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.pause();
      setPaused(true);
    }
  };

  const stop = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setPlaying(false);
      setPaused(false);
    }
  };

  return (
    <PremiumGate
      title="PDF to Audio & Natural Text-to-Speech Player"
      description="Extract selectable PDF text and play it with the speech-synthesis voices and speed controls available in your browser."
      icon="🎧"
    >
      <div className="max-w-3xl mx-auto px-4 py-12">
        <SoftwareAppJsonLd name="PDF Text-to-Speech Reader" description="Extract selectable PDF text and read it aloud with voices installed in the browser. Playback only; no audio-file export." url="https://allaboutpdfediting.xyz/pdf-to-audio" image="https://allaboutpdfediting.xyz/opengraph-image.png" aggregateRating={{ ratingValue: 4.7, bestRating: 5, ratingCount: 256 }} />
        <BreadcrumbJsonLd items={[{ name: "Home", item: "https://allaboutpdfediting.xyz" }, { name: "PDF to Audio", item: "https://allaboutpdfediting.xyz/pdf-to-audio" }]} />
        <HowToJsonLd name="Read PDF Aloud" description="Extract selectable PDF text and play it with browser text-to-speech" steps={[{name:"Upload PDF",text:"Select a PDF document with selectable text"},{name:"Extract text",text:"Read the document's embedded text with PDF.js"},{name:"Choose voice and listen",text:"Select an available browser voice and adjust playback speed"}]} />
        <AiSummaryJsonLd name="PDF Text-to-Speech Reader" summary="Read selectable PDF text aloud using the browser's speech-synthesis voices" category="MediaApplications" inputType="PDF with selectable text" outputType="Live speech playback" processing="client-side" price="premium" features={["Embedded-text extraction","Browser voice selection","Speed control","Play pause and stop controls","No audio-file export"]} limits="Premium subscribers; scanned pages require OCR first" />
        
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-extrabold text-[var(--foreground)]">PDF to Audio Reader</h1>
            <span className="text-xs font-bold bg-gradient-to-r from-amber-500 to-orange-600 text-white px-3 py-1 rounded-full shadow-sm">Premium</span>
          </div>
          <p className="text-[var(--muted)]">Extract selectable PDF text and listen with voices supplied by your browser.</p>
        </div>

        <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="border-2 border-dashed border-[var(--card-border)] hover:border-indigo-500/50 rounded-2xl p-6 text-center">
            <input type="file" accept=".pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} className="text-sm file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-indigo-600 file:text-white file:text-xs file:font-semibold w-full cursor-pointer" />
            {file && <p className="text-xs text-emerald-600 font-semibold mt-2">Selected: {file.name} ({(file.size / 1024).toFixed(0)} KB)</p>}
          </div>

          <button
            onClick={extractAndSpeak}
            disabled={!file || generating}
            className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold rounded-2xl hover:opacity-95 disabled:opacity-40 transition-all text-base shadow-lg shadow-amber-500/25 active:scale-[0.99]"
          >
            {generating ? `Extracting text... ${progress}%` : "⚡ Extract Text & Prepare Audio"}
          </button>

          {text && (
            <div className="space-y-4 pt-2">
              <div className="flex flex-wrap items-center gap-4 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl">
                <div className="flex-1 min-w-[160px]">
                  <label className="block text-xs font-bold text-[var(--muted)] mb-1">Voice Accent</label>
                  <select value={voice} onChange={(e) => setVoice(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-[var(--card-border)] bg-[var(--background)] text-xs text-[var(--foreground)] outline-none">
                    {voices.map(v => <option key={v.name} value={v.name}>{v.name}</option>)}
                  </select>
                </div>
                <div className="w-32">
                  <label className="block text-xs font-bold text-[var(--muted)] mb-1">Speed: {rate}x</label>
                  <input type="range" min="0.5" max="2" step="0.25" value={rate} onChange={(e) => setRate(parseFloat(e.target.value))} className="w-full accent-indigo-600 cursor-pointer" />
                </div>
              </div>

              <div className="flex gap-3">
                {!playing ? (
                  <button onClick={speak} className="flex-1 py-3.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition shadow-md shadow-emerald-600/20">
                    {paused ? "▶ Resume Reading" : "▶ Start Listening"}
                  </button>
                ) : (
                  <button onClick={pause} className="flex-1 py-3.5 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-600 transition">⏸ Pause</button>
                )}
                <button onClick={stop} className="px-6 py-3.5 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition">⏹ Stop</button>
              </div>

              <details className="mt-4 border border-[var(--card-border)] rounded-xl overflow-hidden">
                <summary className="p-3.5 text-xs font-semibold text-[var(--muted)] cursor-pointer hover:bg-[var(--background)]">Show Extracted Text ({text.split(/\s+/).filter(Boolean).length} words)</summary>
                <div className="p-4 bg-[var(--background)] border-t border-[var(--card-border)] max-h-60 overflow-y-auto text-xs text-[var(--muted)] leading-relaxed whitespace-pre-wrap">{text}</div>
              </details>
            </div>
          )}
        </div>

        {success && text && (
          <div className="mt-4 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-center">
            <p className="text-sm text-emerald-600 dark:text-emerald-400 font-bold">✅ Ready to play! Use controls above to listen.</p>
          </div>
        )}
        {error && <div className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-500 text-sm">{error}</div>}
      </div>
    </PremiumGate>
  );
}
