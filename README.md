## Kitchen Compliance Log — rotating PINs

Cook and manager PINs are never stored in this repo — `npx prisma db seed`
reads them from environment variables (see `.env.example` for the full
list) and fails with a clear error if any are missing.

**To rotate a PIN** (a person leaves, a PIN leaks, routine rotation):

1. Generate a fresh 6-8 digit PIN. Do not reuse anything that has ever
   appeared in chat, a screenshot, or a commit — treat those as burned.
   A quick way to generate one locally: `node -e "console.log(String(Math.floor(100000 + Math.random() * 900000)))"`.
2. Update the corresponding variable:
   - Locally, edit `.env`.
   - In production, update the variable in the Vercel project's
     Environment Variables settings (Production scope).
3. Re-run the seed against whichever database you changed the variable
   for: `npx prisma db seed`. This updates the PIN hash for that account;
   every other cook/manager and all existing records are untouched.
4. Tell the affected person their new PIN directly (in person or a DM) —
   never over a channel that gets logged/archived indefinitely if you can
   help it.

Seed output never prints PIN values by default. Set `SEED_PRINT_PINS=true`
locally (never in production) if you need the seed command to echo them
back to you after a run.

---

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
