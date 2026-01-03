// ===================================================================
// FILE: backend/models/farmer.model.js
// ===================================================================

const { supabase } = require('../config/db');
const bcrypt = require('bcryptjs');

class FarmerModel {
  // Create new farmer
  static async create(farmerData) {
    const {
      phone,
      email,
      password,
      name,
      village,
      district,
      state,
      landSizeAcres,
      cropType,
      farmerPhotoUrl,
      farmPhotoUrl,
      upiId,
      bankAccountNumber,
      bankIfscCode,
      bankName,
      metamaskAddress,
    } = farmerData;

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Build insert object with only provided fields (exclude undefined/null values)
    const insertData = {
      phone,
      email,
      password_hash: passwordHash,
      name,
      village: village || null,
      district: district || null,
      state: state || null,
      land_size_acres: landSizeAcres || null,
      crop_type: cropType || null,
      upi_id: upiId || null,
      bank_account_number: bankAccountNumber || null,
      bank_ifsc_code: bankIfscCode || null,
      bank_name: bankName || null,
      metamask_address: metamaskAddress || null,
    };

    // Photo URLs - only include if columns exist in your schema
    // If you get errors about these columns, either:
    // 1. Add them to your Supabase farmers table, OR
    // 2. Remove these lines
    // For now, we'll skip them to avoid schema errors
    // if (farmerPhotoUrl) {
    //   insertData.farmer_photo_url = farmerPhotoUrl;
    // }
    // farm_photo_url removed - column doesn't exist in schema

    const { data, error } = await supabase
      .from('farmers')
      .insert([insertData])
      .select()
      .single();

    if (error) {
      console.error('Farmer creation error:', error);
      throw error;
    }
    return data;
  }

  // Find farmer by phone
  static async findByPhone(phone) {
    const { data, error } = await supabase
      .from('farmers')
      .select('*')
      .eq('phone', phone)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  // Find farmer by email
  static async findByEmail(email) {
    const { data, error } = await supabase
      .from('farmers')
      .select('*')
      .eq('email', email)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  // Find farmer by ID
  static async findById(id) {
    const { data, error } = await supabase
      .from('farmers')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  // Update farmer
  static async update(id, updates) {
    // Filter out undefined/null values and non-existent columns
    const cleanUpdates = {};
    const allowedFields = [
      'name', 'village', 'district', 'state', 'land_size_acres', 'crop_type',
      'upi_id', 'bank_account_number', 'bank_ifsc_code', 'bank_name',
      'metamask_address', 'is_phone_verified', 'is_email_verified',
      // Photo URL fields removed - may not exist in schema
      // 'farmer_photo_url', 'farm_photo_url'
    ];

    Object.keys(updates).forEach((key) => {
      // Convert camelCase to snake_case
      const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      if (allowedFields.includes(snakeKey) && updates[key] !== undefined && updates[key] !== null) {
        cleanUpdates[snakeKey] = updates[key];
      }
    });

    // Don't try to update if no valid fields
    if (Object.keys(cleanUpdates).length === 0) {
      return await this.findById(id);
    }

    const { data, error } = await supabase
      .from('farmers')
      .update(cleanUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Farmer update error:', error);
      throw error;
    }
    return data;
  }

  // Verify phone
  static async verifyPhone(id) {
    return await this.update(id, { is_phone_verified: true });
  }

  // Verify email
  static async verifyEmail(id) {
    return await this.update(id, { is_email_verified: true });
  }

  // Verify password
  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  // Update MetaMask address
  static async updateMetaMaskAddress(id, address) {
    return await this.update(id, { metamask_address: address });
  }
}

module.exports = FarmerModel;