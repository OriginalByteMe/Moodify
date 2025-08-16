'use server';

// This would normally be stored in environment variables
const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

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
		return data.items;
	} catch (error) {
		console.error('Error fetching album tracks:', error);
		throw error;
	}
}
