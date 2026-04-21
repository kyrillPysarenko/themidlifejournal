# The Midlife Journal

Static editorial site for `themidlifejournal.com`. Feeds affiliate traffic to Reprieve.

## Stack

- Plain HTML + CSS (no build step)
- Deployed on Vercel
- Free Google Fonts: Playfair Display, Source Serif Pro, Inter
- Entity-separation from Reprieve: different typography + different color palette

## Structure

```
/                               → index.html (homepage)
/articles/5-signs-cortisol-after-40/     → Listicle #1
/articles/why-women-wake-at-3am-after-40/ → Listicle #2
/about/                         → Editorial standards
/disclosure/                    → Affiliate disclosure (FTC-compliant)
/privacy/                       → Privacy policy
/contact/                       → Contact page
/assets/logo.svg                → Wordmark
/assets/favicon.svg             → Favicon
/assets/styles.css              → All styles
```

## Deploy

Auto-deploys to Vercel on push to `main`. Production domain: `themidlifejournal.com`.

## Content updates

Articles are plain HTML. Edit the file in `articles/<slug>/index.html`. Push to main. Vercel rebuilds.

## Byline placeholder

Every article has a byline block marked `⚠ Placeholder — replace with real advisor before scaling traffic.` Replace `[FIRSTNAME LASTNAME]`, `[SPECIALTY]`, etc. with a real licensed medical advisor once one is onboarded. Remove the placeholder-warning div.

## Affiliate tracking

All Reprieve product links include UTM parameters:
`?utm_source=midlifejournal&utm_medium=listicle&utm_campaign=<slug>&utm_content=<position>`
