"use client";

import TopNav from "@/components/TopNav";
import SectionIndex from "@/components/SectionIndex";
import Hero from "@/components/Hero";
import ProcessStepper from "@/components/ProcessStepper";
import ImpactSection from "@/components/ImpactSection";
import AgentsSection from "@/components/AgentsSection";
import RagVoiceSection from "@/components/RagVoiceSection";
import GetStartedSection from "@/components/GetStartedSection";

export default function Home() {
  return (
    <div className="min-h-screen">
      <TopNav />
      
      <main className="relative flex">
        <SectionIndex />
        
        <div className="flex-1">
          <Hero />
          <ProcessStepper />
          <ImpactSection />
          <AgentsSection />
          <RagVoiceSection />
          <GetStartedSection />
        </div>
      </main>
    </div>
  );
}

