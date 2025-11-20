import { Link2, PlayCircle, ClipboardCheck } from "lucide-react";

const steps = [
  {
    icon: Link2,
    title: "Connect candidate sources",
    description: "Link LinkedIn, GitHub, portfolio, resume. We automatically extract and vectorize key information.",
  },
  {
    icon: PlayCircle,
    title: "Run the interview",
    description: "TTS asks questions, agents adapt to answers in real-time, STT captures and analyzes responses.",
  },
  {
    icon: ClipboardCheck,
    title: "Review the signal",
    description: "See structured, evidence-backed evaluations with direct quotes and context from candidate materials.",
  },
];

const RagVoiceSection = () => {
  return (
    <section id="rag-voice" className="py-24 px-6">
      <div className="max-w-[1200px] mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-pill text-pill-foreground text-xs font-mono tracking-wide">
              <span className="opacity-70">4</span>
              <span className="w-1 h-1 rounded-full bg-pill-foreground/40" />
              <span>RAG & Voice</span>
            </div>
            <h2 className="text-h2 font-bold tracking-tight">
              Voice-native, RAG-powered interviews.
            </h2>
            <div className="space-y-3 text-base text-text-secondary leading-relaxed">
              <p className="flex items-start gap-3">
                <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                <span>Reads LinkedIn, GitHub, portfolio as context for grounded questions</span>
              </p>
              <p className="flex items-start gap-3">
                <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                <span>Uses vector search to dynamically pull relevant candidate history</span>
              </p>
              <p className="flex items-start gap-3">
                <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                <span>Voice layer: TTS asks, STT listens, agents analyze in real-time</span>
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {steps.map((step, index) => (
              <div
                key={step.title}
                className="group"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex gap-4 p-6 rounded-2xl border border-border-subtle bg-background/50 hover:bg-accent hover:border-accent-foreground/20 transition-all duration-300">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center group-hover:gradient-accent transition-all">
                      <step.icon className="w-5 h-5 text-accent-foreground group-hover:text-white transition-colors" />
                    </div>
                  </div>
                  <div className="flex-1 space-y-1">
                    <h3 className="text-base font-semibold tracking-tight group-hover:text-accent-foreground transition-colors">
                      {step.title}
                    </h3>
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

export default RagVoiceSection;
