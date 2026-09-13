"use client";

import { useEffect, useMemo, useState } from "react";
import {
  DEFAULT_RECIPES,
  executePdfRecipe,
  getActionLabel,
  loadSavedRecipes,
  saveCustomRecipe,
  type PdfRecipe,
  type RecipeActionType,
  type RecipeExecutionLog,
} from "@/lib/pdfRecipes";
import PipelineActionBar from "@/components/PipelineActionBar";
import { getPipelineDocument } from "@/lib/pdfPipeline";
import { createPdfFile, isPdfFile, sanitizeDownloadFilename } from "@/lib/pdfBytes";

interface RecipeResult {
  name: string;
  sourceName: string;
  bytes?: Uint8Array;
  url?: string;
  error?: string;
}

const CUSTOM_ACTIONS: RecipeActionType[] = [
  "pii_redact",
  "bates_number",
  "watermark",
  "page_numbers",
  "rotate",
  "flatten",
  "clean_metadata",
  "compress",
  "protect",
];

export default function RecipeRunner() {
  const [recipes, setRecipes] = useState<PdfRecipe[]>(DEFAULT_RECIPES);
  const [selectedRecipe, setSelectedRecipe] = useState<PdfRecipe>(DEFAULT_RECIPES[0]);
  const [files, setFiles] = useState<File[]>([]);
  const [running, setRunning] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [currentFile, setCurrentFile] = useState<string | null>(null);
  const [activeStepIndex, setActiveStepIndex] = useState<number | null>(null);
  const [stepLogs, setStepLogs] = useState<RecipeExecutionLog[]>([]);
  const [results, setResults] = useState<RecipeResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"presets" | "custom">("presets");
  const [recipePassword, setRecipePassword] = useState("");

  const [customName, setCustomName] = useState("");
  const [customDesc, setCustomDesc] = useState("");
  const [customActions, setCustomActions] = useState<RecipeActionType[]>(["watermark", "compress"]);

  const needsPassword = selectedRecipe.actions.some((action) => action.type === "protect");
  const successfulResults = useMemo(
    () => results.filter((result): result is RecipeResult & { bytes: Uint8Array; url: string } => Boolean(result.bytes && result.url)),
    [results],
  );

  useEffect(() => {
    // Read browser-only saved recipes after hydration.
    queueMicrotask(() => setRecipes(loadSavedRecipes()));
    let cancelled = false;
    void getPipelineDocument().then((pipelineDoc) => {
      if (!cancelled && pipelineDoc?.bytes) {
        setFiles([createPdfFile(pipelineDoc.bytes, pipelineDoc.name)]);
      }
    });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    return () => {
      for (const result of results) {
        if (result.url) URL.revokeObjectURL(result.url);
      }
    };
  }, [results]);

  const replaceFiles = (incoming: File[]) => {
    const pdfs = incoming.filter(isPdfFile);
    setFiles(pdfs);
    setStepLogs([]);
    setResults([]);
    setError(pdfs.length === incoming.length ? null : "Only PDF files were added to the queue.");
  };

  const handleRunRecipe = async () => {
    if (files.length === 0 || !selectedRecipe) return;
    if (needsPassword && recipePassword.length < 4) {
      setError("Enter a password of at least 4 characters for the AES-256 protection step.");
      return;
    }

    setRunning(true);
    setError(null);
    setResults([]);
    const completed: RecipeResult[] = [];

    for (const targetFile of files) {
      setCurrentFile(targetFile.name);
      setActiveStepIndex(null);
      setStepLogs(selectedRecipe.actions.map((action) => ({
        step: getActionLabel(action.type),
        status: "pending",
      })));

      try {
        const processedBytes = await executePdfRecipe(
          await targetFile.arrayBuffer(),
          selectedRecipe,
          (stepIndex, log) => {
            setActiveStepIndex(stepIndex);
            setStepLogs((previous) => {
              const updated = [...previous];
              updated[stepIndex] = log;
              return updated;
            });
          },
          { password: recipePassword },
        );
        const name = sanitizeDownloadFilename(`${selectedRecipe.id}-${targetFile.name}`);
        const blob = new Blob([processedBytes.slice() as unknown as BlobPart], { type: "application/pdf" });
        completed.push({
          name,
          sourceName: targetFile.name,
          bytes: processedBytes,
          url: URL.createObjectURL(blob),
        });
      } catch (runError) {
        const message = runError instanceof Error ? runError.message : "Recipe execution failed.";
        completed.push({ sourceName: targetFile.name, name: targetFile.name, error: message });
      }
    }

    setResults(completed);
    setCurrentFile(null);
    setActiveStepIndex(null);
    setRunning(false);

    const failed = completed.filter((result) => result.error).length;
    if (failed > 0) {
      setError(`${failed} of ${completed.length} file${completed.length === 1 ? "" : "s"} failed. Review the result details below.`);
    }
  };

  const handleCreateCustomRecipe = () => {
    if (!customName.trim() || customActions.length === 0) return;
    const actions = [...customActions];
    // Encrypted output cannot be edited by a subsequent recipe operation.
    const protectIndex = actions.indexOf("protect");
    if (protectIndex >= 0) {
      actions.splice(protectIndex, 1);
      actions.push("protect");
    }

    const newRecipe: PdfRecipe = {
      id: `custom_${crypto.randomUUID()}`,
      name: customName.trim(),
      badge: "Custom Macro",
      icon: "⚡",
      category: "Custom",
      description: customDesc.trim() || "Custom multi-step PDF automation recipe.",
      actions: actions.map((type) => ({ type })),
    };

    try {
      saveCustomRecipe(newRecipe);
      setRecipes(loadSavedRecipes());
      setSelectedRecipe(newRecipe);
      setActiveTab("presets");
      setCustomName("");
      setCustomDesc("");
      setError(null);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not save the custom recipe.");
    }
  };

  const toggleAction = (type: RecipeActionType) => {
    setCustomActions((previous) => {
      if (previous.includes(type)) return previous.filter((action) => action !== type);
      if (type === "protect") return [...previous, type];
      const protectIndex = previous.indexOf("protect");
      if (protectIndex < 0) return [...previous, type];
      return [...previous.slice(0, protectIndex), type, ...previous.slice(protectIndex)];
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-center p-1.5 bg-[var(--card)] border border-[var(--card-border)] rounded-2xl w-fit max-w-full mx-auto overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab("presets")}
          className={`px-5 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all whitespace-nowrap ${activeTab === "presets" ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20" : "text-[var(--muted)] hover:text-[var(--foreground)]"}`}
        >
          ⚡ Industry Presets
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("custom")}
          className={`px-5 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all whitespace-nowrap ${activeTab === "custom" ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20" : "text-[var(--muted)] hover:text-[var(--foreground)]"}`}
        >
          🛠️ Custom Builder
        </button>
      </div>

      {error && (
        <div role="alert" className="p-4 rounded-2xl border border-red-500/30 bg-red-500/10 text-sm text-red-500 flex items-start justify-between gap-3">
          <span>{error}</span>
          <button type="button" onClick={() => setError(null)} aria-label="Dismiss error" className="font-bold">×</button>
        </div>
      )}

      {activeTab === "presets" ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recipes.map((recipe) => {
              const selected = selectedRecipe.id === recipe.id;
              return (
                <button
                  type="button"
                  key={recipe.id}
                  onClick={() => { setSelectedRecipe(recipe); setStepLogs([]); setResults([]); setError(null); }}
                  aria-pressed={selected}
                  className={`p-5 rounded-3xl border transition-all flex flex-col justify-between text-left relative overflow-hidden group ${selected ? "border-indigo-500 bg-gradient-to-br from-indigo-500/10 via-[var(--card)] to-purple-500/10 shadow-xl shadow-indigo-500/10 ring-2 ring-indigo-500/30" : "border-[var(--card-border)] bg-[var(--card)] hover:border-indigo-500/40"}`}
                >
                  <span className="w-full">
                    <span className="flex items-center justify-between mb-3">
                      <span className="text-3xl">{recipe.icon}</span>
                      <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">{recipe.badge}</span>
                    </span>
                    <span className="block text-base font-extrabold text-[var(--foreground)] mb-1.5 group-hover:text-indigo-400 transition">{recipe.name}</span>
                    <span className="block text-xs text-[var(--muted)] leading-relaxed mb-4">{recipe.description}</span>
                  </span>
                  <span className="w-full pt-3 border-t border-[var(--card-border)]/60 flex flex-wrap gap-1.5">
                    {recipe.actions.map((action, index) => (
                      <span key={`${action.type}-${index}`} className="text-[10px] font-semibold px-2 py-0.5 rounded-lg bg-[var(--background)] border border-[var(--card-border)] text-[var(--muted)]">
                        {index + 1}. {getActionLabel(action.type)}
                      </span>
                    ))}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center gap-3 pb-5 border-b border-[var(--card-border)]">
              <span className="text-4xl">{selectedRecipe.icon}</span>
              <div>
                <h3 className="text-lg font-extrabold text-[var(--foreground)]">Active Macro: {selectedRecipe.name}</h3>
                <p className="text-xs text-[var(--muted)]">Runs {selectedRecipe.actions.length} validated steps on every queued PDF</p>
              </div>
            </div>

            <div
              onDrop={(event) => { event.preventDefault(); setDragging(false); replaceFiles(Array.from(event.dataTransfer.files)); }}
              onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              className={`border-2 border-dashed rounded-3xl p-8 text-center transition-all ${dragging ? "border-indigo-500 bg-indigo-500/10" : "border-[var(--card-border)] hover:border-indigo-500/50 bg-[var(--background)]"}`}
            >
              <input
                type="file"
                accept="application/pdf,.pdf"
                multiple
                id="recipeFileInput"
                className="hidden"
                onChange={(event) => replaceFiles(Array.from(event.target.files ?? []))}
              />
              <label htmlFor="recipeFileInput" className="cursor-pointer flex flex-col items-center gap-2">
                <span className="text-4xl">📄</span>
                <span className="text-sm font-bold text-indigo-400 hover:underline">
                  {files.length > 0 ? `${files.length} PDF${files.length === 1 ? "" : "s"} queued` : "Select PDFs or drag and drop them here"}
                </span>
                <span className="text-xs text-[var(--muted)]">{files.length > 0 ? files.map((file) => file.name).join(" • ") : "Each file is processed locally; nothing is uploaded"}</span>
              </label>
            </div>

            {needsPassword && (
              <div>
                <label htmlFor="recipePassword" className="block text-xs font-bold text-[var(--foreground)] mb-1.5">Output password for AES-256 protection</label>
                <input
                  id="recipePassword"
                  type="password"
                  autoComplete="new-password"
                  value={recipePassword}
                  onChange={(event) => setRecipePassword(event.target.value)}
                  placeholder="At least 4 characters"
                  className="w-full px-4 py-3 rounded-xl border border-[var(--card-border)] bg-[var(--background)] text-sm text-[var(--foreground)] outline-none focus:border-indigo-500"
                />
              </div>
            )}

            {stepLogs.length > 0 && (
              <div className="space-y-2.5 p-5 rounded-2xl bg-[var(--background)] border border-[var(--card-border)]" aria-live="polite">
                <p className="text-xs font-extrabold uppercase tracking-wider text-[var(--foreground)] mb-3">
                  {currentFile ? `Processing ${currentFile}` : "Last pipeline execution"}
                </p>
                {stepLogs.map((log, index) => (
                  <div
                    key={`${log.step}-${index}`}
                    className={`flex flex-col sm:flex-row sm:items-center justify-between gap-1 p-3 rounded-xl border text-xs ${log.status === "error" ? "border-red-500/40 bg-red-500/10 text-red-400" : log.status === "completed" ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-400" : activeStepIndex === index && running ? "border-indigo-500/50 bg-indigo-500/10 text-indigo-300 font-bold" : "border-[var(--card-border)] text-[var(--muted)]"}`}
                  >
                    <span className="flex items-center gap-2.5">
                      <span>{log.status === "running" ? "◌" : log.status === "completed" ? "✓" : log.status === "error" ? "✕" : "○"}</span>
                      <span>Step {index + 1}: {log.step}</span>
                    </span>
                    {log.details && <span className="text-[11px] font-semibold">{log.details}</span>}
                  </div>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={handleRunRecipe}
              disabled={running || files.length === 0 || (needsPassword && recipePassword.length < 4)}
              className="w-full py-4 bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 text-white font-extrabold rounded-2xl hover:opacity-95 disabled:opacity-40 transition-all shadow-xl shadow-indigo-500/25 text-base active:scale-[0.99]"
            >
              {running ? `Running recipe${currentFile ? ` on ${currentFile}` : ""}…` : `⚡ Run “${selectedRecipe.name}” on ${files.length || 0} PDF${files.length === 1 ? "" : "s"}`}
            </button>
          </div>
        </>
      ) : (
        <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl max-w-2xl mx-auto">
          <div>
            <h3 className="text-lg font-extrabold text-[var(--foreground)] mb-1">Build Your Own Automation Macro</h3>
            <p className="text-xs text-[var(--muted)]">Select operations in execution order. Protection is always moved to the final step.</p>
          </div>
          <div className="space-y-4">
            <div>
              <label htmlFor="customRecipeName" className="block text-xs font-bold text-[var(--foreground)] uppercase mb-1">Macro Name</label>
              <input id="customRecipeName" value={customName} onChange={(event) => setCustomName(event.target.value)} placeholder="Monthly client statement" className="w-full px-4 py-2.5 rounded-xl border border-[var(--card-border)] bg-[var(--background)] text-sm text-[var(--foreground)] outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label htmlFor="customRecipeDescription" className="block text-xs font-bold text-[var(--foreground)] uppercase mb-1">Description</label>
              <input id="customRecipeDescription" value={customDesc} onChange={(event) => setCustomDesc(event.target.value)} placeholder="Redact PII, add page numbers, and optimize" className="w-full px-4 py-2.5 rounded-xl border border-[var(--card-border)] bg-[var(--background)] text-sm text-[var(--foreground)] outline-none focus:border-indigo-500" />
            </div>
            <div>
              <p className="block text-xs font-bold text-[var(--foreground)] uppercase mb-2">Operations ({customActions.length})</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {CUSTOM_ACTIONS.map((actionType) => {
                  const selected = customActions.includes(actionType);
                  const order = customActions.indexOf(actionType) + 1;
                  return (
                    <button key={actionType} type="button" onClick={() => toggleAction(actionType)} className={`p-3 rounded-xl border text-left text-xs font-bold transition-all flex items-center justify-between ${selected ? "border-indigo-500 bg-indigo-500/10 text-indigo-400" : "border-[var(--card-border)] bg-[var(--background)] text-[var(--muted)]"}`}>
                      <span>{getActionLabel(actionType)}</span>
                      <span>{selected ? order : "+"}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <button type="button" onClick={handleCreateCustomRecipe} disabled={!customName.trim() || customActions.length === 0} className="w-full py-3.5 bg-indigo-600 text-white font-extrabold rounded-xl hover:bg-indigo-700 disabled:opacity-40 transition-all text-sm shadow-lg shadow-indigo-500/20">
              Save &amp; Activate Custom Recipe
            </button>
          </div>
        </div>
      )}

      {results.length > 0 && (
        <section className="p-6 rounded-3xl border border-[var(--card-border)] bg-[var(--card)] space-y-3" aria-live="polite">
          <h3 className="text-base font-extrabold text-[var(--foreground)]">Recipe results</h3>
          {results.map((result) => (
            <div key={result.sourceName} className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${result.error ? "border-red-500/30 bg-red-500/5" : "border-emerald-500/30 bg-emerald-500/5"}`}>
              <div>
                <p className="text-xs font-bold text-[var(--foreground)]">{result.sourceName}</p>
                <p className={`text-[11px] ${result.error ? "text-red-500" : "text-emerald-500"}`}>{result.error || "All steps completed successfully"}</p>
              </div>
              {result.url && (
                <a href={result.url} download={result.name} className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold text-center hover:bg-emerald-700 transition">Download {result.name}</a>
              )}
            </div>
          ))}
        </section>
      )}

      {successfulResults.length > 0 && (
        <PipelineActionBar
          pdfBytes={successfulResults[0].bytes}
          filename={successfulResults[0].name}
          downloadUrl={successfulResults[0].url}
          currentToolName={selectedRecipe.name}
        />
      )}
    </div>
  );
}
