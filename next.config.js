/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                hostname: "7z3o4zlblio0tkhp.public.blob.vercel-storage.com"
            },
            {
                hostname: "firebasestorage.googleapis.com"
            }
        ]
    }
}

module.exports = nextConfig
