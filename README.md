# Akshay & Akshara — Wedding Invitation (18 November 2026)

Static site (HTML, CSS, vanilla JS). No build step. Host the folder on any static host
(Netlify, Vercel, Cloudflare Pages, GitHub Pages) — or just open `index.html` through any local web server.

## Before going live
1. **OG / WhatsApp preview** — in `index.html`, replace `YOUR-DOMAIN` (3 places) with the live address.
   The 1200×630 image is `assets/og/og-image.jpg`.
2. **RSVP → Google Sheets** — follow `google-sheets/SETUP.md` (paste `Code.gs` into Apps Script, deploy as a web app,
   put the URL in `config.js` → `rsvp.sheetsUrl`). Responses land in your private sheet; duplicates by phone number are rejected.
3. **John's Village** — in `config.js` → `johnsVillage`, fill in `date`, `time`, `venueName`, `address` and `mapsUrl` once confirmed.
   Empty fields are not shown, and the directions button stays hidden until `mapsUrl` is set. The RSVP scope is `wedding`.
4. **Music** — add a licensed track and set `music.src` in `config.js`; the toggle stays hidden until then.

## Handy
- `?skip=1` on the URL skips the opening animation (useful for testing).
- `source-assets/` holds the untouched originals; it is not needed on the live site.
- Fonts (Cormorant Garamond, Great Vibes, EB Garamond, Manrope) are the Google Fonts files, self-hosted for speed.
