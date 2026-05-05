/**
 * Register healthcare-domain plugin skills.
 *
 * These skills assume three MCP servers are reachable: fhir-mcp, pubmed-mcp,
 * rxnorm-mcp. See domains/healthcare/persona.json for the full allowlist.
 *
 * All skills default to `progenitor` maturity — production deployments should
 * mature them after validation against a reference clinical review panel.
 */
export async function registerDomainSkills(skillManager) {
    await skillManager.registerPlugin({
        name: "phi_redaction_precheck",
        description: "Scan input for protected health information before any reasoning step runs",
        trigger: {
            intentPatterns: ["patient", "case", "record", "phi", "ehr"],
            domains: ["healthcare", "clinical", "hipaa"],
        },
        toolChain: [
            { toolName: "phi_redaction_precheck", argumentTemplate: { text: "{input}" } },
        ],
        maturity: "committed",
        successRate: 0.95,
        activationCount: 20,
        tags: ["healthcare", "hipaa", "phi", "safety"],
    });
    await skillManager.registerPlugin({
        name: "literature_lookup",
        description: "Search PubMed for peer-reviewed evidence and return structured citations",
        trigger: {
            intentPatterns: ["evidence", "literature", "study", "guideline", "pubmed"],
            domains: ["healthcare", "clinical", "evidence-based-medicine"],
        },
        toolChain: [
            { toolName: "literature_search", argumentTemplate: { query: "{query}", limit: 10 } },
            { toolName: "fetch_pubmed_abstract", argumentTemplate: { pmids: "{pmids}" } },
        ],
        maturity: "progenitor",
        successRate: 0.8,
        activationCount: 3,
        tags: ["healthcare", "literature", "citations"],
    });
    await skillManager.registerPlugin({
        name: "drug_interaction_check",
        description: "Given a drug list, query RxNorm for pairwise interactions and severity",
        trigger: {
            intentPatterns: ["interaction", "drug", "medication", "contraindication"],
            domains: ["healthcare", "pharmacovigilance"],
        },
        steps: [
            "Normalize each drug to an RxNorm RXCUI via drug_lookup",
            "Query drug_interaction_query for all pairs",
            "Filter to severity >= moderate",
            "Group by mechanism (pharmacokinetic vs pharmacodynamic)",
            "Return structured list with citations and clinical notes",
        ],
        maturity: "progenitor",
        successRate: 0.82,
        activationCount: 2,
        tags: ["healthcare", "medication", "safety"],
    });
}
//# sourceMappingURL=skills.js.map