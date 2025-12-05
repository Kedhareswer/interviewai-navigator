"use client";

import { useState, useEffect } from "react";

interface Section {
  id: string;
  number: string;
  label: string;
}

const sections: Section[] = [
  { id: "product", number: "1", label: "Product" },
  { id: "how-it-works", number: "2", label: "How it works" },
  { id: "agents", number: "3", label: "Agents" },
  { id: "rag-voice", number: "4", label: "RAG & Voice" },
  { id: "get-started", number: "5", label: "Get started" },
];

const SectionIndex = () => {
  const [activeSection, setActiveSection] = useState("product");

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: "-30% 0px -70% 0px",
      threshold: 0,
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    sections.forEach((section) => {
      const element = document.getElementById(section.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

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
    <aside className="hidden lg:block fixed left-6 top-32 w-40 z-40">
      <div className="space-y-4">
        {sections.map((section) => {
          const isActive = activeSection === section.id;
          return (
            <button
              key={section.id}
              onClick={() => scrollToSection(section.id)}
              className={`w-full text-left flex flex-col gap-1 transition-all duration-300 ${
                isActive ? "opacity-100" : "opacity-50 hover:opacity-80"
              }`}
            >
              <span className="text-[11px] font-mono tracking-widest text-text-secondary uppercase">
                {section.number.padStart(2, "0")}
              </span>
              <span
                className={`text-sm truncate ${
                  isActive ? "text-primary font-semibold" : "text-text-secondary font-medium"
                }`}
              >
                {section.label}
              </span>
              <div
                className={`h-0.5 transition-all duration-300 ${
                  isActive ? "bg-primary w-full" : "bg-border/60 w-1/2"
                }`}
              />
            </button>
          );
        })}
      </div>
    </aside>
  );
};

export default SectionIndex;
