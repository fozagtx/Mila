"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { Check, Copy, FilePdf, UploadSimple } from "@phosphor-icons/react";
import type { DealReview, JargonItem, Severity } from "@/lib/types";

const SEVERITY_ORDER: Record<Severity, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

const RISK_SCORE: Record<Severity, { n: number; stamp: string; means: string }> = {
  critical: {
    n: 4,
    stamp: "Do not agree",
    means: "This can lock you in, take rights, or leave you with open-ended risk.",
  },
  high: {
    n: 3,
    stamp: "Negotiate first",
    means: "The other side wrote this for themselves. Change it before you sign.",
  },
  medium: {
    n: 2,
    stamp: "Push back",
    means: "This is not a deal-breaker on its own, but you should still ask for a fairer version.",
  },
  low: {
    n: 1,
    stamp: "Know this",
    means: "Ordinary contract language — still worth understanding in plain English.",
  },
};

const LOADING_STEPS = [
  "Mila is reading the deal…",
  "Scoring the risks…",
  "Translating the jargon…",
  "Writing the email you can send…",
];

type Phase = "idle" | "ready" | "loading" | "error" | "done";

export function DealDesk() {
  const inputId = useId();
  const errorId = useId();
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string | null>(null);
  const [review, setReview] = useState<DealReview | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [copied, setCopied] = useState<"email" | "subject" | null>(null);

  useEffect(() => {
    if (phase !== "loading") return;
    setLoadingStep(0);
    const id = window.setInterval(() => {
      setLoadingStep((s) => (s + 1) % LOADING_STEPS.length);
    }, 2400);
    return () => window.clearInterval(id);
  }, [phase]);

  function takeFile(next: File | undefined) {
    setCopied(null);
    setReview(null);
    setFileName(null);
    if (!next) {
      setFile(null);
      setError(null);
      setPhase("idle");
      return;
    }
    const okType = next.type === "application/pdf" || next.name.toLowerCase().endsWith(".pdf");
    if (!okType) {
      setFile(null);
      setError("Hand Mila a PDF of the deal.");
      setPhase("error");
      return;
    }
    if (next.size > 10 * 1024 * 1024) {
      setFile(null);
      setError("PDF must be 10 MB or smaller.");
      setPhase("error");
      return;
    }
    setFile(next);
    setError(null);
    setPhase("ready");
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file || phase === "loading") return;

    setPhase("loading");
    setError(null);
    setReview(null);

    const body = new FormData();
    body.set("file", file);

    try {
      const res = await fetch("/api/review", { method: "POST", body });
      const data = (await res.json()) as { review?: DealReview; fileName?: string; error?: string };
      if (!res.ok || !data.review) {
        setError(data.error ?? "Mila could not finish this deal. Try again.");
        setPhase("error");
        return;
      }
      setReview(data.review);
      setFileName(data.fileName ?? file.name);
      setPhase("done");
    } catch {
      setError("Could not reach Mila. Check your connection and try again.");
      setPhase("error");
    }
  }

  async function copyText(kind: "email" | "subject", text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(kind);
      window.setTimeout(() => setCopied((c) => (c === kind ? null : c)), 2000);
    } catch {
      setError("Could not copy. Select the text and copy it yourself.");
    }
  }

  const jargon = (review?.jargon ?? [])
    .slice()
    .sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]);

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:items-start lg:gap-14">
      <form
        id="deal-upload"
        onSubmit={onSubmit}
        className="lg:sticky lg:top-8"
        aria-busy={phase === "loading"}
      >
        <fieldset className="min-w-0" disabled={phase === "loading"}>
          <legend className="mb-3 text-sm font-medium text-navy">The deal you are signing</legend>

          <label
            htmlFor={inputId}
            onDragEnter={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              takeFile(e.dataTransfer.files[0]);
            }}
            className={`flex min-h-[9.5rem] cursor-pointer flex-col items-start justify-center gap-2 rounded-2xl border border-dashed px-5 py-6 transition-colors focus-within:ring-2 focus-within:ring-navy/40 focus-within:ring-offset-2 focus-within:ring-offset-cream ${
              dragOver ? "border-navy bg-cream-soft" : "border-navy/25 bg-cream-soft/70 hover:border-navy/50"
            }`}
          >
            <UploadSimple size={22} weight="bold" className="text-navy" aria-hidden />
            <span className="text-sm font-medium text-navy">Drop the contract PDF</span>
            <span className="text-xs leading-relaxed text-navy/60">Text PDFs, 10 MB max. Scans without text cannot be read.</span>
            <input
              ref={fileRef}
              id={inputId}
              name="file"
              type="file"
              accept="application/pdf,.pdf"
              className="sr-only"
              aria-invalid={phase === "error"}
              aria-describedby={error ? errorId : undefined}
              onChange={(e) => takeFile(e.target.files?.[0])}
            />
          </label>

          {file ? (
            <p className="mt-3 flex items-center gap-2 text-sm text-navy">
              <FilePdf size={18} weight="duotone" aria-hidden />
              <span className="min-w-0 truncate font-medium">{file.name}</span>
            </p>
          ) : null}

          {error ? (
            <p id={errorId} role="alert" className="mt-3 text-sm leading-relaxed text-critical">
              {error}
            </p>
          ) : (
            <p className="mt-3 text-xs leading-relaxed text-navy/60">
              Mila scores the risk and writes the email. Have a lawyer read the final contract.
            </p>
          )}

          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={!file || phase === "loading"}
              className="focus-ring inline-flex min-h-10 items-center justify-center rounded-full bg-navy px-5 text-sm font-medium text-cream enabled:hover:bg-navy-soft disabled:cursor-not-allowed disabled:opacity-40"
            >
              {phase === "loading" ? "Working…" : "What's the risk"}
            </button>
            {file || review ? (
              <button
                type="button"
                className="focus-ring inline-flex min-h-10 items-center justify-center rounded-full px-4 text-sm font-medium text-navy/70 hover:text-navy"
                onClick={() => {
                  if (fileRef.current) fileRef.current.value = "";
                  takeFile(undefined);
                }}
              >
                Clear
              </button>
            ) : null}
          </div>
        </fieldset>
      </form>

      <section aria-live="polite" aria-atomic="false" className="min-w-0">
        {phase === "idle" || (phase === "ready" && !review) || (phase === "error" && !review) ? (
          <EmptyDesk hasFile={Boolean(file)} />
        ) : null}

        {phase === "loading" ? <LoadingDesk step={loadingStep} /> : null}

        {phase === "done" && review ? (
          <ReviewWindows
            review={review}
            fileName={fileName}
            jargon={jargon}
            copied={copied}
            onCopyEmail={() =>
              copyText("email", `Subject: ${review.email.subject}\n\n${review.email.body}`)
            }
            onCopySubject={() => copyText("subject", review.email.subject)}
          />
        ) : null}
      </section>
    </div>
  );
}

