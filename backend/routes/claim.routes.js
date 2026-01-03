// ===================================================================
// FILE: backend/routes/claim.routes.js
// REPLACE YOUR EXISTING FILE WITH THIS
// ===================================================================

const express = require('express');
const router = express.Router();
const claimController = require('../controllers/claim.controller');
const { verifyToken, requirePhoneVerified, requireEmailVerified } = require('../middleware/auth.middleware');
const { uploadMultiple, handleUploadError } = require('../middleware/upload.middleware');
const { validateClaim } = require('../middleware/validation.middleware');

// Submit new claim (protected, with file upload)
// Note: validateClaim runs AFTER uploadMultiple so FormData fields are available in req.body
router.post(
  '/',
  verifyToken,
  requirePhoneVerified,
  requireEmailVerified,
  uploadMultiple,
  handleUploadError,
  validateClaim, // Validation happens after multer processes FormData
  claimController.submitClaim
);

// Get all claims for current farmer (protected)
router.get('/', verifyToken, claimController.getMyClaims);

// Get claim by ID (protected)
router.get('/:id', verifyToken, claimController.getClaimById);

// Process claim with ML (admin/system route)
router.post('/:id/process', claimController.processClaim);

module.exports = router;