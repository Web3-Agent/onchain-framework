import { ChatPromptTemplate } from '@langchain/core/prompts';
import { ChatOpenAI } from '@langchain/openai';
import { createOpenAIFunctionsAgent } from 'langchain/agents';

const agentPrompt = ChatPromptTemplate.fromMessages([
  ["system", "You are an AI agent that helps users interact with blockchain protocols."],
  ["human", "{input}"]
]);

export async function createAgent() {
  const model = new ChatOpenAI({
    temperature: 0,
    modelName: 'gpt-4'
  });

  const agent = await createOpenAIFunctionsAgent({
    llm: model,
    prompt: agentPrompt,
    tools: []
  });

  return agent;
}
