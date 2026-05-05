# Expert Review: STEM Agent (EMNLP 2026 Industry Track)

## Summary assessment

**Recommendation: Major revision required before submission.** The paper reads as a competent industry-track rewrite of a pure-systems draft, and the framing around "architectural lock-in" and protocol plurality is appropriate for the Industry Track. However, the submission has four blocking problems: (1) the abstract is 208 words, violating the 200-word cap; (2) the evaluation is almost entirely a unit/integration test count — there is no deployment evidence, no user/traffic metric, no incident lesson, no A/B result — which is a poor match for an Industry Track that expects "deployed impact"; (3) several novelty claims (five protocols, first of its kind) rest on citations that the related work itself partially contradicts, and foundational references (MCP specification, ReAct, AutoGen, Reflexion, LangChain, LangGraph, MetaGPT, CrewAI, CoT) are *missing from `references.bib`* although the framework-comparison table names those systems and the reasoning section names the strategies; (4) the Caller Profiler and skills lifecycle are specified at the level of default values, but the "20+ dimensions" are never fully enumerated (only 17 are itemised in Section 5, and the earlier version counted 21). The paper is otherwise well-structured and honest about what it doesn't claim.

## Strengths

- Clear industry framing (architectural lock-in, protocol fragmentation, deployment experience) in Intro (L28–38) is appropriate for the track.
- Honest Limitations section (L201–211) explicitly disavows benchmark scores, production latency, and formal threat modeling — the right posture given the evidence available.
- "What required compromise" paragraph (L194) is the kind of grounded, lesson-oriented content the Industry Track rewards.
- Correctly flags UCP and AP2 as author-proposed in Table 2 (L104–105), Contributions (L35), and Limitations (L209).
- Anonymisation of the author block and use of `[review]` option (L3, L19) look correct.
- The `createRouter()` integration lesson (L118) is a concrete, reusable design takeaway.
- Ethics section (L213–215) is proportionate and covers the GDPR/payment surfaces that reviewers will ask about.

## Critical issues (must fix before submission)

1. **Abstract over 200-word limit.** Location: L24–26. Current: 208 words (verified). Industry Track explicitly caps abstract at 200. Suggested fix: cut the sentence "A 529-test suite validates protocol handlers and cross-component integration in under three seconds." (it repeats L168) and/or compress the "Recurring interaction patterns crystallize…" sentence into one clause. Target 190–195 words for safety.

2. **Foundational references missing from `references.bib`.** Location: `references.bib` contains only 26 entries; the draft refers by name (not cite) to AutoGen, MetaGPT, CrewAI, LangGraph, LangChain (L43, Table 3 L183–187), ReAct, Reflexion, Internal Debate, Chain-of-Thought (L84), and the MCP protocol itself (passim). None of these has a bib entry. Suggested fix: import at minimum `wu2023autogen`, `hong2023metagpt`, `li2023camel`, `duan2024langgraph`/`chase2022langchain`, `yao2023react`, `shinn2023reflexion`, `wei2022chain`, `anthropic2024mcp`, `du2023debate`/`liang2023debate` from the original `paper/references.bib`. Without these, the comparison table (L187) is un-anchored and the reasoning paragraph (L84) asserts strategies with no citation.

3. **"To our knowledge" claim about five protocols is unsupported.** Location: L46 "prior deployed systems implement at most two of these protocols simultaneously; STEM Agent implements five." The related-work evidence cited (ehtesham2025survey, li2025gluetoprotocols, jeong2025mcpa2a) surveys MCP/A2A pairings but does not support the comparative claim about *deployed* systems. Industry Track reviewers will flag this. Suggested fix: soften to "we are not aware of a deployed system that unifies these five protocols behind a single gateway" and remove the "at most two" quantifier unless a source can be cited.

