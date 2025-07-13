import { sqliteTable, text, integer, real, blob } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  fullName: text("full_name").notNull(),
  role: text("role").notNull().default('student'),
  profileImage: text("profile_image"),
  phoneNumber: text("phone_number"),
  program: text("program"),
  semester: text("semester"),
  university: text("university").default('University'),
  bio: text("bio"),
  location: text("location"),
  subjects: text("subjects"),
  availability: text("availability"),
  hourlyRate: integer("hourly_rate"),
  joinedAt: text("joined_at").notNull().default('CURRENT_TIMESTAMP'),
});

// Tutor profiles table
export const tutorProfiles = sqliteTable("tutor_profiles", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull(),
  subjects: text("subjects").notNull(),
  hourlyRate: integer("hourly_rate").notNull(),
  experience: text("experience").notNull(),
  availability: text("availability").notNull(),
  isAvailableNow: integer("is_available_now").default(0),
  rating: integer("rating").default(0),
  reviewCount: integer("review_count").default(0),
});

// Sessions table
export const sessions = sqliteTable("sessions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  studentId: integer("student_id").notNull(),
  tutorId: integer("tutor_id").notNull(),
  subject: text("subject").notNull(),
  sessionType: text("session_type").notNull(),
  date: text("date").notNull(),
  startTime: text("start_time").notNull(),
  duration: integer("duration").notNull(), // in minutes
  totalAmount: integer("total_amount").notNull(),
  status: text("status").notNull().default('pending'),
  description: text("description"),
  createdAt: text("created_at").notNull().default('CURRENT_TIMESTAMP'),
  updatedAt: text("updated_at").notNull().default('CURRENT_TIMESTAMP'),
});

// Reviews table
export const reviews = sqliteTable("reviews", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  sessionId: integer("session_id").notNull(),
  studentId: integer("student_id").notNull(),
  tutorId: integer("tutor_id").notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: text("created_at").notNull().default('CURRENT_TIMESTAMP'),
});

// Conversations table
export const conversations = sqliteTable("conversations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  participantOneId: integer("participant_one_id").notNull(),
  participantTwoId: integer("participant_two_id").notNull(),
  lastMessageAt: text("last_message_at").notNull().default('CURRENT_TIMESTAMP'),
  createdAt: text("created_at").notNull().default('CURRENT_TIMESTAMP'),
});

// Messages table
export const messages = sqliteTable("messages", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  conversationId: integer("conversation_id").notNull(),
  senderId: integer("sender_id").notNull(),
  receiverId: integer("receiver_id").notNull(),
  content: text("content").notNull(),
  status: text("status").notNull().default('sent'),
  sentAt: text("sent_at").notNull().default('CURRENT_TIMESTAMP'),
});

// Payment methods table
export const paymentMethods = sqliteTable("payment_methods", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull(),
  type: text("type").notNull(), // e.g., JazzCash, EasyPaisa
  accountNumber: text("account_number").notNull(),
  isDefault: integer("is_default").default(0),
  createdAt: text("created_at").notNull().default('CURRENT_TIMESTAMP'),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, joinedAt: true });
export const insertTutorProfileSchema = createInsertSchema(tutorProfiles).omit({ id: true });
export const insertSessionSchema = createInsertSchema(sessions).omit({ id: true, createdAt: true, updatedAt: true });
export const insertReviewSchema = createInsertSchema(reviews).omit({ id: true, createdAt: true });
export const insertConversationSchema = createInsertSchema(conversations).omit({ id: true, lastMessageAt: true, createdAt: true });
export const insertMessageSchema = createInsertSchema(messages).omit({ id: true, sentAt: true });
export const insertPaymentMethodSchema = createInsertSchema(paymentMethods).omit({ id: true, createdAt: true });

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertTutorProfile = z.infer<typeof insertTutorProfileSchema>;
export type TutorProfile = typeof tutorProfiles.$inferSelect;

export type InsertSession = z.infer<typeof insertSessionSchema>;
export type Session = typeof sessions.$inferSelect;

export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Review = typeof reviews.$inferSelect;

export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Conversation = typeof conversations.$inferSelect;

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

export type InsertPaymentMethod = z.infer<typeof insertPaymentMethodSchema>;
export type PaymentMethod = typeof paymentMethods.$inferSelect; 