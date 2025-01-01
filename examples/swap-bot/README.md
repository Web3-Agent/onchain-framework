# Automated Swap Bot Example

This example demonstrates how to use the web3agent-aof package to create an automated token swapping bot that monitors prices and executes trades when profitable opportunities arise.

## Features

- Automated token swapping
- Multi-DEX price monitoring
- Gas optimization
- Profit calculation
- MEV protection
- Transaction monitoring

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
cp .env.example .env
```

3. Configure your `.env` file with:
- RPC URL (e.g., from Alchemy or Infura)
- Private key for transactions
- Token addresses to trade
- Trading parameters (slippage, profit threshold)
- DEX protocols to use

## Running the Bot

Start the swap bot:
```bash
npm run dev
```

This will:
1. Initialize the web3agent
2. Set up gas optimization
3. Monitor token pairs
4. Find best swap routes
5. Execute profitable trades automatically

## Example Output

```
🤖 Starting Swap Bot...

📊 Monitoring pair: USDC -> WETH
Found route with expected output: 0.5123 WETH
🎯 Profitable trade found! Profit: 1.50%
✅ Trade executed! Transaction hash: 0x123...

📊 Monitoring pair: WETH -> DAI
Found route with expected output: 1890.45 DAI
⏳ Waiting for better opportunities...

Price Update for WETH: $1890.45
```

## Code Structure

- `src/index.ts`: Main bot implementation
- `.env.example`: Example configuration
- `package.json`: Project dependencies
- `tsconfig.json`: TypeScript configuration

## Trading Strategy

The bot:
1. Monitors specified token pairs
2. Finds the best swap routes across multiple DEXs
3. Calculates potential profit
4. Executes trades when profit exceeds threshold
5. Uses gas optimization and MEV protection
6. Monitors transaction status

## Safety Features

- Maximum slippage protection
- Gas optimization
- Profit threshold
- Error handling
- Transaction monitoring

## Additional Resources

- [web3agent-aof Documentation](https://github.com/Web3-Agent/onchain-framework)
- [Ethers.js Documentation](https://docs.ethers.org/v6/) 