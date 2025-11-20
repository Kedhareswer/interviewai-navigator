"use client";

import { LucideIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface AgentCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  scope: string;
  delay?: number;
}

const AgentCard = ({ icon: Icon, title, description, scope, delay = 0 }: AgentCardProps) => {
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setInView(true);
          }
        });
      },
      {
        root: null,
        rootMargin: "0px 0px -20% 0px",
        threshold: 0,
      },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`group cursor-pointer h-full max-w-[720px] mx-auto agent-card ${
        inView ? "agent-card-inview" : ""
      }`}
      style={{ transitionDelay: `${delay}s` }}
    >
      <div className="h-full min-h-[320px] py-20 px-10 rounded-2xl border border-border-subtle bg-background shadow-lg hover:bg-accent hover:border-accent-foreground/20 transition-all duration-300 space-y-4">
        <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center group-hover:gradient-accent transition-all">
          <Icon className="w-6 h-6 text-accent-foreground group-hover:text-white transition-colors" />
        </div>
        
        <div className="space-y-2">
          <h3 className="text-h3 font-semibold tracking-tight group-hover:text-accent-foreground transition-colors">
            {title}
          </h3>
          <p className="text-sm text-text-secondary leading-relaxed">
            {description}
          </p>
        </div>

        <div className="pt-2">
          <span className="inline-block px-3 py-1 rounded-full bg-accent text-accent-foreground text-xs font-mono tracking-wide">
            {scope}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AgentCard;
