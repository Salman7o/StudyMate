# Complete Setup Guide for StudyBuddy

## Option 1: Quick Start (No Database Setup Required)

If you just want to test the application quickly without setting up a database:

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create minimal .env file:**
   ```bash
   echo "SESSION_SECRET=quick_test_secret_key_12345" > .env
   ```

3. **Start the app:**
   ```bash
   npm run dev
   ```

The app will run in memory-only mode (data won't persist between restarts, but everything will work for testing).

## Option 2: Full Setup with Database

### Step 1: Get PostgreSQL Database

**Option A: Local PostgreSQL**
1. Install PostgreSQL on your system
2. Create a database named `studybuddy`
3. Your connection string will be: `postgresql://username:password@localhost:5432/studybuddy`

**Option B: Cloud Database (Recommended)**
1. Sign up for a free database at:
   - [Neon](https://neon.tech) - Free PostgreSQL
   - [Supabase](https://supabase.com) - Free PostgreSQL
   - [Railway](https://railway.app) - Free PostgreSQL
2. Create a new database
3. Copy the connection string they provide

### Step 2: Get Firebase Credentials (Optional)

Only needed if you want push notifications:

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project
3. Go to Project Settings → Service Accounts
4. Click "Generate new private key"
5. Download the JSON file
6. Copy these values from the JSON:
   - `project_id` → FIREBASE_PROJECT_ID
   - `client_email` → FIREBASE_CLIENT_EMAIL
   - `private_key` → FIREBASE_PRIVATE_KEY

### Step 3: Create .env File

```env
# Required
DATABASE_URL=your_postgresql_connection_string_here
SESSION_SECRET=your_random_secret_key_here

# Optional (for push notifications)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_client_email
FIREBASE_PRIVATE_KEY=your_private_key
```

### Step 4: Initialize Database

```bash
npm run db:push
```

### Step 5: Start Application

```bash
npm run dev
```

## Default Test Users

The app includes these pre-configured users:

**Student Account:**
- Username: `salman`
- Password: `password123`

**Tutor Account:**
- Username: `shujja`
- Password: `password123`

## Troubleshooting

**"Database connection failed"**
- Check your DATABASE_URL is correct
- Ensure your database is running
- Try the memory-only option first

**"Firebase initialization failed"**
- This is normal if you haven't set up Firebase
- The app works without Firebase (just no push notifications)

**"Port already in use"**
- The app will automatically find an available port
- Check the console output for the actual port number

**"Module not found"**
- Run `npm install` to ensure all dependencies are installed
- Delete `node_modules` and `package-lock.json`, then run `npm install` again

## Need Help?

If you encounter issues:
1. Check the console for error messages
2. Ensure all dependencies are installed (`npm install`)
3. Try the memory-only setup first
4. Make sure you're using Node.js 18+