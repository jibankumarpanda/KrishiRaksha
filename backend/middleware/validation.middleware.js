// ===================================================================
// FILE: backend/middleware/validation.middleware.js
// ===================================================================

// Validate phone number
exports.validatePhone = (req, res, next) => {
  // Check if req.body exists
  if (!req.body) {
    return res.status(400).json({ error: 'Request body is required' });
  }
  
  const { phone } = req.body;
  
  if (!phone) {
    return res.status(400).json({ error: 'Phone number is required' });
  }
  
  // Indian phone number format: +91XXXXXXXXXX
  const phoneRegex = /^\+91[6-9]\d{9}$/;
  
  if (!phoneRegex.test(phone)) {
    return res.status(400).json({ error: 'Invalid Indian phone number format. Use +91XXXXXXXXXX' });
  }
  
  next();
};

// Validate email
exports.validateEmail = (req, res, next) => {
  // Check if req.body exists
  if (!req.body) {
    return res.status(400).json({ error: 'Request body is required' });
  }
  
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }
  
  next();
};

// Validate OTP
exports.validateOTP = (req, res, next) => {
  // Check if req.body exists
  if (!req.body) {
    return res.status(400).json({ error: 'Request body is required' });
  }
  
  const { otp } = req.body;
  
  if (!otp) {
    return res.status(400).json({ error: 'OTP is required' });
  }
  
  if (!/^\d{6}$/.test(otp)) {
    return res.status(400).json({ error: 'OTP must be 6 digits' });
  }
  
  next();
};

// Validate claim data - Updated to match new schema format and handle FormData
exports.validateClaim = (req, res, next) => {
  // FormData fields come as strings, so we need to handle that
  // Also handle both camelCase (frontend) and snake_case (backend) formats
  const body = req.body || {};
  
  // Normalize field names - support both camelCase and snake_case
  const cropType = body.cropType || body.crop_type || '';
  const estimatedLoss = body.estimatedLoss || body.estimated_loss || body.claimAmount || body.claim_amount;
  const affectedArea = body.affectedArea || body.affected_area || '';
  const incidentDate = body.incidentDate || body.incident_date || '';
  const incidentDescription = body.incidentDescription || body.incident_description || '';
  
  // Old format support (for backward compatibility)
  const damagePercentage = body.damagePercentage || body.damage_percentage;
  const claimAmount = body.claimAmount || body.claim_amount;
  
  // Debug logging in development
  if (process.env.NODE_ENV === 'development') {
    console.log('Validation - Request body keys:', Object.keys(body));
    console.log('Validation - cropType:', cropType, 'estimatedLoss:', estimatedLoss, 'affectedArea:', affectedArea);
  }
  
  // Required fields for new schema
  if (!cropType || cropType.trim() === '') {
    return res.status(400).json({ 
      error: 'Crop type is required',
      received: { cropType, bodyKeys: Object.keys(body) }
    });
  }
  
  if (!incidentDate || incidentDate.trim() === '') {
    return res.status(400).json({ error: 'Incident date is required' });
  }
  
  if (!incidentDescription || incidentDescription.trim() === '') {
    return res.status(400).json({ error: 'Incident description is required' });
  }
  
  // Check for either old format or new format
  const hasOldFormat = damagePercentage !== undefined && damagePercentage !== '' && 
                       claimAmount !== undefined && claimAmount !== '';
  const hasNewFormat = estimatedLoss !== undefined && estimatedLoss !== '' && 
                       affectedArea !== undefined && affectedArea !== '';
  
  if (!hasOldFormat && !hasNewFormat) {
    return res.status(400).json({ 
      error: 'Either (damage percentage and claim amount) or (estimated loss and affected area) are required',
      received: { estimatedLoss, affectedArea, damagePercentage, claimAmount }
    });
  }
  
  // Validate old format if present
  if (hasOldFormat) {
    const damagePct = parseFloat(damagePercentage);
    const claimAmt = parseFloat(claimAmount);
    
    if (isNaN(damagePct) || damagePct < 0 || damagePct > 100) {
      return res.status(400).json({ error: 'Damage percentage must be between 0 and 100' });
    }
    if (isNaN(claimAmt) || claimAmt <= 0) {
      return res.status(400).json({ error: 'Claim amount must be positive' });
    }
  }
  
  // Validate new format if present
  if (hasNewFormat) {
    const estLoss = parseFloat(estimatedLoss);
    const affArea = parseFloat(affectedArea);
    
    if (isNaN(estLoss) || estLoss <= 0) {
      return res.status(400).json({ error: 'Estimated loss must be a positive number' });
    }
    if (isNaN(affArea) || affArea <= 0) {
      return res.status(400).json({ error: 'Affected area must be a positive number' });
    }
  }
  
  // Normalize body for controller (convert strings to numbers where needed)
  if (hasNewFormat) {
    req.body.estimatedLoss = parseFloat(estimatedLoss);
    req.body.affectedArea = parseFloat(affectedArea);
  }
  if (hasOldFormat) {
    req.body.damagePercentage = parseFloat(damagePercentage);
    req.body.claimAmount = parseFloat(claimAmount);
  }
  
  next();
};