# Web3 Agent AOF (AI Onchain Framework)

A powerful framework for AI-powered onchain operations and DeFi interactions.

## Features

- **Smart Order Routing**
  - Multi-DEX aggregation
  - Split order optimization
  - Gas-aware routing
  - Price impact analysis

- **Portfolio Analytics**
  - Risk metrics tracking
  - Performance analysis
  - Position management
  - Real-time portfolio monitoring

- **Gas Optimization**
  - Dynamic gas pricing
  - MEV protection
  - Transaction simulation
  - Network congestion monitoring

- **Cross-Chain Bridge**
  - Multi-bridge support (LayerZero, Hop, Across)
  - Best route finding
  - Bridge fee optimization
  - Transaction monitoring

## Installation

```bash
npm install web3agent-aof
```

## Quick Start

```typescript
import { createAgent } from 'web3agent-aof';

// Initialize agent
const agent = await createAgent(
  process.env.RPC_URL!,
  process.env.PRIVATE_KEY!
);

// Smart order routing
const route = await agent.findBestRoute({
  tokenIn: '0x...',  // USDC
  tokenOut: '0x...', // WETH
  amount: '1000000000', // 1000 USDC
  maxSlippage: 0.5,
  protocols: ['Uniswap', '1inch']
});

// Execute swap
await agent.executeRoute(route);

// Portfolio analysis
const portfolio = await agent.analyzePortfolio([
  '0x...', // USDC
  '0x...'  // WETH
]);

// Bridge assets
const bridgeQuote = await agent.getBridgeQuote({
  sourceChain: 'ethereum',
  targetChain: 'bnb',
  token: '0x...', // USDC
  amount: '1000000000',
  bridgeProtocol: 'LayerZero'
});

await agent.bridge(bridgeQuote);

// Monitor price changes
agent.on('priceChange', (data) => {
  console.log(`Price changed: ${data.token} ${data.price}`);
});

// Monitor health factor
agent.on('healthFactorChange', (data) => {
  console.log(`Health factor: ${data.healthFactor}`);
});
```

## Advanced Usage

### Gas Optimization

```typescript
// Set gas strategy
await agent.setGasStrategy({
  type: 'aggressive',
  maxPriorityFee: BigInt(3000000000), // 3 Gwei
  maxFeePerGas: BigInt(50000000000),  // 50 Gwei
  flashbotsEnabled: true
});

// Enable MEV protection
await agent.enableMEVProtection();
```

### Split Orders

```typescript
const splitRoute = await agent.splitOrder({
  tokenIn: '0x...',  // USDC
  tokenOut: '0x...', // WETH
  amount: '5000000000', // 5000 USDC
  maxSlippage: 0.5,
  protocols: ['Uniswap', '1inch', 'Paraswap'],
  maxSplits: 3
});
```

### Portfolio Management

```typescript
// Get portfolio analytics
const analytics = await agent.analyzePortfolio([
  '0x...', // USDC
  '0x...'  // WETH
]);

console.log(`Portfolio Value: ${analytics.totalValue}`);
console.log(`Sharpe Ratio: ${analytics.sharpeRatio}`);
console.log(`Max Drawdown: ${analytics.maxDrawdown}%`);
```

## Configuration

Create a `.env` file:

```env
RPC_URL=your_rpc_url
PRIVATE_KEY=your_private_key
```

## Features in Development

1. **MEV Protection & Gas Optimization**
   - Advanced gas fee strategies
   - Flashbots integration
   - Bundle transactions

2. **Cross-Chain Bridge Integration**
   - Support for more bridges (Stargate, Synapse)
   - Optimized bridge selection
   - Bridge aggregation

3. **Smart Order Routing & Aggregation**
   - Support for more DEXs
   - Advanced routing algorithms
   - MEV-aware routing

4. **Risk Management & Automation**
   - Advanced portfolio analytics
   - Automated rebalancing
   - Risk-adjusted returns

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

## License

MIT
