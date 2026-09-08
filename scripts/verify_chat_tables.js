import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://blldivvpsmipppdojwam.supabase.co';
const supabaseAnonKey = 'sb_publishable_Hr_KWrSta6ldp5yMWZuqiw_wZTdeWnT';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verifyChatTables() {
  console.log('--- Verifying Chat Tables in Supabase ---');

  // 1. Check profiles
  const profileRes = await supabase.from('profiles').select('id, full_name').limit(1);
  if (profileRes.error) {
    console.log('❌ profiles table:', profileRes.error.code, profileRes.error.message);
  } else {
    console.log('✅ profiles table exists. Row count returned:', profileRes.data?.length);
  }

  // 2. Check conversations
  const convRes = await supabase.from('conversations').select('id, listing_id, buyer_id, seller_id, created_at, updated_at').limit(1);
  if (convRes.error) {
    console.log('❌ conversations table:', convRes.error.code, convRes.error.message);
  } else {
    console.log('✅ conversations table exists. Row count returned:', convRes.data?.length);
  }

  // 3. Check messages
  const msgRes = await supabase.from('messages').select('id, conversation_id, sender_id, content, is_read, created_at').limit(1);
  if (msgRes.error) {
    console.log('❌ messages table:', msgRes.error.code, msgRes.error.message);
  } else {
    console.log('✅ messages table exists. Row count returned:', msgRes.data?.length);
  }

  // 4. Test joins
  const joinRes = await supabase
    .from('conversations')
    .select(`
      id,
      listing:listings(id, title),
      seller:profiles!seller_id(id, full_name),
      buyer:profiles!buyer_id(id, full_name)
    `)
    .limit(1);

  if (joinRes.error) {
    console.log('❌ conversations join check:', joinRes.error.code, joinRes.error.message);
  } else {
    console.log('✅ conversations joins with listings and profiles WORK!');
  }
}

verifyChatTables().catch(console.error);
