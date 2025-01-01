import { ethers } from 'ethers';
import {
  BridgeParams,
  BridgeQuote,
  BridgeRoute,
  BridgeTransaction,
  BridgeProtocol
} from './types';

// Bridge contract ABIs
const LAYERZERO_BRIDGE_ABI = [
  'function estimateFees(uint16 dstChainId, address from, bytes calldata payload) external view returns (uint256 nativeFee, uint256 zroFee)',
  'function bridge(uint16 dstChainId, address token, uint256 amount, address recipient) external payable'
];

const HOP_BRIDGE_ABI = [
  'function sendToL2(uint256 chainId, address recipient, uint256 amount, uint256 deadline, uint256 relayerFee) external payable',
  'function calculateFee(uint256 chainId, uint256 amount) external view returns (uint256)'
];

export class BridgeManager {
  private provider: ethers.Provider;
  private wallet: ethers.Wallet;
  private bridgeContracts: Map<BridgeProtocol, Record<string, string>>;

  constructor(provider: ethers.Provider, wallet: ethers.Wallet) {
    this.provider = provider;
    this.wallet = wallet;
    this.bridgeContracts = new Map([
      ['LayerZero', {
        ethereum: '0x66A71Dcef29A0fFBDBE3c6a460a3B5BC225Cd675',
        bnb: '0x3c2269811836af69497E5F486A85D7316753cf62',
        arbitrum: '0x4D747149A57923Beb89f22E6B7B97f7D8c087A00'
      }],
      ['Hop', {
        ethereum: '0x3666cA85925629d7C42E1504BC7F7E6707cF34E8',
        bnb: '0x2A6F1F51a14B1147079aF4e3Ab4Fd5A75566E958',
        arbitrum: '0x0e0E3d2C5c292161999474247956EF542caBF8dd'
      }]
    ]);
  }

  async getBridgeQuote(params: BridgeParams): Promise<BridgeQuote> {
    switch (params.bridgeProtocol) {
      case 'LayerZero':
        return await this.getLayerZeroQuote(params);
      case 'Hop':
        return await this.getHopQuote(params);
      case 'Across':
        return await this.getAcrossQuote(params);
      default:
        throw new Error(`Unsupported bridge protocol: ${params.bridgeProtocol}`);
    }
  }

  async findBestBridgeRoute(params: Omit<BridgeParams, 'bridgeProtocol'>): Promise<BridgeRoute> {
    // Get quotes from all supported bridges
    const quotes = await Promise.all([
      this.getBridgeQuote({ ...params, bridgeProtocol: 'LayerZero' }),
      this.getBridgeQuote({ ...params, bridgeProtocol: 'Hop' }),
      this.getBridgeQuote({ ...params, bridgeProtocol: 'Across' })
    ]);

    // Find the best route based on fees and estimated time
    const bestQuote = quotes.reduce((best, current) => {
      const currentScore = this.calculateRouteScore(current);
      const bestScore = this.calculateRouteScore(best);
      return currentScore > bestScore ? current : best;
    });

    return {
      protocol: bestQuote.protocol,
      steps: await this.getBridgeSteps(params, bestQuote.protocol),
      totalFee: bestQuote.bridgeFee,
      estimatedTime: bestQuote.estimatedTime
    };
  }

  async bridge(params: BridgeParams): Promise<BridgeTransaction> {
    const bridgeContract = await this.getBridgeContract(params.bridgeProtocol, params.targetChain);
    const recipient = params.recipient || await this.wallet.getAddress();

    try {
      let tx;
      switch (params.bridgeProtocol) {
        case 'LayerZero':
          tx = await this.bridgeWithLayerZero(bridgeContract, params, recipient);
          break;
        case 'Hop':
          tx = await this.bridgeWithHop(bridgeContract, params, recipient);
          break;
        case 'Across':
          tx = await this.bridgeWithAcross(params, recipient);
          break;
      }

      const receipt = await tx.wait();
      
      if (!receipt) {
        throw new Error('Transaction receipt is null');
      }
      
      return {
        hash: receipt.hash,
        status: 'pending',
        sourceChain: params.sourceChain,
        targetChain: params.targetChain,
        sourceHash: receipt.hash,
        amount: params.amount,
        timestamp: Math.floor(Date.now() / 1000)
      };
    } catch (error: any) {
      throw new Error(`Bridge transaction failed: ${error.message}`);
    }
  }

