# NIKHILVERSE
Production-oriented full-stack starter for nikhilverse.media.

## Run
1. Install Node.js 18+.
2. Copy `.env.example` to `.env` and set a strong JWT_SECRET and admin credentials.
3. `npm install`
4. `npm start`
5. Public site: http://localhost:3000
6. Admin: http://localhost:3000/admin/

## Live integrations
- YouTube auto-sync: add YOUTUBE_API_KEY and implement/schedule the channel uploads sync in `server/index.js` (channel IDs should be resolved from the supplied handles).
- Razorpay: add RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET and RAZORPAY_WEBHOOK_SECRET; implement live order creation + signature verification + subscription webhooks before accepting real money.
- OpenAI: add OPENAI_API_KEY and replace the demo `/api/ai` response with your chosen current OpenAI API call. Keep key server-side only.
- Image upload: admin upload endpoint uses multer and stores files in `/uploads`; for production use object storage/CDN.
- HTTPS, reverse proxy, backups, rate limits, secure cookies, CSRF strategy and production database/storage should be configured before public launch.

## Pricing
Plans are configurable in the DB/admin API. The supplied inputs 99/199/299 are seeded as configurable values rather than assuming a monthly/yearly mapping.
