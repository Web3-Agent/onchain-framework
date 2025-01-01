export type GasStrategyType = 'aggressive' | 'moderate' | 'safe';

export interface GasStrategy {
  type: GasStrategyType;
  maxPriorityFee: bigint;
  maxFeePerGas: bigint;
  flashbotsEnabled: boolean;
}

export interface GasEstimate {
  maxFeePerGas: bigint;
  maxPriorityFeePerGas: bigint;
  estimatedGas: bigint;
  estimatedCost: bigint;
}

export interface SimulationResult {
  success: boolean;
  gasUsed: bigint;
  returnValue: string;
  logs: any[];
  error?: string;
} 