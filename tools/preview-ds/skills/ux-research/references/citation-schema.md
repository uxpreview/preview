# citations.json — schema and append rules

`citations.json` is the single evidence store. Top-level keys: `store`, `schema_version`,
`model`, `_note`, `tiers`, `citations`. You append to the `citations` array. Everything
references a citation by `id`; never duplicate a citation inline elsewhere.

## Entry shape

```json
{
  "id": "baymard-form-field-labels",
  "tier": "empirical",
  "finding": "One-sentence finding in past/applied voice — what it says and where it is applied in the system.",
  "source": {
    "org": "Baymard Institute",
    "title": "Exact article or spec title",
    "year": 2024,
    "url": "https://www.example.org/real-resolvable-url"
  },
  "verified_date": null,
  "verification": "UNVERIFIED — pending human review",
  "supports": ["field", "form-layout"]
}
```

## Rules when drafting (agent)

- `id` — kebab-case, prefixed by org shorthand (`wcag-`, `nng-`, `baymard-`, `pew-`,
  `lawsofux-`). Must be unique; check the array first.
- `tier` — per `tiering-rubric.md`. Choose the weaker when unsure.
- `finding` — one sentence, specific, no hype. Name where it applies if known.
- `source` — real `org`, real `title`, real resolvable `url`. `year` may be `null` if the
  source does not state one (add a `notes` line saying so). If you cannot produce a real
  URL, you do not have a citation — drop the finding.
- `verified_date` — always `null` when you draft.
- `verification` — always `"UNVERIFIED — pending human review"`.
- `supports` — the component/decision ids this backs.
- Optional `notes` — caveats (e.g. "Year not stated; confirm recency.").

## What you must never do

- Never set `verified_date` to a date or write a `verification` that claims a human pass.
- Never invent a `source` or a `url`, or point at a plausible-sounding study you did not
  read.
- Never raise an existing entry's `tier` or flip its `verified_date` — drafting adds new
  UNVERIFIED entries only.
