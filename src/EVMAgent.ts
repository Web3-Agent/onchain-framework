import { ethers } from 'ethers';
import { EventEmitter } from 'events';
import { PriceChangeData, HealthFactorData } from './types';
import { OperationType } from './prompts/types';

type PriceChangeCallback = (data: PriceChangeData) => void;
type HealthFactorCallback = (data: HealthFactorData) => void;

export class EVMAgent extends EventEmitter {
  private provider: ethers.Provider;
  private wallet: ethers.Wallet;
  private priceMonitors: Map<string, NodeJS.Timeout>;
  private healthFactorMonitors: Map<string, NodeJS.Timeout>;

  constructor(provider: ethers.Provider, wallet: ethers.Wallet) {
    super();
    this.provider = provider;
    this.wallet = wallet;
    this.priceMonitors = new Map();
    this.healthFactorMonitors = new Map();
  }

  monitorPriceChange(token: string, callback: PriceChangeCallback) {
    if (this.priceMonitors.has(token)) {
      clearInterval(this.priceMonitors.get(token));
    }

    this.getTokenPrice(token).then(lastPrice => {
      const interval = setInterval(async () => {
        try {
          const currentPrice = await this.getTokenPrice(token);
          const priceChange = ((currentPrice - lastPrice) / lastPrice) * 100;
          
          callback({
            token,
            price: currentPrice,
            previousPrice: lastPrice,
            percentageChange: priceChange
          });
          
          lastPrice = currentPrice;
        } catch (error) {
          console.error(`Error monitoring price for ${token}:`, error);
        }
      }, 60000);
      
      this.priceMonitors.set(token, interval);
    });
  }

  monitorHealthFactor(protocol: string, callback: HealthFactorCallback) {
    if (this.healthFactorMonitors.has(protocol)) {
      clearInterval(this.healthFactorMonitors.get(protocol));
    }

    this.getHealthFactor(protocol).then(lastHealthFactor => {
      const interval = setInterval(async () => {
        try {
          const currentHealthFactor = await this.getHealthFactor(protocol);
          
          callback({
            protocol,
            healthFactor: currentHealthFactor,
            previousHealthFactor: lastHealthFactor
          });
          
          lastHealthFactor = currentHealthFactor;
        } catch (error) {
          console.error(`Error monitoring health factor for ${protocol}:`, error);
        }
      }, 60000);
      
      this.healthFactorMonitors.set(protocol, interval);
    });
  }

  stopPriceMonitoring(token: string) {
    const interval = this.priceMonitors.get(token);
    if (interval) {
      clearInterval(interval);
      this.priceMonitors.delete(token);
    }
  }

  stopHealthFactorMonitoring(protocol: string) {
    const interval = this.healthFactorMonitors.get(protocol);
    if (interval) {
      clearInterval(interval);
      this.healthFactorMonitors.delete(protocol);
    }
  }

  stopAllMonitoring() {
    this.priceMonitors.forEach(interval => clearInterval(interval));
    this.healthFactorMonitors.forEach(interval => clearInterval(interval));
    this.priceMonitors.clear();
    this.healthFactorMonitors.clear();
  }

  private async startPriceMonitoring(token: string, callback: PriceChangeCallback): Promise<NodeJS.Timeout> {
    let lastPrice = await this.getTokenPrice(token);
    return setInterval(async () => {
      try {
        const currentPrice = await this.getTokenPrice(token);
        const priceChange = ((currentPrice - lastPrice) / lastPrice) * 100;
        
        callback({
          token,
          price: currentPrice,
          previousPrice: lastPrice,
          percentageChange: priceChange
        });
        
        lastPrice = currentPrice;
      } catch (error) {
        console.error(`Error monitoring price for ${token}:`, error);
      }
    }, 60000); // Check every minute
  }

  private async startHealthFactorMonitoring(protocol: string, callback: HealthFactorCallback): Promise<NodeJS.Timeout> {
    let lastHealthFactor = await this.getHealthFactor(protocol);
    return setInterval(async () => {
      try {
        const currentHealthFactor = await this.getHealthFactor(protocol);
        
        callback({
          protocol,
          healthFactor: currentHealthFactor,
          previousHealthFactor: lastHealthFactor
        });
        
        lastHealthFactor = currentHealthFactor;
      } catch (error) {
        console.error(`Error monitoring health factor for ${protocol}:`, error);
      }
    }, 60000); // Check every minute
  }

  private async getTokenPrice(token: string): Promise<number> {
    // Implementation using Chainlink price feeds
    return 0; // Placeholder
  }

  private async getHealthFactor(protocol: string): Promise<number> {
    // Implementation using protocol-specific methods (e.g., Aave)
    return 0; // Placeholder
  }

  async executeTradeWithAI(params: {
    operation: OperationType;
    network: string;
    [key: string]: any;
  }) {
    switch (params.operation) {
      case 'swap':
        return this.executeSwap(params);
      case 'transfer':
        return this.executeTransfer(params);
      case 'wrap':
      case 'unwrap':
        return this.executeWrap(params);
      case 'approve':
        return this.executeApprove(params);
      case 'send':
        return this.executeSend(params);
      case 'lend':
        return this.executeLend(params);
      case 'borrow':
        return this.executeBorrow(params);
      case 'addLiquidity':
      case 'removeLiquidity':
        return this.executeLiquidity(params);
      default:
        throw new Error(`Unsupported operation: ${params.operation}`);
    }
  }

  private async executeSwap(params: any) {
    // Implement swap logic
    throw new Error('Not implemented');
  }

  private async executeTransfer(params: any) {
    // Implement transfer logic
    throw new Error('Not implemented');
  }

  private async executeWrap(params: any) {
    // Implement wrap/unwrap logic
    throw new Error('Not implemented');
  }

  private async executeApprove(params: any) {
    // Implement approval logic
    throw new Error('Not implemented');
  }

  private async executeSend(params: any) {
    // Implement send logic
    throw new Error('Not implemented');
  }

  private async executeLend(params: any) {
    // Implement lending logic
    throw new Error('Not implemented');
  }

  private async executeBorrow(params: any) {
    // Implement borrowing logic
    throw new Error('Not implemented');
  }

  private async executeLiquidity(params: any) {
    // Implement liquidity provision/removal logic
    throw new Error('Not implemented');
  }
} 