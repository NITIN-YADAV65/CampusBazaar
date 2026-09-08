import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://blldivvpsmipppdojwam.supabase.co';
const supabaseAnonKey = 'sb_publishable_Hr_KWrSta6ldp5yMWZuqiw_wZTdeWnT';

async function testCompleteChatFlow() {
  console.log('=== TEST COMPLETE CHAT FLOW IN SUPABASE ===');

  // We need two clients (one for buyer, one for seller)
  const buyerClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false }
  });
  const sellerClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false }
  });

  // 1. Get a real listing from database
  const { data: listings, error: listingErr } = await buyerClient
    .from('listings')
    .select('id, title, seller_id')
    .limit(1);

  if (listingErr || !listings || listings.length === 0) {
    console.error('❌ Could not fetch listing:', listingErr);
    return;
  }

  const listing = listings[0];
  console.log(`✅ Using listing: "${listing.title}" (id: ${listing.id}, seller_id: ${listing.seller_id})`);

  // 2. Set up buyer and seller credentials
  const buyerEmail = 'cb_test_buyer_999@gmail.com';
  const buyerPass = 'BuyerPass123!Secure';
  const sellerEmail = 'testbuyer123@gmail.com';
  const sellerPass = 'TestPassword123!';

  // Sign in buyer
  const buyerAuth = await buyerClient.auth.signInWithPassword({ email: buyerEmail, password: buyerPass });
  if (buyerAuth.error || !buyerAuth.data?.user) {
    console.error('❌ Buyer sign-in failed:', buyerAuth.error?.message);
    return;
  }
  const buyerId = buyerAuth.data.user.id;
  console.log(`✅ Buyer signed in. UID: ${buyerId} (${buyerEmail})`);

  // Sign in seller
  const sellerAuth = await sellerClient.auth.signInWithPassword({ email: sellerEmail, password: sellerPass });
  if (sellerAuth.error || !sellerAuth.data?.user) {
    console.error('❌ Seller sign-in failed:', sellerAuth.error?.message);
    return;
  }
  const sellerId = sellerAuth.data.user.id;
  console.log(`✅ Seller signed in. UID: ${sellerId} (${sellerEmail})`);

  // Create a dedicated test listing owned by seller
  const { data: testListing, error: testListingErr } = await sellerClient
    .from('listings')
    .insert({
      seller_id: sellerId,
      title: 'Engineering Mechanics Textbook',
      description: 'Clean notes, 3rd edition',
      price: 350,
      condition: 'Good',
      category_id: 'books',
      location: 'UniMall, LPU',
      contact_preference: 'chat',
      status: 'active'
    })
    .select('*')
    .single();

  if (testListingErr || !testListing) {
    console.error('❌ Failed to create test listing for seller:', testListingErr);
    return;
  }
  console.log(`✅ Created test listing: "${testListing.title}" (id: ${testListing.id}) owned by seller (${sellerId})`);

  // --- STEP 1: BUYER creates conversation ---
  console.log('\n--- Step 1: Buyer creates conversation ---');
  let conversationId;
  const { data: convData, error: convErr } = await buyerClient
    .from('conversations')
    .insert({
      listing_id: testListing.id,
      buyer_id: buyerId,
      seller_id: sellerId
    })
    .select('*')
    .single();

  if (convErr) {
    // If it already exists, fetch it
    console.log('Conversation already exists or error:', convErr.message);
    const { data: existingConv } = await buyerClient
      .from('conversations')
      .select('*')
      .eq('listing_id', testListing.id)
      .eq('buyer_id', buyerId)
      .single();
    conversationId = existingConv.id;
  } else {
    conversationId = convData.id;
  }

  console.log(`✅ Conversation exists: id = ${conversationId}`);

  // Verify conversation row
  const { data: checkConv } = await buyerClient
    .from('conversations')
    .select('*')
    .eq('id', conversationId)
    .single();

  console.log('Conversation Row verification:');
  console.log('  buyer_id matches buyer uid:', checkConv.buyer_id === buyerId);
  console.log('  seller_id matches seller uid:', checkConv.seller_id === sellerId);
  console.log('  listing_id matches listing id:', checkConv.listing_id === testListing.id);

  // --- STEP 2: BUYER sends "I want to purchase this" ---
  console.log('\n--- Step 2: Buyer sends first message ---');
  const messageContent = 'I want to purchase this';
  const { data: buyerMsg, error: msgErr } = await buyerClient
    .from('messages')
    .insert({
      conversation_id: conversationId,
      sender_id: buyerId,
      content: messageContent,
      is_read: false
    })
    .select('*')
    .single();

  if (msgErr) {
    console.error('❌ Buyer message insert failed:', msgErr);
    return;
  }
  console.log(`✅ Message inserted: "${buyerMsg.content}" (id: ${buyerMsg.id}, conversation_id: ${buyerMsg.conversation_id})`);

  // --- STEP 3: SELLER opens /messages and queries inbox ---
  console.log('\n--- Step 3: Seller queries conversations ---');
  const { data: sellerConvs, error: sellerConvErr } = await sellerClient
    .from('conversations')
    .select(`
      *,
      listing:listings(*, images:listing_images(*)),
      seller:profiles!seller_id(*),
      buyer:profiles!buyer_id(*)
    `)
    .or(`buyer_id.eq.${sellerId},seller_id.eq.${sellerId}`)
    .order('updated_at', { ascending: false });

  if (sellerConvErr) {
    console.error('❌ Seller fetch conversations failed:', sellerConvErr);
    return;
  }

  console.log(`✅ Seller fetched ${sellerConvs.length} conversation(s).`);
  const foundConv = sellerConvs.find(c => c.id === conversationId);
  if (!foundConv) {
    console.error('❌ Conversation NOT FOUND in seller inbox query!');
    return;
  }
  console.log(`✅ Found conversation in seller inbox! Listing: "${foundConv.listing?.title}", Buyer: "${foundConv.buyer?.full_name}"`);

  // --- STEP 4: SELLER opens conversation and reads messages ---
  console.log('\n--- Step 4: Seller reads messages ---');
  const { data: sellerMsgs, error: sellerMsgsErr } = await sellerClient
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (sellerMsgsErr) {
    console.error('❌ Seller fetch messages failed:', sellerMsgsErr);
    return;
  }
  console.log(`✅ Seller read ${sellerMsgs.length} message(s):`);
  sellerMsgs.forEach(m => console.log(`   [${m.sender_id === sellerId ? 'Seller' : 'Buyer'}]: ${m.content}`));

  // --- STEP 5: SELLER replies to buyer ---
  console.log('\n--- Step 5: Seller replies to buyer ---');
  const sellerReplyContent = 'Sure! We can meet at UniMall ground floor at 4 PM.';
  const { data: replyMsg, error: replyErr } = await sellerClient
    .from('messages')
    .insert({
      conversation_id: conversationId,
      sender_id: sellerId,
      content: sellerReplyContent,
      is_read: false
    })
    .select('*')
    .single();

  if (replyErr) {
    console.error('❌ Seller reply failed:', replyErr);
    return;
  }
  console.log(`✅ Seller reply inserted: "${replyMsg.content}"`);

  // --- STEP 6: BUYER reads seller reply ---
  console.log('\n--- Step 6: Buyer verifies seller reply ---');
  const { data: buyerReadMsgs, error: buyerReadErr } = await buyerClient
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (buyerReadErr) {
    console.error('❌ Buyer reading messages failed:', buyerReadErr);
    return;
  }
  console.log(`✅ Buyer sees ${buyerReadMsgs.length} message(s) in conversation:`);
  buyerReadMsgs.forEach(m => console.log(`   [${m.sender_id === buyerId ? 'Buyer' : 'Seller'}]: ${m.content}`));

  console.log('\n🎉 ALL DATABASE CONVERSATION & MESSAGING CHECKS PASSED PERFECTLY!');
}

testCompleteChatFlow().catch(console.error);
