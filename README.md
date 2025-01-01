# web3agent-aof

A powerful framework for building AI-powered blockchain agents that can understand and execute operations using natural language.

## Features

- Natural language processing for blockchain operations
- Multi-chain support (Ethereum, BSC, Mode, Optimism)
- AI-powered trade execution and optimization
- Price and health factor monitoring
- Automated DeFi operations

## Installation

```bash
npm install web3agent-aof
```

## Quick Start

```typescript
import { EVMAgent, PromptExecutor } from 'web3agent-aof';
import { ethers } from 'ethers';

// Initialize provider and wallet
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);

// Create agent
const agent = new EVMAgent(provider, wallet);

// Initialize prompt executor
const executor = new PromptExecutor(
  new Map([['bsc', agent]]), 
  process.env.OPENAI_API_KEY!
);

// Execute operations using natural language
await executor.execute(
  "Swap 1 USDC to BNB with 0.5% slippage on BSC using PancakeSwap"
);
```

## Supported Operations

### Basic Operations
```typescript
// Transfers
"Transfer 0.1 BNB to 0x742d35Cc6634C0532925a3b844Bc454e4438f44e on BSC"
"Send 50 USDC to 0x123... on Mode network"
"Bridge 0.01 CCIP-BnM to MODE TESTNET"

// Token Swaps
"Swap 1 USDC to BNB with 0.5% slippage on BSC using PancakeSwap"
"Swap 100 USDC for ETH on Mode network using Uniswap V3"
"Trade 5000 BUSD for BNB with max 1% slippage on BSC"

// Wrap/Unwrap
"Wrap 1 BNB to WBNB on BSC"
"Unwrap 0.5 WBNB to BNB on BSC"
"Convert 2 ETH to WETH on Mode"

// Approvals
"Approve 100 USDC for PancakeSwap on BSC"
"Allow Venus protocol to spend 1000 BUSD on BSC"
"Grant unlimited USDC approval to Uniswap on Mode"
```

### DeFi Operations
```typescript
// Lending
"Lend 100 USDC on Venus protocol on BSC network"
"Supply 1000 BUSD to Venus with 3% minimum APY"
"Deposit 50 USDC to Aave on Mode network"

// Borrowing
"Borrow 50 BUSD using 200 USDC as collateral on Venus protocol on BSC"
"Take a loan of 1000 USDC using 2 ETH as collateral on Aave"
"Borrow 500 DAI against my WBTC on Mode"

// Liquidity Provision
"Add liquidity with 1 BNB and 100 USDC to PancakeSwap on BSC"
"Remove liquidity of 0.5 BNB and 50 USDC from PancakeSwap on BSC"
"Provide 2000 USDC and 1 ETH liquidity to Uniswap V3"

// Yield Farming
"Stake LP tokens in PancakeSwap farm on BSC"
"Harvest rewards from Venus protocol"
"Compound yields from my lending positions"
```

### Advanced Operations
```typescript
// Multi-Step Operations
"Swap 1000 USDC to BNB and add liquidity to PancakeSwap"
"Borrow 500 BUSD against USDC and swap to BNB"
"Withdraw liquidity from Uniswap and stake in farm"

// Price Monitoring
"Monitor BNB price and alert when above $300"
"Track USDC/BNB price changes every hour"
"Watch ETH price on Mode network"

// Health Factor Monitoring
"Monitor my Venus health factor and alert below 1.5"
"Track Aave position health on Mode"
"Alert when collateral ratio drops below 150%"
```

## Configuration

Create a `.env` file with the following:

```env
# RPC URLs
RPC_URL=your_rpc_url

# Wallet
PRIVATE_KEY=your_private_key

# OpenAI API Key (Required for AI features)
OPENAI_API_KEY=your_openai_api_key

# Optional Protocol Settings
DEFAULT_SLIPPAGE=0.5
GAS_MULTIPLIER=1.1
```

## Examples

Check out the [examples](./examples) directory for complete working examples:

- [Prompt Operations](./examples/prompt-operations): Natural language operations
- [DeFi Monitor](./examples/defi-monitor): Price and health factor monitoring
- [Swap Bot](./examples/swap-bot): Automated token swapping

## Advanced Usage

### Custom Operation Handlers
```typescript
const agent = new EVMAgent(provider, wallet);

// Add custom operation handler
agent.on('priceChange', (data) => {
  if (data.percentageChange > 5) {
    console.log(`${data.token} price increased by ${data.percentageChange}%`);
  }
});

// Monitor multiple tokens
agent.monitorPriceChange('BNB', callback);
agent.monitorPriceChange('USDC', callback);
```

### Health Factor Monitoring
```typescript
// Monitor DeFi positions
agent.monitorHealthFactor('venus', (data) => {
  if (data.healthFactor < 1.5) {
    console.log('Warning: Low health factor on Venus!');
  }
});
```

### Multi-Chain Operations
```typescript
const agents = new Map([
  ['bsc', new EVMAgent(bscProvider, wallet)],
  ['mode', new EVMAgent(modeProvider, wallet)],
  ['ethereum', new EVMAgent(ethProvider, wallet)]
]);

const executor = new PromptExecutor(agents, process.env.OPENAI_API_KEY!);

// Execute cross-chain operations
await executor.execute("Bridge 0.01 CCIP-BnM from BSC to Mode Testnet");
```

## License

MIT
