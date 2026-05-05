# Related Work Summary for STEM Agent Paper

This document maps each reference in our bibliography to its relevance for the STEM Agent paper, organized by category.

## 1. Multi-Agent Frameworks

### Core Multi-Agent Frameworks

**AutoGen (wu2023autogen, dibia2024autogenstudio)**
- **Relevance**: Direct comparison baseline - multi-agent conversation framework
- **Key contribution**: Flexible agent interaction patterns with human-in-the-loop
- **Connection to STEM**: STEM extends AutoGen's conversational model with standardized protocols (A2A, MCP) and adaptive orchestration
- **Citation context**: Introduction, Related Work, Architecture comparison

**MetaGPT (hong2023metagpt)**
- **Relevance**: Role-based multi-agent framework with software development focus
- **Key contribution**: Structured workflow with defined agent roles (PM, architect, engineer)
- **Connection to STEM**: STEM adopts similar role specialization but adds dynamic protocol negotiation and memory systems
- **Citation context**: Related Work, Architecture section

**CAMEL (li2023camel)**
- **Relevance**: Role-playing multi-agent framework for task decomposition
- **Key contribution**: Inception prompting and role assignment
- **Connection to STEM**: STEM builds on role-based orchestration but adds protocol-agnostic communication
- **Citation context**: Related Work, Task delegation comparison

**Generative Agents (park2023generative)**
- **Relevance**: Memory-augmented agents with reflective behavior
- **Key contribution**: Long-term memory and believable agent behavior
- **Connection to STEM**: STEM's memory architecture inspired by but extends with episodic/semantic distinction
- **Citation context**: Memory system design, Related Work

**LangGraph+CrewAI (duan2024langgraph)**
- **Relevance**: Graph-based multi-agent orchestration
- **Key contribution**: Structured workflow with state management
- **Connection to STEM**: STEM adopts graph-based task routing but adds protocol layer
- **Citation context**: Architecture comparison

### Multi-Agent Communication

**Multi-Agent MARL with Communication (zhu2024commmarl)**
- **Relevance**: Survey of communication mechanisms in multi-agent reinforcement learning
- **Key contribution**: Taxonomy of communication patterns
- **Connection to STEM**: STEM implements explicit communication protocols vs. learned communication
- **Citation context**: Related Work, Protocol design motivation

**Multi-Agent Collaboration Survey (tran2025multiagent)**
- **Relevance**: Recent survey of LLM-based multi-agent collaboration
- **Key contribution**: Comprehensive taxonomy of collaboration mechanisms
- **Connection to STEM**: Positions STEM within current landscape
- **Citation context**: Introduction, Related Work

**Evolving Orchestration (dang2025evolving)**
- **Relevance**: Dynamic multi-agent coordination
- **Key contribution**: Adaptive orchestration strategies
- **Connection to STEM**: STEM adds protocol-based orchestration vs. learned orchestration
- **Citation context**: Architecture, adaptive mechanisms

**Multi-Agent Debate (du2023debate, liang2023debate)**
- **Relevance**: Multi-agent reasoning through debate
- **Key contribution**: Collaborative truth-seeking through argumentation
- **Connection to STEM**: STEM can implement debate as a workflow pattern
- **Citation context**: Example applications, reasoning strategies

### Recent Multi-Agent Benchmarks

**MAFBench (orogat2026mafbench)**
- **Relevance**: Benchmark for multi-agent framework comparison
- **Key contribution**: Unified evaluation methodology
- **Connection to STEM**: Potential evaluation framework for STEM
- **Citation context**: Evaluation, future work

**MAEBE (erisken2025maebe)**
- **Relevance**: Framework for emergent behavior evaluation
- **Key contribution**: Safety and alignment in multi-agent systems
- **Connection to STEM**: Relevant for STEM's safety considerations
- **Citation context**: Safety, evaluation

## 2. Agent Communication Protocols

### Model Context Protocol (MCP)

**MCP Specification (anthropic2024mcp)**
- **Relevance**: CRITICAL - One of STEM's core protocol standards
- **Key contribution**: Standardized tool/resource access for LLM applications
- **Connection to STEM**: STEM implements MCP as standard interface layer
- **Citation context**: Throughout paper - Architecture, Protocol design, Implementation

**MCP-Universe Benchmark (luo2025mcpuniverse)**
- **Relevance**: Benchmark for MCP server evaluation
- **Key contribution**: Real-world MCP server testing
- **Connection to STEM**: Validation and evaluation of STEM's MCP implementation
- **Citation context**: Evaluation, benchmarking

