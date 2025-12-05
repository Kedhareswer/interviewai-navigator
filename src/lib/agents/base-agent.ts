import { gemini, GEMINI_MODELS, GeminiModel } from '../gemini/client';

export interface AgentMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AgentTool {
  name: string;
  description: string;
  parameters: Record<string, any>;
  handler: (...args: any[]) => Promise<any>;
}

export abstract class BaseAgent {
  protected model: GeminiModel = GEMINI_MODELS.PRO;
  protected systemPrompt: string;
  protected tools: AgentTool[] = [];

  constructor(systemPrompt: string) {
    this.systemPrompt = systemPrompt;
  }

  /**
   * Convert messages to Gemini format
   */
  private convertMessagesToGeminiFormat(messages: AgentMessage[]): any[] {
    // Gemini uses a different format - combine system prompt with first user message
    const geminiMessages: any[] = [];
    
    // Find system message
    const systemMsg = messages.find(m => m.role === 'system');
    const otherMessages = messages.filter(m => m.role !== 'system');
    
    // Combine system prompt with first user message if exists
    if (otherMessages.length > 0) {
      const firstUser = otherMessages[0];
      const combinedContent = systemMsg 
        ? `${this.systemPrompt}\n\n${firstUser.content}`
        : firstUser.content;
      
      geminiMessages.push({
        role: 'user',
        parts: [{ text: combinedContent }],
      });
      
      // Add remaining messages
      for (let i = 1; i < otherMessages.length; i++) {
        const msg = otherMessages[i];
        geminiMessages.push({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }],
        });
      }
    } else {
      // Only system message
      geminiMessages.push({
        role: 'user',
        parts: [{ text: this.systemPrompt }],
      });
    }
    
    return geminiMessages;
  }

  /**
   * Execute agent with messages and optional tools
   */
  async execute(
    messages: AgentMessage[],
    tools?: AgentTool[]
  ): Promise<string> {
    const model = gemini.getGenerativeModel({ 
      model: this.model,
      systemInstruction: this.systemPrompt,
    });

    // Convert messages format
    const geminiMessages = this.convertMessagesToGeminiFormat(messages);
    
    // Build function declarations for tools if provided
    const availableTools = tools || this.tools;
    let functionDeclarations = undefined;
    
    if (availableTools.length > 0) {
      functionDeclarations = availableTools.map((tool) => ({
        name: tool.name,
        description: tool.description,
        parameters: {
          type: 'object',
          properties: tool.parameters,
        },
      }));
    }

    const chat = model.startChat({
      history: geminiMessages.slice(0, -1), // All but last message
      tools: functionDeclarations ? [{ functionDeclarations }] : undefined,
    });

    const lastMessage = geminiMessages[geminiMessages.length - 1];
    const result = await chat.sendMessage(lastMessage.parts[0].text);
    const response = result.response;

    // Handle function calls if any
    const functionCalls = response.functionCalls();
    if (functionCalls && functionCalls.length > 0) {
      const functionResults = await Promise.all(
        functionCalls.map(async (fnCall: any) => {
          const tool = availableTools.find((t) => t.name === fnCall.name);
          if (!tool) {
            throw new Error(`Tool not found: ${fnCall.name}`);
          }

          const result = await tool.handler(...Object.values(fnCall.args || {}));

          return {
            name: fnCall.name,
            response: result,
          };
        })
      );

      // Send function results back
      // Gemini expects function results in a specific format
      const functionResponseParts = functionResults.map(result => ({
        functionResponse: {
          name: result.name,
          response: result.response,
        },
      }));
      
      const followUpResult = await chat.sendMessage(functionResponseParts);
      return followUpResult.response.text();
    }

    return response.text();
  }

  /**
   * Execute agent with JSON response
   */
  async executeJSON<T>(
    messages: AgentMessage[],
    schema?: Record<string, any>
  ): Promise<T> {
    const model = gemini.getGenerativeModel({ 
      model: this.model,
      systemInstruction: `${this.systemPrompt}\n\nAlways respond with valid JSON only.`,
    });

    // Convert messages format
    const geminiMessages = this.convertMessagesToGeminiFormat(messages);
    
    // Add JSON schema instruction if provided
    const lastMessage = geminiMessages[geminiMessages.length - 1];
    if (schema) {
      lastMessage.parts[0].text += `\n\nReturn JSON matching this schema: ${JSON.stringify(schema)}`;
    } else {
      lastMessage.parts[0].text += '\n\nReturn valid JSON only.';
    }

    const chat = model.startChat({
      history: geminiMessages.slice(0, -1),
    });

    const result = await chat.sendMessage(lastMessage.parts[0].text);
    const responseText = result.response.text();
    
    // Extract JSON from response (handle markdown code blocks)
    let jsonText = responseText.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/g, '').replace(/```\n?/g, '');
    }

    return JSON.parse(jsonText) as T;
  }
}


