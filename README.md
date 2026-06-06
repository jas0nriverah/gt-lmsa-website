# Georgia Tech LMSA Website

A modern, responsive website for the Georgia Tech chapter of the Latino Medical
Student Association (LMSA). Built with Next.js, TypeScript, and Tailwind CSS, and
organized so non-technical chapter officers can keep it up to date.

---

## How to Edit This Site (for Officers)

You do NOT need coding experience to update this website. Almost everything you
will want to change lives in ONE file:

```
src/lib/site-data.ts
```

Open that file and you will find clearly labeled, commented sections for:

| What you want to change | Where to edit in `src/lib/site-data.ts` |
| ----------------------- | --------------------------------------- |
| Email, Instagram, join form links | the `contactLinks` section |
| Upcoming events | the `events` section |
| Executive board members | the `boardMembers` section |
| Resources and links | the `resourceCategories` section |
| Mission / about text | the `mission` and `whyItMatters` sections |
| "What We Do" cards | the `impactAreas` section |
| Hero quick facts | the `heroStats` section |

### The 3-step update process

1. Edit the text inside the quotation marks in `src/lib/site-data.ts`.
2. Commit and push your change to GitHub:
   ```bash
   git add .
   git commit --trailer "Co-authored-by: Cursor <cursoragent@cursor.com>" -m "Update events for fall semester"
   git push
   ```
3. That's it. **Vercel automatically rebuilds and publishes the live site**,
   usually within about a minute. You do not need to run any build commands.

> Tip: To add a new event or board member, copy an existing `{ ... }` block,
> paste it, and edit the copy. To remove one, delete its whole `{ ... }` block.

---

## Tech Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Logo image at `public/lmsa-logo.png`

## Run Locally (Optional, for Developers)

```bash
npm install
npm run dev
```

Then open http://localhost:3000 in your browser.

Other commands:

```bash
npm run build   # production build
npm run lint    # check code
```

## Deploy to Vercel (Team)

This project uses Vercel default Next.js settings. No environment variables are
required for the current site.

### 1. Push code to GitHub

```bash
git add .
git commit --trailer "Co-authored-by: Cursor <cursoragent@cursor.com>" -m "Update site"
git push -u origin main
```

Repository: https://github.com/jas0nriverah/gt-lmsa-website

### 2. Import into your Vercel team

1. Open https://vercel.com/new and switch to your Team in the account switcher.
2. Click Import on `jas0nriverah/gt-lmsa-website`.
3. Confirm the defaults (Framework: Next.js, Build: next build, Install: npm install).
4. Click Deploy.

### 3. After deploy

- Pushes to `main` deploy to Production automatically.
- Pull requests and other branches get Preview URLs.

### 4. Optional custom domain

In Vercel: Settings -> Domains -> add your chapter domain and follow the DNS steps.

## Where To Edit Page Copy (Developers)

Most text lives in `src/lib/site-data.ts`. Longer marketing copy and section
layout live in:

- `src/app/page.tsx` (homepage sections)
- `src/components/Footer.tsx` (footer)
- `src/components/Navbar.tsx` (navigation)

## Brand Colors

Defined in `src/app/globals.css`:

- Georgia Tech Navy: `#003057`
- Tech Gold: `#B3A369`
- Dark Gold: `#857437`
- White: `#FFFFFF`
- Soft off-white: `#F8F7F2`

Use navy for primary text on light backgrounds and dark gold for accents.
Standard gold is reserved for borders, dividers, and decorative elements because
it does not have enough contrast as body text on white.

## Logo

Stored at `public/lmsa-logo.png`. Replace that file (keep the same name) to
update the logo everywhere without code changes.