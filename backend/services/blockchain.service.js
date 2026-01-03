// backend/services/blockchain.service.js
const { getContract, provider } = require('../config/blockchain');

class BlockchainService {
  constructor() {
    this.contract = null;
  }

  // Initialize contract
  initialize() {
    try {
      this.contract = getContract();
      console.log(' Blockchain service initialized');
      return true;
    } catch (error) {
      console.error(' Blockchain init failed:', error.message);
      throw error;
    }
  }

  // Submit claim to blockchain
  async submitClaim(claimData) {
    try {
      if (!this.contract) this.initialize();

      const { farmerId, cropType, damagePercentage, claimAmount, ipfsHash } = claimData;

      console.log(' Submitting to blockchain...');
      
      const tx = await this.contract.submitClaim(
        farmerId,
        cropType,
        damagePercentage,
        claimAmount,
        ipfsHash
      );

      console.log(' Transaction hash:', tx.hash);
      const receipt = await tx.wait();
      console.log(' Transaction confirmed!');

      // Get claimId from event
      const event = receipt.logs.find(log => {
        try {
          const parsed = this.contract.interface.parseLog(log);
          return parsed.name === 'ClaimSubmitted';
        } catch (e) {
          return false;
        }
      });

      const claimId = event ? Number(this.contract.interface.parseLog(event).args.claimId) : null;

      return {
        success: true,
        claimId,
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
      };
    } catch (error) {
      console.error(' Blockchain submit failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  // Approve claim (after ML verification)
  async approveClaim(claimId) {
    try {
      if (!this.contract) this.initialize();

      console.log(` Approving claim #${claimId}...`);
      
      const tx = await this.contract.approveClaim(claimId);
      const receipt = await tx.wait();
      
      console.log(' Claim approved!');

      return {
        success: true,
        transactionHash: receipt.hash,
      };
    } catch (error) {
      console.error(' Approve failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  // Mark as paid (after UPI payment)
  async markAsPaid(claimId) {
    try {
      if (!this.contract) this.initialize();

      console.log(` Marking claim #${claimId} as paid...`);
      
      const tx = await this.contract.markAsPaid(claimId);
      const receipt = await tx.wait();
      
      console.log(' Marked as paid!');

      return {
        success: true,
        transactionHash: receipt.hash,
      };
    } catch (error) {
      console.error(' Mark paid failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  // Get claim from blockchain
  async getClaim(claimId) {
    try {
      if (!this.contract) this.initialize();

      const claim = await this.contract.getClaim(claimId);

      return {
        farmer: claim.farmer,
        farmerId: claim.farmerId,
        cropType: claim.cropType,
        damagePercentage: Number(claim.damagePercentage),
        claimAmount: Number(claim.claimAmount),
        ipfsHash: claim.ipfsHash,
        approved: claim.approved,
        paid: claim.paid,
        timestamp: Number(claim.timestamp),
      };
    } catch (error) {
      console.error(' Get claim failed:', error.message);
      throw error;
    }
  }
}

module.exports = new BlockchainService();