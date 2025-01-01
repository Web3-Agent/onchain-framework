import { config } from 'dotenv';
import { createAgent } from 'web3agent-aof';

// Load environment variables
config();

async function main() {
  try {
    // Initialize agent
    const agent = await createAgent(
      process.env.RPC_URL!,
      process.env.PRIVATE_KEY!
    );

    // Set up portfolio monitoring
    const tokens = [
      process.env.USDC_ADDRESS!,
      process.env.WETH_ADDRESS!
    ];

    // Monitor portfolio
    const portfolio = await agent.analyzePortfolio(tokens);
    console.log('Initial Portfolio Analysis:', portfolio);

    // Set up price monitoring
    agent.on('priceChange', (data) => {
      console.log(`Price Update:
        Token: ${data.token}
        Current Price: $${data.price}
        Previous Price: $${data.previousPrice}
        Change: ${data.percentageChange.toFixed(2)}%
      `);
    });

    // Set up health factor monitoring
    agent.on('healthFactorChange', (data) => {
      console.log(`Health Factor Update:
        Protocol: ${data.protocol}
        Current Health Factor: ${data.healthFactor}
        Previous Health Factor: ${data.previousHealthFactor}
      `);

      // Alert if health factor drops below threshold
      if (data.healthFactor < Number(process.env.MIN_HEALTH_FACTOR)) {
        console.log('⚠️ WARNING: Health factor below minimum threshold!');
      }
    });

    // Start monitoring prices
    for (const token of tokens) {
      agent.monitorPriceChange(token, (data) => {
        // Price change callback is handled by the event listener above
      });
    }

    // Example of getting a bridge quote
    const bridgeQuote = await agent.getBridgeQuote({
      sourceChain: 'ethereum',
      targetChain: 'bnb',
      token: process.env.USDC_ADDRESS!,
      amount: '1000000000', // 1000 USDC
      bridgeProtocol: 'LayerZero'
    });

    console.log('Bridge Quote:', bridgeQuote);

    // Set up gas optimization
    await agent.setGasStrategy({
      type: 'moderate',
      maxPriorityFee: BigInt(2000000000), // 2 Gwei
      maxFeePerGas: BigInt(40000000000),  // 40 Gwei
      flashbotsEnabled: false
    });

    console.log('🚀 DeFi monitoring started successfully!');
    console.log('Press Ctrl+C to stop monitoring...');

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main(); 