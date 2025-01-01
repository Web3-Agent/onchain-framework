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
      connect: jest.fn().mockReturnThis(),
    } as any;

    agent = new EVMAgent(mockProvider, mockWallet);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('health factor monitoring', () => {
    it('should monitor health factor changes', async () => {
      const callback = jest.fn();
      agent.monitorHealthFactor('Aave', callback);

      // Wait for initial health factor check
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(callback).toHaveBeenCalled();
    });

    it('should stop monitoring when requested', async () => {
      const callback = jest.fn();
      agent.monitorHealthFactor('Aave', callback);

      // Wait for initial health factor check
      await new Promise(resolve => setTimeout(resolve, 100));

      agent.stopHealthFactorMonitoring('Aave');

      // Wait to ensure no more callbacks
      await new Promise(resolve => setTimeout(resolve, 100));

      const callCount = callback.mock.calls.length;
      await new Promise(resolve => setTimeout(resolve, 100));
      expect(callback.mock.calls.length).toBe(callCount);
    });
  });
}); 