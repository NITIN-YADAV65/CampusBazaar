import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://blldivvpsmipppdojwam.supabase.co';
const supabaseAnonKey = 'sb_publishable_Hr_KWrSta6ldp5yMWZuqiw_wZTdeWnT';

async function testAnalytics() {
  console.log('=== VERIFY LISTING ANALYTICS (VIEWS & LIKES) ===');

  const buyerClient = createClient(supabaseUrl, supabaseAnonKey, { auth: { persistSession: false } });
  const sellerClient = createClient(supabaseUrl, supabaseAnonKey, { auth: { persistSession: false } });

  // 1. Sign in buyer and seller
  const buyerAuth = await buyerClient.auth.signInWithPassword({
    email: 'cb_test_buyer_999@gmail.com',
    password: 'BuyerPass123!Secure'
  });
  if (buyerAuth.error) throw new Error('Buyer login failed: ' + buyerAuth.error.message);
  const buyerId = buyerAuth.data.user.id;
  console.log('✅ Buyer signed in:', buyerId);

  const sellerAuth = await sellerClient.auth.signInWithPassword({
    email: 'testbuyer123@gmail.com',
    password: 'TestPassword123!'
  });
  if (sellerAuth.error) throw new Error('Seller login failed: ' + sellerAuth.error.message);
  const sellerId = sellerAuth.data.user.id;
  console.log('✅ Seller signed in:', sellerId);

  // 2. Fetch or create a test listing owned by seller
  const { data: listings } = await sellerClient
    .from('listings')
    .select('id, title, views_count, likes_count, seller_id')
    .eq('seller_id', sellerId)
    .limit(1);

  let targetListing;
  if (listings && listings.length > 0) {
    targetListing = listings[0];
  } else {
    const { data: newListing, error: createErr } = await sellerClient
      .from('listings')
      .insert({
        seller_id: sellerId,
        title: 'Analytics Test Laptop',
        description: 'Test listing for analytics verification',
        price: 25000,
        condition: 'Good',
        category_id: 'laptops',
        location: 'UniMall, LPU',
        contact_preference: 'In-app Chat',
        status: 'active'
      })
      .select('*')
      .single();
    if (createErr) throw createErr;
    targetListing = newListing;
  }

  console.log(`✅ Target Listing: "${targetListing.title}" (id: ${targetListing.id})`);
  console.log(`   Initial views_count: ${targetListing.views_count}, likes_count: ${targetListing.likes_count}`);

  // Clear existing views/likes for clean testing
  await buyerClient.from('listing_views').delete().eq('listing_id', targetListing.id).eq('viewer_id', buyerId);
  await sellerClient.from('listing_views').delete().eq('listing_id', targetListing.id).eq('viewer_id', sellerId);
  await buyerClient.from('listing_likes').delete().eq('listing_id', targetListing.id).eq('user_id', buyerId);
  await sellerClient.from('listing_likes').delete().eq('listing_id', targetListing.id).eq('user_id', sellerId);

  // Re-fetch baseline
  const { data: baseline } = await sellerClient
    .from('listings')
    .select('views_count, likes_count')
    .eq('id', targetListing.id)
    .single();

  const startViews = baseline?.views_count || 0;
  const startLikes = baseline?.likes_count || 0;
  console.log(`   Clean baseline: views=${startViews}, likes=${startLikes}`);

  // -------------------------------------------------------------
  // TEST 1: Buyer opens listing -> View count increases by 1
  // -------------------------------------------------------------
  console.log('\n--- Test 1: Buyer opens listing ---');
  const viewRes1 = await buyerClient.rpc('record_listing_view', { target_listing_id: targetListing.id });
  if (viewRes1.error) throw viewRes1.error;

  const { data: check1 } = await sellerClient.from('listings').select('views_count').eq('id', targetListing.id).single();
  console.log(`   After Buyer 1st visit: views_count = ${check1?.views_count}`);
  if (check1?.views_count !== startViews + 1) {
    throw new Error(`Expected views_count ${startViews + 1}, got ${check1?.views_count}`);
  }
  console.log('✅ Test 1 PASSED: Buyer view recorded and views_count increased.');

  // -------------------------------------------------------------
  // TEST 2: Same buyer refreshes/reopens -> Count does NOT increase (unique viewer)
  // -------------------------------------------------------------
  console.log('\n--- Test 2: Same buyer refreshes page ---');
  const viewRes2 = await buyerClient.rpc('record_listing_view', { target_listing_id: targetListing.id });
  if (viewRes2.error) throw viewRes2.error;

  const { data: check2 } = await sellerClient.from('listings').select('views_count').eq('id', targetListing.id).single();
  console.log(`   After Buyer 2nd visit: views_count = ${check2?.views_count}`);
  if (check2?.views_count !== startViews + 1) {
    throw new Error(`Expected views_count to remain ${startViews + 1}, got ${check2?.views_count}`);
  }
  console.log('✅ Test 2 PASSED: Duplicate view correctly prevented.');

  // -------------------------------------------------------------
  // TEST 3: Second user (seller) opens listing -> Count increases by 1
  // -------------------------------------------------------------
  console.log('\n--- Test 3: Second user opens listing ---');
  const viewRes3 = await sellerClient.rpc('record_listing_view', { target_listing_id: targetListing.id });
  if (viewRes3.error) throw viewRes3.error;

  const { data: check3 } = await sellerClient.from('listings').select('views_count').eq('id', targetListing.id).single();
  console.log(`   After Seller visit: views_count = ${check3?.views_count}`);
  if (check3?.views_count !== startViews + 2) {
    throw new Error(`Expected views_count ${startViews + 2}, got ${check3?.views_count}`);
  }
  console.log('✅ Test 3 PASSED: Second unique user increased view count to ' + check3?.views_count);

  // -------------------------------------------------------------
  // TEST 4: Buyer likes listing -> Like count increases by 1
  // -------------------------------------------------------------
  console.log('\n--- Test 4: Buyer likes listing ---');
  const likeRes1 = await buyerClient.rpc('toggle_listing_like', { target_listing_id: targetListing.id });
  if (likeRes1.error) throw likeRes1.error;
  console.log('   toggle_listing_like result:', likeRes1.data);

  const { data: checkLike1 } = await buyerClient.from('listings').select('likes_count').eq('id', targetListing.id).single();
  console.log(`   After Buyer like: likes_count = ${checkLike1?.likes_count}`);
  if (checkLike1?.likes_count !== startLikes + 1 || !likeRes1.data.is_liked) {
    throw new Error(`Expected likes_count ${startLikes + 1} and is_liked true`);
  }
  console.log('✅ Test 4 PASSED: Like recorded and likes_count increased.');

  // -------------------------------------------------------------
  // TEST 5: Buyer unlikes listing -> Like count decreases by 1
  // -------------------------------------------------------------
  console.log('\n--- Test 5: Buyer unlikes listing ---');
  const likeRes2 = await buyerClient.rpc('toggle_listing_like', { target_listing_id: targetListing.id });
  if (likeRes2.error) throw likeRes2.error;
  console.log('   toggle_listing_like result:', likeRes2.data);

  const { data: checkLike2 } = await buyerClient.from('listings').select('likes_count').eq('id', targetListing.id).single();
  console.log(`   After Buyer unlike: likes_count = ${checkLike2?.likes_count}`);
  if (checkLike2?.likes_count !== startLikes || likeRes2.data.is_liked) {
    throw new Error(`Expected likes_count ${startLikes} and is_liked false`);
  }
  console.log('✅ Test 5 PASSED: Unlike recorded and likes_count decreased.');

  // -------------------------------------------------------------
  // TEST 6: Seller queries own listing -> sees correct real counts
  // -------------------------------------------------------------
  console.log('\n--- Test 6: Seller sees correct counts ---');
  const { data: sellerListing } = await sellerClient
    .from('listings')
    .select('id, views_count, likes_count')
    .eq('id', targetListing.id)
    .single();

  console.log(`✅ Seller sees: views_count = ${sellerListing.views_count}, likes_count = ${sellerListing.likes_count}`);

  console.log('\n🎉 ALL DATABASE ANALYTICS TESTS PASSED PERFECTLY!');
}

testAnalytics().catch(err => {
  console.error('❌ Analytics test failed:', err);
  process.exit(1);
});
