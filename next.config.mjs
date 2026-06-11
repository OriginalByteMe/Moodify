/** @type {import('next').NextConfig} */
const nextConfig = {
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'i.scdn.co',
				pathname: '/**',
			},
			// Local fixture/dev servers (visual lab, e2e tests)
			{
				protocol: 'http',
				hostname: 'localhost',
				pathname: '/**',
			},
		],
	},
};

export default nextConfig;