**MCP Security Analysis (song2025beyondprotocol, hou2025landscape)**
- **Relevance**: Security considerations for MCP
- **Key contribution**: Threat model and attack vectors
- **Connection to STEM**: Informs STEM's security design
- **Citation context**: Security section, threat model

**Context-Aware MCP (jayanti2026enhancing)**
- **Relevance**: Enhanced MCP with shared context
- **Key contribution**: Context store for agent collaboration
- **Connection to STEM**: STEM's memory system provides similar functionality
- **Citation context**: Memory architecture comparison

**Schema-Guided MCP (schlapbach2026convergence)**
- **Relevance**: Convergence of schema-guided dialogue and MCP
- **Key contribution**: Formal schema design principles
- **Connection to STEM**: Validates STEM's schema-based approach
- **Citation context**: Protocol design, schema validation

**Telemetry-Aware MCP (koc2025mindmetrics)**
- **Relevance**: Observability in MCP-based systems
- **Key contribution**: Monitoring and metrics for MCP
- **Connection to STEM**: Relevant for STEM's production deployment
- **Citation context**: Monitoring, observability

### Agent-to-Agent Protocol (A2A)

**A2A Protocol Survey (ehtesham2025survey)**
- **Relevance**: CRITICAL - Comprehensive comparison of A2A, MCP, ACP, ANP
- **Key contribution**: Protocol comparison and adoption roadmap
- **Connection to STEM**: Positions STEM's multi-protocol support
- **Citation context**: Introduction, Related Work, Protocol design

**A2A Security (habler2025a2a)**
- **Relevance**: Secure A2A implementation
- **Key contribution**: Security best practices and threat modeling
- **Connection to STEM**: Informs STEM's A2A security implementation
- **Citation context**: Security section, A2A implementation

**A2A at Edge (duan2025agent)**
- **Relevance**: A2A deployment in edge computing
- **Key contribution**: Performance analysis in resource-constrained environments
- **Connection to STEM**: Relevant for STEM's edge deployment scenarios
- **Citation context**: Deployment scenarios, performance

**A2A+MCP Integration (li2025gluetoprotocols)**
- **Relevance**: CRITICAL - Analysis of combining A2A and MCP
- **Key contribution**: Integration challenges and solutions
- **Connection to STEM**: Direct validation of STEM's dual-protocol approach
- **Citation context**: Architecture, protocol integration

### Other Agent Protocols

**Agent Network Protocol (chang2025anp)**
- **Relevance**: Decentralized agent networking
- **Key contribution**: Open network agent discovery
- **Connection to STEM**: Future extension for STEM
- **Citation context**: Future work, protocol comparison

**AWCP (nie2026awcp)**
- **Relevance**: Workspace delegation protocol
- **Key contribution**: Deep collaboration through shared workspace
- **Connection to STEM**: Alternative collaboration model
- **Citation context**: Related protocols, comparison

**Semantic Agent Communication (berges2024semantic)**
- **Relevance**: Ontology-based protocol design
- **Key contribution**: Semantic interoperability
- **Connection to STEM**: Informs STEM's schema design
- **Citation context**: Protocol semantics

## 3. Reasoning Strategies

### Chain-of-Thought and Extensions

**Chain-of-Thought (wei2022chain)**
- **Relevance**: Foundation for LLM reasoning
- **Key contribution**: Step-by-step reasoning prompting
- **Connection to STEM**: STEM agents use CoT for complex reasoning
- **Citation context**: Reasoning methods, prompting

**ReAct (yao2023react)**
- **Relevance**: Reasoning + Acting paradigm
- **Key contribution**: Interleaved reasoning and action
- **Connection to STEM**: STEM implements ReAct-style reasoning loops
- **Citation context**: Agent reasoning, action selection

**Tree of Thoughts (yao2023tree)**
- **Relevance**: Deliberate exploration of reasoning paths
- **Key contribution**: Tree search over thought space
- **Connection to STEM**: Can be implemented as STEM workflow
- **Citation context**: Advanced reasoning capabilities

**Self-Consistency (wang2023selfconsistency)**
- **Relevance**: Ensemble reasoning for robustness
- **Key contribution**: Multiple reasoning paths with voting
- **Connection to STEM**: STEM can leverage for critical decisions
- **Citation context**: Reliability, ensemble methods

**Reflexion (shinn2023reflexion)**
- **Relevance**: Self-reflection and learning from mistakes
- **Key contribution**: Verbal reinforcement learning
- **Connection to STEM**: STEM's adaptive mechanisms inspired by this
- **Citation context**: Learning and adaptation

