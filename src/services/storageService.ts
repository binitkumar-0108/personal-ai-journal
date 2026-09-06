import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../lib/firebase';
import type { VoiceRecording } from '../types/index';

/**
 * Uploads an audio blob to Firebase Storage for a specific entry.
 * Path: voice/{uid}/{entryId}-{timestamp}.{ext}
 */
export async function uploadVoiceRecording(
  uid: string,
  entryId: string,
  audioBlob: Blob,
  durationSeconds?: number
): Promise<VoiceRecording> {
  // Determine extension from MIME type
  let ext = 'webm';
  if (audioBlob.type.includes('mp4')) ext = 'mp4';
  else if (audioBlob.type.includes('ogg')) ext = 'ogg';
  else if (audioBlob.type.includes('wav')) ext = 'wav';

  const timestamp = Date.now();
  const storagePath = `voice/${uid}/${entryId}-${timestamp}.${ext}`;
  const fileRef = ref(storage, storagePath);

  // Upload file
  await uploadBytes(fileRef, audioBlob, {
    contentType: audioBlob.type,
    customMetadata: {
      entryId,
      userId: uid,
      duration: durationSeconds ? String(durationSeconds) : '',
    },
  });

  // Get public download URL
  const url = await getDownloadURL(fileRef);

  return {
    storagePath,
    url,
    mimeType: audioBlob.type,
    durationSeconds: durationSeconds && durationSeconds > 0 ? durationSeconds : undefined,
    savedAt: new Date(),
  };
}

/**
 * Deletes a voice recording from Firebase Storage.
 */
export async function deleteVoiceRecording(storagePath: string): Promise<void> {
  if (!storagePath) return;
  const fileRef = ref(storage, storagePath);
  try {
    await deleteObject(fileRef);
  } catch (error: unknown) {
    // If the file doesn't exist, we can ignore the error
    if (typeof error === 'object' && error !== null && 'code' in error && (error as { code: string }).code === 'storage/object-not-found') {
      return;
    }
    throw error;
  }
}
