import { ethers } from 'ethers';

export type TokenInfo = {
  address: string;
  symbol: string;
  decimals: number;
  name: string;
};

export type PoolInfo = {
  address: string;
  token0: TokenInfo;
  token1: TokenInfo;
  fee: number;
  liquidity: bigint;
};

export type LendingMarketInfo = {
  poolAddress: string;
  asset: TokenInfo;
  totalSupply: bigint;
  totalBorrow: bigint;
  supplyApy: number;
  borrowApy: number;
  utilizationRate: number;
};

export type UserPosition = {
  supplied: bigint;
  borrowed: bigint;
  healthFactor: number;
  collateralRatio: number;
};

export type PriceData = {
  token: TokenInfo;
  price: number;
  timestamp: number;
  source: string;
}; 