**Self-Refine (madaan2023selfrefine)**
- **Relevance**: Iterative refinement with feedback
- **Key contribution**: Self-improvement through iteration
- **Connection to STEM**: STEM's iterative refinement workflows
- **Citation context**: Quality improvement

**Language Agent Tree Search (zhou2023lats)**
- **Relevance**: Unified reasoning, acting, and planning
- **Key contribution**: Tree search for agent actions
- **Connection to STEM**: Advanced planning capability
- **Citation context**: Planning algorithms

### Recent Reasoning Advances

**Agentic Reasoning (wei2026agentic)**
- **Relevance**: Recent advances in LLM reasoning
- **Key contribution**: Survey of agentic reasoning techniques
- **Connection to STEM**: Contextualizes STEM's reasoning approach
- **Citation context**: Introduction, Related Work

**Budget-Guided Reasoning (li2025budget)**
- **Relevance**: Adaptive computation allocation
- **Key contribution**: Resource-aware reasoning
- **Connection to STEM**: Relevant for STEM's efficiency
- **Citation context**: Performance optimization

**Adaptive Test-Time Compute (alomrani2025reasoning)**
- **Relevance**: Survey of adaptive reasoning strategies
- **Key contribution**: Comprehensive taxonomy
- **Connection to STEM**: Positions STEM's adaptive mechanisms
- **Citation context**: Related Work, adaptation

**Comprehensive AI Agents Review (ferrag2025agents)**
- **Relevance**: Broad survey from LLM reasoning to autonomous agents
- **Key contribution**: End-to-end perspective
- **Connection to STEM**: Contextualizes STEM in broader landscape
- **Citation context**: Introduction, Related Work

## 4. Tool-Augmented LLMs

**Toolformer (schick2023toolformer)**
- **Relevance**: Foundation for tool-augmented LLMs
- **Key contribution**: Self-taught tool use
- **Connection to STEM**: Motivates STEM's tool integration layer
- **Citation context**: Tool use, background

**Gorilla (patil2023gorilla)**
- **Relevance**: LLM with massive API integration
- **Key contribution**: Fine-tuned for API calls
- **Connection to STEM**: STEM provides infrastructure for tool access
- **Citation context**: Tool integration comparison

**ToolLLM (qin2023toolllm)**
- **Relevance**: Large-scale tool learning
- **Key contribution**: 16K+ real-world APIs
- **Connection to STEM**: STEM's MCP layer enables similar scale
- **Citation context**: Tool ecosystem, scalability

**TALM (parisi2022talm)**
- **Relevance**: Tool augmentation via self-play
- **Key contribution**: Iterative tool learning
- **Connection to STEM**: Methodology for tool integration
- **Citation context**: Tool learning approach

**Small LLMs as Tool Learners (shen2024smallllm)**
- **Relevance**: Multi-LLM decomposition for tool use
- **Key contribution**: Specialized agents for tool tasks
- **Connection to STEM**: STEM's modular architecture enables this
- **Citation context**: Agent specialization

## 5. Memory and Retrieval

**Retrieval-Augmented Generation (lewis2020rag)**
- **Relevance**: Foundation for knowledge-intensive tasks
- **Key contribution**: External knowledge integration
- **Connection to STEM**: STEM's memory system builds on RAG
- **Citation context**: Memory architecture, retrieval

**Maximal Marginal Relevance (carbonell1998mmr)**
- **Relevance**: Diversity-based retrieval
- **Key contribution**: Balance relevance and diversity
- **Connection to STEM**: STEM uses MMR for memory retrieval
- **Citation context**: Memory retrieval algorithm

### ATLAS-Related Memory and Learning Papers

**MemRL (zhang2026memrl)** — arXiv:2601.03192
- **Relevance**: Self-evolving agents via RL on episodic memory
- **Key contribution**: RL-driven memory evolution where memory entries gain utility scores from outcomes
- **Connection to STEM**: ATLAS implementation uses EMA utility updates inspired by MemRL's reward-driven memory scoring
- **Citation context**: Memory utility scoring, outcome-driven learning

**Live-Evo (zhang2026liveevo)** — arXiv:2602.02369
- **Relevance**: Online self-evolving memory with experience weight reinforcement/decay
- **Key contribution**: Online learning paradigm with real-time memory weight updates
- **Connection to STEM**: ATLAS's real-time utility feedback loop mirrors Live-Evo's online weight evolution
- **Citation context**: Online memory evolution, real-time adaptation

**AgentFly (zhou2025agentfly)** — arXiv:2508.16153
- **Relevance**: Memory-augmented MDP (M-MDP), achieved GAIA #1 without fine-tuning
- **Key contribution**: Formalizes memory as part of decision-making process
- **Connection to STEM**: ATLAS's utility-biased retrieval implements the memory-as-decision-input principle
- **Citation context**: Memory-augmented decision making, retrieval scoring

