NIKHILVERSE COMPLETE OTT PAGES UPDATE

Added separate public pages:
- movies.html
- tv-shows.html
- documentaries.html
- sci-fi.html
- premium.html
- my-list.html
- search.html
- profile.html

Homepage navigation now points to the proper pages. All browse pages fetch existing /api/videos and route video cards to /watch.html?id=VIDEO_ID. Existing watch.html, playlist.html, app.js, enhancements.js, manifest and service worker are preserved. Android app download is linked in header/footer/new pages.

Do not delete existing admin/, data/, uploads/, public/assets/ or existing CSS. Replace/add the files from this package. Do not change Render environment secrets.