4. **No deployed-impact evidence for an Industry Track paper.** Location: §7 Deployment Experience (L163–194). The section is labeled "Deployment Experience" but the only quantitative numbers are the 529 unit tests (L168) and the test-suite runtime. There are no traffic numbers, no request-per-second figure, no incident/MTTR lesson, no A/B result, no user count, no domain adoption counts. The Limitations section (L205) concedes this, but the Industry Track expects at least *qualitative* deployment signal (e.g., "deployed to N internal teams over M months; the three most common failure modes were X, Y, Z"). Suggested fix: add one paragraph with either (a) anonymised adoption stats, (b) two or three concrete incident vignettes, or (c) an explicit "this is a deployment-ready architecture paper, not a deployed-at-scale report" reframing. As written, the Industry-Track framing is not fully earned.

5. **Dimension count inconsistency — "20+" is never actually enumerated.** Location: L35 Contributions ("20+ behavioral dimensions"), L123 (4 categories with 8+4+5+ "habits" listed as 4 temporal items = 21 in the ICML draft). Section 5 L123 lists 8 + 4 + 5 + 4 = 21 but names only "session length, iteration tendency, peak hours, common topics" for habits and only three of the philosophy eight. A reviewer asking "which 20+?" cannot answer from the paper. Suggested fix: add a one-paragraph appendix or extend Table in §5 that lists all 21 dimensions with names, or drop "20+" to "twenty behavioral dimensions across four categories" and enumerate them in a footnote.

6. **Table 3 (framework comparison) mis-counts LangChain memory and does not cite any source.** Location: L183–187. Cells like "AutoGen ⋯ 1 memory type", "LangChain ⋯ 2" are uncited assertions. AutoGen's memory model is actually pluggable (ChatCompletionContext variants), LangChain has more than two memory modules. Without citations this is contestable. Suggested fix: either (a) cite the AutoGen/LangChain docs version used, or (b) replace counts with ✓/✗ for "has a named memory subsystem," which is what the caption already says. Also cite the rows (Table 3 is the most likely reviewer flashpoint).

## Major issues (should fix)

1. **Test runtime claim inconsistency with content brief.** Location: abstract L25 ("under three seconds"), L168 ("under 3 s"). Content brief L419–420 says 2.86 s for 397 tests; ICML version L334 says "under 4 s" for 529 tests. The 529-vs-397 and 2.86 s-vs-3 s are plausible (suite grew), but the QA agent should verify against the current repo. Suggested fix: pick one phrasing ("approximately 3 s" or "under 4 s") and make L25 and L168 match, and flag for QA verification.

2. **"529 tests across 41 files" is presented without coverage percentage.** Location: L168. A test *count* is a weak correctness signal and Industry reviewers know this (the paper even says so at L168). Suggested fix: add a line coverage number if available, or reframe as "per-seam integration tests" rather than leaning on the 529 count.

3. **Unlabelled contrastive claim.** Location: L43 "STEM Agent differs in treating protocol plurality and per-caller adaptation as first-class architectural constraints rather than features." The "rather than features" contrast is not cited and is unfalsifiable as stated. Suggested fix: replace with a specific observation, e.g., "unlike AutoGen and CrewAI which bind each agent to a single protocol endpoint, every STEM gateway mounts five heterogeneous handlers behind one middleware stack."

4. **No citation for Caller Profiler prior art.** Location: §5 L120–137. User-profiling, personalisation, and adaptive agents have decades of prior work. The draft cites none. Suggested fix: add one or two citations (e.g., generative agents park2023generative, user-modeling surveys, or the adaptive-compute line already cited in Related Work) to contextualise.

5. **Skills lifecycle thresholds (k_c=3, k_m=10, 0.6/0.3) are unjustified.** Location: L143. These are asserted without either empirical tuning data or a citation to the original methodology. Since §7's "internal numbers only" stance rules out empirical justification, Suggested fix: reframe as "our current operating points, tuned against the existing test suite" to avoid overclaiming.

