import { ethers } from 'ethers';

// Uniswap V2 Router ABI (minimal)
const UNISWAP_V2_ROUTER_ABI = [
  'function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)',
  'function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)',
  'function swapExactTokensForETH(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)'
];

export type SwapParams = {
  tokenIn: string;
  tokenOut: string;
  amountIn: string;
  slippage: number;
  routerAddress: string;
};

export const swap = async (params: SwapParams, wallet: ethers.Wallet) => {
  const {
    tokenIn,
    tokenOut,
    amountIn,
    slippage,
    routerAddress
  } = params;

  const router = new ethers.Contract(
    routerAddress,
    UNISWAP_V2_ROUTER_ABI,
    wallet
  );

  const WETH = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'; // Mainnet WETH
  const path = [tokenIn, tokenOut];
  const to = await wallet.getAddress();
  const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes from now

  try {
    let tx;
    if (tokenIn === ethers.ZeroAddress) {
      // Swap ETH for Token
      tx = await router.swapExactETHForTokens(
        0, // amountOutMin (TODO: Add price impact protection)
        [WETH, tokenOut],
        to,
        deadline,
        { value: amountIn }
      );
    } else if (tokenOut === ethers.ZeroAddress) {
      // Swap Token for ETH
      tx = await router.swapExactTokensForETH(
        amountIn,
        0, // amountOutMin (TODO: Add price impact protection)
        [tokenIn, WETH],
        to,
        deadline
      );
    } else {
      // Swap Token for Token
      tx = await router.swapExactTokensForTokens(
        amountIn,
        0, // amountOutMin (TODO: Add price impact protection)
        path,
        to,
        deadline
      );
    }

    const receipt = await tx.wait();
    return receipt;
  } catch (error: any) {
    throw new Error(`Swap failed: ${error.message}`);
  }
}; 