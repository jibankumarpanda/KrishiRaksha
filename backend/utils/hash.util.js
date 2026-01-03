// ===================================================================
// FILE: backend/utils/hash.util.js
// ===================================================================

const crypto = require('crypto');

// Generate hash for IPFS verification
exports.generateHash = (data) => {
  return crypto.createHash('sha256').update(data).digest('hex');
};

// Verify hash
exports.verifyHash = (data, hash) => {
  const computedHash = this.generateHash(data);
  return computedHash === hash;
};

// Generate unique reference ID
exports.generateReferenceId = (prefix = 'REF') => {
  const timestamp = Date.now();
  const random = crypto.randomBytes(4).toString('hex');
  return `${prefix}_${timestamp}_${random}`;
};

// Sanitize sensitive data before logging
exports.sanitize = (data) => {
  const sanitized = { ...data };
  
  // Remove sensitive fields
  delete sanitized.password;
  delete sanitized.password_hash;
  delete sanitized.bank_account_number;
  delete sanitized.upi_id;
  
  return sanitized;
};