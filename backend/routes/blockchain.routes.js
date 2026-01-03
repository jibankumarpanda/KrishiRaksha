// ===================================================================
// FILE: backend/routes/blockchain.routes.js
// KEEP YOUR EXISTING FILE, IT'S ALREADY GOOD
// ===================================================================

const express = require('express');
const router = express.Router();
const blockchainService = require('../services/blockchain.service');

// Get claim from blockchain
router.get('/blockchain/claim/:claimId', async (req, res) => {
  try {
    const { claimId } = req.params;
    const claim = await blockchainService.getClaim(claimId);
    res.json({ success: true, claim });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;