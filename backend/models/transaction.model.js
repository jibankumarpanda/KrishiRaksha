// ===================================================================
// FILE: backend/models/transaction.model.js
// ===================================================================

const { supabase } = require('../config/db');

class TransactionModel {
  // Create transaction
  static async create(transactionData) {
    const {
      claimId,
      farmerId,
      amount,
      paymentMethod,
      paymentReference,
      upiId,
      bankAccountNumber,
    } = transactionData;

    const { data, error } = await supabase
      .from('transactions')
      .insert([
        {
          claim_id: claimId,
          farmer_id: farmerId,
          amount,
          payment_method: paymentMethod,
          payment_reference: paymentReference,
          upi_id: upiId,
          bank_account_number: bankAccountNumber,
          status: 'initiated',
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Find by claim ID
  static async findByClaimId(claimId) {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('claim_id', claimId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  // Find by farmer ID
  static async findByFarmerId(farmerId) {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('farmer_id', farmerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  // Update status
  static async updateStatus(id, status, gatewayResponse) {
    const updates = {
      status,
      gateway_response: gatewayResponse,
    };

    if (status === 'success') {
      updates.completed_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('transactions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Update blockchain tx hash
  static async updateBlockchainTxHash(id, txHash) {
    const { data, error } = await supabase
      .from('transactions')
      .update({ blockchain_tx_hash: txHash })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

module.exports = TransactionModel;