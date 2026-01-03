// ===================================================================
// FILE: backend/models/dashboardStats.model.js
// Dashboard statistics stored in Supabase (dashboard_stats table)
// ===================================================================

const { supabase } = require('../config/db');

class DashboardStatsModel {
  static TABLE = 'dashboard_stats';

  // Get stats for a farmer
  static async findByFarmerId(farmerId) {
    const { data, error } = await supabase
      .from(this.TABLE)
      .select('*')
      .eq('farmer_id', farmerId)
      .order('last_updated', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  // Upsert stats for a farmer
  static async upsert(farmerId, stats) {
    const payload = {
      farmer_id: farmerId,
      ...stats,
      last_updated: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from(this.TABLE)
      .upsert(payload, { onConflict: 'farmer_id' })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

module.exports = DashboardStatsModel;

