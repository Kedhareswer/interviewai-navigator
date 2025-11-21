import { backendExpertAgent, BackendExpertAgent } from './backend-expert-agent';
import { mlExpertAgent, MLExpertAgent } from './ml-expert-agent';
import { frontendExpertAgent, FrontendExpertAgent } from './frontend-expert-agent';
import { expertDomainAgent, ExpertDomainAgent } from './expert-agent';

export type ExpertAgent = BackendExpertAgent | MLExpertAgent | FrontendExpertAgent | ExpertDomainAgent;

export interface Question {
  text: string;
  competency: string;
  difficulty: string;
  expectedAnswer: string;
}

export interface AnswerEvaluation {
  score: number;
  evidence: string;
  recommendation: 'probe_deeper' | 'move_on' | 'sufficient';
}

/**
 * Factory to route to appropriate expert agent based on domain/competency
 */
export class ExpertAgentFactory {
  /**
   * Get the appropriate expert agent for a given domain/competency
   */
  static getExpertAgent(
    domain?: string,
    competency?: string,
    techStack?: string[]
  ): ExpertAgent {
    // Determine domain from explicit domain, competency, or tech stack
    const inferredDomain = this.inferDomain(domain, competency, techStack);

    switch (inferredDomain) {
      case 'backend':
        return backendExpertAgent;
      case 'ml':
      case 'machine-learning':
      case 'ai':
        return mlExpertAgent;
      case 'frontend':
        return frontendExpertAgent;
      default:
        // Fallback to generic expert agent
        return expertDomainAgent;
    }
  }

  /**
   * Infer domain from various signals
   */
  private static inferDomain(
    domain?: string,
    competency?: string,
    techStack?: string[]
  ): string | undefined {
    // If domain is explicitly provided, use it
    if (domain) {
      return domain.toLowerCase();
    }

    // Infer from competency
    if (competency) {
      const compLower = competency.toLowerCase();
      if (compLower.includes('backend') || compLower.includes('api') || compLower.includes('server')) {
        return 'backend';
      }
      if (compLower.includes('frontend') || compLower.includes('react') || compLower.includes('ui')) {
        return 'frontend';
      }
      if (compLower.includes('ml') || compLower.includes('machine learning') || compLower.includes('ai') || compLower.includes('model')) {
        return 'ml';
      }
    }

    // Infer from tech stack
    if (techStack && techStack.length > 0) {
      const stackStr = techStack.join(' ').toLowerCase();
      
      // Backend indicators
      if (stackStr.includes('python') && (stackStr.includes('django') || stackStr.includes('flask') || stackStr.includes('fastapi'))) {
        return 'backend';
      }
      if (stackStr.includes('node') || stackStr.includes('express') || stackStr.includes('nestjs')) {
        return 'backend';
      }
      if (stackStr.includes('java') || stackStr.includes('spring')) {
        return 'backend';
      }
      if (stackStr.includes('go') || stackStr.includes('golang')) {
        return 'backend';
      }
      
      // ML indicators
      if (stackStr.includes('tensorflow') || stackStr.includes('pytorch') || stackStr.includes('scikit')) {
        return 'ml';
      }
      if (stackStr.includes('pandas') || stackStr.includes('numpy') && stackStr.includes('ml')) {
        return 'ml';
      }
      
      // Frontend indicators
      if (stackStr.includes('react') || stackStr.includes('vue') || stackStr.includes('angular')) {
        return 'frontend';
      }
      if (stackStr.includes('typescript') && (stackStr.includes('next') || stackStr.includes('remix'))) {
        return 'frontend';
      }
    }

    return undefined;
  }
}

