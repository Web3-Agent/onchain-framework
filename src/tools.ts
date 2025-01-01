import { DynamicTool } from '@langchain/core/tools';
import { z } from 'zod';
import { ethers } from 'ethers';

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);

export const getTools = () => {
  return [
    new DynamicTool({
      name: 'get_eth_price',
      description: 'Get the current ETH price in USD',
      func: async () => {
        try {
          // Using ETH/USD price feed from Chainlink on Ethereum mainnet
          const aggregatorV3InterfaceABI = [
            'function latestRoundData() external view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)'
          ];
          const addr = '0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419';
          const priceFeed = new ethers.Contract(addr, aggregatorV3InterfaceABI, provider);
          const roundData = await priceFeed.latestRoundData();
          const price = roundData.answer.toString() / 1e8;
          return `The current ETH price is $${price}`;
        } catch (error: any) {
          return `Error getting ETH price: ${error.message}`;
        }
      },
    }),
    new DynamicTool({
      name: 'get_eth_balance',
      description: 'Get the ETH balance of an address',
      func: async (input: string) => {
        try {
          const balance = await provider.getBalance(input);
          return `Balance: ${ethers.formatEther(balance)} ETH`;
        } catch (error: any) {
          return `Error getting balance: ${error.message}`;
        }
      },
    }),
  ];
};
