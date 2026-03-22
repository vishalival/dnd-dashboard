# Local Development & Testing

## Prerequisites
- Docker (for PostgreSQL)
- Node.js
- npm

## Database Setup
1. Start PostgreSQL via Docker:
   ```bash
   docker run -d --name dnd-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=dnd_dashboard -p 5432:5432 postgres:15
   ```
2. Verify it's running:
   ```bash
   docker exec dnd-postgres pg_isready -U postgres
   ```

## Environment Variables
Create `.env.local` in the project root with:
```
POSTGRES_PRISMA_URL="postgresql://postgres:postgres@localhost:5432/dnd_dashboard"
POSTGRES_URL_NON_POOLING="postgresql://postgres:postgres@localhost:5432/dnd_dashboard"
ANTHROPIC_API_KEY="<your-api-key>"
```

Note: `ANTHROPIC_API_KEY` is stored as a secret. Do not hardcode it.

## Schema Sync
After setting env vars, push the Prisma schema:
```bash
export POSTGRES_PRISMA_URL="postgresql://postgres:postgres@localhost:5432/dnd_dashboard"
export POSTGRES_URL_NON_POOLING="postgresql://postgres:postgres@localhost:5432/dnd_dashboard"
npx prisma db push
```

## Running the Dev Server
```bash
npm run dev
```
The app runs at http://localhost:3000.

## Key Flows
- **Onboarding**: If no campaign exists in DB, root `/` redirects to `/onboard`. Upload a zip file with .docx/.txt/.md files. The zip is extracted client-side (JSZip + mammoth), then text is sent as JSON to `/api/onboard`.
- **Reset**: Sidebar has a "Reset Campaign" button that calls `/api/reset` and redirects to `/onboard`.
- **Dashboard**: After onboarding, `/dashboard` shows campaign data.

## Build & Lint
```bash
npx next build   # TypeScript + build check
npm run lint     # ESLint
```

## Deployment
- Deployed on Vercel at https://arcmind-dnd.vercel.app
- Production branch: `devin/1774119187-dm-dashboard-app`
- Vercel preview URLs require authentication; test locally for PR previews
- Build script includes `prisma db push` before `next build`

## Known Issues
- Vercel free tier has 4.5 MB payload limit for serverless functions
- Vercel free tier has 10s function timeout (maxDuration config only works on Pro+)
- Deepgram API key may show FORBIDDEN errors in build logs (unrelated to core functionality)
