# AI Agent Onchain Framework

A comprehensive framework for building AI-powered agents that can interact with blockchain networks. This framework combines the power of AI with onchain operations to create intelligent agents that can:

- Execute complex DeFi strategies autonomously
- Perform natural language interactions with blockchain protocols
- Make data-driven decisions using onchain and market data
- Automate trading and portfolio management
- Monitor and respond to onchain events

## Core Capabilities

### DeFi Operations
- Swapping tokens on DEXs (Uniswap V2)
- Adding/removing liquidity from pools
- Borrowing and lending on Aave V3
- Token transfers and approvals
- Smart contract interactions

### AI Integration
- Natural language processing for commands
- Market sentiment analysis
- Price prediction and trend analysis
- Risk assessment and portfolio optimization
- Automated strategy execution

### Protocol Support
- Uniswap V2/V3
- Aave V3
- Chainlink Price Feeds
- Custom smart contract integration
- Multi-chain support (coming soon)

## Installation

```bash
npm install
```

## Configuration

Create a `.env` file in the root directory with the following variables:

```env
OPENAI_API_KEY="your-openai-api-key"
EVM_PRIVATE_KEY="your-private-key"
RPC_URL="your-rpc-url"
```

## Usage

### Basic Operations

```typescript
import { EVMAgent } from './src/EVMAgent';

const agent = new EVMAgent();
await agent.init('mainnet');

// Natural language commands
const response = await agent.execute(
  "Swap 0.1 ETH for USDC with maximum 0.5% slippage"
);

// Direct function calls
const swapResult = await agent.swap({
  tokenIn: ethers.ZeroAddress, // ETH
  tokenOut: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
  amountIn: ethers.parseEther('0.1').toString(),
  slippage: 0.5,
});
```

### AI-Powered Strategies

```typescript
// Market analysis and automated trading
await agent.execute(
  "Monitor ETH/USDC price and buy 0.1 ETH when RSI indicates oversold"
);

// Portfolio rebalancing
await agent.execute(
  "Rebalance my portfolio to maintain 60% ETH, 30% USDC, and 10% WBTC"
);

// Yield farming optimization
await agent.execute(
  "Find and allocate funds to the highest yielding USDC lending protocol"
);
```

### Event Monitoring

```typescript
// Set up event listeners
agent.onPriceChange('ETH', async (price, change) => {
  if (change < -0.05) { // 5% drop
    await agent.execute("Buy ETH worth 100 USDC");
  }
});

// Monitor liquidation risks
agent.monitorHealthFactor('Aave', async (healthFactor) => {
  if (healthFactor < 1.5) {
    await agent.execute("Repay 20% of my USDC loan");
  }
});
```

## Testing

```bash
npm test
```

## Contributing

We welcome contributions! Please see our contributing guidelines for more details.

## License

MIT
