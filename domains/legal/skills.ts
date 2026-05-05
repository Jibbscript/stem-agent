import type { SkillManager } from "@stem-agent/agent-core";

/**
 * Register legal-domain plugin skills.
 *
 * Paired with domains/legal/persona.json. Designed for contract review and
 * compliance workflows — never for advice-giving.
 */
export async function registerDomainSkills(skillManager: SkillManager): Promise<void> {
  await skillManager.registerPlugin({
    name: "clause_extraction",
    description: "Fetch a contract from the document store and return classified clauses with spans",
    trigger: {
      intentPatterns: ["clause", "extract", "contract", "agreement"],
      domains: ["legal", "contracts", "clm"],
    },
    toolChain: [
      { toolName: "document_fetch", argumentTemplate: { doc_id: "{doc_id}" } },
      { toolName: "clause_extract", argumentTemplate: { text: "{document_text}" } },
      { toolName: "clause_classify", argumentTemplate: { clauses: "{clauses}" } },
    ],
    maturity: "progenitor",
    successRate: 0.78,
    activationCount: 4,
    tags: ["legal", "contracts", "extraction"],
  });

  await skillManager.registerPlugin({
    name: "risk_flagging",
    description: "Flag high-risk clauses (indemnity, liability caps, auto-renewal, IP assignment) with severity and rationale",
    trigger: {
      intentPatterns: ["risk", "flag", "review", "red flag", "concern"],
      domains: ["legal", "contracts", "risk"],
    },
    steps: [
      "Extract clauses via clause_extraction",
      "Score each clause against the risk taxonomy (indemnity, liability, IP, termination, renewal)",
      "Look up controlling authority via case_law_search for any clause with severity >= high",
      "Summarize each high-risk clause with citation to document + authority",
      "Return a ranked list suitable for attorney review",
    ],
    maturity: "progenitor",
    successRate: 0.75,
    activationCount: 2,
    tags: ["legal", "contracts", "risk", "review"],
  });

  await skillManager.registerPlugin({
    name: "obligation_summary",
    description: "Extract party obligations, deadlines, and conditions from a contract into a tracked-commitment list",
    trigger: {
      intentPatterns: ["obligation", "deadline", "commitment", "deliverable", "sla"],
      domains: ["legal", "contracts", "compliance"],
    },
    toolChain: [
      { toolName: "document_fetch", argumentTemplate: { doc_id: "{doc_id}" } },
      { toolName: "obligation_extract", argumentTemplate: { text: "{document_text}" } },
    ],
    maturity: "progenitor",
    successRate: 0.82,
    activationCount: 3,
    tags: ["legal", "compliance", "obligations"],
  });
}
