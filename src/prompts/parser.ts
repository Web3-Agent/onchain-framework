import { ChatOpenAI } from '@langchain/openai';
import { PromptOperation, ParsedPrompt, NetworkType, OperationType } from './types';
import { HumanMessage } from '@langchain/core/messages';

export class PromptParser {
  private llm: ChatOpenAI;

  constructor(apiKey: string) {
    this.llm = new ChatOpenAI({
      modelName: 'gpt-4',
      temperature: 0,
      openAIApiKey: apiKey
    });
  }

  async parsePrompt(prompt: string): Promise<ParsedPrompt> {
    const result = await this.llm.invoke([
      new HumanMessage(`Parse this blockchain operation: "${prompt}"
      
      Extract:
      1. Operation type (transfer/swap/wrap/unwrap/send/approve)
      2. Network (ethereum/bsc/mode/optimism/mode_testnet)
      3. Parameters (tokens, amounts, addresses, etc.)
      
      Format as JSON with exact values from the prompt.`)
    ]);

    const parsed = this.validateAndTransform(result.content as string, prompt);
    return parsed;
  }

  private validateAndTransform(aiResponse: string, rawPrompt: string): ParsedPrompt {
    try {
      const parsed = JSON.parse(aiResponse);
      
      // Validate operation type
      if (!this.isValidOperationType(parsed.type)) {
        throw new Error(`Invalid operation type: ${parsed.type}`);
      }

      // Validate network
      if (!this.isValidNetwork(parsed.network)) {
        throw new Error(`Invalid network: ${parsed.network}`);
      }

      // Validate parameters based on operation type
      this.validateParams(parsed);

      return {
        operation: parsed,
        rawPrompt,
        confidence: this.calculateConfidence(parsed)
      };
    } catch (error) {
      throw new Error(`Failed to parse prompt: ${error}`);
    }
  }

  private isValidOperationType(type: string): type is OperationType {
    const validTypes = [
      'transfer',
      'swap',
      'wrap',
      'unwrap',
      'send',
      'approve'
    ];
    return validTypes.includes(type);
  }

  private isValidNetwork(network: string): network is NetworkType {
    const validNetworks = [
      'ethereum',
      'bsc',
      'mode',
      'optimism',
      'mode_testnet'
    ];
    return validNetworks.includes(network);
  }

  private validateParams(operation: PromptOperation): void {
    const params = operation.params as any;
    switch (operation.type) {
      case 'swap':
        if (!params.tokenIn || !params.tokenOut || !params.amount) {
          throw new Error('Missing required swap parameters');
        }
        break;
      case 'transfer':
        if (!params.token || !params.amount || !params.recipient) {
          throw new Error('Missing required transfer parameters');
        }
        break;
      case 'wrap':
      case 'unwrap':
        if (!params.token || !params.amount) {
          throw new Error('Missing required wrap/unwrap parameters');
        }
        break;
      case 'approve':
        if (!params.token || !params.amount || !params.spender) {
          throw new Error('Missing required approval parameters');
        }
        break;
    }
  }

  private calculateConfidence(operation: PromptOperation): number {
    // Implement confidence scoring based on:
    // 1. Parameter completeness
    // 2. Token address validation
    // 3. Network compatibility
    // 4. Amount format validation
    return 0.95; // Placeholder
  }
} 