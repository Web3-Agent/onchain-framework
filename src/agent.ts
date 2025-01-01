import { ChatOpenAI } from '@langchain/openai';
import { DynamicTool } from '@langchain/core/tools';
import { AgentExecutor, createOpenAIFunctionsAgent } from 'langchain/agents';
import { getTools } from './tools.js';
import { PromptTemplate } from '@langchain/core/prompts';

const AGENT_SYSTEM_TEMPLATE = `You are an advanced AI agent specialized in executing onchain operations and DeFi strategies.
You can understand natural language commands and translate them into specific blockchain operations.

Your capabilities include:
1. Token swaps and liquidity management
2. Lending and borrowing operations
3. Portfolio management and rebalancing
4. Market analysis and automated trading
5. Risk monitoring and management

When processing commands:
1. Analyze the user's intent and desired outcome
2. Consider current market conditions and gas costs
3. Implement safety checks and slippage protection
4. Execute operations in the most efficient order
5. Provide clear feedback on actions taken

Current configuration:
Network: {network}
Available protocols: Uniswap V2, Aave V3, Chainlink
`;

export async function createAgent() {
  const model = new ChatOpenAI({
    modelName: 'gpt-4',
    temperature: 0,
  });

  const tools = [
    ...getTools(),
    new DynamicTool({
      name: 'analyze_market_sentiment',
      description: 'Analyze market sentiment for a given token',
      func: async (token: string) => {
        // Implementation of market sentiment analysis
        return `Market sentiment analysis for ${token}...`;
      },
    }),
    new DynamicTool({
      name: 'optimize_gas_strategy',
      description: 'Optimize gas strategy for transactions',
      func: async () => {
        // Implementation of gas optimization
        return 'Gas strategy optimization...';
      },
    }),
  ];

  const prompt = PromptTemplate.fromTemplate(AGENT_SYSTEM_TEMPLATE);
  const agentPrompt = await prompt.format({ network: 'mainnet' });

  const agent = await createOpenAIFunctionsAgent({
    llm: model,
    tools,
    prompt: agentPrompt,
  });

  return AgentExecutor.fromAgentAndTools({
    agent,
    tools,
    verbose: true,
    maxIterations: 3,
  });
}
