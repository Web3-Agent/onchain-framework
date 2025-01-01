import { ethers } from 'ethers';
import { EVMAgent } from './EVMAgent';

export { EVMAgent } from './EVMAgent';
export * from './types';
export * from './prompts/types';
export { PromptParser } from './prompts/parser';
export { PromptExecutor } from './prompts/executor';

// Re-export common types
export type {
  PriceChangeData,
  HealthFactorData,
  TradeAnalysis,
  TimingSuggestion,
  GasStrategy,
  AITradeParams,
  AITradeResult
} from './types';
