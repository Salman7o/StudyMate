# StudyBuddy - Peer-to-Peer Learning Platform

## Project Overview
A dynamic peer-to-peer learning platform connecting university students with expert tutors through an advanced session matching and booking system.

**Current Status**: Fully functional with Firebase Cloud Messaging notification system implemented.

## Tech Stack
- **Frontend**: React with TypeScript, Tailwind CSS, shadcn/ui components
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Real-time**: WebSocket for messaging
- **Notifications**: Firebase Cloud Messaging for push notifications
- **Authentication**: Custom session-based authentication

## Key Features
- ✅ User authentication (student/tutor roles)
- ✅ Tutor profile management with ratings and reviews
- ✅ Advanced search and filtering for tutors/students
- ✅ Bidirectional booking system (student→tutor and tutor→student)
- ✅ Real-time messaging between users
- ✅ Session management with status tracking
- ✅ Payment simulation (JazzCash/EasyPaisa)
- ✅ Post-session feedback and rating system
- ✅ Push notifications for session reminders
- ✅ Responsive mobile-first design

## Project Architecture
- **Client**: React SPA with Wouter routing
- **Server**: Express API with middleware-based architecture
- **Storage**: PostgreSQL with in-memory fallback for development
- **Real-time**: WebSocket server for instant messaging
- **Notifications**: Firebase Cloud Messaging with automatic session reminders

## Recent Changes
- **2025-01-03**: Cleaned up project structure by removing unnecessary `StudyBuddy_Under_100MB` folder
- **2025-01-03**: Implemented Firebase Cloud Messaging with session reminder notifications
- **2025-01-03**: Added automatic session monitoring (15-minute reminders before sessions)
- **2025-01-03**: Fixed TypeScript compilation errors in storage system
- **2025-01-03**: Added graceful error handling for missing Firebase credentials

## User Preferences
- **Design**: UI inspired by Udemy and LinkedIn Learning
- **Color Scheme**: 
  - Primary: #4A90E2 (blue)
  - Secondary: #34C759 (green)
  - Background: #F8F9FA (light gray)
  - Text: #2C3E50 (dark gray)
  - Accent: #FF9500 (orange)
- **Payment**: Simulation only (JazzCash/EasyPaisa mock integration)
- **Notifications**: Firebase Cloud Messaging for session reminders

## Development Notes
- Using PostgreSQL database with Drizzle ORM
- Firebase credentials required for push notifications (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY)
- Session reminder system runs automatically every minute
- WebSocket connection for real-time messaging
- Bidirectional booking allows both students and tutors to initiate sessions

## Next Steps
- Provide Firebase credentials for full push notification functionality
- Continue refining user experience based on feedback
- Monitor and optimize notification system performance