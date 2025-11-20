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
    <aside className="hidden lg:block fixed left-6 top-32 w-32 z-40">
      <div className="space-y-6">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => scrollToSection(section.id)}
            className={`flex flex-col items-start text-left transition-all duration-300 group ${
              activeSection === section.id ? "opacity-100" : "opacity-40 hover:opacity-70"
            }`}
          >
            <div className="flex items-center gap-3 mb-1">
              <div className="relative h-5">
                {/* Number (inactive state) */}
                <span
                  className={`absolute text-xs font-mono tracking-wider transition-all duration-300 ${
                    activeSection === section.id
                      ? "opacity-0 -translate-y-1 text-text-secondary"
                      : "opacity-100 translate-y-0 text-text-secondary"
                  }`}
                >
                  {section.number}
                </span>

                {/* Label (active state) */}
                <span
                  className={`absolute text-sm tracking-tight transition-all duration-300 ${
                    activeSection === section.id
                      ? "opacity-100 translate-y-0 font-semibold text-primary"
                      : "opacity-0 translate-y-1 font-normal text-text-secondary"
                  }`}
                >
                  {section.label}
                </span>
              </div>
            </div>
            {activeSection === section.id && (
              <div className="mt-1 h-0.5 bg-primary w-full transition-all" />
            )}
          </button>
        ))}
      </div>
    </aside>
  );
};

export default SectionIndex;
