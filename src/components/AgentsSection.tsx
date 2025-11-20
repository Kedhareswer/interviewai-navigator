import { FileCode2, Code2, Users, Database, Mic2 } from "lucide-react";
import AgentCard from "./AgentCard";

const agents = [
  {
    icon: FileCode2,
    title: "JD & Role Agent",
    description: "Extracts requirements, tech stack, and seniority level from job descriptions. Creates structured evaluation frameworks.",
    scope: "Scope: requirements",
  },
  {
    icon: Code2,
    title: "Technical Depth Agent",
    description: "Evaluates coding skills, system design thinking, and problem-solving approaches based on role-specific criteria.",
    scope: "Scope: technical",
  },
  {
    icon: Users,
    title: "HR Behavioral Agent",
    description: "Assesses communication style, team fit, and soft skills through structured behavioral interview patterns.",
    scope: "Scope: behavioral",
  },
  {
    icon: Database,
    title: "RAG Profile Agent",
    description: "Performs vector search over candidate's portfolio, GitHub repos, and professional history for contextual grounding.",
    scope: "Scope: context",
  },
  {
    icon: Mic2,
    title: "Voice Interview Conductor",
    description: "Orchestrates TTS-to-STT conversation flow, adapts follow-up questions in real-time based on candidate responses.",
    scope: "Scope: orchestration",
  },
];

const AgentsSection = () => {
  return (
    <section id="agents" className="py-24 px-6 bg-background">
      <div className="max-w-[1200px] mx-auto space-y-12">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-pill text-pill-foreground text-xs font-mono tracking-wide">
            <span className="opacity-70">3</span>
            <span className="w-1 h-1 rounded-full bg-pill-foreground/40" />
            <span>Agents</span>
          </div>
          <h2 className="text-h2 font-bold tracking-tight">
            Specialist agents for every part of the interview.
          </h2>
          <p className="text-base text-text-secondary leading-relaxed">
            Each agent focuses on one responsibility: JD understanding, technical depth, 
            HR behaviorals, or RAG over portfolios. Together they create comprehensive, 
            evidence-backed evaluations.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((agent, index) => (
            <AgentCard
              key={agent.title}
              icon={agent.icon}
              title={agent.title}
              description={agent.description}
              scope={agent.scope}
              delay={index * 0.1}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default AgentsSection;
