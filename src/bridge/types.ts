export type BridgeProtocol = 'LayerZero' | 'Hop' | 'Across';

export interface BridgeParams {
  sourceChain: string;
  targetChain: string;
  token: string;
  amount: string;
  bridgeProtocol: BridgeProtocol;
  recipient?: string;
  slippage?: number;
}

export interface BridgeQuote {
  estimatedGas: bigint;
  bridgeFee: string;
  estimatedTime: number; // in seconds
  minAmountOut: string;
  protocol: BridgeProtocol;
}

export interface BridgeRoute {
  protocol: BridgeProtocol;
  steps: BridgeStep[];
  totalFee: string;
  estimatedTime: number;
}

export interface BridgeStep {
  type: 'approve' | 'bridge' | 'claim';
  protocol: BridgeProtocol;
  data: any;
  estimatedGas: bigint;
}

export interface BridgeTransaction {
  hash: string;
  status: 'pending' | 'completed' | 'failed';
  sourceChain: string;
  targetChain: string;
  sourceHash?: string;
  targetHash?: string;
  amount: string;
  timestamp: number;
} 