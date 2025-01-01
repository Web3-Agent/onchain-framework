import { config } from 'dotenv';
import { createAgent } from 'web3agent-aof';
import { ethers } from 'ethers';
import TelegramBot from 'node-telegram-bot-api';

// Load environment variables
config();

// Initialize Telegram bot
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN!, { polling: true });

// Parse allowed chat IDs
const allowedChatIds = process.env.ALLOWED_CHAT_IDS?.split(',').map(id => Number(id)) || [];

// Parse protocols from env
const protocols = JSON.parse(process.env.PROTOCOLS || '["PancakeSwap"]');

// Initialize web3agent
let agent: any;

async function initializeAgent() {
  try {
    agent = await createAgent(
      process.env.BNB_RPC_URL!,
      process.env.PRIVATE_KEY!
    );

    // Set up gas optimization for BNB Chain
    await agent.setGasStrategy({
      type: 'moderate',
      maxPriorityFee: ethers.parseUnits(process.env.PRIORITY_GAS_PRICE || '1', 'gwei'),
      maxFeePerGas: ethers.parseUnits(process.env.MAX_GAS_PRICE || '5', 'gwei'),
      flashbotsEnabled: false
    });

    console.log('🤖 Agent initialized successfully!');
  } catch (error) {
    console.error('Failed to initialize agent:', error);
  }
}

// Command handlers
async function handleStart(msg: TelegramBot.Message) {
  const chatId = msg.chat.id;
  if (!allowedChatIds.includes(chatId)) {
    bot.sendMessage(chatId, '⚠️ Unauthorized access. Please contact the administrator.');
    return;
  }

  const message = `Welcome to the BNB Chain Swap Bot! 🚀

Available commands:
/price <token> - Get token price
/swap <amount> <fromToken> <toToken> - Execute swap
/balance - Check wallet balance
/help - Show this help message

Example:
/swap 1 WBNB BUSD - Swap 1 WBNB to BUSD`;

  bot.sendMessage(chatId, message);
}

async function handlePrice(msg: TelegramBot.Message, match: RegExpExecArray | null) {
  const chatId = msg.chat.id;
  if (!allowedChatIds.includes(chatId)) return;

  const token = match?.[1]?.toUpperCase();
  if (!token) {
    bot.sendMessage(chatId, '⚠️ Please specify a token. Example: /price WBNB');
    return;
  }

  try {
    const tokenAddress = getTokenAddress(token);
    if (!tokenAddress) {
      bot.sendMessage(chatId, '⚠️ Unsupported token. Available tokens: WBNB, BUSD, CAKE');
      return;
    }

    // Monitor price
    agent.monitorPriceChange(tokenAddress, (data: any) => {
      bot.sendMessage(chatId, `💰 ${token} Price: $${data.price}`);
    });
  } catch (error) {
    bot.sendMessage(chatId, '❌ Failed to fetch price. Please try again later.');
  }
}

async function handleSwap(msg: TelegramBot.Message, match: RegExpExecArray | null) {
  const chatId = msg.chat.id;
  if (!allowedChatIds.includes(chatId)) return;

  const [amount, fromToken, toToken] = match?.[1]?.split(' ') || [];
  if (!amount || !fromToken || !toToken) {
    bot.sendMessage(chatId, '⚠️ Invalid format. Example: /swap 1 WBNB BUSD');
    return;
  }

  try {
    const tokenIn = getTokenAddress(fromToken.toUpperCase());
    const tokenOut = getTokenAddress(toToken.toUpperCase());

    if (!tokenIn || !tokenOut) {
      bot.sendMessage(chatId, '⚠️ Unsupported token pair. Available tokens: WBNB, BUSD, CAKE');
      return;
    }

    bot.sendMessage(chatId, '🔍 Finding best swap route...');

    // Find best route
    const route = await agent.findBestRoute({
      tokenIn,
      tokenOut,
      amount: ethers.parseEther(amount),
      maxSlippage: Number(process.env.MAX_SLIPPAGE),
      protocols
    });

    const message = `Found route:
💱 Swap ${amount} ${fromToken} to ${toToken}
📊 Expected output: ${route.expectedOutput}
🏷️ Price impact: ${route.priceImpact}%`;

    bot.sendMessage(chatId, message, {
      reply_markup: {
        inline_keyboard: [[
          { text: '✅ Confirm Swap', callback_data: `confirm_swap_${fromToken}_${toToken}_${amount}` },
          { text: '❌ Cancel', callback_data: 'cancel_swap' }
        ]]
      }
    });
  } catch (error) {
    bot.sendMessage(chatId, '❌ Failed to calculate swap. Please try again later.');
  }
}

async function handleBalance(msg: TelegramBot.Message) {
  const chatId = msg.chat.id;
  if (!allowedChatIds.includes(chatId)) return;

  try {
    const tokens = [
      { symbol: 'WBNB', address: process.env.WBNB_ADDRESS! },
      { symbol: 'BUSD', address: process.env.BUSD_ADDRESS! },
      { symbol: 'CAKE', address: process.env.CAKE_ADDRESS! }
    ];

    let message = '💼 Wallet Balance:\n';
    for (const token of tokens) {
      const balance = await agent.getTokenBalance(token.address);
      message += `${token.symbol}: ${ethers.formatEther(balance)}\n`;
    }

    bot.sendMessage(chatId, message);
  } catch (error) {
    bot.sendMessage(chatId, '❌ Failed to fetch balance. Please try again later.');
  }
}

// Helper function to get token address
function getTokenAddress(symbol: string): string | undefined {
  const addresses: { [key: string]: string } = {
    'WBNB': process.env.WBNB_ADDRESS!,
    'BUSD': process.env.BUSD_ADDRESS!,
    'CAKE': process.env.CAKE_ADDRESS!
  };
  return addresses[symbol];
}

// Register command handlers
bot.onText(/\/start/, handleStart);
bot.onText(/\/price (.+)/, handlePrice);
bot.onText(/\/swap (.+)/, handleSwap);
bot.onText(/\/balance/, handleBalance);
bot.onText(/\/help/, handleStart);

// Handle callback queries (swap confirmation)
bot.on('callback_query', async (query) => {
  const chatId = query.message?.chat.id;
  if (!chatId || !allowedChatIds.includes(chatId)) return;

  if (query.data?.startsWith('confirm_swap_')) {
    const [, , fromToken, toToken, amount] = query.data.split('_');
    try {
      bot.sendMessage(chatId, '🔄 Executing swap...');
      
      const receipt = await agent.executeRoute({
        tokenIn: getTokenAddress(fromToken),
        tokenOut: getTokenAddress(toToken),
        amount: ethers.parseEther(amount),
        maxSlippage: Number(process.env.MAX_SLIPPAGE),
        protocols
      });

      bot.sendMessage(chatId, `✅ Swap executed successfully!
Transaction hash: ${receipt.hash}
Explorer: https://bscscan.com/tx/${receipt.hash}`);
    } catch (error) {
      bot.sendMessage(chatId, '❌ Swap failed. Please try again later.');
    }
  } else if (query.data === 'cancel_swap') {
    bot.sendMessage(chatId, '❌ Swap cancelled.');
  }
});

// Initialize agent and start bot
async function main() {
  try {
    await initializeAgent();
    console.log('🤖 Telegram Bot is running...');
  } catch (error) {
    console.error('Error starting bot:', error);
    process.exit(1);
  }
}

main(); 