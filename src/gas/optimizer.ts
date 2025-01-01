import { ethers } from 'ethers';
import { GasStrategy, GasEstimate, SimulationResult, GasStrategyType } from './types';

export class GasOptimizer {
  private provider: ethers.Provider;
  private currentStrategy: GasStrategy;

  constructor(provider: ethers.Provider) {
    this.provider = provider;
    this.currentStrategy = this.getDefaultStrategy();
  }

  private getDefaultStrategy(): GasStrategy {
    return {
      type: 'moderate',
      maxPriorityFee: BigInt(2000000000), // 2 Gwei
      maxFeePerGas: BigInt(40000000000), // 40 Gwei
      flashbotsEnabled: false
    };
  }

  async setStrategy(type: GasStrategyType) {
    const strategies: Record<GasStrategyType, GasStrategy> = {
      aggressive: {
        type: 'aggressive',
        maxPriorityFee: BigInt(3000000000), // 3 Gwei
        maxFeePerGas: BigInt(50000000000), // 50 Gwei
        flashbotsEnabled: true
      },
      moderate: this.getDefaultStrategy(),
      safe: {
        type: 'safe',
        maxPriorityFee: BigInt(1500000000), // 1.5 Gwei
        maxFeePerGas: BigInt(30000000000), // 30 Gwei
        flashbotsEnabled: false
      }
    };

    this.currentStrategy = strategies[type];
  }

  async estimateGas(tx: ethers.TransactionRequest): Promise<GasEstimate> {
    const [baseFee, priorityFee] = await Promise.all([
      this.provider.getFeeData(),
      this.estimatePriorityFee()
    ]);

    const maxPriorityFee = priorityFee > this.currentStrategy.maxPriorityFee
      ? this.currentStrategy.maxPriorityFee
      : priorityFee;

    const maxFeePerGas = baseFee.maxFeePerGas || BigInt(0);
    const estimatedGas = await this.provider.estimateGas(tx);
    const estimatedCost = maxFeePerGas * estimatedGas;

    return {
      maxFeePerGas,
      maxPriorityFeePerGas: maxPriorityFee,
      estimatedGas,
      estimatedCost
    };
  }

  async simulateTransaction(tx: ethers.TransactionRequest): Promise<SimulationResult> {
    try {
      const result = await this.provider.call(tx);
      return {
        success: true,
        gasUsed: BigInt(0), // Actual gas used would come from trace_call
        returnValue: result,
        logs: [] // Actual logs would come from trace_call
      };
    } catch (error: any) {
      return {
        success: false,
        gasUsed: BigInt(0),
        returnValue: '0x',
        logs: [],
        error: error.message
      };
    }
  }

  private async estimatePriorityFee(): Promise<bigint> {
    const feeHistory = await (this.provider as any).send('eth_feeHistory', [
      4,
      'latest',
      [25, 50, 75]
    ]);

    const rewards = feeHistory.reward.map((block: string[]) => BigInt(block[1]));
    const medianPriorityFee = rewards.sort((a: bigint, b: bigint) => {
      return a < b ? -1 : a > b ? 1 : 0;
    })[Math.floor(rewards.length / 2)];

    return medianPriorityFee;
  }

  async enableMEVProtection() {
    // Implementation would integrate with Flashbots
    this.currentStrategy.flashbotsEnabled = true;
  }

  async optimizeGasPrice(baseGasPrice: bigint): Promise<bigint> {
    const networkCongestion = await this.getNetworkCongestion();
    let multiplier = 1.0;

    switch (networkCongestion) {
      case 'high':
        multiplier = 1.2;
        break;
      case 'medium':
        multiplier = 1.1;
        break;
      case 'low':
        multiplier = 1.0;
        break;
    }

    return BigInt(Math.floor(Number(baseGasPrice) * multiplier));
  }

  private async getNetworkCongestion(): Promise<'high' | 'medium' | 'low'> {
    const block = await this.provider.getBlock('latest');
    if (!block) return 'medium';

    const gasUsed = Number(block.gasUsed);
    const gasLimit = Number(block.gasLimit);
    const utilization = gasUsed / gasLimit;

    if (utilization > 0.8) return 'high';
    if (utilization > 0.5) return 'medium';
    return 'low';
  }
} 