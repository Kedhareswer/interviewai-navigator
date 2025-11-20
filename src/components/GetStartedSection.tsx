import { Button } from "@/components/ui/button";
import { ArrowRight, Mail } from "lucide-react";

const GetStartedSection = () => {
  return (
    <section id="get-started" className="py-32 px-6">
      <div className="max-w-[800px] mx-auto text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-pill text-pill-foreground text-xs font-mono tracking-wide">
          <span className="opacity-70">5</span>
          <span className="w-1 h-1 rounded-full bg-pill-foreground/40" />
          <span>Get started</span>
        </div>

        <h2 className="text-h2 font-bold tracking-tight">
          Interested in using InterviewOS for your hiring?
        </h2>

        <p className="text-lg text-text-secondary max-w-2xl mx-auto leading-relaxed">
          We're working with select teams to refine the platform. Book a walkthrough 
          to see the full interview pipeline in action.
        </p>

        <div className="flex items-center justify-center gap-4 pt-4">
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all hover:scale-105 px-6 py-6 text-base group">
            Book a walkthrough
            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button
            variant="outline"
            className="border-border-strong hover:bg-accent hover:text-accent-foreground transition-all px-6 py-6 text-base group"
          >
            <Mail className="mr-2 w-4 h-4" />
            Contact us
          </Button>
        </div>

        {/* Footer */}
        <div className="pt-16 space-y-6">
          <div className="flex items-center justify-center gap-6 text-sm text-text-secondary">
            <a href="#" className="hover:text-foreground transition-colors">
              Terms
            </a>
            <span className="w-1 h-1 rounded-full bg-border-strong" />
            <a href="#" className="hover:text-foreground transition-colors">
              Privacy
            </a>
            <span className="w-1 h-1 rounded-full bg-border-strong" />
            <a href="#" className="hover:text-foreground transition-colors">
              LinkedIn
            </a>
            <span className="w-1 h-1 rounded-full bg-border-strong" />
            <a href="#" className="hover:text-foreground transition-colors">
              X
            </a>
          </div>
          <p className="text-xs text-text-secondary">
            © 2025 InterviewOS. All rights reserved.
          </p>
        </div>
      </div>
    </section>
  );
};

export default GetStartedSection;
