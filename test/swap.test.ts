import { EVMAgent } from '../src/EVMAgent.js';
import { ethers } from 'ethers';

describe('Swap Tests', () => {
  let agent: EVMAgent;

  beforeAll(async () => {
    agent = new EVMAgent();
    await agent.init('mainnet');
  });

  test('should swap ETH for USDC', async () => {
    const amount = ethers.parseEther('0.1');
    const usdcAddress = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'; // USDC on mainnet

    const result = await agent.swap({
      tokenIn: ethers.ZeroAddress, // ETH
      tokenOut: usdcAddress,
      amountIn: amount.toString(),
      slippage: 0.5,
    });

    expect(result).toBeDefined();
    expect(result.hash).toBeDefined();
  });

  test('should swap USDC for ETH', async () => {
    const amount = ethers.parseUnits('100', 6); // 100 USDC
    const usdcAddress = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'; // USDC on mainnet

    // First approve USDC spending
    await agent.approveToken(
      agent.getUniswapRouterAddress(),
      amount.toString(),
      usdcAddress
    );

    const result = await agent.swap({
      tokenIn: usdcAddress,
      tokenOut: ethers.ZeroAddress, // ETH
      amountIn: amount.toString(),
      slippage: 0.5,
    });

    expect(result).toBeDefined();
    expect(result.hash).toBeDefined();
  });

  test('should swap USDC for DAI', async () => {
    const amount = ethers.parseUnits('100', 6); // 100 USDC
    const usdcAddress = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'; // USDC on mainnet
    const daiAddress = '0x6B175474E89094C44Da98b954EedeAC495271d0F'; // DAI on mainnet

    // First approve USDC spending
    await agent.approveToken(
      agent.getUniswapRouterAddress(),
      amount.toString(),
      usdcAddress
    );

    const result = await agent.swap({
      tokenIn: usdcAddress,
      tokenOut: daiAddress,
      amountIn: amount.toString(),
      slippage: 0.5,
    });

    expect(result).toBeDefined();
    expect(result.hash).toBeDefined();
  });
});