**MUSE (yang2025muse)** — arXiv:2510.08002
- **Relevance**: Hierarchical memory module for long-horizon self-evolution
- **Key contribution**: Structured memory with tiered consolidation for long-horizon tasks
- **Connection to STEM**: ATLAS consolidation engine (promote/merge/prune) parallels MUSE's tiered approach
- **Citation context**: Memory consolidation, long-horizon learning

**CraniMem (mody2026cranimem)** — arXiv:2603.15642
- **Relevance**: Neurocognitive gated bounded memory with goal-conditioned gating
- **Key contribution**: Hard capacity bounds with principled eviction
- **Connection to STEM**: ATLAS enforces hard capacity bounds (episodicCapacity=1000, semanticCapacity=500) with utility-based eviction
- **Citation context**: Bounded memory, capacity management

**Memory for Autonomous LLM Agents (du2026memory)** — arXiv:2603.07670
- **Relevance**: Comprehensive survey with write-manage-read loop taxonomy
- **Key contribution**: 5 mechanism families for agent memory, foundational taxonomy
- **Connection to STEM**: ATLAS architecture aligns with the write-manage-read framework: utility scoring (manage), biased retrieval (read), consolidation (manage)
- **Citation context**: Memory architecture survey, taxonomy

## 6. Self-Adaptive Systems

**AI Autonomy (liu2022autonomy)**
- **Relevance**: Self-initiated continual learning
- **Key contribution**: Open-world adaptation
- **Connection to STEM**: STEM's self-adaptive capabilities inspired by this
- **Citation context**: Adaptation mechanisms, autonomy

**Lifelong Self-Adaptation (gheibi2022lifelong)**
- **Relevance**: ML in self-adaptive systems
- **Key contribution**: Lifelong learning for adaptation
- **Connection to STEM**: STEM's learning mechanisms
- **Citation context**: Continuous adaptation

**Hybrid Control Theory + AI (caldas2020hybrid)**
- **Relevance**: Combining control theory with AI
- **Key contribution**: Formal + learned adaptation
- **Connection to STEM**: Hybrid approach to adaptation
- **Citation context**: Adaptation strategies

## 7. Architecture Patterns

**Blackboard Architecture (hayesroth1985blackboard)**
- **Relevance**: Classic pattern for agent coordination
- **Key contribution**: Shared memory for collaboration
- **Connection to STEM**: STEM's memory system inspired by blackboard
- **Citation context**: Architecture patterns

**Ensemble Methods (dietterich2000ensemble)**
- **Relevance**: Multiple models for robustness
- **Key contribution**: Combining diverse models
- **Connection to STEM**: STEM can leverage ensemble patterns
- **Citation context**: Reliability, ensemble reasoning

**Adaptive Computation Time (graves2016adaptive)**
- **Relevance**: Dynamic compute allocation
- **Key contribution**: Variable computation per input
- **Connection to STEM**: Relevant for STEM's efficiency
- **Citation context**: Adaptive computation

**Think Before You Speak (goyal2023think)**
- **Relevance**: Pause tokens for reasoning
- **Key contribution**: Explicit reasoning time
- **Connection to STEM**: STEM can implement similar mechanisms
- **Citation context**: Reasoning strategies

## 8. Foundation Models

**Transformer Architecture (vaswani2017attention)**
- **Relevance**: Foundation of modern LLMs
- **Key contribution**: Attention mechanism
- **Connection to STEM**: Underlying technology
- **Citation context**: Background, foundations

**GPT-3 (brown2020gpt3)**
- **Relevance**: Few-shot learning foundation
- **Key contribution**: Scale and few-shot capabilities
- **Connection to STEM**: LLM capabilities leveraged by STEM
- **Citation context**: Background

**Claude (anthropic2024claude)**
- **Relevance**: Model family used in STEM
- **Key contribution**: Advanced reasoning and tool use
- **Connection to STEM**: Primary LLM for STEM agents
- **Citation context**: Implementation, experiments

## 9. Agent Development Frameworks

**LangChain (chase2022langchain)**
- **Relevance**: Popular agent framework
- **Key contribution**: Modular LLM application development
- **Connection to STEM**: Comparison baseline
- **Citation context**: Related Work, framework comparison

**DSPy (khattab2023dspy)**
- **Relevance**: Declarative LM programming
- **Key contribution**: Self-improving pipelines
- **Connection to STEM**: Alternative programming paradigm
- **Citation context**: Related Work, comparison

