import { ethers } from 'ethers';

export type NetworkConfig = {
  chainId: number;
  name: string;
  rpcUrl: string;
  explorerUrl: string;
  contracts: {
    uniswapV2Router: string;
    aaveV3Pool: string;
  };
};

export const NETWORKS: { [key: string]: NetworkConfig } = {
  mainnet: {
    chainId: 1,
    name: 'Ethereum Mainnet',
    rpcUrl: process.env.RPC_URL || 'https://eth-mainnet.g.alchemy.com/v2/your-api-key',
    explorerUrl: 'https://etherscan.io',
    contracts: {
      uniswapV2Router: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
      aaveV3Pool: '0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2'
    }
  }
};

export const setupWallet = async (network: string = 'mainnet') => {
  const config = NETWORKS[network];
  if (!config) {
    throw new Error(`Network ${network} not supported`);
  }

  if (!process.env.EVM_PRIVATE_KEY) {
    throw new Error('EVM_PRIVATE_KEY is not set');
  }

  // Use a mock provider in test environment
  const provider = process.env.NODE_ENV === 'test'
    ? new ethers.JsonRpcProvider('http://localhost:8545')
    : new ethers.JsonRpcProvider(config.rpcUrl);

  const wallet = new ethers.Wallet(process.env.EVM_PRIVATE_KEY, provider);

  return {
    wallet,
    provider,
    network: config
  };
};

export const getExplorerUrl = (txHash: string, network: string = 'mainnet') => {
  const config = NETWORKS[network];
  if (!config) {
    throw new Error(`Network ${network} not supported`);
  }

  return `${config.explorerUrl}/tx/${txHash}`;
}; 