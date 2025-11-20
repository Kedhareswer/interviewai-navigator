"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";

const TopNav = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith("/dashboard");

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
      className={`w-full z-40 transition-all duration-300 ${
        isScrolled ? "bg-page/85 backdrop-blur-nav shadow-sm" : "bg-transparent"
      }`}
    >
      <div className="max-w-[1200px] mx-auto px-6 flex justify-between items-center h-16">
        <Link
          href={isDashboard ? "/" : "#product"}
          onClick={!isDashboard ? (e) => {
            e.preventDefault();
            scrollToSection("product");
          } : undefined}
          className="text-lg font-semibold tracking-tight hover:text-primary transition-colors"
        >
          InterviewOS
        </Link>
        
        {!isDashboard && (
          <Link href="/dashboard">
            <Button variant="outline" size="sm">
              Dashboard
            </Button>
          </Link>
        )}
      </div>
    </nav>
  );
};

export default TopNav;
