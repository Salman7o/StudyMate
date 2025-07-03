# StudyBuddy - Peer-to-Peer Learning Platform

## Super Simple Setup (Just 3 Commands!)

### Prerequisites
- Node.js 18+ installed (Download from nodejs.org)

### Installation & Setup

1. **Extract and navigate to the project**
   ```bash
   unzip studybuddy.zip
   cd studybuddy
   ```

2. **Run the automatic setup**
   ```bash
   node start.js
   ```

**That's it!** The app will:
- Install all dependencies automatically
- Create the needed configuration files
- Start the application on `http://localhost:5000`

### Alternative Manual Setup (if automatic doesn't work)

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Create config file**
   ```bash
   echo "SESSION_SECRET=studybuddy_secret_key_12345" > .env
   ```

3. **Start the app**
   ```bash
   npm run dev
   ```

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