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

export async function searchSpotify(query) {
	try {
		const token = await getAccessToken();

		const response = await fetch(
			`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=12`,
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
		return data.tracks.items;
	} catch (error) {
		console.error('Error searching Spotify:', error);
		throw error;
	}
}
