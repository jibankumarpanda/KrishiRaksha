// backend/config/blockchain.js
const { ethers } = require('ethers');

const BLOCKCHAIN_CONFIG = {
  contractAddress: '0xD87c1AB0e3682fB37E13e9dd8def2680F72B018B', // Update this with your contract address on Celo Sepolia
  rpcUrl: 'https://rpc.ankr.com/celo_sepolia', // Celo Sepolia RPC endpoint
  chainId: 470, // Celo Sepolia chain ID
  networkName: 'Celo Sepolia Testnet',
  // Optional: Add block explorer URL for transaction links
  explorerUrl: 'https://explorer.celo.org/sepolia',
  // Optional: Add native currency info
  nativeCurrency: {
    name: 'CELO',
    symbol: 'CELO',
    decimals: 18
  }
};

// Contract ABI - we'll create this file next
const path = require('path');
const CONTRACT_ABI = require(path.join(__dirname, '../blockchain/abi/KrishiRaksha.json'));

// Create provider
const provider = new ethers.providers.JsonRpcProvider(BLOCKCHAIN_CONFIG.rpcUrl);

// Create wallet (admin wallet for backend operations)
const getWallet = () => {
  if (!process.env.ADMIN_PRIVATE_KEY) {
    throw new Error('ADMIN_PRIVATE_KEY not found in .env');
  }
  return new ethers.Wallet(process.env.ADMIN_PRIVATE_KEY, provider);
};

// Create contract instance
const getContract = () => {
  const wallet = getWallet();
  return new ethers.Contract(
    BLOCKCHAIN_CONFIG.contractAddress,
    CONTRACT_ABI.abi,
    wallet
  );
};

module.exports = {
  BLOCKCHAIN_CONFIG,
  provider,
  getWallet,
  getContract,
};