# NIKHILVERSE — YouTube Stats & Comments Fix

## Included fixes
- YouTube view / like / comment counts on video cards across Movies, TV Shows, Documentaries, Sci-Fi, Search, My List and Playlist pages.
- Watch page shows live public YouTube statistics.
- YouTube public comments are loaded into the Discussion / Theory Room.
- Official `Watch on YouTube` buttons are added to cards and the home hero carousel.
- Home page now shows both channels separately plus combined totals:
  - Total channel views
  - Subscribers
  - Total public videos
  - Rolling last-24-hour view delta from stored channel-view snapshots
- Channel stats refresh every 2 minutes in the browser and the server keeps snapshots while the Render instance is awake.
- YouTube stats are refreshed through the YouTube Data API.

## Render environment variables
Keep the existing variables:
- `YOUTUBE_API_KEY`
- `JWT_SECRET`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `OPENAI_API_KEY`
- `OPENAI_MODEL`
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`

Optional, only if you want the site to publish comments to YouTube from the channel account:
- `YOUTUBE_CLIENT_ID`
- `YOUTUBE_CLIENT_SECRET`
- `YOUTUBE_REFRESH_TOKEN`

The refresh token must be obtained through Google OAuth with the YouTube write scope. Never put it in frontend JavaScript or commit it to GitHub.

## Important YouTube limitation
A public API key can read public video statistics and public comments. Creating a YouTube comment is a write operation and requires OAuth authorization. The site therefore has:
- **Post Comment** = NIKHILVERSE website-local discussion.
- **Post as NIKHILVERSE on YouTube** = optional owner-authorized YouTube comment endpoint.

A visitor's website comment cannot honestly be mirrored to YouTube as that visitor without that visitor authorizing their own Google/YouTube account. The YouTube API requires OAuth for comment insertion.

## Last 24 hours
The YouTube Data API gives current channel `viewCount`, `subscriberCount` and `videoCount`. It does not provide a real-time rolling 24-hour counter. This build stores periodic channel-view snapshots and calculates the rolling delta. On a fresh deployment, the 24-hour value will show **Collecting…** until enough history exists. This is intentional rather than inventing a number.

## Deploy
1. Replace the project files with this ZIP's files.
2. Push to GitHub.
3. Render deploys automatically.
4. Open the site in an incognito/private tab or hard-refresh the browser.
5. Run YouTube Sync once from the admin panel if `channel_id` data has not been stored yet.

## YouTube API quota
Video statistics are batched in groups of up to 50 video IDs. Public comments are fetched only for the video currently opened on the watch page. Avoid aggressive polling.
