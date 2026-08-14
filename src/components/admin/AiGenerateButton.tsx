"use client";

import { useState } from "react";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { useAiGenerate } from "@/lib/ai/useAiGenerate";
import { TASK_LABELS, TASK_FIELDS, type TaskName } from "@/lib/ai/tasks";
import { Spinner } from "@/components/Spinner";

type Variant = "secondary" | "inline" | "outline";

const VARIANT_CLASS: Record<Variant, string> = {
  secondary: "btn-base btn-secondary",
  inline: "btn-base btn-secondary !px-2 !py-1 text-xs",
  outline: "btn-base btn-outline",
};

export function AiGenerateButton<T = string | Record<string, unknown>>({
  task,
  context,
  onResult,
  label = "Generate with AI",
  variant = "secondary",
  disabled,
  className,
}: {
  task: TaskName;
  context: Record<string, unknown>;
  onResult: (result: T) => void;
  label?: string;
  variant?: Variant;
  disabled?: boolean;
  className?: string;
}) {
  const { run, previewBrief, loading, previewLoading, error, setError } = useAiGenerate();
  const [open, setOpen] = useState(false);
  const [brief, setBrief] = useState("");

  const openModal = async () => {
    setError("");
    setOpen(true);
    setBrief(await previewBrief(task, context));
  };

  const close = () => {
    if (loading) return;
    setOpen(false);
  };

  const generate = async () => {
    const result = await run<T>(task, context, brief);
    if (result !== null) {
      onResult(result);
      setOpen(false);
    }
  };

  const fields = TASK_FIELDS[task];

  return (
    <>
      <button
        type="button"
        disabled={disabled}
        onClick={openModal}
        className={`${VARIANT_CLASS[variant]} ${className ?? ""}`}
      >
        {label}
      </button>

      <Dialog open={open} onClose={close} className="relative z-50">
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" aria-hidden />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="w-full max-w-lg rounded-2xl border border-border bg-surface p-6 text-foreground shadow-2xl">
            <DialogTitle className="font-display text-lg font-semibold">
              {TASK_LABELS[task] ?? "Generate with AI"}
            </DialogTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              {fields?.length
                ? `This will fill in: ${fields.join(", ")}. Optimized for SEO — feel free to add your own details below.`
                : "Optimized for SEO — feel free to add your own details below."}
            </p>

            <div className="mt-4">
              <label className="mono-label text-muted-foreground">What should the AI write about?</label>
              <textarea
                value={previewLoading ? "Loading…" : brief}
                onChange={(e) => setBrief(e.target.value)}
                disabled={previewLoading || loading}
                rows={6}
                placeholder="Add extra details, tone, or specifics the AI should use…"
                className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground disabled:text-muted-foreground"
              />
              <p className="mt-1.5 text-[12.5px] text-muted-foreground">
                Pre-filled from this form&apos;s fields. Edit it however you like, then generate.
              </p>
            </div>

            {error ? (
              <p className="mt-2 text-[13px] text-[color:var(--app-destructive)]">{error}</p>
            ) : null}

            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={close} disabled={loading} className="btn-base btn-outline">
                Cancel
              </button>
              <button
                type="button"
                onClick={generate}
                disabled={previewLoading || loading || !brief.trim()}
                className="btn-base btn-primary"
              >
                {loading ? <Spinner className="h-4 w-4" /> : null}
                {loading ? "Generating…" : "Generate"}
              </button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </>
  );
}