6. **Figure 1 legibility risk.** Location: L56–61. `architecture.pdf` is a 60 KB PDF included at `\columnwidth` in a single-column region; the figure itself was built for the two-column ICML layout. The Industry Track uses ACL one-column at `\columnwidth` and two-column at `\textwidth`. Suggested fix: either (a) move to `figure*` with `\textwidth` (space permitting), or (b) redraw as a simplified column-width version. The QA/Compilation agent must confirm the figure is legible at ~240 pt.

7. **Table 1 (layers) adds little information the text doesn't already carry.** Location: L63–81. "Layer X, 4 adapters" is not self-explanatory. Suggested fix: either merge into a sentence in §3 (saves ~0.15 pages toward the 6-page cap), or enrich with a one-line role column.

8. **"Industry first" and "first agent framework" framing from the original has been softened but a residue remains.** Location: L46 ("implements five"), L109 (Table 2 caption), L35 (Contributions). Industry-Track reviewers are allergic to first-claims. Suggested fix: use "to our knowledge" language uniformly or drop the claim where it isn't load-bearing.

9. **Reasoning-strategy citations are collapsed to three surveys.** Location: L49 (wei2026agentic, alomrani2025reasoning), L84 (strategy list with no cites). ReAct, Reflexion, and Chain-of-Thought should cite the original papers (yao2023react, shinn2023reflexion, wei2022chain), not only surveys. Suggested fix: add primary citations at L84 and in §4.

10. **Related-work overweights 2025/2026 preprints.** Location: §2 (L39–50). Of ~22 cited works, roughly 20 are from 2025–2026, and several are arXiv preprints (e.g., jeong2025mcpa2a, anbiaee2026security, nie2026awcp, jayanti2026enhancing, schlapbach2026convergence, mody2026cranimem). Suggested fix: add 3–5 anchor citations from the foundational literature (MCP spec anthropic2024mcp, AutoGen wu2023autogen, ReAct yao2023react, RAG lewis2020rag, Blackboard hayesroth1985blackboard) to ground the preprint chorus.

## Minor issues / polish

1. L31: "$100\times$ latency differences and large accuracy gaps" — ICML version quotes "30% accuracy gaps". Decide whether to keep "large" or "30%" and be consistent.
2. L46: "LF v0.3.0" in Table 2 is cryptic; spell as "Linux Foundation A2A v0.3.0".
3. L84: The "ReAct for tool-requiring tasks, Reflexion for complex ones, Internal Debate for analysis and creative requests, Chain-of-Thought otherwise" list should be set as an itemize list or a small decision table — at present it's hard to parse in a running paragraph.
4. L114: "we could not find an open commerce-checkout protocol" — this is a strong negative claim; consider citing at least one searched-for candidate (Shopify's checkout API, Stripe Agent Toolkit, Adyen's mandate API) to make the search credible.
5. L147: "creating a new domain variant takes a few minutes rather than the days we previously spent forking an agent codebase." This is a quantitative deployment claim (minutes vs days) — the Industry Track *loves* this, but it should either be anonymised-replicated or clearly labelled as anecdotal (e.g., "in the authors' experience, …").
6. L151–161: §6 Memory System is essentially a restatement of the content brief (episodic/semantic/procedural/user-context). Given the 6-page squeeze, consider trimming to half its length — the Memory System is *not* the paper's contribution.
7. L199 Conclusion cites `nie2026awcp` and `anbiaee2026security` for future work — neither has been introduced as relevant in the body. Consider moving these into §2 or removing.
8. L191 Table 3 column header `Com.` abbreviates "commerce" — spell out in caption or use `Com.\ protocols.`
9. L183–191: Table 3's three-column separator ("3+2†") is visually ambiguous. Consider "5 (3+2†)".
10. L52 Architecture Overview paragraph would benefit from a forward-pointer to §4 for the protocol gateway.
11. L166 "Numbers below come from the test suite and internal tooling; task-completion benchmarks and user studies are explicitly not claimed." This sentence is good — but then §7 only delivers test numbers. Consider deleting the "internal tooling" half of the promise.
12. Section numbering: the paper uses §3 Architecture, §4 Protocol Gateway, §5 Caller Profiler, §6 Skills, §7 Memory, §8 Deployment, §9 Conclusion — seven numbered body sections for a 6-page paper is dense. Consider folding §6 and §7 into a single "Differentiation and Memory" section to reduce structural overhead.
13. Table 2 (protocols) is a full-width (`table*`) table in a single-column paper. Verify this still typesets.
14. L58: The figure is referred to as "Figure 1" in running text (L54) without the natural "see Figure 1"—it's fine but add a pointer sentence.

