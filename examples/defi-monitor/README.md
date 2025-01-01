# DeFi Monitoring Example

This example demonstrates how to use the web3agent-aof package to monitor DeFi positions, track prices, and manage cross-chain operations.

## Features

- Real-time price monitoring for tokens
- Portfolio analysis
- Health factor monitoring
- Bridge quote fetching
- Gas optimization

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
- Private key (for transactions)
- OpenAI API key (for AI features)
- Token addresses to monitor
- Monitoring settings

## Running the Example

Start the monitoring service:
```bash
npm run dev
```

This will:
1. Initialize the web3agent
2. Start monitoring token prices
3. Track portfolio health factors
4. Set up gas optimization
5. Fetch bridge quotes

## Example Output

```
Initial Portfolio Analysis: {
  totalValue: 1000.00,
  sharpeRatio: 1.5,
  maxDrawdown: -5.2
}

Price Update:
  Token: 0xA0b...eB48
  Current Price: $1.00
  Previous Price: $1.00
  Change: 0.00%

Health Factor Update:
  Protocol: Aave
  Current Health Factor: 1.8
  Previous Health Factor: 1.85
```

## Code Structure

- `src/index.ts`: Main application file
- `.env.example`: Example environment variables
- `package.json`: Project dependencies
- `tsconfig.json`: TypeScript configuration

## Additional Resources

- [web3agent-aof Documentation](https://github.com/Web3-Agent/onchain-framework)
- [Ethers.js Documentation](https://docs.ethers.org/v6/) 