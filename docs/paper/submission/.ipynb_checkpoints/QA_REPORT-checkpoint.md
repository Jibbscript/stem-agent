# QA Report — Validity & Authenticity

## Verdict
**Pass-with-minor-fixes** (two direct fixes applied; no fabricated citations; no anonymity leaks; all claim-level numbers align with `content_brief.md` / `eval_guide.md` after fixes).

## Numeric claims (24 checked, 2 discrepancies — both fixed)

| Claim | Location (tex) | Source of truth | Status |
|---|---|---|---|
| 422 tests | abstract (L25); §7 L185 | content_brief §1.1 (422 tests / 40 files) | MATCH |
| 40 test files | §7 L185 | content_brief §1.1 | MATCH |
| runtime ~2.86 s | §7 L185 ("approximately 2.86 s") | content_brief §6 ("2.86s total") | MATCH |
| abstract runtime "under 3 s" | L25 | 2.86 s is under 3 s | MATCH |
| 5 protocols (A2A, AG-UI, A2UI, UCP, AP2) | abstract, §4 | content_brief §2 Layer 2 | MATCH |
| 21 behavioral dimensions | abstract, §5 L140 | content_brief §3.1 (8+4+5+4=21) | MATCH |
| 4 categories | §5 | content_brief §3.1 | MATCH |
| 10 behavior parameters | §5 L153 | content_brief §2 Layer 3 (10 listed) | MATCH |
| 10 intent categories | §3 L84 | content_brief §2 (10 listed) | MATCH |
| 3 complexity levels | §3 L84 | content_brief (simple/medium/complex) | MATCH |
| 16 A2UI primitives | §3 L129 | content_brief §2 (16 listed) | MATCH |
| 4 framework adapters | §7 L189 | content_brief §2 (AutoGen, CrewAI, LangGraph, OpenAI) | MATCH |
| 4 IAM plugins (JWT/OAuth2/SAML/API-Key) | Table 1, §7 L189 | content_brief §2 Layer 3.5 | MATCH |
| 4 memory types | §6, Table 1 | content_brief §2 Layer 4 | MATCH |
| 154+ Zod types | §3 L104 | content_brief §5 (154+) | MATCH |
| retries default 2 | §3 L84 | content_brief §2 (maxExecutionRetries: 2) | MATCH |
| circuit breaker @ 3 | §3 L84 | content_brief §2 (threshold: 3) | MATCH |
| EMA α = 0.1 | §5 L147 | content_brief §3.2 | MATCH |
| conf = 1 − exp(−0.1 n) | §5 L150 | content_brief §3.2 exact formula | MATCH |
| confidence ≈ 0.9 at n=20 | §5 L151 | content_brief §3.2 | MATCH |
| k_c=3, k_m=10, ≥0.6 success, apoptosis <0.3 after ≥10 | §6 L160 | eval_guide §20.4 (Committed 3+/≥60%, Mature 10+, Apoptosis <30% after 10+) | MATCH |
| 6 stem_* MCP tools | §6 L164 | content_brief lists 6 tools | MATCH |
| 100× latency differences | §1 L31 | orogat2026mafbench (not independently verified beyond bib entry) | UNVERIFIED — accept |
| 97% MCP smells | §2 L49 | hasan2026mcpsmells (review noted 97.1% in ICML draft; 97% is valid round) | ACCEPT |
| **"seven workspace packages"** | §3 L104 | content_brief §7.1 ("6 workspace packages") | **FIXED → "six"** |
| **"3 transports" in Table 1** | Table 1 row 5 | content_brief lists 2 concrete (stdio, SSE) + abstract base | **FIXED → "2"** |

## Citation authenticity

All 37 `\cite*` keys resolve in `references.bib`. Spot checks:

- `yao2023react`, `shinn2023reflexion`, `wei2022chain`, `du2023debate`, `wu2023autogen`, `hong2023metagpt`, `li2023camel`, `park2023generative`, `anthropic2024mcp`, `chase2022langchain`, `langgraph2024`, `crewai2023` — all look correct (right authors/venues/years).
- 2026-dated arXiv IDs (e.g., `2602.03128` for orogat2026mafbench, `2601.12538` for wei2026agentic, `2602.11327` for anbiaee2026security) follow the YYMM.NNNNN arXiv convention consistent with Jan–Mar 2026 submissions. Not independently verified, but plausible.
- Unused in tex but present in bib: `lewis2020rag`, `shen2026mcp38` — harmless, kept.
- No obvious fabrications (no implausible venues; no round-number DOIs).

## Novelty / comparative claims

| Claim | Location | Assessment |
|---|---|---|
| "We are not aware of a deployed system that unifies these five protocols behind a single gateway" | §2 L46 | **Defensible** — soft hedge; related_work_summary documents MCP+A2A pairings only. |
| "Unlike frameworks that bind each agent to a single protocol endpoint, every STEM gateway mounts five heterogeneous handlers behind one shared middleware stack" | §2 L43 | **Defensible** — Table 4 supports with per-framework protocol count; AutoGen/LangChain/etc. are indeed single-protocol-primary. |
| "minutes vs. multi-day" differentiation time | §6 L164 | **Anecdotal (flagged in-text)** — paper explicitly says "in the authors' experience… we do not have a controlled measurement." OK. |
| UCP "we could not find an open commerce-checkout protocol that treated the agent as the primary client" | §4 L131 | **Strong negative claim, not cited.** Review recommended naming at least one searched alternative (Stripe Agent Toolkit, Shopify, AP2 Google). Flagged as recommended-fix. |

