import { ChatPromptTemplate } from '@langchain/core/prompts';
import { ChatOpenAI } from '@langchain/openai';
import { createOpenAIFunctionsAgent, AgentExecutor } from 'langchain/agents';
import { ethers } from 'ethers';
import { EventEmitter } from 'events';
import { DynamicTool } from '@langchain/core/tools';
import { 
  PriceChangeData, 
  HealthFactorData, 
  TradeAnalysis, 
  TimingSuggestion, 
  GasStrategy, 
  AITradeParams, 
  AITradeResult 
} from './types';

export class EVMAgent extends EventEmitter {
  private provider: ethers.Provider;
  private wallet: ethers.Wallet;
  private aiAgent: AgentExecutor | null = null;
  private llm: ChatOpenAI | null = null;

  constructor(provider: ethers.Provider, wallet: ethers.Wallet) {
    super();
    this.provider = provider;
    this.wallet = wallet;
    this.initializeAI();
  }

  private async initializeAI() {
    if (!process.env.OPENAI_API_KEY) {
      console.warn('OPENAI_API_KEY not found. AI features will be disabled.');
      return;
    }

    try {
      this.llm = new ChatOpenAI({
        modelName: 'gpt-4',
        temperature: 0,
        openAIApiKey: process.env.OPENAI_API_KEY
      });

      const tools = this.getAITools();
      const prompt = ChatPromptTemplate.fromMessages([
        ["system", "You are an AI agent specialized in blockchain operations and DeFi trading. You help users make informed decisions about trades, analyze market conditions, and optimize transactions."],
        ["human", "{input}"]
      ]);

      this.aiAgent = await createOpenAIFunctionsAgent({
        llm: this.llm,
        tools,
        prompt
      });

      console.log('AI agent initialized successfully');
    } catch (error) {
      console.error('Failed to initialize AI:', error);
    }
  }

  private getAITools(): DynamicTool[] {
    return [
      new DynamicTool({
        name: 'analyze_trade',
        description: 'Analyze a potential trade and provide insights',
        func: async ({ tokenIn, tokenOut, amount, route }: any) => {
          try {
            const analysis = await this.analyzeTrade(tokenIn, tokenOut, amount, route);
            return JSON.stringify(analysis);
          } catch (error) {
            return `Error analyzing trade: ${error}`;
          }
        }
      }),
      new DynamicTool({
        name: 'suggest_trade_timing',
        description: 'Suggest the best time to execute a trade based on market conditions',
        func: async ({ token, amount }: any) => {
          try {
            const suggestion = await this.suggestTradeTiming(token, amount);
            return JSON.stringify(suggestion);
          } catch (error) {
            return `Error suggesting trade timing: ${error}`;
          }
        }
      }),
      new DynamicTool({
        name: 'optimize_gas_strategy',
        description: 'Optimize gas strategy based on network conditions',
        func: async () => {
          try {
            const strategy = await this.optimizeGasStrategy();
            return JSON.stringify(strategy);
          } catch (error) {
            return `Error optimizing gas strategy: ${error}`;
          }
        }
      })
    ];
  }

  // AI-powered methods
  async analyzeTrade(tokenIn: string, tokenOut: string, amount: string, route: any): Promise<TradeAnalysis> {
    if (!this.aiAgent) {
      throw new Error('AI agent not initialized');
    }

    const result = await this.aiAgent.invoke({
      input: `Analyze this trade:
      - Token In: ${tokenIn}
      - Token Out: ${tokenOut}
      - Amount: ${amount}
      - Route: ${JSON.stringify(route)}
      
      Consider:
      1. Price impact
      2. Market conditions
      3. Historical volatility
      4. Liquidity depth
      5. Potential risks`
    });

    return result.output as TradeAnalysis;
  }

  async suggestTradeTiming(token: string, amount: string): Promise<TimingSuggestion> {
    if (!this.aiAgent) {
      throw new Error('AI agent not initialized');
    }

    const result = await this.aiAgent.invoke({
      input: `Suggest the best time to trade ${amount} of ${token} based on:
      1. Current market conditions
      2. Historical price patterns
      3. Gas prices
      4. Network congestion
      5. Trading volume`
    });

    return result.output as TimingSuggestion;
  }

  async optimizeGasStrategy(): Promise<GasStrategy> {
    if (!this.aiAgent) {
      throw new Error('AI agent not initialized');
    }

    const result = await this.aiAgent.invoke({
      input: `Optimize gas strategy based on:
      1. Current network congestion
      2. Historical gas patterns
      3. Transaction urgency
      4. MEV protection needs
      5. Cost-efficiency targets`
    });

    return result.output as GasStrategy;
  }

  // AI-powered trade execution
  async executeTradeWithAI(params: AITradeParams): Promise<AITradeResult> {
    // First analyze the trade
    const analysis = await this.analyzeTrade(
      params.tokenIn,
      params.tokenOut,
      params.amount,
      null
    );

    // Get timing suggestion
    const timing = await this.suggestTradeTiming(params.tokenIn, params.amount);

    // Optimize gas strategy
    const gasStrategy = await this.optimizeGasStrategy();

    // Execute the trade with optimized parameters
    const route = await this.findBestRoute({
      ...params,
      gasStrategy
    });

    const receipt = await this.executeRoute(route);

    return {
      analysis,
      timing,
      gasStrategy,
      route,
      receipt
    };
  }

  // Event emitter methods for price and health factor monitoring
  emit(event: 'priceChange', data: PriceChangeData): boolean;
  emit(event: 'healthFactorChange', data: HealthFactorData): boolean;
  emit(event: string, data: any): boolean {
    return super.emit(event, data);
  }

  on(event: 'priceChange', listener: (data: PriceChangeData) => void): this;
  on(event: 'healthFactorChange', listener: (data: HealthFactorData) => void): this;
  on(event: string, listener: (data: any) => void): this {
    return super.on(event, listener);
  }

  // Existing methods...
  async findBestRoute(params: AITradeParams): Promise<any> {
    // Implementation
    return params;
  }

  async executeRoute(route: any): Promise<any> {
    // Implementation
    return route;
  }
}

// Export the agent creator function
export async function createAgent(
  rpcUrl: string,
  privateKey: string
): Promise<EVMAgent> {
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);
  return new EVMAgent(provider, wallet);
}
