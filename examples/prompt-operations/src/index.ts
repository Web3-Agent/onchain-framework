import { ethers } from 'ethers';
import { EVMAgent, PromptExecutor } from 'web3agent-aof';
import dotenv from 'dotenv';

dotenv.config();

async function main() {
  // Initialize provider and wallet
  const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);

  // Create agent for each supported network
  const agents = new Map();
  agents.set('bsc', new EVMAgent(provider, wallet));
  agents.set('mode', new EVMAgent(provider, wallet));

  // Initialize prompt executor
  const executor = new PromptExecutor(agents, process.env.OPENAI_API_KEY!);

  // Example operations
  const operations = [
    // Swap operation
    "Swap 1 USDC to BNB with 0.5% slippage on BSC using PancakeSwap",
    
    // Transfer operation
    "Transfer 0.1 BNB to 0x742d35Cc6634C0532925a3b844Bc454e4438f44e on BSC",
    
    // Lending operation
    "Lend 100 USDC on Venus protocol on BSC network",
    
    // Borrowing operation
    "Borrow 50 BUSD using 200 USDC as collateral on Venus protocol on BSC",
    
    // Liquidity operations
    "Add liquidity with 1 BNB and 100 USDC to PancakeSwap on BSC",
    "Remove liquidity of 0.5 BNB and 50 USDC from PancakeSwap on BSC",
    
    // Wrap/Unwrap operations
    "Wrap 1 BNB to WBNB on BSC",
    "Unwrap 0.5 WBNB to BNB on BSC"
  ];

  // Execute each operation
  for (const operation of operations) {
    try {
      console.log(`\nExecuting: ${operation}`);
      const result = await executor.execute(operation);
      console.log('Result:', result);
    } catch (error) {
      console.error('Error:', error.message);
    }
  }
}

main().catch(console.error); 