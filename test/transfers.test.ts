import { jest } from '@jest/globals';
import { ethers } from 'ethers';
import { EVMAgent } from '../src/EVMAgent';

describe('EVMAgent', () => {
  let agent: EVMAgent;
  let mockProvider: jest.Mocked<ethers.Provider>;
  let mockWallet: jest.Mocked<ethers.Wallet>;

  beforeEach(() => {
    mockProvider = {
      getNetwork: jest.fn().mockResolvedValue({ chainId: 1 }),
    } as any;

    mockWallet = {
      provider: mockProvider,
      getAddress: jest.fn().mockResolvedValue('0x123'),
      sendTransaction: jest.fn().mockResolvedValue({
        wait: jest.fn().mockResolvedValue({ hash: '0x123' })
      }),
      connect: jest.fn().mockReturnThis(),
    } as any;

    agent = new EVMAgent(mockProvider, mockWallet);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('price monitoring', () => {
    it('should monitor price changes', async () => {
      const callback = jest.fn();
      agent.monitorPriceChange('ETH', callback);

      // Wait for initial price check
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(callback).toHaveBeenCalled();
    });
  });

  describe('health factor monitoring', () => {
    it('should monitor health factor changes', async () => {
      const callback = jest.fn();
      agent.monitorHealthFactor('Aave', callback);

      // Wait for initial health factor check
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(callback).toHaveBeenCalled();
    });
  });
}); 