import { FileText, UserSearch, Brain, Mic, Star, Send } from "lucide-react";

interface Step {
  number: string;
  title: string;
  description: string;
  icon: React.ElementType;
}

const steps: Step[] = [
  {
    number: "i",
    title: "Ingest",
    description: "Parse job description and extract key requirements, tech stack, and evaluation criteria.",
    icon: FileText,
  },
  {
    number: "ii",
    title: "Profile",
    description: "RAG over candidate's LinkedIn, GitHub, portfolio to build a comprehensive knowledge base.",
    icon: UserSearch,
  },
  {
    number: "iii",
    title: "Plan",
    description: "Generate tailored interview questions based on role requirements and candidate background.",
    icon: Brain,
  },
  {
    number: "iv",
    title: "Interview",
    description: "Conduct voice-native conversation with TTS asking questions and STT capturing responses.",
    icon: Mic,
  },
  {
    number: "v",
    title: "Score",
    description: "Multi-agent evaluation across technical depth, communication, and cultural fit dimensions.",
    icon: Star,
  },
  {
    number: "vi",
    title: "Export",
    description: "Structured reports with evidence-backed evaluations, exportable to your ATS.",
    icon: Send,
  },
];

const ProcessStepper = () => {
  return (
    <section id="how-it-works" className="py-24 px-6">
      <div className="max-w-[1200px] mx-auto">
        <div className="grid lg:grid-cols-[1fr_2fr] gap-16">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-pill text-pill-foreground text-xs font-mono tracking-wide">
              <span className="opacity-70">2</span>
              <span className="w-1 h-1 rounded-full bg-pill-foreground/40" />
              <span>How it works</span>
            </div>
            <h2 className="text-h2 font-serif tracking-tight">
              A <span className="italic">structured pipeline</span> from job spec to voice interview.
            </h2>
            <p className="text-base text-text-secondary leading-relaxed">
              Six specialized stages ensure comprehensive evaluation while maintaining consistency and fairness across all candidates.
            </p>
          </div>

          <div className="space-y-8">
            {steps.map((step, index) => (
              <div
                key={step.number}
                className="group cursor-pointer"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex gap-6 p-6 rounded-2xl border border-border-subtle bg-background/50 hover:bg-accent hover:border-accent-foreground/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center group-hover:gradient-accent transition-all">
                      <step.icon className="w-6 h-6 text-accent-foreground group-hover:text-white transition-colors" />
                    </div>
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono text-text-secondary tracking-widest">
                        {step.number}
                      </span>
                      <h3 className="text-h3 font-semibold tracking-tight group-hover:text-accent-foreground transition-colors">
                        {step.title}
                      </h3>
                    </div>
                    <p className="text-sm text-text-secondary leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProcessStepper;
