// server/lib/supabaseClient.js

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY // ATTENTION : cette clé ne doit jamais aller dans le frontend
);

module.exports = { supabase };
