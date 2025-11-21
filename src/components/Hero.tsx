"use client";

import Image from "next/image";
import Link from "next/link";
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
    <section
      id="product"
      className="min-h-screen flex items-center justify-end px-6 py-24 relative overflow-hidden"
    >
      <div className="absolute top-10 inset-x-0 z-20 flex justify-center">
        <span className="text-2xl font-semibold tracking-[0.3em] text-text-secondary uppercase">
          InterviewOS
        </span>
      </div>
      {/* Gradient orb background */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[600px] h-[600px] rounded-full gradient-accent-subtle blur-3xl opacity-30" />
      </div>

      {/* Hero illustration background */}
      <div className="absolute inset-y-0 left-0 w-full lg:w-[60%] pointer-events-none">
        <div className="relative w-full h-full">
          <Image
            src="/hero.png"
            alt="AI interview assistant illustration"
            fill
            priority
            sizes="(min-width: 1024px) 60vw, 100vw"
            className="object-contain object-left translate-x-[-10%]"
          />
        </div>
      </div>

      <div className="max-w-3xl w-full relative z-10 space-y-8 text-right">
        {/* Pill badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pill text-pill-foreground text-sm font-mono tracking-wide ml-auto">
          <span className="text-xs opacity-70">1</span>
          <span className="w-1 h-1 rounded-full bg-pill-foreground/40" />
          <span>Product</span>
        </div>

        {/* Display headline */}
        <h1 className="text-display font-serif tracking-tight leading-tight">
          Interview agents that <span className="italic">actually understand</span> your candidates.
        </h1>

        {/* Supporting body */}
        <p className="text-lg text-text-secondary max-w-2xl ml-auto leading-relaxed">
          InterviewOS combines specialized AI agents with RAG and voice technology
          to conduct structured, evidence-based technical interviews at scale.
          From job specs to scored evaluations, fully automated.
        </p>

        {/* CTA buttons */}
        <div className="flex items-center justify-end gap-4 pt-4">
          <Button
            asChild
            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all hover:scale-105 px-6 py-6 text-base"
          >
            <Link href="/dashboard">Get started</Link>
          </Button>
          <Button
            variant="outline"
            onClick={() => scrollToSection("get-started")}
            className="border-border-strong hover:bg-accent hover:text-accent-foreground transition-all px-6 py-6 text-base"
          >
            Learn more
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
