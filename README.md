# LMSA Plus Chapter at Georgia Tech Website

This is the website project for the **LMSA Plus Chapter at Georgia Tech**,
formally written as the **Latino Medical Student Association Plus Chapter at
Georgia Tech**.

The site is designed to feel polished, official, warm, and easy for chapter
officers to maintain. It uses Georgia Tech colors, the LMSA logo, and editable
content files so Stacy and future officers can update the site through Cursor
without needing to learn advanced web development.

## Very Important Warning

Do **not** run `npm install` locally on Jason's Windows laptop unless the npm
issue is fixed. Vercel handles installation and builds online after changes are
pushed to GitHub.

For regular website updates, Stacy/officers should only:

1. Edit the needed content.
2. Commit the change.
3. Push to GitHub.
4. Let Vercel automatically rebuild and publish the live site.

## How the Website Is Structured

The most important parts are:

- `src/app/page.tsx` - the main homepage layout.
- `src/app/links/page.tsx` - the mobile-friendly Linktree-style links page.
- `src/lib/site-data.ts` - the main content file Stacy/officers should edit.
- `src/components/` - reusable design pieces like cards, navbar, and footer.
- `public/lmsa-logo.png` - the current LMSA logo.
- `public/images/` - future approved chapter/event photos.
- `public/board/` - future officer headshots.

Most normal edits should happen in **one file**:

```text
src/lib/site-data.ts
```

That file has numbered sections and comments explaining what to edit.

## Simple Editing Workflow for Stacy

1. Open the project in Cursor.
2. Ask Cursor something specific, like:
   - "Update the next General Body Meeting date to September 12 at 6 PM."
   - "Replace the membership form coming soon link with this Google Form URL."
   - "Add a new board member named ___ with the role ___."
3. Review the changes in `src/lib/site-data.ts`.
4. Commit and push to GitHub:

```bash
git add .
git commit -m "Update LMSA Plus website content"
git push
```

5. Vercel automatically updates the live website after the push.

## Where To Edit Main Chapter Information

Open `src/lib/site-data.ts` and edit:

```text
1. CHAPTER IDENTITY
```

This controls the short chapter name, full chapter name, founding year,
recognition status, hero headline, and preferred wording.

## Where To Edit Email, Instagram, and Forms

Open `src/lib/site-data.ts` and edit:

```text
2. CONTACT LINKS
```

This controls:

- Chapter email: `lmsaplusgatech@gmail.com`
- Instagram URL: `https://www.instagram.com/lmsaplusgatech/`
- Instagram handle: `@lmsaplusgatech`
- Membership / Google Form link
- Mentorship form link
- Newsletter signup form link

Right now, membership, mentorship, and newsletter links are marked as **Coming
soon**. When the real forms are ready:

1. Replace `"#contact"` or `"#newsletter"` with the full Google Form URL.
2. Change the matching `comingSoon` value from `true` to `false`.
3. Update the label text if needed.

Example:

```ts
membershipForm: "https://forms.gle/REAL_FORM_URL",
membershipLabel: "Join LMSA Plus",
membershipComingSoon: false,
```

## Where To Edit Events

Open `src/lib/site-data.ts` and edit:

```text
8. EVENTS
```

Each event has `date`, `tag`, `title`, `time`, `location`, and `description`.
Current events are templates with TBD details. Replace TBD values when events are
confirmed.

## Where To Edit Officers / Board Members

Open `src/lib/site-data.ts` and edit:

```text
9. EXECUTIVE BOARD
```

Current listed officer:

- Stacy Lomeli - President & Founder
- LinkedIn: `https://www.linkedin.com/in/stacylomeli/?skipRedirect=true`
- Instagram: `https://www.instagram.com/sta.acyy_/`

Additional officers are placeholders. When more officers are ready, replace the
placeholder cards with real names, roles, bios, optional emails, optional social
links, and optional headshot paths.

Headshots should go in:

```text
public/board/
```

Example future image path:

```ts
image: "/board/stacy-lomeli.jpg",
```

## Where To Edit Resources

Open `src/lib/site-data.ts` and edit:

```text
10. OFFICIAL RESOURCES
```

Current resources use official/relevant links only:

- Georgia Tech Pre-Health Advising
- Georgia Tech Academic Success & Advising
- Georgia Tech Find Your Advisor
- LMSA National
- LMSA National Join page
- LMSA Southeast
- LMSA Southeast Events
- LMSA Southeast Regional Conference

Do not add scholarships or MCAT links yet unless the chapter is ready to curate
them carefully.

## Where To Edit the Linktree-Style `/links` Page

The `/links` page is a simple mobile-friendly page for Instagram bios.

Open `src/lib/site-data.ts` and edit:

```text
12. LINKTREE-STYLE /links PAGE
```

Current buttons include Instagram, email, the main website, membership form
coming soon, mentorship form coming soon, newsletter signup coming soon, GT
Pre-Health Advising, LMSA National, and LMSA Southeast.

The page itself lives at:

```text
src/app/links/page.tsx
```

Most updates should not require editing that page directly.

## Where To Add Photos or Logos Later

Use only approved chapter photos, approved event photos, officer headshots, or
logos you have permission to use. Do not use random images from Google Images.

Recommended folders:

```text
public/images/   future approved chapter/event photos
public/board/    future officer headshots
```

Current logo:

```text
public/lmsa-logo.png
```

If you get a higher-resolution transparent LMSA logo, replace
`public/lmsa-logo.png` with the new file using the same file name.

## Information Still Needed

The website is ready, but it will be stronger once the chapter has:

- Final membership Google Form URL
- Final mentorship form URL
- Final newsletter signup form URL
- Full executive board names and roles
- Officer bios and headshots
- Real event dates, times, and locations
- Higher-resolution transparent LMSA logo
- Approved chapter/event photos
- Any official Georgia Tech LMSA Plus wording or constitution language
- Any official chapter domain or preferred URL

## Brand Colors

The brand colors are defined in `src/app/globals.css`.

- GT Navy: `#003057`
- Tech Gold: `#B3A369`
- Dark Gold: `#857437`
- White: `#FFFFFF`
- Soft off-white: `#F8F7F2`

Use navy for important text and gold as an accent. Standard Tech Gold should not
be used as small body text on white because it does not have enough contrast.

## Deployment

The site deploys through Vercel.

Normal process:

1. Edit files in Cursor.
2. Commit and push to GitHub.
3. Vercel automatically installs dependencies and builds online.
4. The live site updates after the deployment finishes.

No local dependency commands are needed for routine updates.

## Technical Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Vercel deployment

Developers can edit layout/design in `src/app/page.tsx`,
`src/app/links/page.tsx`, `src/components/`, and `src/app/globals.css`.

Stacy/officers should usually edit `src/lib/site-data.ts`.
