"use client";

import { useState, useEffect } from "react";
import {
  DEFAULT_RECIPES,
  executePdfRecipe,
  loadSavedRecipes,
  saveCustomRecipe,
  type PdfRecipe,
  type RecipeExecutionLog,
  type RecipeActionType,
  getActionLabel,
} from "@/lib/pdfRecipes";
import PipelineActionBar from "@/components/PipelineActionBar";
import { getPipelineDocument } from "@/lib/pdfPipeline";

export default function RecipeRunner() {
  const [recipes, setRecipes] = useState<PdfRecipe[]>(DEFAULT_RECIPES);
  const [selectedRecipe, setSelectedRecipe] = useState<PdfRecipe>(DEFAULT_RECIPES[0]);
  const [files, setFiles] = useState<File[]>([]);
  const [running, setRunning] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState<number | null>(null);
  const [stepLogs, setStepLogs] = useState<RecipeExecutionLog[]>([]);
  const [resultBytes, setResultBytes] = useState<Uint8Array | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"presets" | "custom">("presets");

  // Custom Recipe Builder State
  const [customName, setCustomName] = useState("");
  const [customDesc, setCustomDesc] = useState("");
  const [customActions, setCustomActions] = useState<RecipeActionType[]>(["watermark", "compress"]);

  useEffect(() => {
    setRecipes(loadSavedRecipes());
    (async () => {
      const pipelineDoc = await getPipelineDocument();
      if (pipelineDoc && pipelineDoc.bytes) {
        const f = new File([pipelineDoc.bytes as unknown as BlobPart], pipelineDoc.name, { type: "application/pdf" });
        setFiles([f]);
      }
    })();
  }, []);

  const handleRunRecipe = async () => {
    if (files.length === 0 || !selectedRecipe) return;
    setRunning(true);
    setResultBytes(null);
    setDownloadUrl(null);

    // Initialize step logs
    const initialLogs: RecipeExecutionLog[] = selectedRecipe.actions.map((act) => ({
      step: getActionLabel(act.type),
      status: "pending",
    }));
    setStepLogs(initialLogs);

    try {
      // Process first file (or all in batch)
      const targetFile = files[0];
      const bytes = await targetFile.arrayBuffer();

      const processedBytes = await executePdfRecipe(bytes, selectedRecipe, (stepIdx, log) => {
        setActiveStepIndex(stepIdx);
        setStepLogs((prev) => {
          const updated = [...prev];
          updated[stepIdx] = log;
          return updated;
        });
      });

      setResultBytes(processedBytes);
      const blob = new Blob([processedBytes as unknown as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);

      const downloadName = `${selectedRecipe.id}-${targetFile.name}`;
      const a = document.createElement("a");
      a.href = url;
      a.download = downloadName;
      a.click();
    } catch {
      // Handled in log
    } finally {
      setRunning(false);
    }
  };

  const handleCreateCustomRecipe = () => {
    if (!customName.trim() || customActions.length === 0) return;
    const newRecipe: PdfRecipe = {
      id: `custom_${Date.now()}`,
      name: customName.trim(),
      badge: "Custom Macro",
      icon: "⚡",
      category: "Custom",
      description: customDesc.trim() || "Custom multi-step PDF automated macro recipe.",
      actions: customActions.map((type) => ({ type })),
    };
    saveCustomRecipe(newRecipe);
    const updated = loadSavedRecipes();
    setRecipes(updated);
    setSelectedRecipe(newRecipe);
    setActiveTab("presets");
    setCustomName("");
    setCustomDesc("");
  };

  const toggleAction = (type: RecipeActionType) => {
    setCustomActions((prev) =>
      prev.includes(type) ? prev.filter((a) => a !== type) : [...prev, type]
    );
  };

  return (
    <div className="space-y-8">
      {/* Recipe Tabs */}
      <div className="flex items-center justify-center p-1.5 bg-[var(--card)] border border-[var(--card-border)] rounded-2xl w-fit mx-auto">
        <button
          onClick={() => setActiveTab("presets")}
          className={`px-6 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all ${
            activeTab === "presets"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
              : "text-[var(--muted)] hover:text-[var(--foreground)]"
          }`}
        >
          ⚡ Industry Preset Recipes
        </button>
        <button
          onClick={() => setActiveTab("custom")}
          className={`px-6 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all ${
            activeTab === "custom"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
              : "text-[var(--muted)] hover:text-[var(--foreground)]"
          }`}
        >
          🛠️ Custom Recipe Builder
        </button>
      </div>

      {activeTab === "presets" ? (
        <>
          {/* Preset Recipe Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recipes.map((recipe) => {
              const isSelected = selectedRecipe.id === recipe.id;
              return (
                <div
                  key={recipe.id}
                  onClick={() => setSelectedRecipe(recipe)}
                  className={`p-5 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between text-left relative overflow-hidden group ${
                    isSelected
                      ? "border-indigo-500 bg-gradient-to-br from-indigo-500/10 via-[var(--card)] to-purple-500/10 shadow-xl shadow-indigo-500/10 ring-2 ring-indigo-500/30"
                      : "border-[var(--card-border)] bg-[var(--card)] hover:border-indigo-500/40 hover:bg-[var(--card)]/80"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-3xl">{recipe.icon}</span>
                      <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                        {recipe.badge}
                      </span>
                    </div>
                    <h3 className="text-base font-extrabold text-[var(--foreground)] mb-1.5 group-hover:text-indigo-400 transition">
                      {recipe.name}
                    </h3>
                    <p className="text-xs text-[var(--muted)] line-clamp-3 leading-relaxed mb-4">
                      {recipe.description}
                    </p>
                  </div>

                  <div>
                    <div className="pt-3 border-t border-[var(--card-border)]/60 flex flex-wrap gap-1.5">
                      {recipe.actions.map((act, i) => (
                        <span
                          key={i}
                          className="text-[10px] font-semibold px-2 py-0.5 rounded-lg bg-[var(--background)] border border-[var(--card-border)] text-[var(--muted)]"
                        >
                          {i + 1}. {getActionLabel(act.type)}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Recipe Execution Deck */}
          <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl backdrop-blur-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-[var(--card-border)]">
              <div className="flex items-center gap-3">
                <span className="text-4xl">{selectedRecipe.icon}</span>
                <div>
                  <h3 className="text-lg font-extrabold text-[var(--foreground)]">
                    Active Macro: {selectedRecipe.name}
                  </h3>
                  <p className="text-xs text-[var(--muted)]">
                    Executes {selectedRecipe.actions.length} automated steps in sequence
                  </p>
                </div>
              </div>
            </div>

            {/* Dropzone */}
            <div className="border-2 border-dashed border-[var(--card-border)] hover:border-indigo-500/50 rounded-3xl p-8 bg-[var(--background)] text-center transition-all">
              <input
                type="file"
                accept=".pdf"
                multiple
                id="recipeFileInput"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files) {
                    setFiles(Array.from(e.target.files));
                    setResultBytes(null);
                    setStepLogs([]);
                  }
                }}
              />
              <label htmlFor="recipeFileInput" className="cursor-pointer flex flex-col items-center gap-2">
                <span className="text-4xl">📄</span>
                <span className="text-sm font-bold text-indigo-400 hover:underline">
                  {files.length > 0
                    ? `${files.length} file(s) selected (${files.map((f) => f.name).join(", ")})`
                    : "Select PDF documents or drag & drop"}
                </span>
                <span className="text-xs text-[var(--muted)]">
                  Process individual files or batch queues in 1 click
                </span>
              </label>
            </div>

            {/* Step Progress Tracker */}
            {stepLogs.length > 0 && (
              <div className="space-y-2.5 p-5 rounded-2xl bg-[var(--background)] border border-[var(--card-border)]">
                <p className="text-xs font-extrabold uppercase tracking-wider text-[var(--foreground)] mb-3">
                  Pipeline Execution Progress
                </p>
                {stepLogs.map((log, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all text-xs ${
                      activeStepIndex === idx && running
                        ? "border-indigo-500/50 bg-indigo-500/10 text-indigo-300 font-bold"
                        : log.status === "completed"
                        ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-400"
                        : "border-[var(--card-border)] opacity-60 text-[var(--muted)]"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {log.status === "running" ? (
                        <svg className="animate-spin h-4 w-4 text-indigo-400" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                      ) : log.status === "completed" ? (
                        <span className="text-emerald-400 font-bold">✓</span>
                      ) : (
                        <span>○</span>
                      )}
                      <span>
                        Step {idx + 1}: {log.step}
                      </span>
                    </div>

                    {log.details && (
                      <span className="text-[11px] font-semibold text-emerald-400/90">{log.details}</span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Run Button */}
            <button
              onClick={handleRunRecipe}
              disabled={running || files.length === 0}
              className="w-full py-4 bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 text-white font-extrabold rounded-2xl hover:opacity-95 disabled:opacity-40 transition-all shadow-xl shadow-indigo-500/25 text-base flex items-center justify-center gap-2 active:scale-[0.99]"
            >
              {running ? "Executing Automated Pipeline Steps..." : `⚡ Run "${selectedRecipe.name}" Recipe`}
            </button>
          </div>
        </>
      ) : (
        /* Custom Recipe Builder Form */
        <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl max-w-2xl mx-auto">
          <div>
            <h3 className="text-lg font-extrabold text-[var(--foreground)] mb-1">
              Build Your Own Automation Macro
            </h3>
            <p className="text-xs text-[var(--muted)]">
              Chain multiple operations together to execute in 1 click across future documents.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[var(--foreground)] uppercase mb-1">
                Macro Name
              </label>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="e.g. Monthly Client Statement Standard"
                className="w-full px-4 py-2.5 rounded-xl border border-[var(--card-border)] bg-[var(--background)] text-sm text-[var(--foreground)] outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--foreground)] uppercase mb-1">
                Description
              </label>
              <input
                type="text"
                value={customDesc}
                onChange={(e) => setCustomDesc(e.target.value)}
                placeholder="e.g. Scans PII, adds header page numbers, and compresses file"
                className="w-full px-4 py-2.5 rounded-xl border border-[var(--card-border)] bg-[var(--background)] text-sm text-[var(--foreground)] outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--foreground)] uppercase mb-2">
                Select Operations to Include (In Execution Order)
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {(
                  [
                    "pii_redact",
                    "bates_number",
                    "watermark",
                    "page_numbers",
                    "flatten",
                    "clean_metadata",
                    "compress",
                  ] as RecipeActionType[]
                ).map((actionType) => {
                  const isChecked = customActions.includes(actionType);
                  return (
                    <button
                      key={actionType}
                      type="button"
                      onClick={() => toggleAction(actionType)}
                      className={`p-3 rounded-xl border text-left text-xs font-bold transition-all flex items-center justify-between ${
                        isChecked
                          ? "border-indigo-500 bg-indigo-500/10 text-indigo-400"
                          : "border-[var(--card-border)] bg-[var(--background)] text-[var(--muted)]"
                      }`}
                    >
                      <span>{getActionLabel(actionType)}</span>
                      <span>{isChecked ? "✓" : "+"}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={handleCreateCustomRecipe}
              disabled={!customName.trim() || customActions.length === 0}
              className="w-full py-3.5 bg-indigo-600 text-white font-extrabold rounded-xl hover:bg-indigo-700 disabled:opacity-40 transition-all text-sm shadow-lg shadow-indigo-500/20"
            >
              Save &amp; Activate Custom Recipe
            </button>
          </div>
        </div>
      )}

      {/* Result Pipeline Action Bar */}
      {resultBytes && (
        <PipelineActionBar
          pdfBytes={resultBytes}
          filename={`${selectedRecipe.id}-${files[0]?.name || "document.pdf"}`}
          downloadUrl={downloadUrl}
          currentToolName={selectedRecipe.name}
        />
      )}
    </div>
  );
}
