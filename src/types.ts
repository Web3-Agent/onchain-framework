export interface PriceChangeData {
  token: string;
  price: number;
  previousPrice: number;
  percentageChange: number;
}

export interface HealthFactorData {
  protocol: string;
  healthFactor: number;
  previousHealthFactor: number;
}

export interface TradeAnalysis {
  recommendation: string;
  riskLevel: 'low' | 'medium' | 'high';
  priceImpact: number;
  liquidityScore: number;
  volatilityScore: number;
  risks: string[];
  opportunities: string[];
}

export interface TimingSuggestion {
  bestTimeWindow: string;
  confidence: number;
  reasoning: string[];
  marketConditions: {
    trend: 'bullish' | 'bearish' | 'neutral';
    volatility: 'low' | 'medium' | 'high';
    volume: 'low' | 'medium' | 'high';
  };
}

export interface GasStrategy {
  type: 'aggressive' | 'moderate' | 'safe';
  maxPriorityFee: bigint;
  maxFeePerGas: bigint;
  flashbotsEnabled: boolean;
  waitBlocks?: number;
  reasoning: string[];
}

export interface AITradeParams {
  tokenIn: string;
  tokenOut: string;
  amount: string;
  maxSlippage: number;
  gasStrategy?: GasStrategy;
}

export interface AITradeResult {
  analysis: TradeAnalysis;
  timing: TimingSuggestion;
  gasStrategy: GasStrategy;
  route: any; // Replace with actual route type
  receipt?: any; // Replace with actual receipt type
} 