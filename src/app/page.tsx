import { TrendChart } from "@/components/TrendChart";
import {
  getRecentReports,
  getTotals,
  getUseErrorSignals,
  getYearlyByType,
  USE_ERROR_PATTERNS,
  type ErrorStage,
} from "@/lib/openfda";
import type { ReactNode } from "react";

const STAGE_CHIP: Record<ErrorStage, { label: string; className: string }> = {
  perception: { label: "Perception", className: "bg-brass-100 text-brass-700" },
  cognition: { label: "Cognition", className: "bg-ink-50 text-ink-700" },
  action: { label: "Action", className: "bg-rust-600/10 text-rust-600" },
  boundary: { label: "Boundary case", className: "border border-stone-350/60 text-stone-550" },
  attribution: { label: "Reporter-attributed", className: "border border-stone-350/60 text-stone-550" },
};

export const revalidate = 86400;

const PORTFOLIO = "https://www.kennedydesousa.com";

function highlight(text: string): ReactNode[] {
  const phrases = USE_ERROR_PATTERNS.map((p) => p.phrase);
  const re = new RegExp(`(${phrases.join("|")})`, "gi");
  return text.split(re).map((part, i) =>
    phrases.some((p) => p.toLowerCase() === part.toLowerCase()) ? (
      <mark key={i}>{part}</mark>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: "rust" | "brass" }) {
  return (
    <div className="rounded-lg border border-stone-350/40 bg-cream p-6">
      <p
        className={`font-serif text-4xl font-medium ${
          tone === "rust" ? "text-rust-600" : tone === "brass" ? "text-brass-600" : "text-ink-800"
        }`}
      >
        {value}
      </p>
      <p className="mt-2 text-sm text-stone-550">{label}</p>
    </div>
  );
}

export default async function Home() {
  const [totals, yearly, signals, recent] = await Promise.all([
    getTotals(),
    getYearlyByType(2008),
    getUseErrorSignals(),
    getRecentReports(5),
  ]);

  return (
    <main className="mx-auto w-full max-w-5xl px-5 pb-24 sm:px-8">
      {/* Header */}
      <header className="flex flex-wrap items-baseline justify-between gap-3 border-b border-stone-350/40 py-6">
        <div>
          <p className="font-serif text-xl font-medium text-ink-900">
            MAUDE Signal Explorer
          </p>
          <p className="text-xs uppercase tracking-[0.14em] text-brass-600">
            Surgical Staplers · A Human Factors Lens
          </p>
        </div>
        <p className="text-sm text-stone-550">
          An independent demo by{" "}
          <a href={PORTFOLIO} className="font-medium text-ink-600 underline underline-offset-2">
            Kennedy DeSousa
          </a>
        </p>
      </header>

      {/* Hero */}
      <section className="py-14">
        <p className="mb-5 text-xs font-semibold uppercase tracking-[0.18em] text-brass-600">
          Post-market surveillance, read like a human factors engineer
        </p>
        <h1 className="font-serif max-w-3xl text-4xl font-medium leading-tight text-ink-900 sm:text-5xl">
          What {Math.round(totals.all / 1000)},000+ adverse-event reports say
          about surgical staplers
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-stone-650">
          HFE teams mostly look forward — formative studies, validation,
          design controls. But the FDA&apos;s MAUDE database is a backward-looking
          goldmine: real use errors, in real ORs, in the reporters&apos; own words.
          This page mines the public{" "}
          <a href="https://open.fda.gov/apis/device/event/" className="text-ink-600 underline underline-offset-2">
            openFDA device-event API
          </a>{" "}
          for surgical staplers (product codes GAG &amp; GDW) and shows how
          post-market signals can seed formative-study hypotheses.
        </p>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Total reports in MAUDE" value={totals.all.toLocaleString()} />
        <Stat label="Malfunctions" value={totals.malfunction.toLocaleString()} />
        <Stat label="Injuries" value={totals.injury.toLocaleString()} tone="brass" />
        <Stat label="Deaths" value={totals.death.toLocaleString()} tone="rust" />
      </section>
      <p className="mt-3 text-xs text-stone-450">
        Live from openFDA · dataset last updated {totals.lastUpdated}
      </p>

      {/* Trend */}
      <section className="mt-16">
        <h2 className="font-serif text-2xl font-medium text-ink-900">
          Reports per year — and the hidden-database story
        </h2>
        <p className="mb-8 mt-3 max-w-2xl leading-relaxed text-stone-650">
          For years, stapler manufacturers could route adverse events through
          FDA&apos;s &ldquo;Alternative Summary Reporting&rdquo; program —
          tens of thousands of malfunction reports that never appeared in
          public MAUDE. After investigative reporting surfaced the practice,
          FDA ended ASR in mid-2019 and the hidden reports flooded into the
          public record. The lesson for anyone reading this data:{" "}
          <em>the shape of a reporting curve reflects policy as much as risk.</em>
        </p>
        <TrendChart data={yearly} />
      </section>

      {/* Use-error lens */}
      <section className="mt-16">
        <h2 className="font-serif text-2xl font-medium text-ink-900">
          A use-error lens on the narratives
        </h2>
        <p className="mb-8 mt-3 max-w-2xl leading-relaxed text-stone-650">
          Event narratives often encode <em>perception, cognition, or action</em>{" "}
          failures — the raw material of use-related risk analysis. These
          phrase counts are a deliberately simple heuristic for surfacing
          candidate reports to read, not a validated classifier:
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {signals.map((s) => (
            <div key={s.phrase} className="rounded-lg border border-stone-350/40 bg-paper/60 p-5">
              <div className="flex items-baseline justify-between gap-2">
                <p className="font-medium text-ink-800">{s.label}</p>
                <p className="font-serif text-2xl font-medium text-ink-600">
                  {s.total.toLocaleString()}
                </p>
              </div>
              <p className="mt-1 text-xs text-stone-450">
                reports mentioning &ldquo;{s.phrase}&rdquo;
              </p>
              <span
                className={`mt-3 inline-block rounded px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${STAGE_CHIP[s.stage].className}`}
              >
                {STAGE_CHIP[s.stage].label}
              </span>
              <p className="mt-3 text-sm leading-relaxed text-stone-650">{s.why}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Boundary tests */}
      <section className="mt-16">
        <h2 className="font-serif text-2xl font-medium text-ink-900">
          Which analysis owns this cause?
        </h2>
        <p className="mb-8 mt-3 max-w-2xl leading-relaxed text-stone-650">
          A signal only becomes a <em>use-related</em> risk when the initiating
          event is a human perceiving, deciding, or acting while the device
          performs to specification. Device deviates from spec → that&apos;s a
          failure mode for the FMEA family. Two tests sort every narrative:
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-stone-350/40 bg-cream p-6">
            <p className="font-serif text-lg text-ink-800">
              1 · The perfect-device test
            </p>
            <p className="mt-2 text-sm leading-relaxed text-stone-650">
              Would this scenario still occur with a flawlessly functioning
              device? <strong className="text-stone-850">Yes</strong> → use-related
              analysis. <strong className="text-stone-850">No</strong> — it
              requires a malfunction → failure-mode analysis. A &ldquo;failed to
              fire&rdquo; narrative can land either way, which is why it&apos;s
              tagged a boundary case above.
            </p>
          </div>
          <div className="rounded-lg border border-stone-350/40 bg-cream p-6">
            <p className="font-serif text-lg text-ink-800">
              2 · The initiating-event test
            </p>
            <p className="mt-2 text-sm leading-relaxed text-stone-650">
              When a chain involves both a failure and a user, ask what{" "}
              <em>starts</em> it. The failure itself belongs to the failure-mode
              analyses — but the user-response task the failure creates
              (respond, recover, replace) is use-related risk in its own right.
            </p>
          </div>
        </div>
      </section>

      {/* Recent reports */}
      <section className="mt-16">
        <h2 className="font-serif text-2xl font-medium text-ink-900">
          The latest reports, in the reporters&apos; own words
        </h2>
        <p className="mb-8 mt-3 max-w-2xl leading-relaxed text-stone-650">
          The most recent stapler narratives in MAUDE, with use-error phrases
          highlighted. Reading raw narratives is where the method earns its
          keep — counts point you somewhere; the words tell you why.
        </p>
        <div className="space-y-4">
          {recent.map((r, i) => (
            <article key={i} className="rounded-lg border border-stone-350/40 bg-cream p-6">
              <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-450">
                <span
                  className={`rounded px-2 py-0.5 font-semibold uppercase tracking-wide ${
                    r.eventType === "Death"
                      ? "bg-rust-600/10 text-rust-600"
                      : r.eventType === "Injury"
                        ? "bg-brass-100 text-brass-700"
                        : "bg-ink-50 text-ink-700"
                  }`}
                >
                  {r.eventType}
                </span>
                <span>Received {r.date}</span>
                <span className="truncate">
                  {r.brand} · {r.manufacturer}
                </span>
              </div>
              <p className="text-sm leading-relaxed text-stone-750">
                {highlight(r.text)}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* Method */}
      <section className="mt-16 rounded-xl bg-ink-900 p-8 text-ink-100 sm:p-10">
        <h2 className="font-serif text-2xl font-medium text-cream">
          Why this matters for HFE teams
        </h2>
        <div className="mt-6 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="font-serif text-lg text-brass-100">1 · Signal</p>
            <p className="mt-2 text-sm leading-relaxed text-ink-200">
              Trend breaks and phrase clusters point to where users struggle —
              before your own study budget is spent.
            </p>
          </div>
          <div>
            <p className="font-serif text-lg text-brass-100">2 · Hypothesis</p>
            <p className="mt-2 text-sm leading-relaxed text-ink-200">
              Each recurring narrative pattern (&ldquo;wrong size,&rdquo;
              &ldquo;failed to fire&rdquo;) becomes a candidate use error for
              task analysis and PCA classification.
            </p>
          </div>
          <div>
            <p className="font-serif text-lg text-brass-100">3 · Study design</p>
            <p className="mt-2 text-sm leading-relaxed text-ink-200">
              Formative scenarios and IFU probes get grounded in documented
              field failures instead of conference-room guesses.
            </p>
          </div>
          <div>
            <p className="font-serif text-lg text-brass-100">4 · Risk file</p>
            <p className="mt-2 text-sm leading-relaxed text-ink-200">
              Confirmed patterns flow into the use-related risk analysis —
              recalibrating severity and likelihood on existing rows, seeding
              new ones, and tracing each use-error chain to the hazards the
              top-level risk file owns.
            </p>
          </div>
        </div>
      </section>

      {/* Limitations */}
      <section className="mt-16">
        <h2 className="font-serif text-2xl font-medium text-ink-900">
          Limitations — read before drawing conclusions
        </h2>
        <ul className="mt-6 max-w-3xl list-disc space-y-3 pl-5 text-sm leading-relaxed text-stone-650">
          <li>
            <strong className="text-stone-850">MAUDE has no denominator.</strong>{" "}
            Report counts can&apos;t be turned into rates — procedure volumes
            aren&apos;t in the data, so more reports ≠ more dangerous.
          </li>
          <li>
            <strong className="text-stone-850">Reporting is biased and incomplete.</strong>{" "}
            Underreporting is well documented; media attention, litigation, and
            policy changes (see the ASR story above) all move the curve.
          </li>
          <li>
            <strong className="text-stone-850">Keyword matching is a heuristic.</strong>{" "}
            Phrase counts surface candidates for human reading. A validated
            use-error classification needs trained reviewers and a coding
            scheme (e.g., PCA taxonomy) with reliability checks.
          </li>
          <li>
            <strong className="text-stone-850">Duplicates and follow-ups exist.</strong>{" "}
            The same event can generate multiple MDRs; no deduplication is
            attempted here.
          </li>
          <li>
            <strong className="text-stone-850">Narratives are secondhand.</strong>{" "}
            Most are written by manufacturers from user communications, with
            their own framing incentives.
          </li>
        </ul>
      </section>

      {/* Footer */}
      <footer className="mt-16 border-t border-stone-350/40 pt-8 text-sm text-stone-550">
        <p>
          Built by{" "}
          <a href={PORTFOLIO} className="font-medium text-ink-600 underline underline-offset-2">
            Kennedy DeSousa
          </a>{" "}
          — Human Factors Engineer. Independent project on public data;
          not affiliated with FDA or any device manufacturer.
        </p>
        <p className="mt-3 text-xs text-stone-450">
          Data: FDA openFDA device/event API. Per openFDA terms: do not rely on
          this data to make decisions regarding medical care; assume all
          results are unvalidated.
        </p>
      </footer>
    </main>
  );
}
