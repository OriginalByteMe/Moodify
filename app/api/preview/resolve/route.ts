import { NextRequest, NextResponse } from 'next/server';
import previewFinder from 'spotify-preview-finder';

/**
 * Resolve a playable 30s preview for a track, trying:
 * 1. spotify-preview-finder (scrapes Spotify's embed previews)
 * 2. iTunes Search API (Apple's 30s previews, m4a — plays fine in <audio>)
 *
 * GET /api/preview/resolve?title=...&artist=...&id=<spotifyTrackId>
 */

function normalize(value: string): string {
  return value
    .toLowerCase()
    .replace(/\(.*?\)|\[.*?\]/g, '') // drop "(feat. X)" / "[Remix]" qualifiers
    .replace(/[^a-z0-9 ]/g, '')
    .trim();
}

async function resolveFromItunes(title: string, artist: string): Promise<string | null> {
  try {
    const term = encodeURIComponent(`${title} ${artist}`.trim());
    const res = await fetch(
      `https://itunes.apple.com/search?term=${term}&media=music&entity=song&limit=5`,
      { next: { revalidate: 60 * 60 } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const results: any[] = Array.isArray(data?.results) ? data.results : [];
    const wantedTitle = normalize(title);
    const wantedArtist = normalize(artist);
    const match = results.find((r) => {
      const gotTitle = normalize(r?.trackName ?? '');
      const gotArtist = normalize(r?.artistName ?? '');
      return (
        r?.previewUrl &&
        (gotTitle.includes(wantedTitle) || wantedTitle.includes(gotTitle)) &&
        (!wantedArtist || gotArtist.includes(wantedArtist) || wantedArtist.includes(gotArtist))
      );
    });
    return match?.previewUrl ?? results.find((r) => r?.previewUrl)?.previewUrl ?? null;
  } catch (err) {
    console.warn('[PreviewResolver] iTunes lookup failed', err);
    return null;
  }
}

export async function GET(request: NextRequest) {
  const title = request.nextUrl.searchParams.get('title') ?? '';
  const artist = request.nextUrl.searchParams.get('artist') ?? '';
  const trackId = request.nextUrl.searchParams.get('id') ?? '';

  if (!title) {
    return NextResponse.json({ error: 'title is required' }, { status: 400 });
  }

  // 1. spotify-preview-finder
  try {
    const pfRes = await previewFinder(title, artist || undefined, 3);
    if (pfRes?.success && Array.isArray(pfRes.results) && pfRes.results.length > 0) {
      const match = trackId ? pfRes.results.find((r: any) => r.trackId === trackId) : null;
      const chosen = match ?? pfRes.results[0];
      if (Array.isArray(chosen?.previewUrls) && chosen.previewUrls.length > 0) {
        return NextResponse.json({ previewUrl: chosen.previewUrls[0], source: 'spotify' });
      }
    }
  } catch (err) {
    console.warn('[PreviewResolver] spotify-preview-finder failed', err);
  }

  // 2. iTunes fallback
  const itunesUrl = await resolveFromItunes(title, artist);
  if (itunesUrl) {
    return NextResponse.json({ previewUrl: itunesUrl, source: 'itunes' });
  }

  return NextResponse.json({ previewUrl: null, source: null }, { status: 404 });
}
