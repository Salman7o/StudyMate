# Vercel Deployment Guide for StudyMate

## Prerequisites
1. Install Vercel CLI: `npm i -g vercel`
2. Have a GitHub account with your StudyMate repository

## Step 1: Install Vercel CLI
```bash
npm i -g vercel
```

## Step 2: Login to Vercel
```bash
vercel login
```

## Step 3: Deploy to Vercel
```bash
vercel
```

## Step 4: Set Environment Variables
In your Vercel dashboard, go to your project settings and add these environment variables:

### Required Environment Variables:
```
DATABASE_URL=file:./dev.db
NODE_ENV=production
SESSION_SECRET=your-super-secret-session-key-here
```

### Optional Environment Variables:
```
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY=your-firebase-private-key
FIREBASE_CLIENT_EMAIL=your-firebase-client-email
```

## Step 5: Configure Database
Since Vercel uses serverless functions, you'll need to use a persistent database:

### Option A: Use Vercel Postgres (Recommended)
1. In Vercel dashboard, go to Storage tab
2. Create a new Postgres database
3. Update your `DATABASE_URL` to use the Postgres connection string

### Option B: Use External Database
- Use services like Neon, Supabase, or Railway for PostgreSQL
- Update your `DATABASE_URL` accordingly

## Step 6: Update Database Configuration
If using Postgres, update your `server/db.ts`:

```typescript
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

const connectionString = process.env.DATABASE_URL;
const client = postgres(connectionString);
export const db = drizzle(client);
```

## Step 7: Redeploy
After setting environment variables:
```bash
vercel --prod
```

## Troubleshooting

### Common Issues:
1. **Database Connection**: Make sure your database is accessible from Vercel's servers
2. **Environment Variables**: Double-check all required variables are set
3. **Build Errors**: Check Vercel build logs for any missing dependencies

### Vercel Advantages:
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Automatic deployments from Git
- ✅ Built-in analytics
- ✅ Easy environment variable management
- ✅ Serverless functions (no server management)

## Support
If you encounter issues:
1. Check Vercel deployment logs
2. Verify environment variables
3. Test database connectivity
4. Review build output for errors 