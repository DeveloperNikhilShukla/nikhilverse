# NIKHILVERSE Update

Implemented in this build:

- Live YouTube video view/like refresh through the backend YouTube Data API.
- Channel totals: views, subscribers, videos.
- Last-24-hours channel views using persistent server snapshots while the Render process is running.
- Smart "More from NIKHILVERSE": current video excluded, related topics/categories prioritized, random fallback, shuffled order and duplicate protection.
- Dynamic watch-page title, description, canonical URL, Open Graph/Twitter metadata and VideoObject JSON-LD.
- Organization/WebSite schema on the home page.
- SEO metadata on the main category/static pages.
- Dynamic sitemap.xml containing static pages and published video watch URLs.
- robots.txt.
- Server-side caching for YouTube stats to reduce API quota usage.

Important:
- `last 24 hours` is a near-real-time snapshot estimate. YouTube Analytics reports are not real-time.
- The first 24 hours after deployment may show `Collecting…` until a 24-hour baseline exists.
- Keep `YOUTUBE_API_KEY` in Render Environment Variables. Never put the key in frontend code.
- Production canonical domain is configured as https://nikhilverse.onrender.com/
