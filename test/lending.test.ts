import { EVMAgent } from '../src/EVMAgent.js';
import { ethers } from 'ethers';

describe('Lending Tests', () => {
  let agent: EVMAgent;

  beforeAll(async () => {
    agent = new EVMAgent();
    await agent.init('mainnet');
  });

  test('should borrow USDC', async () => {
    const amount = ethers.parseUnits('100', 6); // 100 USDC
    const usdcAddress = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'; // USDC on mainnet

    const result = await agent.borrow({
      asset: usdcAddress,
      amount: amount.toString(),
      interestRateMode: 2, // variable rate
    });

    expect(result).toBeDefined();
    expect(result.hash).toBeDefined();
  });

  test('should borrow ETH', async () => {
    const amount = ethers.parseEther('0.1'); // 0.1 ETH
    const wethAddress = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'; // WETH on mainnet

    const result = await agent.borrow({
      asset: wethAddress,
      amount: amount.toString(),
      interestRateMode: 2, // variable rate
    });

    expect(result).toBeDefined();
    expect(result.hash).toBeDefined();
  });

  test('should fail to borrow with insufficient collateral', async () => {
    const amount = ethers.parseUnits('1000000', 6); // 1M USDC
    const usdcAddress = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'; // USDC on mainnet

    await expect(
      agent.borrow({
        asset: usdcAddress,
        amount: amount.toString(),
        interestRateMode: 2, // variable rate
      })
    ).rejects.toThrow('Health factor too low to borrow');
  });
}); 