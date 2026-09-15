NIKHILVERSE VIDEO INTERNAL FIX

Replace in GitHub:
public/index.html
public/app.js
public/watch.html
public/playlist.html
server/index.js

This version preserves YouTube auto-sync, makes all home video cards and hero slides open /watch.html?id=VIDEO_ID instead of YouTube, fixes the logo path, and adds /api/playlists plus /api/playlist for internal playlist pages.
Do not change Render environment secrets. Commit to main, wait for Render deploy, then hard refresh with Ctrl+F5.
