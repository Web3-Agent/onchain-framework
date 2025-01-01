export interface Position {
  token: string;
  amount: string;
  entryPrice: number;
  currentPrice: number;
  protocol?: string;
  type: 'spot' | 'liquidity' | 'lending' | 'borrowing';
}

export interface Trade {
  timestamp: number;
  token: string;
  type: 'buy' | 'sell';
  amount: string;
  price: number;
  txHash: string;
}

export interface PortfolioAnalytics {
  // Risk metrics
  sharpeRatio: number;
  volatility: number;
  maxDrawdown: number;
  // Performance metrics
  historicalReturns: number;
  impermanentLoss: number;
  // Position tracking
  activePositions: Position[];
  historicalTrades: Trade[];
  // Portfolio composition
  totalValue: string;
  tokenAllocations: Map<string, number>;
}

export interface PortfolioBalance {
  token: string;
  amount: string;
  value: string;
  allocation: number;
} 