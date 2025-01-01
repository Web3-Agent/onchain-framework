export type NetworkType = 'ethereum' | 'bsc' | 'mode' | 'optimism' | 'mode_testnet';

export type OperationType = 
  | 'transfer'
  | 'swap'
  | 'wrap'
  | 'unwrap'
  | 'send'
  | 'approve'
  | 'lend'
  | 'borrow'
  | 'addLiquidity'
  | 'removeLiquidity';

export interface PromptOperation {
  type: OperationType;
  network: NetworkType;
  params: SwapParams | TransferParams | WrapParams | ApproveParams | LendParams | BorrowParams | LiquidityParams;
}

export interface SwapParams {
  tokenIn: string;
  tokenOut: string;
  amount: string;
  slippage?: number;
  protocol?: string;
}

export interface TransferParams {
  token: string;
  amount: string;
  recipient: string;
  targetNetwork?: NetworkType;
}

export interface WrapParams {
  token: string;
  amount: string;
  isWrap: boolean;
}

export interface ApproveParams {
  token: string;
  amount: string;
  spender: string;
}

export interface LendParams {
  token: string;
  amount: string;
  protocol: string;
  apy?: string;
}

export interface BorrowParams {
  token: string;
  amount: string;
  protocol: string;
  collateralToken?: string;
  collateralAmount?: string;
}

export interface LiquidityParams {
  tokenA: string;
  tokenB: string;
  amountA: string;
  amountB: string;
  protocol: string;
  isAdd: boolean;
  slippage?: number;
}

export interface ParsedPrompt {
  operation: PromptOperation;
  rawPrompt: string;
  confidence: number;
} 