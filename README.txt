NIKHILVERSE FIX — 15 Sep 2026

Replace these 3 files in the existing GitHub repo:
1. server/index.js
2. public/app.js
3. public/watch.html

Fixes:
- YouTube video player initialization made more reliable with origin + host and explicit error handling.
- Watch page shows YouTube view/like counts.
- Home/category cards show view/like counts.
- YouTube sync now stores public statistics and embeddable status.
- Existing watchlist/comments/resume/theater/share features retained.

After upload, Render should auto-deploy. Wait for the deploy to finish, then hard refresh the website.
The first YouTube sync after deploy will populate statistics for all synced videos; automatic sync continues every 15 minutes.
