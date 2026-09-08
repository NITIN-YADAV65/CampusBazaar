import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://blldivvpsmipppdojwam.supabase.co';
const supabaseAnonKey = 'sb_publishable_Hr_KWrSta6ldp5yMWZuqiw_wZTdeWnT';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verifyListingImagesTable() {
  console.log('--- Verifying public.listing_images in Supabase ---');
  
  // 1. Check table existence
  const { data, error, status } = await supabase
    .from('listing_images')
    .select('*')
    .limit(1);

  if (error) {
    console.log('❌ TABLE ERROR:', error.code, error.message);
    return false;
  }

  console.log('✅ TABLE CONFIRMED: public.listing_images exists and responds with HTTP', status);

  // 2. Check individual columns
  const testCols = ['id', 'listing_id', 'image_url', 'position', 'created_at'];
  console.log('--- Checking Columns in public.listing_images ---');
  for (const col of testCols) {
    const colRes = await supabase.from('listing_images').select(col).limit(1);
    if (colRes.error) {
      console.log(`❌ Column '${col}': MISSING (${colRes.error.message})`);
    } else {
      console.log(`✅ Column '${col}': PRESENT`);
    }
  }

  // 3. Test PostgREST foreign key relationship with listings
  const joinCheck = await supabase
    .from('listings')
    .select('id, title, images:listing_images(*)')
    .limit(1);

  if (joinCheck.error) {
    console.log('⚠️ PostgREST join check warning:', joinCheck.error.message);
  } else {
    console.log('✅ FOREIGN KEY CONFIRMED: PostgREST successfully joins listings with listing_images.');
  }

  return true;
}

verifyListingImagesTable().catch(console.error);
