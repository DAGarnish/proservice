// lib/supabaseClient.ts
// Supabase client utility and storage helper for uploading logos.
// Uses client-safe publishable keys from environment variables.

import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://pdreqrrstrzzephufxri.supabase.co';
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  'sb_publishable_ePPoJ9-WKGAlazd6Nk58jg_WAXXbteL';

export const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Uploads a compressed logo (Blob or File) to Supabase Storage.
 * Tries standard public bucket names ('logos', 'public', 'website-logos', 'images').
 * Returns the public URL of the uploaded image.
 */
export async function uploadLogoToSupabase(
  file: Blob | File,
  customFilename?: string
): Promise<string> {
  const ext =
    file.type === 'image/svg+xml'
      ? 'svg'
      : file.type === 'image/png'
      ? 'png'
      : file.type === 'image/webp'
      ? 'webp'
      : 'jpg';
  const filename =
    customFilename || `logo_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;

  const bucketsToTry = [
    process.env.NEXT_PUBLIC_SUPABASE_BUCKET,
    'webpro50',
    'logos',
    'public',
    'website-logos',
    'images',
    'assets',
  ].filter(Boolean) as string[];
  let lastError: any = null;

  for (const bucket of bucketsToTry) {
    try {
      const { data, error } = await supabase.storage.from(bucket).upload(filename, file, {
        cacheControl: '3600',
        upsert: true,
        contentType: file.type || 'image/png',
      });

      if (!error && data) {
        const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(filename);
        if (publicUrlData?.publicUrl) {
          return publicUrlData.publicUrl;
        }
      } else if (error) {
        lastError = error;
        if (!error.message?.toLowerCase().includes('not found')) {
          console.warn(`[Supabase upload warning for bucket "${bucket}"]:`, error.message);
        }
      }
    } catch (err: any) {
      lastError = err;
    }
  }

  throw new Error(
    lastError?.message ||
      'Could not upload to Supabase Storage. Please ensure a public bucket named "webpro50" exists in your Supabase dashboard!'
  );
}
