import { LucideIcon } from "lucide-react";

interface AgentCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  scope: string;
  delay?: number;
}

const AgentCard = ({ icon: Icon, title, description, scope, delay = 0 }: AgentCardProps) => {
  return (
    <div
      className="group cursor-pointer h-full"
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="h-full p-6 rounded-2xl border border-border-subtle bg-background/50 hover:bg-accent hover:border-accent-foreground/20 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl space-y-4">
        <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center group-hover:gradient-accent transition-all">
          <Icon className="w-6 h-6 text-accent-foreground group-hover:text-white transition-colors" />
        </div>
        
        <div className="space-y-2">
          <h3 className="text-h3 font-semibold tracking-tight group-hover:text-accent-foreground transition-colors">
            {title}
          </h3>
          <p className="text-sm text-text-secondary leading-relaxed">
            {description}
          </p>
        </div>

        <div className="pt-2">
          <span className="inline-block px-3 py-1 rounded-full bg-accent text-accent-foreground text-xs font-mono tracking-wide">
            {scope}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AgentCard;
