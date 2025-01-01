import { ethers } from 'ethers';

// Uniswap V2 Router ABI (minimal)
const UNISWAP_V2_ROUTER_ABI = [
  'function addLiquidity(address tokenA, address tokenB, uint amountADesired, uint amountBDesired, uint amountAMin, uint amountBMin, address to, uint deadline) external returns (uint amountA, uint amountB, uint liquidity)',
  'function addLiquidityETH(address token, uint amountTokenDesired, uint amountTokenMin, uint amountETHMin, address to, uint deadline) external payable returns (uint amountToken, uint amountETH, uint liquidity)'
];

export type AddLiquidityParams = {
  tokenA: string;
  tokenB: string;
  amountA: string;
  amountB: string;
  slippage: number;
  routerAddress: string;
};

export const addLiquidity = async (params: AddLiquidityParams, wallet: ethers.Wallet) => {
  const {
    tokenA,
    tokenB,
    amountA,
    amountB,
    slippage,
    routerAddress
  } = params;

  const router = new ethers.Contract(
    routerAddress,
    UNISWAP_V2_ROUTER_ABI,
    wallet
  );

  const to = await wallet.getAddress();
  const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes from now

  // Calculate minimum amounts based on slippage
  const amountABigInt = ethers.parseUnits(amountA, 18);
  const amountBBigInt = ethers.parseUnits(amountB, 18);
  const slippageFactor = BigInt(Math.floor((1 - slippage) * 1000));
  const amountAMin = (amountABigInt * slippageFactor) / 1000n;
  const amountBMin = (amountBBigInt * slippageFactor) / 1000n;

  try {
    let tx;
    if (tokenA === ethers.ZeroAddress || tokenB === ethers.ZeroAddress) {
      // Add liquidity ETH
      const token = tokenA === ethers.ZeroAddress ? tokenB : tokenA;
      const tokenAmount = tokenA === ethers.ZeroAddress ? amountB : amountA;
      const ethAmount = tokenA === ethers.ZeroAddress ? amountA : amountB;

      tx = await router.addLiquidityETH(
        token,
        tokenAmount,
        0, // amountTokenMin
        0, // amountETHMin
        to,
        deadline,
        { value: ethAmount }
      );
    } else {
      // Add liquidity tokens
      tx = await router.addLiquidity(
        tokenA,
        tokenB,
        amountA,
        amountB,
        amountAMin,
        amountBMin,
        to,
        deadline
      );
    }

    const receipt = await tx.wait();
    return receipt;
  } catch (error: any) {
    throw new Error(`Add liquidity failed: ${error.message}`);
  }
}; 