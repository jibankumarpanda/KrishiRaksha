// ===================================================================
// FILE: backend/models/otp.model.js
// ===================================================================

const { supabase } = require('../config/db');

class OTPModel {
  // Create OTP
  static async create(identifier, otp, type) {
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const { data, error } = await supabase
      .from('otp_verifications')
      .insert([
        {
          identifier,
          otp,
          type,
          expires_at: expiresAt.toISOString(),
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Find valid OTP
  static async findValid(identifier, otp, type) {
    const { data, error } = await supabase
      .from('otp_verifications')
      .select('*')
      .eq('identifier', identifier)
      .eq('otp', otp)
      .eq('type', type)
      .eq('is_verified', false)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  // Mark as verified
  static async markAsVerified(id) {
    const { data, error } = await supabase
      .from('otp_verifications')
      .update({ is_verified: true })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Delete expired OTPs
  static async deleteExpired() {
    const { error } = await supabase
      .from('otp_verifications')
      .delete()
      .lt('expires_at', new Date().toISOString());

    if (error) throw error;
  }
}

module.exports = OTPModel;