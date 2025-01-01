import { ethers } from 'ethers';
import { createAgent } from './agent.js';
import { swap, type SwapParams } from './dex/swap.js';
import { addLiquidity, type AddLiquidityParams } from './dex/addLiquidity.js';
import { borrow, type BorrowParams } from './lending/borrow.js';
import { transfer, type TransferParams, approve } from './transfers/transfers.js';
import { setupWallet, type NetworkConfig } from './utils/setup.js';
import { EventEmitter } from 'events';

type PriceCallback = (price: number, percentChange: number) => Promise<void>;
type HealthFactorCallback = (healthFactor: number) => Promise<void>;

export class EVMAgent extends EventEmitter {
  private wallet!: ethers.Wallet;
  private provider!: ethers.Provider;
  private network!: NetworkConfig;
  private agent: any;
  private priceMonitors: Map<string, NodeJS.Timer> = new Map();
  private healthFactorMonitors: Map<string, NodeJS.Timer> = new Map();

  constructor() {
    super();
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not set');
    }

    if (!process.env.EVM_PRIVATE_KEY) {
      throw new Error('EVM_PRIVATE_KEY is not set');
    }

    if (!process.env.RPC_URL) {
      throw new Error('RPC_URL is not set');
    }
  }

  async init(network: string = 'mainnet') {
    const setup = await setupWallet(network);
    this.wallet = setup.wallet;
    this.provider = setup.provider;
    this.network = setup.network;
    this.agent = await createAgent();
  }

  getUniswapRouterAddress(): string {
    return this.network.contracts.uniswapV2Router;
  }

  getAavePoolAddress(): string {
    return this.network.contracts.aaveV3Pool;
  }

  async execute(input: string) {
    if (!this.agent) {
      throw new Error('Agent not initialized. Call init() first.');
    }
    const response = await this.agent.invoke({
      input,
    });
    return response;
  }

  async swap(params: Omit<SwapParams, 'routerAddress'>) {
    return await swap(
      {
        ...params,
        routerAddress: this.getUniswapRouterAddress()
      },
      this.wallet
    );
  }

  async addLiquidity(params: Omit<AddLiquidityParams, 'routerAddress'>) {
    return await addLiquidity(
      {
        ...params,
        routerAddress: this.getUniswapRouterAddress()
      },
      this.wallet
    );
  }

  async borrow(params: Omit<BorrowParams, 'poolAddress'>) {
    return await borrow(
      {
        ...params,
        poolAddress: this.getAavePoolAddress()
      },
      this.wallet
    );
  }

  async transfer(params: TransferParams) {
    return await transfer(params, this.wallet);
  }

  async approveToken(spender: string, amount: string, tokenAddress: string) {
    return await approve(spender, amount, tokenAddress, this.wallet);
  }

  // New AI-powered features
  onPriceChange(token: string, callback: PriceCallback) {
    if (this.priceMonitors.has(token)) {
      throw new Error(`Already monitoring price for ${token}`);
    }

    let lastPrice: number | null = null;
    const interval = setInterval(async () => {
      try {
        const price = await this.getTokenPrice(token);
        if (lastPrice !== null) {
          const percentChange = ((price - lastPrice) / lastPrice) * 100;
          await callback(price, percentChange);
        }
        lastPrice = price;
      } catch (error) {
        console.error(`Error monitoring price for ${token}:`, error);
      }
    }, 60000); // Check every minute

    this.priceMonitors.set(token, interval);
  }

  monitorHealthFactor(protocol: string, callback: HealthFactorCallback) {
    if (this.healthFactorMonitors.has(protocol)) {
      throw new Error(`Already monitoring health factor for ${protocol}`);
    }

    const interval = setInterval(async () => {
      try {
        const healthFactor = await this.getHealthFactor(protocol);
        await callback(healthFactor);
      } catch (error) {
        console.error(`Error monitoring health factor for ${protocol}:`, error);
      }
    }, 300000); // Check every 5 minutes

    this.healthFactorMonitors.set(protocol, interval);
  }

  private async getTokenPrice(token: string): Promise<number> {
    // Implementation using Chainlink price feeds
    const aggregatorV3InterfaceABI = [
      'function latestRoundData() external view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)'
    ];
    
    // Get price feed address for the token
    const priceFeedAddress = this.getPriceFeedAddress(token);
    const priceFeed = new ethers.Contract(priceFeedAddress, aggregatorV3InterfaceABI, this.provider);
    const roundData = await priceFeed.latestRoundData();
    return Number(roundData.answer) / 1e8;
  }

  private async getHealthFactor(protocol: string): Promise<number> {
    if (protocol.toLowerCase() === 'aave') {
      const pool = new ethers.Contract(
        this.getAavePoolAddress(),
        [
          'function getUserAccountData(address user) external view returns (uint256 totalCollateralBase, uint256 totalDebtBase, uint256 availableBorrowsBase, uint256 currentLiquidationThreshold, uint256 ltv, uint256 healthFactor)'
        ],
        this.provider
      );

      const userAddress = await this.wallet.getAddress();
      const { healthFactor } = await pool.getUserAccountData(userAddress);
      return Number(healthFactor) / 1e18;
    }
    throw new Error(`Protocol ${protocol} not supported`);
  }

  private getPriceFeedAddress(token: string): string {
    // Mainnet Chainlink Price Feed addresses
    const priceFeedAddresses: { [key: string]: string } = {
      'ETH': '0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419',
      'BTC': '0xF4030086522a5bEEa4988F8cA5B36dbC97BeE88c',
      'USDC': '0x8fFfFfd4AfB6115b954Bd326cbe7B4BA576818f6',
      // Add more tokens as needed
    };

    const address = priceFeedAddresses[token.toUpperCase()];
    if (!address) {
      throw new Error(`Price feed not found for token ${token}`);
    }
    return address;
  }

  // Cleanup method
  cleanup() {
    for (const interval of this.priceMonitors.values()) {
      clearInterval(interval);
    }
    for (const interval of this.healthFactorMonitors.values()) {
      clearInterval(interval);
    }
    this.priceMonitors.clear();
    this.healthFactorMonitors.clear();
  }
} 