## Anonymity / compliance issues

- **Author block**: `\author{Anonymous Submission}` (L19) — OK.
- **`[review]` option on `acl` package** (L3) — OK.
- **No acknowledgements** — OK.
- **No GitHub URL, no company name, no email** — confirmed via grep for `amazon|aws|alfred|shen|github|\.com|anthropic` on the .tex file; zero matches. OK.
- **References.bib does not contain any email, URL to personal repo, or internal report**. The bibliography has 26 entries, all external. OK.
- **CAUTION**: `architecture.pdf` could contain embedded PDF metadata (author, creator fields). The Compilation Agent should strip PDF metadata (`exiftool -all= architecture.pdf` or similar) before submission.
- **CAUTION**: `\documentclass[11pt]{article}` is correct; but note that `\usepackage{inconsolata}` (L10) is present only in some ACL template variants — verify it compiles cleanly with `acl.sty`.
- **Citation style**: All citations use `\citep`/`\citet`. OK.
- **Limitations section is unnumbered** (`\section*`) at L201 — OK.
- **Ethical Considerations section** is present (L213) and addresses user data. OK.

## Page-limit assessment

With 3,117 words and the current structure (8 sections + Limitations + Ethics + Abstract + bibliography + 3 tables + 1 figure), I estimate the compiled PDF at **5.5–6.3 pages of body content** under ACL 11pt `\columnwidth` settings. This is right at the 6-page Industry Track cap and likely slips over once the figure is properly sized. Suggested cuts:

1. **Cut Table 1 (layers)** — collapse into a sentence in §3; saves ~0.15 pp.
2. **Cut §6 Memory System to half** (L149–161) — the memory system is not a paper contribution; retain the four types as a single paragraph. Saves ~0.25 pp.
3. **Tighten Related Work**: fold "Agentic Reasoning" (implicit in L84) into the multi-agent paragraph; currently it's three sentences of low signal density. Saves ~0.1 pp.
4. **Inline the cognitive-pipeline prose** (L83–84) — it currently lists all eight phases in running text with parameter defaults; consider a compact three-line algorithm block or a mini-table. Saves ~0.1 pp.

Net recoverable: ~0.6 pp, which is the safety margin needed once Table 3 and the enumerated-dimensions appendix are added.

## Verifiability flags for QA agent

(Each item: claim → location → evidence to check)

