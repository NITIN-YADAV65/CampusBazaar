import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://blldivvpsmipppdojwam.supabase.co';
const supabaseAnonKey = 'sb_publishable_Hr_KWrSta6ldp5yMWZuqiw_wZTdeWnT';

const anonClient = createClient(supabaseUrl, supabaseAnonKey);

async function runSecurityTests() {
  console.log('============================================================');
  console.log('TEST 1: Anonymous SELECT on public.listing_images');
  console.log('============================================================');
  const { data: images, error: imgErr, count } = await anonClient
    .from('listing_images')
    .select('*', { count: 'exact' });

  console.log('Error:', imgErr?.message || 'NONE');
  console.log('Total listing_images records accessible to anonymous:', images?.length ?? 0);
  if (images && images.length > 0) {
    console.log('Sample image record:', images[0]);
  }

  console.log('\n============================================================');
  console.log('TEST 2: Anonymous joined query (listings + images)');
  console.log('============================================================');
  const { data: listings, error: listErr } = await anonClient
    .from('listings')
    .select(`
      id,
      title,
      seller_id,
      images:listing_images(*)
    `)
    .limit(10);

  console.log('Error:', listErr?.message || 'NONE');
  console.log('Listings fetched:', listings?.length ?? 0);
  let totalImagesAttached = 0;
  listings?.forEach((l) => {
    const imgCount = l.images?.length ?? 0;
    totalImagesAttached += imgCount;
    if (imgCount > 0) {
      console.log(`✅ Listing "${l.title}" has ${imgCount} image(s): ${l.images[0].image_url.slice(0, 70)}...`);
    } else {
      console.log(`ℹ️ Listing "${l.title}" has 0 images`);
    }
  });
  console.log('Total images attached across sample listings:', totalImagesAttached);

  console.log('\n============================================================');
  console.log('TEST 3: Security: Anonymous INSERT to listing_images (MUST BE BLOCKED)');
  console.log('============================================================');
  const { data: insertData, error: insertErr } = await anonClient
    .from('listing_images')
    .insert({
      listing_id: listings?.[0]?.id || '00000000-0000-0000-0000-000000000000',
      image_url: 'https://attacker.com/malicious.jpg',
      position: 0
    })
    .select();

  if (insertErr) {
    console.log('✅ SECURE: Anonymous INSERT rejected as expected! Error code:', insertErr.code, '-', insertErr.message);
  } else {
    console.error('❌ SECURITY FAILURE: Anonymous user was able to insert image record!', insertData);
  }

  console.log('\n============================================================');
  console.log('TEST 4: Security: Anonymous DELETE on listing_images (MUST BE BLOCKED)');
  console.log('============================================================');
  if (images && images.length > 0) {
    const targetImgId = images[0].id;
    const { data: delData, error: delErr } = await anonClient
      .from('listing_images')
      .delete()
      .eq('id', targetImgId)
      .select();

    if (delErr || (delData && delData.length === 0)) {
      console.log('✅ SECURE: Anonymous DELETE blocked as expected! (Deleted rows:', delData?.length ?? 0, delErr?.message || 'RLS denied)');
    } else {
      console.error('❌ SECURITY FAILURE: Anonymous user was able to delete image record!', delData);
    }
  }

  console.log('\n============================================================');
  console.log('TEST 5: Security: Anonymous Upload to Storage (MUST BE BLOCKED)');
  console.log('============================================================');
  const dummyBlob = new Blob(['test'], { type: 'text/plain' });
  const { error: storageUploadErr } = await anonClient.storage
    .from('listing-images')
    .upload('anonymous_attack.txt', dummyBlob);

  if (storageUploadErr) {
    console.log('✅ SECURE: Anonymous storage upload rejected as expected! Error:', storageUploadErr.message);
  } else {
    console.error('❌ SECURITY FAILURE: Anonymous storage upload succeeded!');
  }

  if (images && images.length > 0) {
    console.log('\n============================================================');
    console.log('TEST 6: Public HTTP Image Download Verification');
    console.log('============================================================');
    const publicImageUrl = images[0].image_url;
    console.log('Fetching public image URL:', publicImageUrl);
    try {
      const resp = await fetch(publicImageUrl);
      console.log('HTTP Status:', resp.status, resp.statusText);
      console.log('Content-Type:', resp.headers.get('content-type'));
      if (resp.ok) {
        console.log('✅ Public HTTP fetch of image succeeded!');
      } else {
        console.log('⚠️ HTTP status was not 200 OK:', resp.status);
      }
    } catch (e) {
      console.error('Fetch error:', e.message);
    }
  }
}

runSecurityTests().catch(console.error);
