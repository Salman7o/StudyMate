import { storage } from "./storage";
import * as admin from "firebase-admin";

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

interface NotificationPayload {
  title: string;
  body: string;
  userId: number;
  sessionId?: number;
  type: 'session_reminder' | 'session_confirmed' | 'new_message' | 'payment_received';
}

export class NotificationService {
  private deviceTokens: Map<number, string> = new Map();
  
  // Check for upcoming sessions that need reminders
  async checkSessionReminders() {
    try {
      const now = new Date();
      const reminderTime = new Date(now.getTime() + 15 * 60 * 1000); // 15 minutes from now
      
      // Get all sessions that start within the next 15-20 minutes
      const upcomingSessions = await this.getUpcomingSessions(reminderTime);
      
      for (const session of upcomingSessions) {
        await this.sendSessionReminder(session);
      }
    } catch (error) {
      console.error('Error checking session reminders:', error);
    }
  }

  private async getUpcomingSessions(reminderTime: Date) {
    try {
      // Get all confirmed sessions
      const allSessions = await storage.getAllSessions();
      
      // Filter sessions that start within the next 15-20 minutes and are confirmed
      const upcomingSessions = allSessions.filter((session: any) => {
        if (session.status !== 'confirmed') {
          return false;
        }
        
        const sessionDate = new Date(session.date);
        const now = new Date();
        const timeDiff = sessionDate.getTime() - now.getTime();
        
        // Check if session starts between 15-16 minutes from now
        return timeDiff >= 14 * 60 * 1000 && timeDiff <= 16 * 60 * 1000;
      });
      
      console.log(`Found ${upcomingSessions.length} sessions needing reminders`);
      return upcomingSessions;
    } catch (error) {
      console.error('Error getting upcoming sessions:', error);
      return [];
    }
  }

  async sendSessionReminder(session: any) {
    try {
      // Get tutor and student details
      const tutor = await storage.getUser(session.tutorId);
      const student = await storage.getUser(session.studentId);
      
      if (!tutor || !student) {
        console.error('Could not find tutor or student for session:', session.id);
        return;
      }

      // Format session time
      const sessionTime = new Date(session.date);
      const timeString = sessionTime.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });

      // Send notification to student
      const studentNotification: NotificationPayload = {
        title: "Session Reminder",
        body: `Your tutoring session with ${tutor.fullName} starts in 15 minutes at ${timeString}`,
        userId: student.id,
        sessionId: session.id,
        type: 'session_reminder'
      };

      // Send notification to tutor
      const tutorNotification: NotificationPayload = {
        title: "Session Reminder", 
        body: `Your tutoring session with ${student.fullName} starts in 15 minutes at ${timeString}`,
        userId: tutor.id,
        sessionId: session.id,
        type: 'session_reminder'
      };

      await this.sendPushNotification(studentNotification);
      await this.sendPushNotification(tutorNotification);

      console.log(`Session reminders sent for session ${session.id}`);
      
    } catch (error) {
      console.error('Error sending session reminder:', error);
    }
  }

  async sendPushNotification(notification: NotificationPayload) {
    try {
      const deviceToken = await this.getUserDeviceToken(notification.userId);
      
      if (!deviceToken) {
        console.log(`No device token found for user ${notification.userId}`);
        return;
      }

      const message = {
        notification: {
          title: notification.title,
          body: notification.body,
        },
        data: {
          sessionId: notification.sessionId?.toString() || '',
          type: notification.type,
          userId: notification.userId.toString(),
        },
        token: deviceToken
      };

      const response = await admin.messaging().send(message);
      console.log('Successfully sent notification:', response);
      
    } catch (error: any) {
      console.error('Error sending push notification:', error);
      
      // Handle invalid token errors
      if (error.code === 'messaging/invalid-registration-token' || 
          error.code === 'messaging/registration-token-not-registered') {
        console.log(`Removing invalid token for user ${notification.userId}`);
        await this.removeUserDeviceToken(notification.userId);
      }
    }
  }

  // Store device tokens when users log in
  async storeUserDeviceToken(userId: number, deviceToken: string) {
    try {
      this.deviceTokens.set(userId, deviceToken);
      console.log(`Stored device token for user ${userId}`);
    } catch (error) {
      console.error('Error storing device token:', error);
    }
  }

  private async getUserDeviceToken(userId: number): Promise<string> {
    try {
      return this.deviceTokens.get(userId) || '';
    } catch (error) {
      console.error('Error getting device token:', error);
      return '';
    }
  }

  async removeUserDeviceToken(userId: number) {
    try {
      this.deviceTokens.delete(userId);
      console.log(`Removed device token for user ${userId}`);
    } catch (error) {
      console.error('Error removing device token:', error);
    }
  }

  // Start the reminder checker (runs every minute)
  startReminderChecker() {
    console.log('Starting session reminder checker...');
    
    // Check immediately
    this.checkSessionReminders();
    
    // Then check every minute
    setInterval(() => {
      this.checkSessionReminders();
    }, 60 * 1000); // Every minute
  }
}

export const notificationService = new NotificationService();