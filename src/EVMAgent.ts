import { ethers } from 'ethers';
import { EventEmitter } from 'events';
import { PriceChangeData, HealthFactorData } from './types';

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
} 