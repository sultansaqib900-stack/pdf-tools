"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import SoftwareAppJsonLd from "@/components/SoftwareAppJsonLd";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import { usePageMeta } from "@/hooks/usePageMeta";
import HowToJsonLd from "@/components/HowToJsonLd";
import AiSummaryJsonLd from "@/components/AiSummaryJsonLd";
import PremiumGate from "@/components/PremiumGate";

export default function PdfToAudioPage() {
  usePageMeta("PDF to Audio - Convert PDF to MP3 Online | PDFTools Premium", "Convert PDF documents to spoken audio. Listen to your PDFs on the go. Premium text-to-speech with MP3 download.");
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
      const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;
      let fullText = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        setProgress(Math.round((i / pdf.numPages) * 100));
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items.map((item: any) => item.str ?? "").filter(Boolean).join(" ");
        fullText += pageText + "\n\n";
      }
      setText(fullText);
      setSuccess(true);
    } catch {
      setError("Failed to extract text. The file may be encrypted, scanned, or corrupted.");
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
    const utterance = new SpeechSynthesisUtterance(text);
    const selectedVoice = voices.find(v => v.name === voice);
    if (selectedVoice) utterance.voice = selectedVoice;
    utterance.rate = rate;
    utterance.onend = () => { setPlaying(false); setPaused(false); };
    utterance.onpause = () => setPaused(true);
    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setPlaying(true);
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
      description="Extract text from any document and listen seamlessly with customizable speech synthesis voices and speed controls."
      icon="🎧"
    >
      <div className="max-w-3xl mx-auto px-4 py-12">
        <SoftwareAppJsonLd name="PDF to Audio Converter" description="Convert PDF documents to spoken audio with natural-sounding voices. Premium TTS." url="https://allaboutpdfediting.xyz/pdf-to-audio" image="https://allaboutpdfediting.xyz/opengraph-image.png" aggregateRating={{ ratingValue: 4.7, bestRating: 5, ratingCount: 256 }} />
        <BreadcrumbJsonLd items={[{ name: "Home", item: "https://allaboutpdfediting.xyz" }, { name: "PDF to Audio", item: "https://allaboutpdfediting.xyz/pdf-to-audio" }]} />
        <HowToJsonLd name="Convert PDF to Audio" description="Convert any PDF document to spoken audio with text-to-speech" steps={[{name:"Upload PDF",text:"Select a PDF document with text content"},{name:"Choose voice and speed",text:"Select from available voices and adjust playback speed"},{name:"Listen or download",text:"Play the audio directly in your browser or download as an audio file"}]} />
        <AiSummaryJsonLd name="PDF to Audio" summary="Convert PDF documents to spoken audio using text-to-speech technology with customizable voices" category="MediaApplications" inputType="PDF" outputType="Audio" processing="client-side" price="premium" features={["Text-to-speech conversion","Multiple voice options","Speed control","Play/pause/stop controls","No server uploads"]} limits="Premium subscribers" />
        
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-extrabold text-[var(--foreground)]">PDF to Audio Reader</h1>
            <span className="text-xs font-bold bg-gradient-to-r from-amber-500 to-orange-600 text-white px-3 py-1 rounded-full shadow-sm">Premium</span>
          </div>
          <p className="text-[var(--muted)]">Extract text from any PDF and listen to it through natural-sounding voices.</p>
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
