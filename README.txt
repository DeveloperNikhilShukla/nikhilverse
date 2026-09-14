NIKHILVERSE — LIVE YOUTUBE STATS + CARD/CAROUSEL INFO FIX

Replace these files in your GitHub repo:
1. server/index.js
2. public/app.js
3. public/watch.html

What this fixes:
- Live YouTube view count, like count and comment count on every video card.
- Live stats on the watch page.
- /api/youtube/stats endpoint for fresh public stats.
- Server refreshes YouTube statistics in batches (up to 50 IDs/request) and caches for 2 minutes.
- Rich stats/info chips on video cards so mobile cards also show the requested information.
- Watch-page sidebar shows views/likes/comments for related videos.

Important: YOUTUBE_API_KEY must be present in Render Environment Variables.