## Formula checks

| Formula | Location | Source | Match |
|---|---|---|---|
| `v_{t+1} = (1−α) v_t + α s_t`, α=0.1 | §5 L143–147 | content_brief §3.2 `new_val = old_val*(1−α) + signal*α`, α=0.1 | EXACT |
| `conf(n) = 1 − exp(−0.1 n)` | §5 L150 | content_brief §3.2 `1 − exp(−0.1 * n)` | EXACT |
| Skill thresholds k_c=3 / k_m=10 / 0.6 / 0.3 | §6 L160 | eval_guide §20.4 | EXACT |
| Strategy selector (ReAct / Reflexion / Debate / CoT with complexity > 0.8) | Table 2, §3 L84 | content_brief §2 Reasoning Engine | EXACT |

## Anonymity scan

Scanned `/submission/` for `Amazon`, `amazon`, `@amazon`, `Alfred`, `alfred`, `aws`, `anthropic.com`, GitHub URLs, author names:
- `stem_agent_emnlp26.tex`: **zero matches**.
- `references.bib`: `\url{https://modelcontextprotocol.io/specification}` (MCP spec — Anthropic reference, public specification URL, acceptable in a non-anonymous citation to an org). `\url{https://github.com/langchain-ai/langchain}`, `\url{https://github.com/langchain-ai/langgraph}`, `\url{https://github.com/crewAIInc/crewAI}` — all are citations to third-party open-source projects; standard for bibliography and not author-identifying. **OK.**
- `\author{Anonymous Submission}` confirmed (L19).
- `\usepackage[review]{acl}` confirmed (L3).
- **CAUTION**: `architecture.pdf` should be checked for PDF metadata (author/creator fields) by the Compilation Agent (`exiftool -all= architecture.pdf`). Not an issue Claude can check from source.

No anonymity residues detected in textual content.

## Unresolved citation keys

None. All 37 `\citep`/`\citet` keys are defined in `references.bib`.

## Internal contradictions

1. ~~§3 L104 says "seven workspace packages" but content_brief says 6~~ **FIXED in-place**.
2. ~~Table 1 row 5 says "3 transports" but implementation has 2 concrete (+ abstract base)~~ **FIXED in-place**.
3. Abstract (L25) and §7 L185 both now reference 422 tests in under 3 s / 2.86 s — consistent.
4. Contributions (L35) says "ten self-tunable behavior parameters" and §5 L153 enumerates exactly 10 — consistent.
5. §3 Table 1 lists Layer 3 = "5 engines" — paper text names 5 phases with engines (Perception, Reasoning, Planning, Execution, Skills/Learning); content_brief lists 4 "Core Engines" (Perception, Reasoning, Planning, Execution) plus a Skill Manager / Learning flow. **Minor** — defensible either way; not flagging as a contradiction.

## Compile-blocking issues

- `\texttimes` and `\checkmark` used in Table 4 — require `amssymb` (present, L14) or `pifont`. `\texttimes` is provided by `textcomp` which ships with LaTeX standard distributions; may need `\usepackage{textcomp}` if compilation fails. **Flag for compilation agent.**
- `\perp` used in Table 1 — provided by `amssymb` (present). OK.
- `$\geq$`, `$\rightarrow$`, `$\ldots$`, `$\alpha$`, `$n{=}20$`, `$\alpha=0.1$`, `$0.8$`, `$100\times$` — all properly math-mode delimited. OK.
- Table 3 uses `p{5.5cm}` column in a `table*` (two-column-spanning) environment — fine.
- Figure 1 `\includegraphics[width=\columnwidth]{architecture.pdf}` — file exists (`/submission/architecture.pdf`). OK.
- One URL-like token `/.well-known/agent.json` appears outside a `\url{}` — wrapped in `\texttt{}`, no `%` or `_`, so no escape issue.
- No unmatched `$`, no mis-nested `begin/end`. Labels `tab:layers`, `tab:strategy`, `tab:protocols`, `tab:comparison`, `fig:architecture`, `eq:ema`, `sec:*` all referenced at least once.

No compile-blockers identified.

## Recommended fixes (for follow-up)

**Priority 1 (judgement calls, leave to authors):**
1. §4 L131 UCP negative claim ("we could not find an open commerce-checkout protocol that treated the agent as the primary client") — consider adding one searched alternative (Stripe Agent Toolkit / Shopify Checkout / Google AP2 variant) to make the search credible. *Not fixed — factual search-scope claim, needs author input.*
2. §1 L31 `$100\times$ latency differences` — not independently verified against orogat2026mafbench text; authors should spot-check the source.
3. §2 L49 `97%` — review notes 97.1% in the original source; "97%" is acceptable rounding but authors may prefer exact.

**Priority 2 (cosmetic):**
4. Table 1 row 3 "Agent Core | 5 engines" — content_brief lists 4 concrete core engines; if including the Skill Manager it's 5. Consider changing caption or dropping to "4 engines + skill manager" for transparency. Low priority.
5. `architecture.pdf` metadata strip for anonymity (Compilation Agent task).

## Direct edits applied

Two edits made to `/opt/dlami/nvme/codes/papers/emnlp26/submission/stem_agent_emnlp26.tex`:
1. "seven workspace packages" → "six workspace packages" (§3 L104) to match content_brief §7.1.
2. Table 1 row 5: "3 transports" → "2 transports" (MCP Integration) to match content_brief §2 Layer 5 (stdio + SSE concrete transports).

No other direct edits. All other concerns are flagged as recommendations.
