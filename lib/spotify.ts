'use server';

// This would normally be stored in environment variables
const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

import previewFinder from 'spotify-preview-finder';

let accessToken: string | null = null;
let tokenExpiration = 0;

async function getAccessToken() {
	// Check if we have a valid token
	if (accessToken && tokenExpiration > Date.now()) {
		return accessToken;
	}

	// Get a new token
	try {
		const response = await fetch('https://accounts.spotify.com/api/token', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				Authorization: 'Basic ' + Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64'),
			},
			body: 'grant_type=client_credentials',
		});

		if (!response.ok) {
			throw new Error('Failed to get Spotify access token');
		}

		const data = await response.json();
		accessToken = data.access_token;
		tokenExpiration = Date.now() + data.expires_in * 1000;
		return accessToken;
	} catch (error) {
		console.error('Error getting Spotify access token:', error);
		throw error;
	}
}

export async function searchSpotify(query: string, offset: number = 0, limit: number = 12, type: string = 'track') {
	try {
		const token = await getAccessToken();

		const response = await fetch(
			`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=${type}&limit=${limit}&offset=${offset}`,
			{
				headers: {
					Authorization: `Bearer ${token}`,
				},
			},
		);

		if (!response.ok) {
			throw new Error('Failed to fetch from Spotify API');
		}

		const data = await response.json();
		const resultKey = type === 'album' ? 'albums' : 'tracks';
		const results = data[resultKey];

		// Enrich track search results with previewUrl using spotify-preview-finder
		if (type !== 'album' && Array.isArray(results?.items)) {
			results.items = await Promise.all(
				results.items.map(async (item: any) => {
					try {
						const name: string = item?.name ?? '';
						const artists: string[] = Array.isArray(item?.artists) ? item.artists.map((a: any) => a?.name).filter(Boolean) : [];
						const trackId: string | undefined = item?.id;
						let previewUrl: string | null = null;
						if (name) {
							const primaryArtist = artists[0] ?? undefined;
							const pfRes = await previewFinder(name, primaryArtist, 3);
							if (pfRes && pfRes.success && Array.isArray(pfRes.results) && pfRes.results.length > 0) {
								const match = trackId ? pfRes.results.find((r: any) => r.trackId === trackId) : null;
								const chosen = match ?? pfRes.results[0];
								if (Array.isArray(chosen.previewUrls) && chosen.previewUrls.length > 0) {
									previewUrl = chosen.previewUrls[0];
								}
							}
						}
						return { ...item, previewUrl };
					} catch (e) {
						console.warn('[Spotify] Preview URL fetch failed for search item', { id: item?.id, name: item?.name, error: (e as Error).message });
						return { ...item, previewUrl: null };
					}
				})
			);
		}
		
		return {
			items: results.items,
			total: results.total,
			offset: results.offset,
			limit: results.limit,
			hasMore: results.offset + results.limit < results.total
		};
	} catch (error) {
		console.error('Error searching Spotify:', error);
		throw error;
	}
}

export async function getAlbumTracks(albumId: string) {
	try {
		const token = await getAccessToken();

		const response = await fetch(
			`https://api.spotify.com/v1/albums/${albumId}/tracks`,
			{
				headers: {
					Authorization: `Bearer ${token}`,
				},
			},
		);

		if (!response.ok) {
			throw new Error('Failed to fetch album tracks from Spotify API');
		}

		const data = await response.json();
		let items = Array.isArray(data?.items) ? data.items : [];
		// Enrich album tracks with previewUrl
		items = await Promise.all(
			items.map(async (item: any) => {
				try {
					const name: string = item?.name ?? '';
					const artists: string[] = Array.isArray(item?.artists) ? item.artists.map((a: any) => a?.name).filter(Boolean) : [];
					const trackId: string | undefined = item?.id;
					let previewUrl: string | null = null;
					if (name) {
						const primaryArtist = artists[0] ?? undefined;
						const pfRes = await previewFinder(name, primaryArtist, 3);
						if (pfRes && pfRes.success && Array.isArray(pfRes.results) && pfRes.results.length > 0) {
							const match = trackId ? pfRes.results.find((r: any) => r.trackId === trackId) : null;
							const chosen = match ?? pfRes.results[0];
							if (Array.isArray(chosen.previewUrls) && chosen.previewUrls.length > 0) {
								previewUrl = chosen.previewUrls[0];
							}
						}
					}
					return { ...item, previewUrl };
				} catch (e) {
					console.warn('[Spotify] Preview URL fetch failed for album track', { id: item?.id, name: item?.name, error: (e as Error).message });
					return { ...item, previewUrl: null };
				}
			})
		);
		return items;
	} catch (error) {
		console.error('Error fetching album tracks:', error);
		throw error;
	}
}

export async function getTrackById(trackId: string) {
  try {
    const token = await getAccessToken();
    const response = await fetch(`https://api.spotify.com/v1/tracks/${encodeURIComponent(trackId)}`, {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: 0 },
    })
    if (!response.ok) throw new Error(`Failed to fetch track ${trackId}`)
    const item = await response.json()
    // Try to enrich previewUrl if missing
    let previewUrl: string | null = item?.preview_url ?? null
    if (!previewUrl) {
      try {
        const name: string = item?.name ?? ''
        const artists: string[] = Array.isArray(item?.artists) ? item.artists.map((a: any) => a?.name).filter(Boolean) : []
        const pfRes = await previewFinder(name, artists[0] ?? undefined, 3)
        if (pfRes && pfRes.success && Array.isArray(pfRes.results) && pfRes.results.length > 0) {
          const match = pfRes.results.find((r: any) => r.trackId === trackId) || pfRes.results[0]
          if (Array.isArray(match.previewUrls) && match.previewUrls.length > 0) {
            previewUrl = match.previewUrls[0]
          }
        }
      } catch {}
    }
    return { ...item, previewUrl }
  } catch (e) {
    console.error('Error fetching track by id:', e)
    throw e
  }
}