  private async getBridgeContract(protocol: BridgeProtocol, chain: string): Promise<ethers.Contract> {
    const contracts = this.bridgeContracts.get(protocol);
    if (!contracts || !contracts[chain.toLowerCase()]) {
      throw new Error(`Contract address not found for protocol: ${protocol} on chain: ${chain}`);
    }

    const address = contracts[chain.toLowerCase()];
    const abi = protocol === 'LayerZero' ? LAYERZERO_BRIDGE_ABI : HOP_BRIDGE_ABI;
    return new ethers.Contract(address, abi, this.wallet);
  }

  private async getLayerZeroQuote(params: BridgeParams): Promise<BridgeQuote> {
    const bridgeContract = await this.getBridgeContract('LayerZero', params.targetChain);
    const dstChainId = this.getLayerZeroChainId(params.targetChain);
    const [nativeFee] = await bridgeContract.estimateFees(dstChainId, this.wallet.address, '0x');

    return {
      estimatedGas: BigInt(300000), // Approximate gas limit
      bridgeFee: nativeFee.toString(),
      estimatedTime: 1800, // 30 minutes
      minAmountOut: params.amount, // LayerZero guarantees exact amount
      protocol: 'LayerZero'
    };
  }

  private async getHopQuote(params: BridgeParams): Promise<BridgeQuote> {
    // Implementation for Hop bridge quote
    return {
      estimatedGas: BigInt(500000),
      bridgeFee: '0',
      estimatedTime: 600, // 10 minutes
      minAmountOut: params.amount,
      protocol: 'Hop'
    };
  }

  private async getAcrossQuote(params: BridgeParams): Promise<BridgeQuote> {
    // Implementation for Across bridge quote
    return {
      estimatedGas: BigInt(400000),
      bridgeFee: '0',
      estimatedTime: 900, // 15 minutes
      minAmountOut: params.amount,
      protocol: 'Across'
    };
  }

  private calculateRouteScore(quote: BridgeQuote): number {
    const feeFactor = 1 / Number(quote.bridgeFee);
    const timeFactor = 1 / quote.estimatedTime;
    return feeFactor * 0.7 + timeFactor * 0.3; // Weight fees more than time
  }

  private async getBridgeSteps(
    params: Omit<BridgeParams, 'bridgeProtocol'>,
    protocol: BridgeProtocol
  ): Promise<any[]> {
    // Implementation to get bridge steps
    return [];
  }

  private async bridgeWithLayerZero(
    contract: ethers.Contract,
    params: BridgeParams,
    recipient: string
  ): Promise<ethers.ContractTransactionResponse> {
    const dstChainId = this.getLayerZeroChainId(params.targetChain);
    return await contract.bridge(
      dstChainId,
      params.token,
      params.amount,
      recipient,
      { value: params.amount } // For native token bridges
    );
  }

  private async bridgeWithHop(
    contract: ethers.Contract,
    params: BridgeParams,
    recipient: string
  ): Promise<ethers.ContractTransactionResponse> {
    const deadline = Math.floor(Date.now() / 1000) + 3600; // 1 hour deadline
    return await contract.sendToL2(
      this.getHopChainId(params.targetChain),
      recipient,
      params.amount,
      deadline,
      0 // relayerFee
    );
  }

  private async bridgeWithAcross(
    params: BridgeParams,
    recipient: string
  ): Promise<ethers.ContractTransactionResponse> {
    // Implementation for Across bridge
    throw new Error('Across bridge not implemented yet');
  }

  private getLayerZeroChainId(chain: string): number {
    const chainIds: Record<string, number> = {
      'ethereum': 101,
      'bnb': 102,
      'avalanche': 106,
      'polygon': 109,
      'arbitrum': 110,
      'optimism': 111,
      'fantom': 112
    };
    const chainId = chainIds[chain.toLowerCase()];
    if (!chainId) throw new Error(`Unsupported chain: ${chain}`);
    return chainId;
  }

  private getHopChainId(chain: string): number {
    const chainIds: Record<string, number> = {
      'ethereum': 1,
      'bnb': 56,
      'polygon': 137,
      'arbitrum': 42161,
      'optimism': 10,
      'gnosis': 100
    };
    const chainId = chainIds[chain.toLowerCase()];
    if (!chainId) throw new Error(`Unsupported chain: ${chain}`);
    return chainId;
  }
} 