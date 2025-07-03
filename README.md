# StudyBuddy - Peer-to-Peer Learning Platform

## Quick Start Guide

### Prerequisites
- Node.js 18+ installed
- PostgreSQL database (or use the provided database setup)

### Installation & Setup

1. **Extract the project files**
   ```bash
   unzip studybuddy.zip
   cd studybuddy
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory with:
   ```
   DATABASE_URL=your_postgresql_connection_string
   SESSION_SECRET=your_session_secret_key
   
   # Optional: Firebase credentials for push notifications
   FIREBASE_PROJECT_ID=your_firebase_project_id
   FIREBASE_CLIENT_EMAIL=your_firebase_client_email
   FIREBASE_PRIVATE_KEY=your_firebase_private_key
   ```

   **How to get these credentials:**
   
   **For PostgreSQL:**
   - Install PostgreSQL locally or use a cloud service (Neon, Supabase, etc.)
   - Format: `postgresql://username:password@host:port/database`
   - Example: `postgresql://myuser:mypassword@localhost:5432/studybuddy`
   
   **For Firebase (optional):**
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Create a new project or select existing one
   - Go to Project Settings > Service Accounts
   - Generate new private key (downloads JSON file)
   - Copy the values from the JSON file to your .env
   
   **Session Secret:**
   - Generate a random string (at least 32 characters)
   - You can use: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

4. **Set up the database**
   ```bash
   npm run db:push
   ```

5. **Start the application**
   ```bash
   npm run dev
   ```

The application will start on `http://localhost:5000`

### Features
- Student/Tutor authentication and profiles
- Advanced search and filtering
- Bidirectional booking system
- Real-time messaging
- Session management
- Payment simulation
- Push notifications (requires Firebase setup)

### Default Test Users
- **Student**: username: `salman`, password: `password123`
- **Tutor**: username: `shujja`, password: `password123`

### Troubleshooting

**Database Issues:**
- Make sure PostgreSQL is running
- Check your DATABASE_URL in .env file
- Run `npm run db:push` to sync the database schema

**Port Issues:**
- If port 5000 is in use, the app will automatically use the next available port

**Firebase Notifications:**
- Push notifications are optional
- App will work without Firebase credentials
- To enable notifications, add Firebase credentials to .env

### Project Structure
```
├── client/          # React frontend
├── server/          # Express backend
├── shared/          # Shared types and schemas
├── package.json     # Dependencies and scripts
└── README.md        # This file
```

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run db:push` - Push database schema changes
- `npm run db:studio` - Open database studio

### Need Help?
If you encounter any issues, check the console logs for error messages and ensure all dependencies are properly installed.