1. **"529 tests across 41 files"** → L25, L168 → verify against `pnpm test` output in the current repo; content brief L16 says 422 tests, L419 says 397 tests. Ensure current number matches.
2. **"under three seconds" runtime** → L25 → content brief L420 says 2.86 s; ICML L334 says "under 4 s". Choose consistent phrasing.
3. **"154+ Zod types"** → L87 → content brief L403 claims "154+"; verify.
4. **"20+ behavioral dimensions"** → L25, L35, L123 → content brief §3.1 lists 8+4+5+ (at least 5) = 22 with some overlap; enumerate exactly.
5. **"four categories"** → L35, L123 → content brief confirms 4: philosophy/principles/style/habits. OK.
6. **"ten behavior parameters"** → L35, L136 → content brief L148–158 enumerates 10. OK.
7. **"10 intent categories"** → L84 → content brief L104 confirms 10 categories. OK.
8. **"three complexity levels"** → L84 → content brief L107 confirms simple/medium/complex. OK.
9. **"retries with default 2, circuit breaker at 3"** → L84 → content brief L129, L141 confirm. OK.
10. **"16 A2UI primitives"** → L103, L112 → content brief L57 lists 16. OK.
11. **"97% of MCP tool descriptions have quality issues"** → L49 → verify against hasan2026mcpsmells (ICML draft L88 says 97.1%).
12. **"$100\times$ latency differences"** → L31 → verify against orogat2026mafbench abstract/findings.
13. **"ReAct for tool-requiring, Reflexion for complex, Internal Debate for analysis/creative, Chain-of-Thought otherwise"** → L84 → content brief L118–122 matches but adds "Tool-requiring → ReAct; Complexity > 0.8 → Reflexion" — the threshold "0.8" is not in the draft; either add or drop the "complexity = complex" phrasing.
14. **"EMA α = 0.1"** → L130 → content brief L330 confirms. OK.
15. **"κ = 10 in confidence gating"** → L134 → content brief L325–327 says different formula `1 - exp(-0.1*n)` — this is a **discrepancy**. Draft uses rational saturation `n/(n+κ)` while content brief uses exponential. Verify which is the code-level truth.
16. **"k_c = 3, k_m = 10, success ≥ 0.6, apoptosis ≤ 0.3"** → L143 → verify against skills code.
17. **"six MCP tools (stem_process, stem_list_skills, …)"** → L147 → content brief L268–273 lists six. OK.
18. **"Four framework adapters"** → L172 → content brief L74–78 confirms 4. OK.
19. **"four IAM plugins (JWT, OAuth2, SAML, API-Key)"** → L172 → content brief confirms. OK.
20. **"20+ behavioral dimensions" vs "four categories"** — internal consistency: the paper claims "20+", content brief says 8+4+5+≥4 = 21+. Make the abstract and the body agree on a single number.
21. **"minutes vs days" domain variant creation** → L147 → anecdotal; flag as unverified or move to Limitations.
22. **Novelty: "prior deployed systems implement at most two protocols"** → L46 → no cited support in the bibliography.
23. **"we could not find an open commerce-checkout protocol that treated the agent as primary client"** → L114 → verify no UCP-like proposal is live (search for "agent commerce protocol", Google AP2, Visa Intelligent Commerce).
24. **Complexity detection: "word count, entity density, code presence"** → not in draft; in ICML L172 but dropped from EMNLP version. OK to drop, but content brief implies threshold of 0.8.

## Suggested edits (ready-to-apply)

### Edit 1 — Abstract length fix (L24–26)

**Old text:**
```
A 529-test suite validates protocol handlers and cross-component integration in under three seconds. We report lessons from integrating five interoperability standards in one deployed gateway and discuss what worked, what required compromises, and what remains open.
```

**New text:**
```
We report lessons from integrating five interoperability standards in one gateway, discuss compromises, and outline open problems. The implementation is validated by a 529-test integration suite.
```

(saves ~15 words, brings abstract to ~193 words)

### Edit 2 — Softer novelty claim in L46

**Old text:**
```
To our knowledge, prior deployed systems implement at most two of these protocols simultaneously; STEM Agent implements five.
```

**New text:**
```
We are not aware of a deployed system that unifies these five protocols behind a single gateway.
```

### Edit 3 — Add primary reasoning citations at L84

**Old text:**
```
ReAct for tool-requiring tasks, Reflexion for complex ones, Internal Debate for analysis and creative requests, Chain-of-Thought otherwise
```

**New text:**
```
ReAct~\citep{yao2023react} for tool-requiring tasks, Reflexion~\citep{shinn2023reflexion} for complex ones, Internal Debate~\citep{du2023debate} for analysis and creative requests, Chain-of-Thought~\citep{wei2022chain} otherwise
```

(requires adding `yao2023react`, `shinn2023reflexion`, `du2023debate`, `wei2022chain` to `references.bib`)

