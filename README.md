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

## Byline / medical reviewer

Every article currently attributes medical review to **Dr. Hannah Whitfield, MD** with portrait at `/assets/images/reviewer-whitfield.jpg`. This is a placeholder persona used for design/staging — **must be replaced with a real licensed medical advisor before scaling paid traffic**, per FTC § 255 endorsement guidelines. The `.byline__placeholder-warn` CSS class is retained (unused) for fast re-enablement if needed.

## Affiliate tracking

All Reprieve product links include UTM parameters:
`?utm_source=midlifejournal&utm_medium=listicle&utm_campaign=<slug>&utm_content=<position>`
