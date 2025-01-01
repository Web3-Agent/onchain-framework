import { EVMAgent } from './EVMAgent.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function main() {
  try {
    const agent = new EVMAgent();
    
    // Test the agent's execute function
    const response = await agent.execute('What is the current ETH price?');
    console.log('Agent Response:', response);

  } catch (error: any) {
    console.error('Error:', error.message || 'Unknown error occurred');
  }
}

main();
