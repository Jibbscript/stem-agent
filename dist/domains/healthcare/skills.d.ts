import type { SkillManager } from "@stem-agent/agent-core";
/**
 * Register healthcare-domain plugin skills.
 *
 * These skills assume three MCP servers are reachable: fhir-mcp, pubmed-mcp,
 * rxnorm-mcp. See domains/healthcare/persona.json for the full allowlist.
 *
 * All skills default to `progenitor` maturity — production deployments should
 * mature them after validation against a reference clinical review panel.
 */
export declare function registerDomainSkills(skillManager: SkillManager): Promise<void>;
//# sourceMappingURL=skills.d.ts.map