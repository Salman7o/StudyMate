# LearnBuddy - University Tutoring Platform

## Overview

LearnBuddy is a full-stack web application that connects university students with qualified tutors for personalized learning sessions. The platform facilitates tutor discovery, session booking, real-time messaging, and payment processing, creating a comprehensive educational marketplace.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Build Tool**: Vite
- **Routing**: Wouter for client-side routing
- **UI Components**: Shadcn/ui with Radix UI primitives
- **Styling**: Tailwind CSS with custom theme configuration
- **State Management**: TanStack React Query for server state
- **Form Handling**: React Hook Form with Zod validation
- **Authentication**: Context-based auth with session management

### Backend Architecture
- **Runtime**: Node.js with Express server
- **Language**: TypeScript with ESM modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon serverless PostgreSQL
- **Authentication**: Passport.js with local strategy and bcrypt
- **Session Management**: Express session with PostgreSQL store
- **WebSocket**: WebSocket server for real-time messaging
- **File Upload**: Integrated profile image handling

### Database Design
- **ORM**: Drizzle with PostgreSQL dialect
- **Schema Location**: `shared/schema.ts` for type sharing
- **Migration Strategy**: Drizzle Kit for schema management
- **Key Tables**: users, tutorProfiles, sessions, reviews, conversations, messages, paymentMethods

## Key Components

### Authentication System
- **Strategy**: Session-based authentication with secure password hashing
- **User Roles**: Students and tutors with role-based access control
- **Registration**: Multi-step registration with tutor profile creation
- **Session Storage**: PostgreSQL-backed session store for scalability

### Tutor Discovery Engine
- **Search Filters**: Subject, program, semester, budget, availability, rating
- **Profile System**: Detailed tutor profiles with reviews and ratings
- **Availability Management**: Time slot booking system
- **Featured Tutors**: Algorithmic ranking system

### Real-time Messaging
- **WebSocket Implementation**: Custom WebSocket server for instant messaging
- **Message Persistence**: Database-backed message storage
- **User Presence**: Online status tracking
- **Conversation Threading**: Organized chat conversations

### Booking System
- **Session Scheduling**: Calendar-based booking with availability checking
- **Status Management**: Pending, confirmed, completed, cancelled states
- **Payment Integration**: JazzCash and EasyPaisa payment methods
- **Review System**: Post-session feedback and rating system

### Notification System
- **Firebase Integration**: Push notifications for mobile devices
- **Email Notifications**: Session reminders and status updates
- **In-app Notifications**: Real-time notification delivery
- **Reminder System**: Automated session reminder checking

## Data Flow

### User Registration Flow
1. User submits registration form with role selection
2. Backend validates data and creates user record
3. If tutor role, additional tutor profile creation
4. Session establishment and redirect to dashboard

### Tutor Search Flow
1. User applies search filters on frontend
2. API request with filter parameters
3. Database query with complex joins and filtering
4. Paginated results returned with tutor profiles

### Session Booking Flow
1. Student selects tutor and time slot
2. Booking request validation and creation
3. Real-time notification to tutor
4. Payment processing upon tutor confirmation
5. Session status updates and notifications

### Message Flow
1. WebSocket connection establishment with authentication
2. Message sent through WebSocket
3. Message persistence in database
4. Real-time delivery to recipient
5. Read status tracking and updates

## External Dependencies

### Database Services
- **Neon**: Serverless PostgreSQL database hosting
- **Connection Pooling**: Built-in connection management

### Authentication Services
- **Passport.js**: Authentication middleware
- **bcrypt**: Password hashing and verification

### Payment Services
- **JazzCash**: Pakistani mobile payment integration
- **EasyPaisa**: Alternative mobile payment method

### Notification Services
- **Firebase Admin SDK**: Push notification delivery
- **WebSocket**: Real-time in-app notifications

### UI/UX Libraries
- **Shadcn/ui**: Component library built on Radix UI
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library
- **Date-fns**: Date manipulation and formatting

## Deployment Strategy

### Build Process
- **Client Build**: Vite builds React app to `dist/public`
- **Server Build**: ESBuild bundles TypeScript server to `dist`
- **Static Assets**: Vite handles asset optimization and CDN preparation

### Environment Configuration
- **Database**: Environment variable for DATABASE_URL
- **Sessions**: Secure session secret configuration
- **Firebase**: Service account credentials for notifications
- **Payment**: API keys for payment processor integration

### Production Considerations
- **Database Migrations**: Drizzle Kit for schema deployment
- **Session Store**: PostgreSQL-backed session storage
- **Static Files**: Express serves built React application
- **WebSocket**: Integrated with HTTP server for real-time features

## Changelog

- July 03, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.