"use client";

import React, { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  FileArchive,
  Loader2,
  Sparkles,
  X,
  CheckCircle2,
  Brain,
  ScrollText,
  Layers,
  Wand2,
  ArrowRight,
} from "lucide-react";
import { useRouter } from "next/navigation";

type Step = "processing" | "analyzing" | "creating" | "finishing" | "done";

interface StepConfig {
  key: Step;
  label: string;
  icon: React.ElementType;
}

const STEPS: StepConfig[] = [
  { key: "processing", label: "Processing your info", icon: Brain },
  { key: "analyzing", label: "Analyzing your stories", icon: ScrollText },
  { key: "creating", label: "Creating your cards", icon: Layers },
  { key: "finishing", label: "Finishing it up", icon: Wand2 },
  { key: "done", label: "Done!", icon: CheckCircle2 },
];

function getStepIndex(step: Step): number {
  return STEPS.findIndex((s) => s.key === step);
}

export function OnboardClient() {
  const router = useRouter();
  const [dmName, setDmName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [started, setStarted] = useState(false);
  const [currentStep, setCurrentStep] = useState<Step | null>(null);
  const [detail, setDetail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [summary, setSummary] = useState<Record<string, number> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile?.name.toLowerCase().endsWith(".zip")) {
      setFile(droppedFile);
      setError(null);
    } else {
      setError("Please upload a .zip file");
    }
  }, []);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (selectedFile) {
        if (selectedFile.name.toLowerCase().endsWith(".zip")) {
          setFile(selectedFile);
          setError(null);
        } else {
          setError("Please upload a .zip file");
        }
      }
    },
    [],
  );

  const handleSubmit = async () => {
    if (!file) return;

    setError(null);
    setStarted(true);
    setCurrentStep("processing");
    setDetail("Uploading your campaign archive...");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("dmName", dmName || "Dungeon Master");

      abortRef.current = new AbortController();

      const response = await fetch("/api/onboard", {
        method: "POST",
        body: formData,
        signal: abortRef.current.signal,
      });

      if (!response.ok || !response.body) {
        throw new Error("Failed to connect to ArcMind");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const event = JSON.parse(line.slice(6));
            if (event.step === "error") {
              throw new Error(event.detail || "Something went wrong");
            }
            if (event.step && event.step !== "error") {
              setCurrentStep(event.step as Step);
            }
            if (event.detail) {
              setDetail(event.detail);
            }
            if (event.summary) {
              setSummary(event.summary);
            }
          } catch (parseErr) {
            if (parseErr instanceof SyntaxError) {
              // JSON parse error from incomplete SSE chunk, skip
            } else {
              throw parseErr;
            }
          }
        }
      }
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      setError(err instanceof Error ? err.message : "Something went wrong");
      setStarted(false);
      setCurrentStep(null);
    }
  };

  const isDone = currentStep === "done";
  const isProcessing = started && !isDone && !error;
  const currentStepIndex = currentStep ? getStepIndex(currentStep) : -1;

  return (
    <div className="min-h-screen bg-[#09090B] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* ArcMind Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 via-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <Sparkles className="h-7 w-7 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-3 tracking-tight">
            Welcome to <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">ArcMind</span>
          </h1>
          <p className="text-zinc-400 text-sm max-w-md mx-auto leading-relaxed">
            Upload a zip file of all your campaign info and ArcMind will build
            your personalized DM dashboard automatically.
          </p>
        </motion.div>

        {/* Main card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#141416] border border-white/[0.06] rounded-2xl p-8"
        >
          <AnimatePresence mode="wait">
            {!started ? (
              <motion.div
                key="upload-form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, y: -10 }}
              >
                {/* DM Name Input */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Your DM Name
                  </label>
                  <input
                    type="text"
                    value={dmName}
                    onChange={(e) => setDmName(e.target.value)}
                    placeholder="e.g. Rachel, Matt Mercer, etc."
                    className="w-full h-11 px-4 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white placeholder:text-zinc-600 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/30 transition-all"
                  />
                </div>

                {/* File Upload Area */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Campaign Documents (ZIP)
                  </label>
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOver(true);
                    }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
                      dragOver
                        ? "border-indigo-400/50 bg-indigo-400/[0.03]"
                        : file
                          ? "border-emerald-400/30 bg-emerald-400/[0.02]"
                          : "border-white/[0.08] bg-white/[0.01] hover:border-white/[0.15] hover:bg-white/[0.02]"
                    }`}
                    onClick={() =>
                      document.getElementById("file-input")?.click()
                    }
                  >
                    <input
                      id="file-input"
                      type="file"
                      accept=".zip"
                      onChange={handleFileSelect}
                      className="hidden"
                    />

                    {file ? (
                      <div className="flex items-center justify-center gap-3">
                        <FileArchive className="h-8 w-8 text-emerald-400" />
                        <div className="text-left">
                          <p className="text-sm font-medium text-white">
                            {file.name}
                          </p>
                          <p className="text-xs text-zinc-500">
                            {(file.size / (1024 * 1024)).toFixed(1)} MB
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setFile(null);
                          }}
                          className="ml-2 p-1 rounded-lg hover:bg-white/[0.05] text-zinc-500 hover:text-white transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <Upload className="h-8 w-8 text-zinc-600 mx-auto mb-3" />
                        <p className="text-sm text-zinc-400 mb-1">
                          Drop your campaign zip here or{" "}
                          <span className="text-indigo-400 font-medium">
                            browse
                          </span>
                        </p>
                        <p className="text-xs text-zinc-600">
                          Supports .docx, .txt, and .md files inside the zip
                        </p>
                      </>
                    )}
                  </div>
                </div>

                {/* Error message */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
                    >
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit button */}
                <button
                  onClick={handleSubmit}
                  disabled={!file}
                  className={`w-full h-12 rounded-xl font-medium text-sm transition-all ${
                    !file
                      ? "bg-white/[0.03] text-zinc-600 cursor-not-allowed border border-white/[0.05]"
                      : "bg-gradient-to-r from-violet-500 to-indigo-600 text-white hover:from-violet-400 hover:to-indigo-500 shadow-lg shadow-indigo-500/20"
                  }`}
                >
                  Let ArcMind Build My Dashboard
                </button>

                <p className="text-[11px] text-zinc-600 text-center mt-4 leading-relaxed">
                  Include session notes, character sheets, NPC trackers, world lore,
                  and more. AI will extract and organize everything.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="progress-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="py-2"
              >
                {/* Step list */}
                <div className="space-y-1">
                  {STEPS.map((step, idx) => {
                    const Icon = step.icon;
                    const isActive = step.key === currentStep;
                    const isComplete = currentStepIndex > idx || isDone;
                    const isPending = currentStepIndex < idx && !isDone;

                    return (
                      <motion.div
                        key={step.key}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all ${
                          isActive && !isDone
                            ? "bg-indigo-500/[0.08] border border-indigo-500/20"
                            : isComplete
                              ? "bg-emerald-500/[0.04] border border-transparent"
                              : "border border-transparent opacity-40"
                        }`}
                      >
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                            isComplete
                              ? "bg-emerald-500/20 text-emerald-400"
                              : isActive && !isDone
                                ? "bg-indigo-500/20 text-indigo-400"
                                : "bg-white/[0.04] text-zinc-600"
                          }`}
                        >
                          {isComplete ? (
                            <CheckCircle2 className="h-[18px] w-[18px]" />
                          ) : isActive && !isDone ? (
                            <Loader2 className="h-[18px] w-[18px] animate-spin" />
                          ) : (
                            <Icon className="h-[18px] w-[18px]" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-sm font-medium ${
                              isComplete
                                ? "text-emerald-300"
                                : isActive && !isDone
                                  ? "text-indigo-300"
                                  : "text-zinc-500"
                            }`}
                          >
                            {step.label}
                          </p>
                          {isActive && !isDone && detail && (
                            <motion.p
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="text-xs text-zinc-500 mt-0.5 truncate"
                            >
                              {detail}
                            </motion.p>
                          )}
                          {isComplete && !isPending && step.key !== "done" && (
                            <p className="text-xs text-zinc-600 mt-0.5">
                              Complete
                            </p>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Summary + CTA when done */}
                <AnimatePresence>
                  {isDone && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="mt-6"
                    >
                      {summary && (
                        <div className="grid grid-cols-4 gap-2 mb-6">
                          {Object.entries(summary)
                            .filter(([, count]) => count > 0)
                            .map(([key, count]) => (
                              <div
                                key={key}
                                className="text-center p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04]"
                              >
                                <p className="text-lg font-bold text-white">
                                  {count}
                                </p>
                                <p className="text-[10px] text-zinc-500 capitalize">
                                  {key.replace(/([A-Z])/g, " $1").trim()}
                                </p>
                              </div>
                            ))}
                        </div>
                      )}

                      <button
                        onClick={() => router.push("/dashboard")}
                        className="w-full h-12 rounded-xl font-medium text-sm bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-400 hover:to-teal-500 shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
                      >
                        Take me to my dashboard
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Processing indicator */}
                {isProcessing && (
                  <p className="text-[11px] text-zinc-600 text-center mt-6">
                    ArcMind is working its magic — this may take a minute or two
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
