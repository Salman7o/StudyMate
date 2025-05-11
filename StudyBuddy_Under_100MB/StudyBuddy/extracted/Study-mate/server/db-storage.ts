import { 
  users, User, InsertUser, 
  tutorProfiles, TutorProfile, InsertTutorProfile,
  sessions, Session, InsertSession,
  reviews, Review, InsertReview,
  conversations, Conversation, InsertConversation,
  messages, Message, InsertMessage,
  paymentMethods, PaymentMethod, InsertPaymentMethod
} from "@shared/schema";
import { IStorage } from "./storage";
import { db } from "./db";
import { eq, and, desc, or, like, inArray, gte, lte } from "drizzle-orm";
import connectPg from "connect-pg-simple";
import session from "express-session";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export class DatabaseStorage implements IStorage {
  sessionStore: any; // Using any to avoid type issues with SessionStore

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email));
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const result = await db.update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    return result[0];
  }
  
  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }
  
  async searchStudents(filters: Partial<{
    subjects: string[];
    program: string;
    semester: string;
    availability: string;
    maxBudget: number;
  }>): Promise<User[]> {
    let query = db.select().from(users).where(eq(users.role, 'student'));
    
    // Apply filters
    if (filters.program) {
      query = query.where(eq(users.program as any, filters.program));
    }
    
    if (filters.semester) {
      query = query.where(eq(users.semester as any, filters.semester));
    }
    
    // TODO: Implement more advanced filtering for subjects and availability
    // Note: These would require more complex queries or post-processing
    
    return await query;
  }
  
  // Tutor profile methods
  async getTutorProfile(id: number): Promise<TutorProfile | undefined> {
    const result = await db.select().from(tutorProfiles).where(eq(tutorProfiles.id, id));
    return result[0];
  }

  async getTutorProfileByUserId(userId: number): Promise<TutorProfile | undefined> {
    const result = await db.select().from(tutorProfiles).where(eq(tutorProfiles.userId, userId));
    return result[0];
  }

  async createTutorProfile(profile: InsertTutorProfile): Promise<TutorProfile> {
    const result = await db.insert(tutorProfiles).values(profile).returning();
    return result[0];
  }

  async updateTutorProfile(id: number, profileData: Partial<TutorProfile>): Promise<TutorProfile | undefined> {
    const result = await db.update(tutorProfiles)
      .set(profileData)
      .where(eq(tutorProfiles.id, id))
      .returning();
    return result[0];
  }

  async searchTutorProfiles(filters: Partial<{
    subjects: string;
    program: string;
    semester: string;
    maxRate: number;
    isAvailableNow: boolean;
  }>): Promise<(TutorProfile & { user: User })[]> {
    // Create a query to join tutor profiles with their users
    let query = db.select({
      ...tutorProfiles,
      user: users
    })
    .from(tutorProfiles)
    .innerJoin(users, eq(tutorProfiles.userId, users.id));
    
    // Apply filters
    if (filters.maxRate) {
      query = query.where(lte(tutorProfiles.hourlyRate, filters.maxRate));
    }
    
    if (filters.isAvailableNow) {
      query = query.where(eq(tutorProfiles.isAvailableNow, true));
    }
    
    // TODO: Add more advanced filtering for subjects
    // This might require a separate subjects table with a many-to-many relationship
    
    const results = await query;
    return results;
  }
  
  // Session methods
  async getSession(id: number): Promise<Session | undefined> {
    const result = await db.select().from(sessions).where(eq(sessions.id, id));
    return result[0];
  }

  async getSessionsByStudent(studentId: number): Promise<Session[]> {
    return await db.select().from(sessions).where(eq(sessions.studentId, studentId));
  }

  async getSessionsByTutor(tutorId: number): Promise<Session[]> {
    return await db.select().from(sessions).where(eq(sessions.tutorId, tutorId));
  }

  async createSession(session: InsertSession): Promise<Session> {
    const result = await db.insert(sessions).values(session).returning();
    return result[0];
  }

  async updateSessionStatus(id: number, status: 'pending' | 'confirmed' | 'completed' | 'cancelled'): Promise<Session | undefined> {
    const result = await db.update(sessions)
      .set({ status })
      .where(eq(sessions.id, id))
      .returning();
    return result[0];
  }
  
  // Review methods
  async getReview(id: number): Promise<Review | undefined> {
    const result = await db.select().from(reviews).where(eq(reviews.id, id));
    return result[0];
  }

  async getReviewsByTutor(tutorId: number): Promise<Review[]> {
    return await db.select().from(reviews).where(eq(reviews.tutorId, tutorId));
  }

  async createReview(review: InsertReview): Promise<Review> {
    const result = await db.insert(reviews).values(review).returning();
    return result[0];
  }
  
  // Conversation methods
  async getConversation(id: number): Promise<Conversation | undefined> {
    const result = await db.select().from(conversations).where(eq(conversations.id, id));
    return result[0];
  }

  async getConversationByParticipants(userOneId: number, userTwoId: number): Promise<Conversation | undefined> {
    const result = await db.select().from(conversations).where(
      or(
        and(
          eq(conversations.participantOneId, userOneId),
          eq(conversations.participantTwoId, userTwoId)
        ),
        and(
          eq(conversations.participantOneId, userTwoId),
          eq(conversations.participantTwoId, userOneId)
        )
      )
    );
    return result[0];
  }

  async getConversationsByUser(userId: number): Promise<(Conversation & { 
    otherParticipant: User,
    lastMessage?: Message
  })[]> {
    // First, find all conversations this user is a part of
    const userConversations = await db.select().from(conversations).where(
      or(
        eq(conversations.participantOneId, userId),
        eq(conversations.participantTwoId, userId)
      )
    );

    // Map through each conversation to get the other participant and last message
    const conversationsWithDetails = await Promise.all(
      userConversations.map(async (conversation) => {
        // Get the other participant
        const otherParticipantId = 
          conversation.participantOneId === userId 
            ? conversation.participantTwoId 
            : conversation.participantOneId;
        
        const [otherParticipant] = await db.select()
          .from(users)
          .where(eq(users.id, otherParticipantId));
        
        // Get the last message
        const lastMessages = await db.select()
          .from(messages)
          .where(eq(messages.conversationId, conversation.id))
          .orderBy(desc(messages.sentAt))
          .limit(1);

        const lastMessage = lastMessages.length > 0 ? lastMessages[0] : undefined;
        
        return {
          ...conversation,
          otherParticipant,
          lastMessage
        };
      })
    );
    
    return conversationsWithDetails;
  }

  async createConversation(conversation: InsertConversation): Promise<Conversation> {
    const result = await db.insert(conversations).values(conversation).returning();
    return result[0];
  }
  
  // Message methods
  async getMessage(id: number): Promise<Message | undefined> {
    const result = await db.select().from(messages).where(eq(messages.id, id));
    return result[0];
  }

  async getMessagesByConversation(conversationId: number): Promise<Message[]> {
    return await db.select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(messages.sentAt);
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const result = await db.insert(messages).values(message).returning();
    return result[0];
  }

  async updateMessageStatus(id: number, status: 'sent' | 'delivered' | 'read'): Promise<Message | undefined> {
    const result = await db.update(messages)
      .set({ status })
      .where(eq(messages.id, id))
      .returning();
    return result[0];
  }
  
  // Payment method methods
  async getPaymentMethod(id: number): Promise<PaymentMethod | undefined> {
    const result = await db.select().from(paymentMethods).where(eq(paymentMethods.id, id));
    return result[0];
  }

  async getPaymentMethodsByUser(userId: number): Promise<PaymentMethod[]> {
    return await db.select().from(paymentMethods).where(eq(paymentMethods.userId, userId));
  }

  async createPaymentMethod(paymentMethod: InsertPaymentMethod): Promise<PaymentMethod> {
    const result = await db.insert(paymentMethods).values(paymentMethod).returning();
    return result[0];
  }

  async updatePaymentMethodDefault(userId: number, paymentMethodId: number): Promise<void> {
    // First, set all payment methods for this user to isDefault = false
    await db.update(paymentMethods)
      .set({ isDefault: false })
      .where(eq(paymentMethods.userId, userId));
    
    // Then set the specified payment method to isDefault = true
    await db.update(paymentMethods)
      .set({ isDefault: true })
      .where(and(
        eq(paymentMethods.id, paymentMethodId),
        eq(paymentMethods.userId, userId)
      ));
  }
}