# Prompt Operations Example

This example demonstrates how to use web3agent-aof to execute blockchain operations using natural language prompts across multiple networks.

## Features

- Natural language command processing
- Multi-network support (Ethereum, BSC, Mode, Optimism)
- AI-powered operation execution
- Cross-chain transfers
- Token swaps
- Wrapping/Unwrapping
- Approvals
- Vault creation

## Supported Operations

1. Transfers:
```bash
Transfer 0.01 CCIP-BnM to MODE TESTNET
Transfer 1 BNB to OPTIMISM
```

2. Swaps:
```bash
Swap 1 USDC to BNB with 5% slippage using Enso
Swap 0.0001 ETH to USDC on MODE MAINNET network with 5% slippage
```

3. Wrap/Unwrap:
```bash
Wrap 0.000001 BNB on BSC network
Unwrap 0.000001 ETH on Ethereum network
```

4. Approvals:
```bash
Approve 0.001 BNB to 0x20613aBe93e4611Cf547b4395E4248c6129c8697
```

5. Vault Creation:
```bash
Create a vault with layerbank strategy on mode network
```

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
   - RPC URLs for each network
   - Private key
   - OpenAI API key
   - Token addresses
   - Protocol addresses

## Usage

Run a command:
```bash
npm start execute "Swap 1 USDC to ETH with 5% slippage using enso"
```

The AI agent will:
1. Parse the natural language command
2. Determine the appropriate network and protocol
3. Analyze market conditions
4. Execute the operation with optimal parameters

## AI Features

The example uses AI to:
- Parse natural language commands
- Analyze market conditions
- Optimize gas strategies
- Suggest best execution timing
- Monitor transaction status

## Code Structure

- `src/index.ts`: Main CLI implementation
- `.env.example`: Configuration template
- `package.json`: Dependencies
- `tsconfig.json`: TypeScript configuration

## Networks Supported

- Ethereum Mainnet
- BNB Chain
- Mode (Mainnet & Testnet)
- Optimism

## Additional Resources

- [web3agent-aof Documentation](https://github.com/Web3-Agent/onchain-framework)
- [Mode Network Documentation](https://docs.mode.network/)
- [LayerBank Documentation](https://docs.layerbank.finance/) 