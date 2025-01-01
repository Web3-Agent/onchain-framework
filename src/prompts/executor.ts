import { EVMAgent } from '../EVMAgent';
import { PromptOperation, ParsedPrompt, NetworkType } from './types';
import { PromptParser } from './parser';

export class PromptExecutor {
  private agents: Map<NetworkType, EVMAgent>;
  private parser: PromptParser;

  constructor(agents: Map<NetworkType, EVMAgent>, openAIKey: string) {
    this.agents = agents;
    this.parser = new PromptParser(openAIKey);
  }

  async execute(prompt: string) {
    try {
      // Parse the prompt
      const parsed = await this.parser.parsePrompt(prompt);
      
      // Get the appropriate agent
      const agent = this.agents.get(parsed.operation.network);
      if (!agent) {
        throw new Error(`No agent available for network: ${parsed.operation.network}`);
      }

      // Execute the operation
      return await this.executeOperation(agent, parsed);
    } catch (error) {
      throw new Error(`Failed to execute prompt: ${error}`);
    }
  }

  private async executeOperation(agent: EVMAgent, parsed: ParsedPrompt) {
    const { operation } = parsed;

    // Use AI-powered execution for all operations
    return await agent.executeTradeWithAI({
      operation: operation.type,
      ...operation.params,
      network: operation.network
    });
  }

  // Helper method to add new agents
  addAgent(network: NetworkType, agent: EVMAgent) {
    this.agents.set(network, agent);
  }

  // Helper method to get supported networks
  getSupportedNetworks(): NetworkType[] {
    return Array.from(this.agents.keys());
  }
} 