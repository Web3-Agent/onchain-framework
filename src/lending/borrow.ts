import { ethers } from 'ethers';

// Aave V3 Pool ABI (minimal)
const AAVE_V3_POOL_ABI = [
  'function borrow(address asset, uint256 amount, uint256 interestRateMode, uint16 referralCode, address onBehalfOf) external',
  'function supply(address asset, uint256 amount, address onBehalfOf, uint16 referralCode) external',
  'function getUserAccountData(address user) external view returns (uint256 totalCollateralBase, uint256 totalDebtBase, uint256 availableBorrowsBase, uint256 currentLiquidationThreshold, uint256 ltv, uint256 healthFactor)'
];

export type BorrowParams = {
  asset: string;
  amount: string;
  poolAddress: string;
  interestRateMode?: number; // 1 for stable, 2 for variable
};

export const borrow = async (params: BorrowParams, wallet: ethers.Wallet) => {
  const {
    asset,
    amount,
    poolAddress,
    interestRateMode = 2 // Default to variable rate
  } = params;

  const pool = new ethers.Contract(
    poolAddress,
    AAVE_V3_POOL_ABI,
    wallet
  );

  const userAddress = await wallet.getAddress();

  try {
    // Check user's borrowing capacity
    const {
      availableBorrowsBase,
      healthFactor
    } = await pool.getUserAccountData(userAddress);

    if (healthFactor.lt(ethers.parseUnits('1.5', 18))) {
      throw new Error('Health factor too low to borrow');
    }

    const tx = await pool.borrow(
      asset,
      amount,
      interestRateMode,
      0, // referralCode
      userAddress // onBehalfOf
    );

    const receipt = await tx.wait();
    return receipt;
  } catch (error: any) {
    throw new Error(`Borrow failed: ${error.message}`);
  }
}; 