function EmptyDesk({ hasFile }: { hasFile: boolean }) {
  return (
    <div className="space-y-3">
      <p className="max-w-lg text-sm leading-relaxed text-navy/65">
        {hasFile
          ? "Ask Mila what is in this contract, and she will score the risk, explain the jargon, and write an email you can send."
          : "Hand Mila the deal and she will score the risk, explain the jargon, and write an email you can send."}
      </p>
      <div className="grid gap-3 sm:grid-cols-3">
        <PreviewWindow title="Risk" body="This window scores the deal and tells you whether you should sign yet." />
        <PreviewWindow title="What this means" body="This window turns the contractor's jargon into normal English." />
        <PreviewWindow title="Send this" body="This window is a negotiation email you can give them." />
      </div>
    </div>
  );
}

function PreviewWindow({ title, body }: { title: string; body: string }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-navy/10 bg-cream-soft/70">
      <p className="border-b border-navy/10 px-3 py-2 font-mono text-[11px] uppercase tracking-[0.12em] text-navy/45">
        {title}
      </p>
      <p className="px-3 py-4 text-sm leading-relaxed text-navy/55">{body}</p>
    </div>
  );
}

function LoadingDesk({ step }: { step: number }) {
  return (
    <div className="space-y-3" role="status">
      <p className="text-sm font-medium text-navy">{LOADING_STEPS[step]}</p>
      <div className="grid gap-3 sm:grid-cols-3">
        {["Risk", "What this means", "Send this"].map((title) => (
          <div key={title} className="overflow-hidden rounded-2xl border border-navy/10">
            <p className="border-b border-navy/10 px-3 py-2 font-mono text-[11px] uppercase tracking-[0.12em] text-navy/40">
              {title}
            </p>
            <div className="h-24 animate-pulse bg-cream-deep/70" />
          </div>
        ))}
      </div>
      <span className="sr-only">Mila is working</span>
    </div>
  );
}

