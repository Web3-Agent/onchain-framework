export type DexProtocol = 'Uniswap' | '1inch' | 'Paraswap';

export interface RoutingParams {
  tokenIn: string;
  tokenOut: string;
  amount: string;
  maxSlippage: number;
  protocols: DexProtocol[];
  maxSplits?: number;
}

export interface RouteQuote {
  protocol: DexProtocol;
  amountOut: string;
  priceImpact: number;
  path: string[];
  gasEstimate: bigint;
}

export interface SplitRoute {
  routes: RouteQuote[];
  totalAmountOut: string;
  averagePriceImpact: number;
  totalGasEstimate: bigint;
}

export interface RoutingResult {
  bestSingleRoute: RouteQuote;
  bestSplitRoute?: SplitRoute;
  expectedAmountOut: string;
  minAmountOut: string;
  estimatedGasUsed: bigint;
  priceImpact: number;
} 