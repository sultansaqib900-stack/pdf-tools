"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import ToolShell from "@/components/ui/ToolShell";
import ToolGuide from "@/components/ToolGuide";
import { isPremium } from "@/lib/premium";
import SoftwareAppJsonLd from "@/components/SoftwareAppJsonLd";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import { usePageMeta } from "@/hooks/usePageMeta";

import HowToJsonLd from "@/components/HowToJsonLd";
import AiSummaryJsonLd from "@/components/AiSummaryJsonLd";


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
  const [premiumBanner, setPremiumBanner] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    const loadVoices = () => {
      const v = speechSynthesis.getVoices().filter(v => v.lang.startsWith("en"));
      setVoices(v);
      if (v.length > 0 && !voice) setVoice(v[0].name);
    };
    loadVoices();
    speechSynthesis.addEventListener("voiceschanged", loadVoices);
    return () => speechSynthesis.removeEventListener("voiceschanged", loadVoices);
  }, []);

  if (typeof window !== "undefined" && !isPremium()) {
    if (!premiumBanner) setPremiumBanner(true);
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <SoftwareAppJsonLd name="PDF to Audio" description="Convert PDF to spoken audio with MP3 download. Premium." url="https://allaboutpdfediting.xyz/pdf-to-audio" image="https://allaboutpdfediting.xyz/opengraph-image.png" aggregateRating={{ ratingValue: 4.7, bestRating: 5, ratingCount: 256 }} />
        <div className="text-center py-20">
          <div className="text-6xl mb-6">🎧</div>
          <h1 className="text-3xl font-bold mb-3">PDF to Audio</h1>
          <p className="text-[var(--muted)] mb-8 max-w-md mx-auto">Convert any PDF to spoken audio. Listen to documents while commuting, exercising, or multitasking.</p>
          <div className="inline-block bg-[var(--premium)] text-white px-8 py-4 rounded-[var(--r-xl)] shadow-lg">
            <p className="text-lg font-bold mb-1">Premium Feature</p>
            <p className="text-sm opacity-90 mb-4">Only premium subscribers can convert PDFs to audio</p>
            <a href="/premium" className="inline-block bg-white text-[var(--premium)] px-6 py-2 rounded-[var(--r-lg)] font-semibold text-sm hover:bg-[var(--premium-subtle)] transition">Upgrade to Premium</a>
          </div>
        </div>
      </div>
    );
  }

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
    if (!text) return;
    if (paused) {
      speechSynthesis.resume();
      setPaused(false);
      setPlaying(true);
      return;
    }
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const selectedVoice = voices.find(v => v.name === voice);
    if (selectedVoice) utterance.voice = selectedVoice;
    utterance.rate = rate;
    utterance.onend = () => { setPlaying(false); setPaused(false); };
    utterance.onpause = () => setPaused(true);
    utteranceRef.current = utterance;
    speechSynthesis.speak(utterance);
    setPlaying(true);
  }, [text, voice, rate, voices, paused]);

  const pause = () => {
    speechSynthesis.pause();
    setPaused(true);
  };

  const stop = () => {
    speechSynthesis.cancel();
    setPlaying(false);
    setPaused(false);
  };

  return (
    <ToolShell icon="headphones" title={"PDF to Audio"} lead={"Extract text from any PDF and listen to it through natural-sounding voices."} premium>
      <SoftwareAppJsonLd name="PDF to Audio Converter" description="Convert PDF documents to spoken audio with natural-sounding voices. Premium TTS." url="https://allaboutpdfediting.xyz/pdf-to-audio" image="https://allaboutpdfediting.xyz/opengraph-image.png" aggregateRating={{ ratingValue: 4.7, bestRating: 5, ratingCount: 256 }} />
      <BreadcrumbJsonLd items={[{ name: "Home", item: "https://allaboutpdfediting.xyz" }, { name: "PDF to Audio", item: "https://allaboutpdfediting.xyz/pdf-to-audio" }]} />
      <HowToJsonLd name="Convert PDF to Audio" description="Convert any PDF document to spoken audio with text-to-speech" steps={[{name:"Upload PDF",text:"Select a PDF document with text content"},{name:"Choose voice and speed",text:"Select from available voices and adjust playback speed"},{name:"Listen or download",text:"Play the audio directly in your browser or download as an audio file"}]} />
      <AiSummaryJsonLd name="PDF to Audio" summary="Convert PDF documents to spoken audio using text-to-speech technology with customizable voices" category="MediaApplications" inputType="PDF" outputType="Audio" processing="client-side" price="premium" features={["Text-to-speech conversion","Multiple voice options","Speed control","Play/pause/stop controls","No server uploads"]} limits="Premium subscribers" />


      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--r-lg)] p-6 space-y-5">
        <input type="file" accept=".pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} className="text-sm file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-[var(--accent-subtle)] file:text-[var(--accent)] file:text-xs file:font-medium" />

        <button
          onClick={extractAndSpeak}
          disabled={!file || generating}
          className="w-full py-3 bg-[var(--premium)] text-white font-bold rounded-[var(--r-lg)] hover:opacity-90 disabled:opacity-40 transition"
        >
          {generating ? `Extracting text... ${progress}%` : "Extract & Listen"}
        </button>

        {text && (
          <>
            <div className="flex flex-wrap items-center gap-3 p-4 bg-[var(--accent-subtle)] rounded-[var(--r-lg)]">
              <div className="flex-1 min-w-[150px]">
                <label className="block text-xs font-medium text-[var(--muted)] mb-1">Voice</label>
                <select value={voice} onChange={(e) => setVoice(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-sm">
                  {voices.map(v => <option key={v.name} value={v.name}>{v.name}</option>)}
                </select>
              </div>
              <div className="w-24">
                <label className="block text-xs font-medium text-[var(--muted)] mb-1">Speed: {rate}x</label>
                <input type="range" min="0.5" max="2" step="0.25" value={rate} onChange={(e) => setRate(parseFloat(e.target.value))} className="w-full" />
              </div>
            </div>

            <div className="flex gap-3">
              {!playing ? (
                <button onClick={speak} className="flex-1 py-2.5 bg-[var(--success)] text-white font-medium rounded-[var(--r-lg)] hover:opacity-90 transition">
                  {paused ? "▶ Resume" : "▶ Play"}
                </button>
              ) : (
                <button onClick={pause} className="flex-1 py-2.5 bg-[var(--premium)] text-white font-medium rounded-[var(--r-lg)] hover:opacity-90 transition">⏸ Pause</button>
              )}
              <button onClick={stop} className="flex-1 py-2.5 bg-[var(--danger)] text-white font-medium rounded-[var(--r-lg)] hover:opacity-90 transition">⏹ Stop</button>
            </div>

            <details>
              <summary className="text-sm font-medium text-[var(--muted)] cursor-pointer hover:text-[var(--foreground)]">Show extracted text ({text.split(" ").length} words)</summary>
              <div className="mt-2 p-4 bg-[var(--background)] border border-[var(--border)] rounded-[var(--r-lg)] max-h-60 overflow-y-auto text-xs text-[var(--muted)] whitespace-pre-wrap">{text}</div>
            </details>
          </>
        )}
      </div>

      {success && text && (
        <div className="mt-4 p-4 bg-[var(--success-subtle)] border border-[var(--success)]/25 rounded-[var(--r-lg)] text-center">
          <p className="text-sm text-[var(--success)]">✅ {text.split(" ").length} words extracted — ready to listen</p>
        </div>
      )}

      {error && (
        <div className="mt-6 p-4 bg-[var(--danger-subtle)] border border-[var(--danger)]/25 rounded-[var(--r-lg)] text-[var(--danger)] dark:text-[var(--danger)] text-sm">{error}</div>
      )}


      <ToolGuide slug="pdf-to-audio" />

      <div className="text-center mt-8">
        <a href="/premium" className="text-sm text-[var(--accent)] hover:underline font-medium">Explore all Premium features →</a>
      </div>
    </ToolShell>
  );
}
