// ===================================================================
// FILE: backend/routes/farmer.routes.js
// REPLACE YOUR EXISTING FILE WITH THIS
// ===================================================================

const express = require('express');
const router = express.Router();
const farmerController = require('../controllers/farmer.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// Get farmer dashboard (protected)
router.get('/dashboard', verifyToken, farmerController.getDashboard);

// Predict yield and persist dashboard stats (protected)
router.post('/predict-yield', verifyToken, farmerController.predictYield);

// Update profile (protected)
router.put('/profile', verifyToken, farmerController.updateProfile);

// Get farmer by ID (protected)
router.get('/:id', verifyToken, farmerController.getFarmerById);

module.exports = router;