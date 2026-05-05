import type { SkillManager } from "@stem-agent/agent-core";

/**
 * Register ai-research-domain plugin skills. Paired with
 * domains/ai-research/persona.json (reflexion strategy, depth 7).
 */
export async function registerDomainSkills(skillManager: SkillManager): Promise<void> {
  await skillManager.registerPlugin({
    name: "paper_search_synthesis",
    description: "Search arXiv + HuggingFace for recent papers on a topic and produce a structured synthesis",
    trigger: {
      intentPatterns: ["paper", "literature", "arxiv", "survey", "review"],
      domains: ["ai-research", "ml", "nlp"],
    },
    toolChain: [
      { toolName: "arxiv_search", argumentTemplate: { query: "{query}", limit: 15 } },
      { toolName: "huggingface_paper_search", argumentTemplate: { query: "{query}", limit: 10 } },
      { toolName: "web_search", argumentTemplate: { query: "{query} benchmark results" } },
    ],
    maturity: "committed",
    successRate: 0.83,
    activationCount: 8,
    tags: ["ai-research", "literature", "synthesis"],
  });

  await skillManager.registerPlugin({
    name: "benchmark_comparison",
    description: "Compare reported model performance across a shared benchmark, reconciling differences in setup",
    trigger: {
      intentPatterns: ["benchmark", "compare", "leaderboard", "evaluate", "sota"],
      domains: ["ai-research", "ml"],
    },
    steps: [
      "Identify canonical benchmark name and version",
      "Query HuggingFace for models reporting this benchmark",
      "Query arXiv for recent papers claiming SOTA on the benchmark",
      "Extract reported metrics, compute budget, and evaluation protocol per entry",
      "Flag comparisons that differ in setup (e.g., few-shot vs fine-tuned)",
      "Produce a ranked table with caveats",
    ],
    maturity: "progenitor",
    successRate: 0.76,
    activationCount: 3,
    tags: ["ai-research", "benchmark", "evaluation"],
  });

  await skillManager.registerPlugin({
    name: "replication_assessment",
    description: "Assess whether a paper's results are reproducible: check code release, dataset access, and community replications",
    trigger: {
      intentPatterns: ["replicate", "reproduce", "implementation", "code release"],
      domains: ["ai-research", "ml"],
    },
    toolChain: [
      { toolName: "arxiv_fetch", argumentTemplate: { id: "{paper_id}" } },
      { toolName: "github_search", argumentTemplate: { query: "{paper_title} implementation" } },
      { toolName: "huggingface_model_search", argumentTemplate: { query: "{paper_title}" } },
    ],
    maturity: "progenitor",
    successRate: 0.74,
    activationCount: 2,
    tags: ["ai-research", "reproducibility", "meta"],
  });
}