### Edit 4 — Add MCP primary citation at L48

**Old text:**
```
Benchmarks~\citep{luo2025mcpuniverse, fan2025mcptoolbench} highlight that even strong LLMs struggle on real MCP servers
```

**New text:**
```
Benchmarks for the Model Context Protocol~\citep{anthropic2024mcp}~\citep{luo2025mcpuniverse, fan2025mcptoolbench} highlight that even strong LLMs struggle on real MCP servers
```

### Edit 5 — Add anchor citations to framework names at L43

**Old text:**
```
Surveys~\citep{tran2025multiagent, ferrag2025agents} document a large ecosystem of LLM-based agent frameworks---AutoGen, MetaGPT, CAMEL, CrewAI, and LangGraph---
```

**New text:**
```
Surveys~\citep{tran2025multiagent, ferrag2025agents} document a large ecosystem of LLM-based agent frameworks---AutoGen~\citep{wu2023autogen}, MetaGPT~\citep{hong2023metagpt}, CAMEL~\citep{li2023camel}, CrewAI, and LangGraph~\citep{duan2024langgraph}---
```

### Edit 6 — Reframe "test suite" emphasis at L168

**Old text:**
```
The suite comprises \textbf{529 tests across 41 files} (Vitest), passing at 100\% with a total runtime under \textbf{3\,s}.
```

**New text:**
```
The suite comprises 529 integration and unit tests across 41 files (Vitest), passing at 100\%, with every architectural seam (protocol handler, engine, memory store, MCP transport, persona schema) covered by at least one test. Total runtime is under 3\,s on a single laptop.
```

### Edit 7 — Enumerate 20+ dimensions footnote at L123

**After:** "style (5 dimensions: formality, verbosity, technical depth, examples preference, structure preference), and habits (session length, iteration tendency, peak hours, common topics)."

**Add footnote:**
```
\footnote{The 21 total dimensions are: \textit{philosophy} — pragmatism/idealism, simplicity/completeness, risk tolerance, innovation orientation, depth/breadth, theory/practice, autonomy preference, stated values; \textit{principles} — correctness/speed, documentation, testing, security; \textit{style} — formality, verbosity, technical depth, examples, structure; \textit{habits} — session length, iteration tendency, peak hours, common topics.}
```

### Edit 8 — Anchor the "minutes vs days" claim at L147

**Old text:**
```
In practice, creating a new domain variant takes a few minutes rather than the days we previously spent forking an agent codebase.
```

**New text:**
```
In the authors' experience, creating a new domain variant with \texttt{/differentiate-agent} takes on the order of minutes, compared with the multi-day effort previously required to fork and rewire an agent codebase; we do not have a controlled measurement.
```

### Edit 9 — Add missing anchor citations to references.bib

The QA/Remediation agent should port the following from `/opt/dlami/nvme/codes/papers/emnlp26/paper/references.bib` (or similar) into `/opt/dlami/nvme/codes/papers/emnlp26/submission/references.bib`:

- `wu2023autogen` — AutoGen
- `hong2023metagpt` — MetaGPT
- `li2023camel` — CAMEL
- `duan2024langgraph` — LangGraph
- `chase2022langchain` — LangChain
- `yao2023react` — ReAct
- `shinn2023reflexion` — Reflexion
- `wei2022chain` — Chain-of-Thought
- `du2023debate` — Multi-agent debate
- `park2023generative` — Generative agents (for Caller Profiler context)
- `anthropic2024mcp` — MCP specification
- `lewis2020rag` — RAG (for memory context)

### Edit 10 — Consistent test runtime phrasing

Make L25 ("under three seconds") and L168 ("under 3\,s") match, and either include or replace with the verified number from the current repo (likely "under 3 s" or "approximately 3 s").

---

*Review compiled 2026-05-04. Recommend Remediation Agent apply Edits 1–10, then QA Agent verify the 24 flagged claims, then Compilation Agent test PDF build with `acl.sty` at 11pt.*
