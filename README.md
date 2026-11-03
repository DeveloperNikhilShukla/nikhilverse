# SIRAJ TIMES – Frontend Prototype

## Included
- Responsive Hindi + English news homepage
- Location selector (demo interaction)
- Local news section and permanently prominent Lucknow section
- National news, trending/newsletter placeholders
- YouTube Video News section configured for:
  - Channel: https://www.youtube.com/@satyaghoshnewsmedia
  - Publishing mode: automatically publish all new public videos
- Footer policy/navigation links

## Important: YouTube sync status
The current `index.html` is a frontend prototype. It displays the connected channel identity and the intended auto-sync behavior, but it does **not** fetch or publish live YouTube videos yet.

To activate real automatic publishing, implement a server-side integration:
1. Resolve the channel handle to a stable YouTube Channel ID.
2. Use YouTube Data API v3 to identify the channel's Uploads playlist and retrieve recent public uploads.
3. Run a scheduled backend sync (for example, every 5–15 minutes) or a YouTube push notification subscription where supported.
4. Store video IDs uniquely in a `youtube_videos` table to prevent duplicates.
5. Automatically publish public uploads to the website's Video News section; refresh title, thumbnail, publish date and visibility.
6. Keep API credentials on the server only. Never expose API keys or OAuth secrets in browser JavaScript.
7. Respect YouTube API quota, deleted/private video status, and YouTube embedding restrictions.

## Suggested database tables
- `users`: admin and reporter accounts, roles, password hashes
- `articles`: headline, slug, body, language, category, city, status, author, approver, published_at
- `categories`: category names and language labels
- `cities`: city, district, state, priority
- `article_media`: article image/video assets
- `youtube_channels`: channel_id, handle, channel_url, enabled, sync_mode, last_synced_at
- `youtube_videos`: video_id (unique), channel_id, title, description, thumbnail_url, published_at, visibility, status, embed_url
- `youtube_sync_logs`: sync_started_at, sync_finished_at, result, error_message
- `ads`: placement, creative, target_page, active dates
- `epapers`: issue_date, language, pdf_url, status

## Editorial workflow
Reporter-submitted articles remain pending until an Admin approves them. The selected YouTube rule is separate: new public videos from the configured channel are automatically published to the Video News section.

## Domain
Planned domain: sirajtimes.com. Domain ownership, DNS, hosting and production deployment are not configured by this prototype.
