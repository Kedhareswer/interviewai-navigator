import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

const TopNav = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
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
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-page/85 backdrop-blur-nav shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-12">
            <button
              onClick={() => scrollToSection("product")}
              className="text-lg font-semibold tracking-tight hover:text-primary transition-colors"
            >
              InterviewOS
            </button>
            
            <div className="hidden md:flex items-center gap-8">
              <button
                onClick={() => scrollToSection("product")}
                className="text-sm text-text-secondary hover:text-foreground transition-colors relative group"
              >
                Product
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
              </button>
              <button
                onClick={() => scrollToSection("how-it-works")}
                className="text-sm text-text-secondary hover:text-foreground transition-colors relative group"
              >
                How it works
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
              </button>
              <button
                onClick={() => scrollToSection("agents")}
                className="text-sm text-text-secondary hover:text-foreground transition-colors relative group"
              >
                Agents
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
              </button>
              <button
                onClick={() => scrollToSection("rag-voice")}
                className="text-sm text-text-secondary hover:text-foreground transition-colors relative group"
              >
                RAG & Voice
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
              </button>
              <button
                onClick={() => scrollToSection("get-started")}
                className="text-sm text-text-secondary hover:text-foreground transition-colors relative group"
              >
                Get started
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
              </button>
            </div>
          </div>

          <Button
            onClick={() => scrollToSection("get-started")}
            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm hover:shadow-md transition-all hover:scale-105"
          >
            Talk to us
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default TopNav;
