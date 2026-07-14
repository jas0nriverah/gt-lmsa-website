# LMSA Plus at Georgia Tech

Public website for the Latino Medical Student Association Plus Chapter at Georgia Tech. The chapter is recognized by Georgia Tech and LMSA PLUS and is preparing public programming for Fall 2026.

Live site: [gt-lmsa-website.vercel.app](https://gt-lmsa-website.vercel.app)

## What is included

- Homepage with launch information and planned activities
- About page with mission, values, LMSA history, board, and FAQ
- Programs page with an honest planned-program roadmap
- Events page separating confirmed, planned, and past events
- Resources page with official links and time-sensitive opportunity statuses
- Get Involved page with active contact methods and non-clickable Coming Soon forms
- Privacy-minimal chapter interest form at `/interest`
- Mobile quick-links page at `/links`
- Route metadata, sitemap, robots file, 404 page, keyboard focus styles, and reduced-motion support

## Routine officer updates

Most public content is maintained in one file:

```text
src/lib/site-data.ts
```

That file contains chapter identity, approved contact accounts, announcements, programs, events, board members, resources, opportunities, FAQs, involvement actions, and quick links. Its opening privacy warning applies to every update.

Research citations and review dates are maintained separately in:

```text
src/lib/source-registry.ts
```

### Publish a confirmed event

In the `events` array:

1. Replace the planned display date with confirmed information.
2. Add `time` and `location` only when verified.
3. Change `status` from `"planned"` to `"confirmed"`.
4. Add a public registration URL and change `registrationStatus` to `"active"` only when the form is approved and tested.
5. Never name a speaker, partner, or venue before confirmation.

When an event is complete, change its status to `"past"` and keep only accurate, approved information.

### How the chapter interest form works

The `/interest` page gathers a minimal set of details in the visitor's browser and prepares an email addressed to the approved chapter account. The website does not transmit or store the response, and no third-party form vendor is involved. The visitor must review and send the prepared email from their own mail app.

This approach can be replaced later with an approved Google Form or another reviewed service. Before changing it, document who owns the form, where responses are stored, who has access, how long data is retained, and which fields are actually necessary.

### Activate another form or action

Coming Soon actions intentionally have no URL. To activate one:

```ts
{
  label: "Newsletter signup",
  description: "Receive chapter announcements.",
  href: "https://approved-public-form.example",
  status: "active",
  category: "Updates",
}
```

Test the form in a private browser window before publishing. Confirm that its owner, permissions, data-request fields, privacy language, and response destination are appropriate for public use.

### Update the board

Edit `boardMembers` only after the officer approves their public name, role, description, image, and any optional contact link. Personal contact details are omitted by default.

If an approved headshot is added, place it in `public/board/` and include meaningful alt text. Do not upload contact screenshots, private messages, ID cards, class schedules, or unapproved images.

### Update resources or opportunities

For every time-sensitive item:

1. Open the official source.
2. Confirm the current cycle, audience, eligibility, award or benefit, and deadline.
3. Update the status and `lastVerified` date.
4. Update the matching source record when necessary.
5. Preserve the visible verification disclaimer.

Use `"verify-current-cycle"` when an official page is ambiguous or between cycles. A closed or uncertain opportunity must never be presented as open.

## Public contact policy

The only approved chapter contact accounts currently published are:

- Chapter email: `lmsaplusgatech@gmail.com`
- Chapter Instagram: `@lmsaplusgatech`

The creator credit links the creator's name to the approved LinkedIn profile. It does not publish a separate personal Instagram link.

Never publish personal phone numbers, private conversations, student IDs, home addresses, medical or financial information, secrets, or unapproved personal emails and social accounts.

## Page and component structure

```text
src/app/                 Next.js routes, metadata, sitemap, and global styles
src/components/          Reusable navigation, footer, cards, statuses, and sections
src/lib/site-data.ts     Officer-editable public content
src/lib/source-registry.ts  Research and verification audit record
src/lib/site-types.ts    Content data types
public/lmsa-logo.png     Current LMSA logo asset
public/board/            Future approved board images
public/images/           Future approved chapter or event images
```

## Local validation

This project uses Next.js, TypeScript, Tailwind CSS, and ESLint. When dependencies already exist, run:

```bash
npm run lint
npx tsc --noEmit
npm run build
```

Do not run `npm install` or regenerate a lockfile on the currently restricted maintenance machine. Vercel installs dependencies from `package.json` during deployment. Do not commit `.next`, `node_modules`, environment files, local logs, PDFs, or temporary attachments.

Before publishing, also review:

- Desktop and mobile layouts
- Keyboard navigation and visible focus
- Heading hierarchy and image alt text
- Reduced-motion behavior and color contrast
- Internal and external links
- Browser console and hydration warnings
- Repository-wide privacy and secret scans

## Deployment

Pushing the tracked GitHub branch triggers the existing Vercel project. Normal publishing flow:

```bash
git status
git diff --check
git add <intended-files>
git commit -m "Describe the public content update"
git push
```

After pushing, verify both the GitHub commit and the resulting Vercel deployment before announcing that the update is live.

## Remaining officer decisions

- Confirm the exact Fall 2026 interest-meeting date, time, location, and registration method
- Confirm Georgia Tech Student Organization Fair participation and logistics
- Decide whether to keep the email-based interest form or replace it with an approved hosted form
- Approve the public newsletter, mentorship, volunteer, and event-suggestion forms
- Decide local membership and graduate-student participation policies
- Approve any officer headshots or expanded public biographies
- Confirm each program before changing its status from Planned
- Re-verify time-sensitive resources and opportunities on a regular schedule
