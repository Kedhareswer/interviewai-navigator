import TopNav from "@/components/TopNav";
import SectionIndex from "@/components/SectionIndex";
import Hero from "@/components/Hero";
import ProcessStepper from "@/components/ProcessStepper";
import AgentsSection from "@/components/AgentsSection";
import RagVoiceSection from "@/components/RagVoiceSection";
import GetStartedSection from "@/components/GetStartedSection";

const Index = () => {
  return (
    <div className="min-h-screen">
      <TopNav />
      
      <main className="relative flex">
        <SectionIndex />
        
        <div className="flex-1">
          <Hero />
          <ProcessStepper />
          <AgentsSection />
          <RagVoiceSection />
          <GetStartedSection />
        </div>
      </main>
    </div>
  );
};

export default Index;
