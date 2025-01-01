import { EVMAgent } from '../src/EVMAgent.js';
import { ethers } from 'ethers';
import { jest } from '@jest/globals';

// Mock ethers
jest.mock('ethers', () => {
  return {
    JsonRpcProvider: function() {
      return {
        getNetwork: jest.fn().mockResolvedValue({ chainId: 1 })
      };
    },
    Wallet: function() {
      return {
        getAddress: jest.fn().mockResolvedValue('0x123'),
        sendTransaction: jest.fn().mockResolvedValue({
          wait: jest.fn().mockResolvedValue({ hash: '0x123' })
        })
      };
    },
    Contract: function() {
      return {
        transfer: jest.fn().mockResolvedValue({
          wait: jest.fn().mockResolvedValue({ hash: '0x123' })
        }),
        approve: jest.fn().mockResolvedValue({
          wait: jest.fn().mockResolvedValue({ hash: '0x123' })
        })
      };
    },
    ZeroAddress: '0x0000000000000000000000000000000000000000',
    parseUnits: function(value: string) { return BigInt(value); },
    parseEther: function(value: string) { return BigInt(value); }
  };
});

describe('Transfer Tests', () => {
  let agent: EVMAgent;

  beforeAll(async () => {
    agent = new EVMAgent();
    await agent.init('mainnet');
  });

  test('should transfer ETH', async () => {
    const amount = '100000000000000000'; // 0.1 ETH
    const to = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';

    const result = await agent.transfer({
      to,
      amount,
    });

    expect(result.hash).toBe('0x123');
  });

  test('should transfer ERC20 tokens', async () => {
    const amount = '10000000'; // 10 USDC (6 decimals)
    const to = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';
    const tokenAddress = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';

    const result = await agent.transfer({
      to,
      amount,
      tokenAddress,
    });

    expect(result.hash).toBe('0x123');
  });

  test('should approve ERC20 spending', async () => {
    const amount = '10000000'; // 10 USDC (6 decimals)
    const spender = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D';
    const tokenAddress = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';

    const result = await agent.approveToken(
      spender,
      amount,
      tokenAddress
    );

    expect(result.hash).toBe('0x123');
  });
}); 