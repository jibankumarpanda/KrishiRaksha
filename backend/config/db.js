// ===================================================================
// FILE 1: backend/config/db.js
// PostgreSQL (Supabase) Connection
// ===================================================================
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');  // Add this line

// Debug log environment variables
console.log('Environment Variables:', {
  SUPABASE_URL: process.env.SUPABASE_URL ? '***' : 'MISSING',
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY ? '***' : 'MISSING',
  NODE_ENV: process.env.NODE_ENV
});

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials. Please check your environment variables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Test connection
const testConnection = async () => {
  try {
    const { data, error } = await supabase.from('farmers').select('count');
    if (error) throw error;
    console.log('✅ Supabase connected successfully');
    return true;
  } catch (error) {
    console.error('❌ Supabase connection failed:', error.message);
    return false;
  }
};

module.exports = { 
  supabase, 
  testConnection 
};