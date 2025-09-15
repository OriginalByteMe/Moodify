import { NextRequest, NextResponse } from 'next/server';
import { fetchTracksFromDatabase, uploadTracksToDatabase, patchTrack } from '@/lib/database-handler';
import type { SpotifyTrack } from '@/app/utils/interfaces';

const ANALYZER_URL = process.env.AUDIO_ANALYZER_URL || 'https://originalbyteme--ai-audio-features-web-app.modal.run';

async function analyzePreviewUrl(previewUrl?: string | null) {
  if (!previewUrl) return null;
  try {
    const url = `${ANALYZER_URL}/analyze?url=${encodeURIComponent(previewUrl)}`;
    const res = await fetch(url, { next: { revalidate: 0 } });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      console.warn('[Analyzer] Non-OK response', res.status, text);
      return null;
    }
    const data = await res.json();
    // Expecting shape compatible with backend fields
    return data as Partial<SpotifyTrack>;
  } catch (err) {
    console.warn('[Analyzer] Failed to analyze preview URL', err);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const data = await fetchTracksFromDatabase([request.nextUrl.searchParams.get('id') || '']);
    return NextResponse.json({ track: data }, { status: 200 });
  } catch (error) {
    console.error('Error fetching from database:', error);
    return NextResponse.json(
      { error: 'Failed to fetch from database' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tracks } = body as { tracks: SpotifyTrack[] };
    if (!Array.isArray(tracks)) {
      return NextResponse.json({ error: 'Invalid payload: tracks must be an array' }, { status: 400 });
    }

    // Enrich each track with audio features when a previewUrl is available
    const enriched = await Promise.all(
      tracks.map(async (t) => {
        const features = await analyzePreviewUrl(t.previewUrl);
        if (features) {
          return {
            ...t,
            // Map all supported audio features; extra fields will be ignored by backend
            danceability: features.danceability,
            energy: features.energy,
            key: features.key,
            loudness: features.loudness,
            mode: features.mode,
            speechiness: features.speechiness,
            acousticness: features.acousticness,
            instrumentalness: features.instrumentalness,
            liveness: features.liveness,
            valence: features.valence,
            tempo: features.tempo,
            time_signature: features.time_signature,
            duration_ms: features.duration_ms ?? t.duration_ms,
            audio_features_status: 'imported',
          } as SpotifyTrack;
        }
        return t;
      })
    );

    const bulkResult = await uploadTracksToDatabase(enriched);

    // If any tracks were skipped (already existed), attempt to patch them with features/palette we just computed
    try {
      const skipped = bulkResult?.skipped?.tracks as Array<{ id: number; spotifyId: string }> | undefined;
      if (Array.isArray(skipped) && skipped.length > 0) {
        const bySpotifyId = new Map<string, SpotifyTrack>();
        for (const t of enriched) bySpotifyId.set(t.id, t);
        await Promise.all(
          skipped.map(async (s) => {
            const original = bySpotifyId.get(s.spotifyId);
            if (!original) return;
            const payload: any = {};
            // Send palette if present
            if (Array.isArray(original.colourPalette)) payload.colourPalette = original.colourPalette;
            // Send audio features if present
            const keys: (keyof SpotifyTrack)[] = [
              'danceability','energy','key','loudness','mode','speechiness','acousticness','instrumentalness','liveness','valence','tempo','time_signature','duration_ms','audio_features_status'
            ];
            for (const k of keys) {
              const val = original[k];
              if (val !== undefined && val !== null) payload[k] = val as any;
            }
            if (Object.keys(payload).length > 0) {
              await patchTrack(s.spotifyId, payload).catch((e) => console.warn('[PatchTrack] Failed', s.spotifyId, e));
            }
          })
        );
      }
    } catch (e) {
      console.warn('[BulkPatch] Skipped patch stage due to error', e);
    }

    return NextResponse.json({ tracks: bulkResult }, { status: 200 });
  } catch (error) {
    console.error('Error uploading to database:', error);
    return NextResponse.json(
      { error: 'Failed to upload to database' },
      { status: 500 }
    );
  }
}


    