**AutoGPT (significantgravitas2023autogpt)**
- **Relevance**: Autonomous agent framework
- **Key contribution**: Goal-driven autonomy
- **Connection to STEM**: Comparison for autonomy features
- **Citation context**: Related Work, autonomous agents

## 10. Domain-Specific Applications (Examples)

**MedAide (yang2024medaide)**
- **Relevance**: Healthcare multi-agent system
- **Key contribution**: Domain-specific agent collaboration
- **Connection to STEM**: Example application domain
- **Citation context**: Applications, case studies

**Project Synapse (yadav2026synapse)**
- **Relevance**: Last-mile delivery disruption resolution
- **Key contribution**: Hierarchical multi-agent with memory
- **Connection to STEM**: Similar architecture principles
- **Citation context**: Architecture comparison, applications

**Thucy (theologitis2025thucy)**
- **Relevance**: Database claim verification
- **Key contribution**: Multi-agent for structured data
- **Connection to STEM**: Tool-augmented reasoning example
- **Citation context**: Applications, tool integration

## Citation Priority

### Must-Cite (Essential References)
1. **Protocols**: anthropic2024mcp, ehtesham2025survey, habler2025a2a, li2025gluetoprotocols
2. **Multi-Agent Frameworks**: wu2023autogen, hong2023metagpt, li2023camel
3. **Reasoning**: wei2022chain, yao2023react, shinn2023reflexion
4. **Tool Use**: schick2023toolformer, patil2023gorilla, qin2023toolllm
5. **Memory**: lewis2020rag, carbonell1998mmr, zhang2026memrl, zhang2026liveevo, zhou2025agentfly
6. **Adaptation**: liu2022autonomy, gheibi2022lifelong
7. **Recent Work**: tran2025multiagent, wei2026agentic, ferrag2025agents

### Should-Cite (Important Context)
1. **MCP Research**: luo2025mcpuniverse, jayanti2026enhancing, schlapbach2026convergence
2. **Security**: song2025beyondprotocol, hou2025landscape
3. **Framework Tools**: dibia2024autogenstudio, chase2022langchain
4. **Architecture**: hayesroth1985blackboard, dietterich2000ensemble
5. **Foundations**: vaswani2017attention, brown2020gpt3, anthropic2024claude

### Could-Cite (Supporting Details)
1. Specific reasoning extensions (ToT, LATS, Self-Consistency)
2. Domain applications (MedAide, Synapse, Thucy)
3. Additional protocols (ANP, AWCP)
4. Framework comparisons (DSPy, AutoGPT)
5. Recent surveys (orogat2026mafbench, alomrani2025reasoning)

## Section-Specific Citation Map

### Introduction
- Cite: ferrag2025agents, tran2025multiagent (context), wu2023autogen, hong2023metagpt (existing work), anthropic2024mcp, ehtesham2025survey (protocols)

### Related Work
**Multi-Agent Systems**: wu2023autogen, hong2023metagpt, li2023camel, park2023generative, zhu2024commmarl, tran2025multiagent, dang2025evolving

**Protocols**: anthropic2024mcp, ehtesham2025survey, habler2025a2a, li2025gluetoprotocols, chang2025anp, berges2024semantic

**Reasoning**: wei2022chain, yao2023react, yao2023tree, shinn2023reflexion, wei2026agentic

**Tool Use**: schick2023toolformer, patil2023gorilla, qin2023toolllm, parisi2022talm

**Memory**: lewis2020rag, carbonell1998mmr, park2023generative

**Adaptation**: liu2022autonomy, gheibi2022lifelong, caldas2020hybrid

### Architecture
- Cite: hayesroth1985blackboard (shared memory), anthropic2024mcp (MCP layer), ehtesham2025survey (protocols), jayanti2026enhancing (context sharing)

### Memory System
- Cite: lewis2020rag, carbonell1998mmr (retrieval), park2023generative (agent memory), hayesroth1985blackboard (shared memory), zhang2026memrl, zhang2026liveevo, zhou2025agentfly (ATLAS self-learning), yang2025muse, mody2026cranimem (bounded memory), du2026memory (survey)

### Protocol Layer
- Cite: anthropic2024mcp, habler2025a2a, li2025gluetoprotocols (integration), schlapbach2026convergence (schema design)

### Evaluation
- Cite: orogat2026mafbench (benchmarks), luo2025mcpuniverse (MCP testing), dibia2024autogenstudio (comparison)

### Security
- Cite: song2025beyondprotocol, hou2025landscape (MCP security), habler2025a2a (A2A security)

### Future Work
- Cite: chang2025anp (additional protocols), nie2026awcp (workspace collaboration), li2025budget (adaptive compute)
