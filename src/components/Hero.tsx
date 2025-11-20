import { Button } from "@/components/ui/button";

const Hero = () => {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({ top: offsetPosition, behavior: "smooth" });
    }
  };

  return (
    <section id="product" className="min-h-screen flex items-center justify-center px-6 py-24 relative overflow-hidden">
      {/* Gradient orb background */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[600px] h-[600px] rounded-full gradient-accent-subtle blur-3xl opacity-30" />
      </div>

      <div className="max-w-3xl mx-auto text-center relative z-10 space-y-8">
        {/* Pill badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pill text-pill-foreground text-sm font-mono tracking-wide">
          <span className="text-xs opacity-70">1</span>
          <span className="w-1 h-1 rounded-full bg-pill-foreground/40" />
          <span>Product</span>
        </div>

        {/* Display headline */}
        <h1 className="text-display font-bold tracking-tight">
          Interview agents that actually understand your candidates.
        </h1>

        {/* Supporting body */}
        <p className="text-lg text-text-secondary max-w-2xl mx-auto leading-relaxed">
          InterviewOS combines specialized AI agents with RAG and voice technology 
          to conduct structured, evidence-based technical interviews at scale. 
          From job specs to scored evaluations, fully automated.
        </p>

        {/* CTA buttons */}
        <div className="flex items-center justify-center gap-4 pt-4">
          <Button
            onClick={() => scrollToSection("how-it-works")}
            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all hover:scale-105 px-6 py-6 text-base"
          >
            Explore the interview flow
          </Button>
          <Button
            onClick={() => scrollToSection("agents")}
            variant="outline"
            className="border-border-strong hover:bg-accent hover:text-accent-foreground transition-all px-6 py-6 text-base"
          >
            See how agents work
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
