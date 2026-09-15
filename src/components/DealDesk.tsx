"use client";

import { useEffect, useId, useRef, useState, type CSSProperties } from "react";
import { CaretDown, Check, Copy, FilePdf, UploadSimple } from "@phosphor-icons/react";
import type { DealReview, JargonItem, Severity } from "@/lib/types";
import { MOCK_REVIEW } from "@/lib/mock-review";

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
  "Writing a negotiable email…",
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
  const [mockOn, setMockOn] = useState(false);
  const [moreBelow, setMoreBelow] = useState(false);
  const mockToggleId = useId();
  const mockTimer = useRef<number | null>(null);
  const resultsRef = useRef<HTMLElement>(null);

  useEffect(() => {
    return () => {
      if (mockTimer.current) window.clearTimeout(mockTimer.current);
    };
  }, []);

  useEffect(() => {
    if (phase !== "loading") return;
    setLoadingStep(0);
    const id = window.setInterval(() => {
      setLoadingStep((s) => (s + 1) % LOADING_STEPS.length);
    }, 2400);
    return () => window.clearInterval(id);
  }, [phase]);

  useEffect(() => {
    if (phase !== "done" || !review) {
      setMoreBelow(false);
      return;
    }

    const update = () => {
      const leftover =
        document.documentElement.scrollHeight - window.innerHeight - window.scrollY;
      setMoreBelow(leftover > 80);
    };

    const id = window.requestAnimationFrame(() => {
      update();
      window.requestAnimationFrame(update);
    });
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    const ro = new ResizeObserver(update);
    ro.observe(document.documentElement);
    return () => {
      window.cancelAnimationFrame(id);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      ro.disconnect();
    };
  }, [phase, review]);

  function takeFile(next: File | undefined) {
    setCopied(null);
    setReview(null);
    setFileName(null);
    if (!next) {
      setFile(null);
      setError(null);
      setMockOn(false);
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
    setMockOn(false);
    setPhase("ready");
  }

  function toggleMock(on: boolean) {
    setMockOn(on);
    setCopied(null);
    setError(null);
    if (mockTimer.current) window.clearTimeout(mockTimer.current);
    if (on) {
      setReview(null);
      setFileName("Harborline station operator agreement (mock)");
      setPhase("loading");
      mockTimer.current = window.setTimeout(() => {
        setReview(MOCK_REVIEW);
        setPhase("done");
      }, 900);
      return;
    }
    setReview(null);
    setFileName(null);
    setPhase(file ? "ready" : "idle");
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
    <>
    <div className="space-y-4">
      <form
        id="deal-upload"
        onSubmit={onSubmit}
        className="sticky top-0 z-20 -mx-4 border-b border-navy/10 bg-cream/95 px-4 py-2.5 backdrop-blur-[2px] md:-mx-6 md:px-6"
        aria-busy={phase === "loading"}
      >
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <label htmlFor={mockToggleId} className="inline-flex cursor-pointer items-center gap-2 text-sm text-navy">
            <input
              id={mockToggleId}
              type="checkbox"
              checked={mockOn}
              onChange={(e) => toggleMock(e.target.checked)}
              className="size-4 shrink-0 accent-navy"
            />
            <span>
              <span className="font-medium">Optional mock.</span>{" "}
              <span className="text-navy">
                This shows the review without AWS, because Bedrock is still waiting on Support.
              </span>
            </span>
          </label>
        </div>

        {mockOn ? null : (
        <fieldset className="mt-2.5 min-w-0" disabled={phase === "loading"}>
          <legend className="sr-only">The deal you are signing</legend>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
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
              className={`flex min-h-12 flex-1 cursor-pointer items-center gap-3 rounded-xl border border-dashed px-3.5 py-2.5 transition-colors focus-within:ring-2 focus-within:ring-navy/40 focus-within:ring-offset-2 focus-within:ring-offset-cream ${
                dragOver ? "border-navy bg-cream-soft" : "border-navy/25 bg-cream-soft/70 hover:border-navy/50"
              }`}
            >
              {file ? (
                <FilePdf size={18} weight="duotone" className="shrink-0 text-navy" aria-hidden />
              ) : (
                <UploadSimple size={18} weight="bold" className="shrink-0 text-navy" aria-hidden />
              )}
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium text-navy">
                  {file ? file.name : "Drop the contract PDF"}
                </span>
                <span className="block text-xs text-navy">
                  {file ? "Ready to score." : "Text PDFs, 10 MB max."}
                </span>
              </span>
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
            <div className="flex shrink-0 flex-wrap gap-2">
              <button
                type="submit"
                disabled={!file || phase === "loading"}
                className="focus-ring inline-flex min-h-10 items-center justify-center rounded-full bg-navy px-4 text-sm font-medium text-cream enabled:hover:bg-navy-soft disabled:cursor-not-allowed disabled:opacity-40"
              >
                {phase === "loading" ? "Working…" : "What's the risk"}
              </button>
              {file || review ? (
                <button
                  type="button"
                  className="focus-ring inline-flex min-h-10 items-center justify-center rounded-full px-3 text-sm font-medium text-navy hover:text-navy"
                  onClick={() => {
                    if (fileRef.current) fileRef.current.value = "";
                    takeFile(undefined);
                  }}
                >
                  Clear
                </button>
              ) : null}
            </div>
          </div>
          {error ? (
            <p id={errorId} role="alert" className="mt-2 text-sm text-critical">
              {error}
            </p>
          ) : (
            <p className="mt-2 text-xs text-navy">
              Mila scores the risk and writes a negotiable email. Have a lawyer read the final contract.
            </p>
          )}
        </fieldset>
        )}
      </form>

      <section
        ref={resultsRef}
        aria-live="polite"
        aria-atomic="false"
        className={`min-w-0 ${phase === "done" && review ? "pb-14" : ""}`}
      >
        {phase === "idle" || (phase === "ready" && !review) || (phase === "error" && !review) ? (
          <EmptyDesk hasFile={Boolean(file)} />
        ) : null}

        {phase === "loading" ? <LoadingDesk step={loadingStep} /> : null}

        {phase === "done" && review ? (
          <ReviewWindows
            review={review}
            fileName={fileName}
            isMock={mockOn}
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
    {moreBelow ? (
      <>
        <div className="scroll-more-fade" aria-hidden />
        <button
          type="button"
          className="scroll-more-hint focus-ring"
          aria-label="Scroll down. More of the review is below."
          onClick={() =>
            window.scrollBy({
              top: Math.round(window.innerHeight * 0.72),
              behavior: "smooth",
            })
          }
        >
          <CaretDown size={16} weight="bold" className="scroll-more-caret" aria-hidden />
          More below
        </button>
      </>
    ) : null}
    </>
  );
}

function EmptyDesk({ hasFile }: { hasFile: boolean }) {
  return (
    <div className="space-y-3">
      <p className="max-w-xl text-sm leading-snug text-navy">
        {hasFile
          ? "Ask Mila what is in this contract. She scores each risk as a circle. Click one to read the card."
          : "Hand Mila the deal. She scores each risk as a circle. Click one to read the card."}
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        {["Risk", "Clause", "Clause", "Email"].map((label, i) => (
          <div key={`${label}-${i}`} className="flex w-20 flex-col items-center gap-1.5 px-1 py-1">
            <span className="grid size-20 place-items-center rounded-full border border-dashed border-navy/20 text-navy/30">
              <span className="font-mono text-sm tabular-nums">{i === 3 ? "—" : "0"}</span>
            </span>
            <span className="text-[11px] text-navy">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function LoadingDesk({ step }: { step: number }) {
  return (
    <div className="space-y-3" role="status">
      <p className="text-sm font-medium text-navy">{LOADING_STEPS[step]}</p>
      <div className="flex flex-wrap justify-center gap-3">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="flex w-20 flex-col items-center gap-1.5 px-1 py-1">
            <span className="size-20 animate-pulse rounded-full bg-cream-deep/80" />
            <span className="h-2.5 w-12 animate-pulse rounded bg-cream-deep/70" />
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
  isMock,
  jargon,
  copied,
  onCopyEmail,
  onCopySubject,
}: {
  review: DealReview;
  fileName: string | null;
  isMock: boolean;
  jargon: JargonItem[];
  copied: "email" | "subject" | null;
  onCopyEmail: () => void;
  onCopySubject: () => void;
}) {
  const [open, setOpen] = useState<string>("risk");
  const detailId = useId();
  const score = RISK_SCORE[review.overallSeverity];
  const selectedJargon =
    open?.startsWith("j-") ? jargon[Number(open.slice(2))] : undefined;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen("risk");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  function toggle(key: string) {
    setOpen(key);
  }

  return (
    <div className="space-y-3">
      <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-navy">
        {isMock ? "Mock · " : ""}
        {fileName ?? "Contract"}
        {review.parties.length > 0 ? ` · ${review.parties.join(" · ")}` : ""}
      </p>
      <p className="font-display text-[1.5rem] italic leading-none text-navy">{review.title}</p>

      <div className="flex flex-wrap items-start justify-center gap-2">
        <ScorePick
          severity={review.overallSeverity}
          name="Overall risk"
          label="Risk"
          selected={open === "risk"}
          detailId={detailId}
          onClick={() => toggle("risk")}
        />
        {jargon.map((item, i) => (
          <ScorePick
            key={`${item.term}-${i}`}
            severity={item.severity}
            name={item.term}
            label={shortLabel(item.term)}
            selected={open === `j-${i}`}
            detailId={detailId}
            onClick={() => toggle(`j-${i}`)}
          />
        ))}
        <button
          type="button"
          aria-pressed={open === "email"}
          aria-expanded={open === "email"}
          aria-controls={detailId}
          onClick={() => toggle("email")}
          className={`focus-ring flex w-20 flex-col items-center gap-1.5 rounded-2xl px-1 py-1.5 ${
            open === "email" ? "ring-2 ring-navy ring-offset-2 ring-offset-cream" : "hover:bg-navy/5"
          }`}
        >
          <span className="grid size-20 place-items-center rounded-full border-[5px] border-[#d8d8dc] text-[11px] font-medium text-navy">
            Mail
          </span>
          <span className="text-center text-[11px] leading-tight text-navy">Email</span>
        </button>
      </div>

      {open === "risk" ? (
        <article id={detailId} className="deal-card">
          <p className={`deal-kicker ${toneClass(review.overallSeverity)}`}>
            {score.stamp} · {score.n} / 4
          </p>
          <h3 className="deal-title">What's the risk</h3>
          <p className="deal-dek">{score.means}</p>
          <p className="deal-body">{review.verdict}</p>
        </article>
      ) : null}

      {selectedJargon ? (
        <article id={detailId} className="deal-card">
          <p className={`deal-kicker ${toneClass(selectedJargon.severity)}`}>
            {RISK_SCORE[selectedJargon.severity].stamp} · {RISK_SCORE[selectedJargon.severity].n} / 4
          </p>
          <h3 className="deal-title">{selectedJargon.term}</h3>
          <p className="deal-body">{selectedJargon.plainEnglish}</p>
          {selectedJargon.excerpt ? (
            <figure className="deal-quote">
              <figcaption>In the contract</figcaption>
              <blockquote>{selectedJargon.excerpt}</blockquote>
            </figure>
          ) : null}
          <dl className="deal-notes">
            <div>
              <dt>If you sign this as written</dt>
              <dd>{selectedJargon.whyBeforeYouAgree}</dd>
            </div>
            <div>
              <dt>Ask them to change</dt>
              <dd>{selectedJargon.negotiateFor}</dd>
            </div>
          </dl>
        </article>
      ) : null}

      {open === "email" ? (
        <article id={detailId} className="deal-card">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="deal-kicker text-navy">Give them this</p>
              <h3 className="deal-title">{review.email.subject}</h3>
            </div>
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
          </div>
          <p className="deal-dek">
            Send this to the other party so they can change the terms. It is written for you to pass along as-is.
          </p>
          <pre className="deal-body mt-4 whitespace-pre-wrap font-sans">{review.email.body}</pre>
        </article>
      ) : null}

      {jargon.length === 0 && open === "risk" ? (
        <p className="text-sm leading-relaxed text-navy">
          Nothing in the readable text stood out as jargon or a one-sided clause. Read the original PDF anyway.
        </p>
      ) : null}
    </div>
  );
}

function shortLabel(term: string) {
  if (term.length <= 16) return term;
  return term.split(" ").slice(0, 2).join(" ");
}

function toneClass(severity: Severity, onInk = false) {
  if (severity === "critical") return "text-critical";
  if (severity === "high") return "text-high";
  return onInk ? "text-cream" : "text-navy";
}

function ScorePick({
  severity,
  name,
  label,
  selected,
  detailId,
  onClick,
}: {
  severity: Severity;
  name: string;
  label: string;
  selected: boolean;
  detailId: string;
  onClick: () => void;
}) {
  const score = RISK_SCORE[severity];
  return (
    <button
      type="button"
      aria-pressed={selected}
      aria-expanded={selected}
      aria-controls={detailId}
      onClick={onClick}
      className={`focus-ring flex w-20 flex-col items-center gap-1.5 rounded-2xl px-1 py-1.5 ${
        selected ? "ring-2 ring-navy ring-offset-2 ring-offset-cream" : "hover:bg-navy/5"
      }`}
    >
      <ScoreRing severity={severity} />
      <span className="line-clamp-2 text-center text-[11px] leading-tight text-navy" aria-hidden>
        {label}
      </span>
      <span className="sr-only">
        {name}. {score.stamp}, {score.n} out of 4, {score.n * 25} percent.{" "}
        {selected ? "Details are open." : "Show details."}
      </span>
    </button>
  );
}

function ScoreRing({ severity }: { severity: Severity }) {
  const { n } = RISK_SCORE[severity];
  const percent = n * 25;
  const radius = 16.5;
  const circumference = 2 * Math.PI * radius;
  const filled = (percent / 100) * circumference;

  return (
    <span
      className="relative grid size-20 place-items-center text-navy"
      style={{ "--ring-fill": filled, "--ring-c": circumference } as CSSProperties}
      aria-hidden
    >
      <svg viewBox="0 0 44 44" className="absolute inset-0 size-full -rotate-90">
        <circle cx="22" cy="22" r={radius} fill="#fbf6ec" />
        <circle
          cx="22"
          cy="22"
          r={radius}
          fill="none"
          stroke="var(--ios-track)"
          strokeWidth="5"
        />
        <circle
          cx="22"
          cy="22"
          r={radius}
          fill="none"
          stroke="var(--ios-ring)"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={`${filled} ${circumference}`}
          className="score-ring-arc"
        />
      </svg>
      <span className="relative flex flex-col items-center leading-none">
        <span className="font-mono text-[1.15rem] tabular-nums tracking-tight">{percent}</span>
        <span className="mt-0.5 text-[9px] font-semibold tracking-wide text-navy">%</span>
      </span>
    </span>
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
      className="focus-ring inline-flex min-h-10 items-center gap-1.5 rounded-full border border-navy/25 bg-transparent px-3.5 text-sm font-medium text-navy hover:border-navy"
    >
      {done ? <Check size={16} weight="bold" aria-hidden /> : <Copy size={16} weight="bold" aria-hidden />}
      {label}
    </button>
  );
}
