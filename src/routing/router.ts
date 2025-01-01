import { ethers } from 'ethers';
import {
  RoutingParams,
  RouteQuote,
  SplitRoute,
  RoutingResult,
  DexProtocol
} from './types';

// Protocol-specific ABIs
const UNISWAP_QUOTER_ABI = [
  'function quoteExactInputSingle(address tokenIn, address tokenOut, uint24 fee, uint256 amountIn, uint160 sqrtPriceLimitX96) external returns (uint256 amountOut)',
  'function getPool(address tokenA, address tokenB, uint24 fee) external view returns (address pool)'
];

const INCH_QUOTER_ABI = [
  'function getRate(address fromToken, address toToken, uint256 amount) external view returns (uint256)'
];

export class SmartOrderRouter {
  private provider: ethers.Provider;
  private wallet: ethers.Wallet;
  private quoterContracts: Map<DexProtocol, string>;

  constructor(provider: ethers.Provider, wallet: ethers.Wallet) {
    this.provider = provider;
    this.wallet = wallet;
    this.quoterContracts = new Map([
      ['Uniswap', '0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6'],
      ['1inch', '0x1111111254fb6c44bAC0beD2854e76F90643097d'],
      // Add other quoter contracts
    ]);
  }

  async findBestRoute(params: RoutingParams): Promise<RoutingResult> {
    // Get quotes from all specified protocols
    const quotes = await Promise.all(
      params.protocols.map(protocol => this.getQuote(protocol, params))
    );

    // Find the best single route
    const bestSingleRoute = quotes.reduce((best, current) => {
      return this.compareRoutes(best, current) > 0 ? best : current;
    });

    // If maxSplits is specified, try to find better split routes
    let bestSplitRoute: SplitRoute | undefined;
    if (params.maxSplits && params.maxSplits > 1) {
      bestSplitRoute = await this.findBestSplitRoute(params);
    }

    const usesSplit = bestSplitRoute && this.isSplitRouteBetter(bestSplitRoute, bestSingleRoute);
    const expectedAmountOut = usesSplit ? bestSplitRoute!.totalAmountOut : bestSingleRoute.amountOut;
    const priceImpact = usesSplit ? bestSplitRoute!.averagePriceImpact : bestSingleRoute.priceImpact;
    const estimatedGasUsed = usesSplit ? bestSplitRoute!.totalGasEstimate : bestSingleRoute.gasEstimate;

    // Calculate minimum amount out based on slippage
    const minAmountOut = this.calculateMinAmountOut(expectedAmountOut, params.maxSlippage);

    return {
      bestSingleRoute,
      bestSplitRoute,
      expectedAmountOut,
      minAmountOut,
      estimatedGasUsed,
      priceImpact
    };
  }

  async splitOrder(params: RoutingParams & { maxSplits: number }): Promise<SplitRoute> {
    return await this.findBestSplitRoute(params);
  }

  private async getQuote(protocol: DexProtocol, params: RoutingParams): Promise<RouteQuote> {
    switch (protocol) {
      case 'Uniswap':
        return await this.getUniswapQuote(params);
      case '1inch':
        return await this.get1inchQuote(params);
      case 'Paraswap':
        return await this.getParaswapQuote(params);
      default:
        throw new Error(`Unsupported protocol: ${protocol}`);
    }
  }

  private async getUniswapQuote(params: RoutingParams): Promise<RouteQuote> {
    const quoterContract = await this.getQuoterContract('Uniswap');
    const amountOut = await quoterContract.quoteExactInputSingle(
      params.tokenIn,
      params.tokenOut,
      3000, // 0.3% fee tier
      params.amount,
      0 // No price limit
    );

    return {
      protocol: 'Uniswap',
      amountOut: amountOut.toString(),
      priceImpact: await this.calculatePriceImpact(params, amountOut),
      path: [params.tokenIn, params.tokenOut],
      gasEstimate: BigInt(180000) // Approximate gas used for Uniswap swap
    };
  }

  private async get1inchQuote(params: RoutingParams): Promise<RouteQuote> {
    const quoterContract = await this.getQuoterContract('1inch');
    const amountOut = await quoterContract.getRate(
      params.tokenIn,
      params.tokenOut,
      params.amount
    );

    return {
      protocol: '1inch',
      amountOut: amountOut.toString(),
      priceImpact: await this.calculatePriceImpact(params, amountOut),
      path: [params.tokenIn, params.tokenOut], // 1inch might use more complex paths internally
      gasEstimate: BigInt(200000) // Approximate gas used for 1inch swap
    };
  }

