import { adminDb } from './config/firebaseAdmin.js';

async function test() {
  try {
    console.log('Testing adminDb access...');
    const snapshot = await adminDb.collection('users').limit(1).get();
    console.log('SUCCESS: adminDb read successfully. Count:', snapshot.size);
  } catch (err: any) {
    console.error('FAILED: adminDb error:', err?.message, err?.code);
  }
}

test();