function ReviewWindows({
  review,
  fileName,
  jargon,
  copied,
  onCopyEmail,
  onCopySubject,
}: {
  review: DealReview;
  fileName: string | null;
  jargon: JargonItem[];
  copied: "email" | "subject" | null;
  onCopyEmail: () => void;
  onCopySubject: () => void;
}) {
  const score = RISK_SCORE[review.overallSeverity];

  return (
    <div className="space-y-4">
      <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-navy/45">
        {fileName ?? "Contract"}
        {review.parties.length > 0 ? ` · ${review.parties.join(" · ")}` : ""}
      </p>

      <Window title="Risk">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-display text-[1.85rem] italic leading-tight text-navy text-balance">{review.title}</p>
            <p className="mt-3 text-sm text-navy/60">{score.means}</p>
          </div>
          <RiskScore severity={review.overallSeverity} />
        </div>
        <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-navy text-pretty">{review.verdict}</p>
      </Window>

      <Window title="What this really means">
        {jargon.length === 0 ? (
          <p className="text-sm leading-relaxed text-navy/60">
            Nothing in the readable text stood out as jargon or a one-sided clause. Read the original PDF anyway.
          </p>
        ) : (
          <ol className="space-y-6">
            {jargon.map((item, i) => (
              <li
                key={`${item.term}-${i}`}
                className="stagger-in border-t border-navy/10 pt-6 first:border-t-0 first:pt-0"
                style={{ animationDelay: `${Math.min(i, 8) * 45}ms` }}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <p className="text-[15px] font-medium text-navy">{item.term}</p>
                  <RiskScore severity={item.severity} compact />
                </div>
                <p className="mt-3 text-[15px] leading-relaxed text-navy text-pretty">{item.plainEnglish}</p>
                {item.excerpt ? (
                  <blockquote className="mt-3 border-l-2 border-navy/20 pl-3 font-mono text-[12px] leading-relaxed text-navy/55">
                    {item.excerpt}
                  </blockquote>
                ) : null}
                <p className="mt-3 text-sm leading-relaxed text-navy/80">
                  <span className="font-medium text-navy">If you sign this as written: </span>
                  {item.whyBeforeYouAgree}
                </p>
                <p className="mt-1.5 text-sm leading-relaxed text-navy/80">
                  <span className="font-medium text-navy">Ask them to change: </span>
                  {item.negotiateFor}
                </p>
              </li>
            ))}
          </ol>
        )}
      </Window>

      <Window
        title="Give them this"
        action={
          <div className="flex flex-wrap gap-2">
            <CopyButton
              label={copied === "subject" ? "Subject copied" : "Copy subject"}
              done={copied === "subject"}
              onClick={onCopySubject}
            />
            <CopyButton
              label={copied === "email" ? "Email copied" : "Copy email"}
              done={copied === "email"}
              onClick={onCopyEmail}
            />
          </div>
        }
      >
        <p className="text-sm leading-relaxed text-navy/60">
          Send this to the other party so they can change the terms. It is written for you to pass along as-is.
        </p>
        <p className="mt-5 font-mono text-[12px] text-navy/50">Subject</p>
        <p className="mt-1 text-sm font-medium text-navy">{review.email.subject}</p>
        <pre className="mt-5 whitespace-pre-wrap font-sans text-sm leading-relaxed text-navy">{review.email.body}</pre>
      </Window>
    </div>
  );
}

function Window({
  title,
  action,
  children,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-navy/10 bg-cream-soft/80">
      <header className="flex min-h-10 flex-wrap items-center justify-between gap-2 border-b border-navy/10 px-4 py-2">
        <h3 className="font-mono text-[11px] uppercase tracking-[0.12em] text-navy/50">{title}</h3>
        {action}
      </header>
      <div className="p-5 md:p-6">{children}</div>
    </section>
  );
}

function RiskScore({ severity, compact = false }: { severity: Severity; compact?: boolean }) {
  const score = RISK_SCORE[severity];
  const tone =
    severity === "critical"
      ? "text-critical"
      : severity === "high"
        ? "text-high"
        : "text-navy";

  return (
    <div className="text-right">
      <p className={`font-mono text-[11px] uppercase tracking-wide ${tone}`}>
        {score.stamp}
      </p>
      <p className={`font-mono tabular-nums ${compact ? "text-sm" : "text-2xl"} ${tone}`}>
        {score.n}
        <span className="text-navy/35"> / 4</span>
      </p>
    </div>
  );
}

function CopyButton({
  label,
  done,
  onClick,
}: {
  label: string;
  done: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="focus-ring inline-flex min-h-10 items-center gap-1.5 rounded-full border border-navy/15 bg-cream px-3.5 text-sm font-medium text-navy hover:border-navy/35"
    >
      {done ? <Check size={16} weight="bold" aria-hidden /> : <Copy size={16} weight="bold" aria-hidden />}
      {label}
    </button>
  );
}
