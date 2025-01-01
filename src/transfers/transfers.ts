import { ethers } from 'ethers';

// ERC20 ABI (minimal)
const ERC20_ABI = [
  'function transfer(address to, uint256 amount) external returns (bool)',
  'function balanceOf(address account) external view returns (uint256)',
  'function approve(address spender, uint256 amount) external returns (bool)'
];

export type TransferParams = {
  to: string;
  amount: string;
  tokenAddress?: string; // Optional for ERC20 transfers
};

export const transfer = async (params: TransferParams, wallet: ethers.Wallet) => {
  const { to, amount, tokenAddress } = params;

  try {
    let tx;
    if (tokenAddress) {
      // ERC20 transfer
      const token = new ethers.Contract(tokenAddress, ERC20_ABI, wallet);
      tx = await token.transfer(to, amount);
    } else {
      // Native ETH transfer
      tx = await wallet.sendTransaction({
        to,
        value: amount
      });
    }

    const receipt = await tx.wait();
    return receipt;
  } catch (error: any) {
    throw new Error(`Transfer failed: ${error.message}`);
  }
};

export const approve = async (
  spender: string,
  amount: string,
  tokenAddress: string,
  wallet: ethers.Wallet
) => {
  try {
    const token = new ethers.Contract(tokenAddress, ERC20_ABI, wallet);
    const tx = await token.approve(spender, amount);
    const receipt = await tx.wait();
    return receipt;
  } catch (error: any) {
    throw new Error(`Approval failed: ${error.message}`);
  }
}; 