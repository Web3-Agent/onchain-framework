import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Set test environment
process.env.NODE_ENV = 'test';
process.env.EVM_PRIVATE_KEY = 'test-private-key';
process.env.OPENAI_API_KEY = 'test-api-key';
process.env.RPC_URL = 'test-rpc-url';
