# Simple Setup Guide - StudyBuddy

## The Easy Way (3 Steps Only!)

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Create Basic Config
```bash
echo 'SESSION_SECRET=your_secret_key_here' > .env
```

### Step 3: Start the App
```bash
npm run dev
```

**That's it!** The app will run on `http://localhost:5000`

## Test Users Already Available
- **Student**: username `salman`, password `password123`
- **Tutor**: username `shujja`, password `password123`

## What This Setup Does
- Runs the app with in-memory storage (no database needed)
- All features work normally
- Data resets when you restart the app
- Perfect for testing and development

## If You Want Persistent Data Later
1. Sign up for free PostgreSQL at https://neon.tech
2. Add this line to your .env file:
   ```
   DATABASE_URL=your_connection_string_from_neon
   ```
3. Run `npm run db:push`
4. Restart with `npm run dev`

## Common Issues & Solutions

**"npm install fails"**
- Make sure you have Node.js 18+ installed
- Try: `npm install --legacy-peer-deps`

**"Port already in use"**
- The app will find another port automatically
- Check the terminal output for the actual port

**"Module not found"**
- Delete `node_modules` folder
- Run `npm install` again

**"Cannot connect to database"**
- This is normal with the simple setup
- The app works fine without a database

## Need Help?
If it still doesn't work, tell me:
1. What operating system you're using
2. What error message you see
3. What happens when you run each command

The app is designed to work with just these 3 commands - no database setup, no Firebase, no complex configuration needed!