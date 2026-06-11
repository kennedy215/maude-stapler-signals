# MAUDE Signal Explorer — Surgical Staplers

A human-factors lens on FDA adverse-event data for surgical staplers
(product codes **GAG** and **GDW**), built on the public
[openFDA device/event API](https://open.fda.gov/apis/device/event/).

**Live:** https://maude-stapler-signals.vercel.app

## Why

Human factors engineering teams mostly look forward — formative studies,
validation, design controls. But post-market surveillance data is a
backward-looking goldmine: real use errors, in real ORs, described in the
reporters' own words. This project demonstrates a simple, honest method for
turning MAUDE into formative-study input:

1. **Signal** — reporting trends and phrase clusters show where users struggle
2. **Hypothesis** — recurring narrative patterns become candidate use errors
   for task analysis and PCA (Perception / Cognition / Action) classification
3. **Study design** — formative scenarios and IFU probes grounded in
   documented field failures

Surgical staplers were chosen deliberately: the FDA's 2019 decision to end
Alternative Summary Reporting put tens of thousands of previously hidden
stapler reports into public MAUDE — a built-in lesson that *reporting curves
reflect policy as much as risk*.

## What it shows

- Totals by event type (malfunction / injury / death), live from openFDA
- Reports per year since 2008, annotated with the 2019 ASR policy change
- A use-error phrase lens (deliberately simple heuristic, not a classifier)
- The latest narratives with use-error phrases highlighted
- A limitations section that should be read before drawing any conclusion

## Stack

Next.js (App Router) · TypeScript · Tailwind CSS v4 · Recharts.
Data is fetched server-side and revalidated daily; no API key required.

## Honest limitations

MAUDE has no denominators, is subject to under- and over-reporting, contains
duplicates, and its narratives are usually secondhand. Keyword counts here
surface candidates for human reading — a validated use-error classification
requires trained reviewers and a reliability-checked coding scheme. Per
openFDA terms: do not rely on this data for medical decisions.

## Author

[Kennedy DeSousa](https://www.kennedydesousa.com) — Human Factors Engineer.
Independent project on public data; not affiliated with FDA or any device
manufacturer.
