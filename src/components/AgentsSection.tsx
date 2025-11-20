"use client";

import { useEffect, useRef, useState } from "react";
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
  const sectionRef = useRef<HTMLElement | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const el = sectionRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const sectionHeight = el.offsetHeight;

      const scrollable = sectionHeight - viewportHeight;
      if (scrollable <= 0) {
        setProgress(0);
        return;
      }

      // How far we've scrolled into the section (clamped)
      const distanceIntoSection = Math.min(Math.max(-rect.top, 0), scrollable);
      const p = distanceIntoSection / scrollable;
      setProgress(p);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Horizontal offset across the gallery.
  // Use a smaller per-card shift so motion is slower and more subtle.
  const maxShiftPerCard = 50; // percent
  const maxShift = (agents.length - 1) * maxShiftPerCard;
  const translatePercent = progress * maxShift;

  return (
    <section ref={sectionRef} id="agents" className="agents-section py-24 px-6">
      <div className="max-w-[1200px] mx-auto">
        <div className="sticky top-24 space-y-10">
          <div className="max-w-3xl space-y-4 text-text-inverted">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-pill text-pill-foreground text-xs font-mono tracking-wide">
              <span className="opacity-70">{agents.length}</span>
              <span className="w-1 h-1 rounded-full bg-pill-foreground/40" />
              <span>Agents</span>
            </div>
            <h2 className="text-h2 font-serif tracking-tight">
              <span className="italic">Specialist agents</span> for every part of the interview.
            </h2>
            <p className="text-base text-text-inverted/80 leading-relaxed">
              Each agent focuses on one responsibility: JD understanding, technical depth, 
              HR behaviorals, or RAG over portfolios. Together they create comprehensive, 
              evidence-backed evaluations.
            </p>
          </div>

          <div className="relative mt-8">
            <div className="h-[520px] flex items-center overflow-hidden agents-gallery">
              {/* Edge fades so neighboring cards are visible but slightly muted */}
              <div className="agents-fade-left" />
              <div className="agents-fade-right" />
              <div
                className="relative flex gap-1 will-change-transform transition-transform duration-200 ease-out justify-center"
                style={{ transform: `translateX(-${translatePercent}%)` }}
              >
                {agents.map((agent, index) => (
                  <div key={agent.title} className="w-full flex-shrink-0">
                    <AgentCard
                      icon={agent.icon}
                      title={agent.title}
                      description={agent.description}
                      scope={agent.scope}
                      delay={index * 0.1}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Larger spacer so scroll progress is slower across the gallery while heading stays fixed */}
        <div className="h-[120vh]" />
      </div>
    </section>
  );
};

export default AgentsSection;