  private async getParaswapQuote(params: RoutingParams): Promise<RouteQuote> {
    // Implementation for Paraswap quote
    throw new Error('Paraswap integration not implemented yet');
  }

  private async findBestSplitRoute(params: RoutingParams): Promise<SplitRoute> {
    const maxSplits = params.maxSplits || 4;
    const totalAmount = BigInt(params.amount);
    
    // Try different split ratios
    const splitRatios = this.generateSplitRatios(maxSplits);
    const splitRoutes = await Promise.all(
      splitRatios.map(async ratios => {
        const routes = await Promise.all(
          ratios.map(async (ratio, index) => {
            const splitAmount = (totalAmount * BigInt(Math.floor(ratio * 100))) / BigInt(100);
            return await this.getQuote(params.protocols[index], {
              ...params,
              amount: splitAmount.toString()
            });
          })
        );

        const totalAmountOut = routes.reduce(
          (sum, route) => sum + BigInt(route.amountOut),
          BigInt(0)
        );

        const averagePriceImpact = routes.reduce(
          (sum, route) => sum + route.priceImpact,
          0
        ) / routes.length;

        const totalGasEstimate = routes.reduce(
          (sum, route) => sum + route.gasEstimate,
          BigInt(0)
        );

        return {
          routes,
          totalAmountOut: totalAmountOut.toString(),
          averagePriceImpact,
          totalGasEstimate
        };
      })
    );

    // Find the best split route
    return splitRoutes.reduce((best, current) => {
      return this.compareSplitRoutes(best, current) > 0 ? best : current;
    });
  }

  private async getQuoterContract(protocol: DexProtocol): Promise<ethers.Contract> {
    const address = this.quoterContracts.get(protocol);
    if (!address) {
      throw new Error(`Quoter contract not found for protocol: ${protocol}`);
    }

    const abi = protocol === 'Uniswap' ? UNISWAP_QUOTER_ABI : INCH_QUOTER_ABI;
    return new ethers.Contract(address, abi, this.provider);
  }

  private async calculatePriceImpact(
    params: RoutingParams,
    amountOut: bigint
  ): Promise<number> {
    // Implementation of price impact calculation
    return 0; // Placeholder
  }

  private calculateMinAmountOut(amountOut: string, slippage: number): string {
    const amount = BigInt(amountOut);
    const slippageFactor = 1 - slippage;
    return ((amount * BigInt(Math.floor(slippageFactor * 10000))) / BigInt(10000)).toString();
  }

  private compareRoutes(a: RouteQuote, b: RouteQuote): number {
    const aAmount = BigInt(a.amountOut);
    const bAmount = BigInt(b.amountOut);
    if (aAmount !== bAmount) return aAmount > bAmount ? 1 : -1;
    
    // If amounts are equal, compare gas costs
    return a.gasEstimate < b.gasEstimate ? 1 : -1;
  }

  private compareSplitRoutes(a: SplitRoute, b: SplitRoute): number {
    const aAmount = BigInt(a.totalAmountOut);
    const bAmount = BigInt(b.totalAmountOut);
    if (aAmount !== bAmount) return aAmount > bAmount ? 1 : -1;
    
    // If amounts are equal, compare gas costs
    return a.totalGasEstimate < b.totalGasEstimate ? 1 : -1;
  }

  private isSplitRouteBetter(split: SplitRoute, single: RouteQuote): boolean {
    const splitAmount = BigInt(split.totalAmountOut);
    const singleAmount = BigInt(single.amountOut);
    const amountDiff = splitAmount - singleAmount;
    
    // Calculate the gas cost difference in terms of output token
    const gasDiff = split.totalGasEstimate - single.gasEstimate;
    const gasPrice = BigInt(50000000000); // 50 Gwei
    const gasCostDiff = gasDiff * gasPrice;

    // Split route is better if the amount improvement outweighs the gas cost
    return amountDiff > gasCostDiff;
  }

  private generateSplitRatios(maxSplits: number): number[][] {
    const ratios: number[][] = [];
    
    // Generate different split ratios
    if (maxSplits >= 2) {
      ratios.push([0.5, 0.5]);
    }
    if (maxSplits >= 3) {
      ratios.push([0.4, 0.3, 0.3]);
    }
    if (maxSplits >= 4) {
      ratios.push([0.25, 0.25, 0.25, 0.25]);
    }

    return ratios;
  }
} 