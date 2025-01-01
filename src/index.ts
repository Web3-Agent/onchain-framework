import { ethers } from 'ethers';
import { EVMAgent } from './EVMAgent';

export async function createAgent(rpcUrl: string, privateKey: string) {
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);
  return new EVMAgent(provider, wallet);
}

export { EVMAgent } from './EVMAgent';
export * from './types';
export * from './bridge/types';
export * from './gas/types';
export * from './portfolio/types';
export * from './routing/types';
