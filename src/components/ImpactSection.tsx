import React from "react";

const ImpactSection = () => {
  return (
    <section className="py-24 px-6 bg-page">
      <div className="max-w-[1200px] mx-auto">
        <div className="max-w-3xl ml-auto pr-4">
          <p className="text-sm font-mono tracking-[0.2em] uppercase text-text-secondary mb-4">
            Why this matters
          </p>
          <h2 className="text-h2 font-serif tracking-tight leading-snug">
            InterviewOS turns noisy interview loops into
            <span className="block text-text-secondary/80">
              consistent, agent-driven conversations with evidence you can trust.
            </span>
          </h2>
        </div>
      </div>
    </section>
  );
};

export default ImpactSection;
