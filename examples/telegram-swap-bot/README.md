# Telegram Swap Bot for BNB Chain

This example demonstrates how to create a Telegram bot using web3agent-aof for executing swaps on BNB Chain (BSC).

## Features

- Token price monitoring
- Token swaps on BNB Chain
- Wallet balance checking
- Gas optimization
- Multiple DEX support (PancakeSwap, BiSwap, ApeSwap)
- Secure access control

## Setup

1. Create a Telegram Bot:
   - Message [@BotFather](https://t.me/BotFather) on Telegram
   - Use the `/newbot` command
   - Follow instructions to create bot
   - Copy the bot token

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Configure your `.env` file with:
   - BNB Chain RPC URL
   - Private key for transactions
   - Telegram bot token
   - Allowed chat IDs (for security)
   - Token addresses
   - Trading parameters

## Available Commands

- `/start` - Show welcome message and available commands
- `/price <token>` - Get current price of a token
- `/swap <amount> <fromToken> <toToken>` - Execute a token swap
- `/balance` - Check wallet balance
- `/help` - Show help message

## Example Usage

```
/price WBNB
💰 WBNB Price: $310.45

/swap 1 WBNB BUSD
🔍 Finding best route...
Found route:
💱 Swap 1 WBNB to BUSD
📊 Expected output: 310.45 BUSD
🏷️ Price impact: 0.1%
[Confirm Swap] [Cancel]

/balance
💼 Wallet Balance:
WBNB: 1.5
BUSD: 500.0
CAKE: 100.0
```

## Security Features

1. Access Control:
   - Only allowed chat IDs can use the bot
   - Configurable through environment variables

2. Transaction Safety:
   - Slippage protection
   - Gas optimization
   - Transaction confirmation
   - Price impact warning

## Code Structure

- `src/index.ts`: Main bot implementation
- `.env.example`: Example configuration
- `package.json`: Project dependencies
- `tsconfig.json`: TypeScript configuration

## Running the Bot

Start the bot:
```bash
npm run dev
```

For production:
```bash
npm run build
npm start
```

## Additional Resources

- [web3agent-aof Documentation](https://github.com/Web3-Agent/onchain-framework)
- [BNB Chain Documentation](https://docs.bnbchain.org/)
- [Telegram Bot API](https://core.telegram.org/bots/api) 