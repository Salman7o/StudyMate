// This file contains additional types used in the client application

export type UserRole = 'student' | 'tutor';

export interface User {
  id: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  userType: UserRole;
  createdAt: Date;
}

export interface TutorProfile {
  id: number;
  userId: number;
  bio: string;
  rate: string;
  subjects: string[];
  academicLevel: string;
  program: string;
  availability: {
    weekdays: boolean;
    weekends: boolean;
    evenings: boolean;
    mornings: boolean;
  };
  averageRating: string;
  reviewCount: number;
  user?: User;
  reviews?: ReviewWithStudent[];
}

export interface Session {
  id: number;
  studentId: number;
  tutorId: number;
  subject: string;
  date: Date;
  duration: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  totalAmount: string;
  createdAt: Date;
  tutor?: User;
  student?: User;
}

export interface Review {
  id: number;
  sessionId: number;
  studentId: number;
  tutorId: number;
  rating: number;
  comment?: string;
  createdAt: Date;
}

export interface ReviewWithStudent extends Review {
  student: User;
}

export interface Message {
  id: number;
  senderId: number;
  receiverId: number;
  content: string;
  read: boolean;
  createdAt: Date;
}

export interface Conversation {
  id: number;
  user1Id: number;
  user2Id: number;
  lastMessageAt: Date;
  otherUser?: User;
  lastMessage?: Message;
}

// Search/filter types
export interface TutorSearchFilters {
  subject?: string;
  academicLevel?: string;
  priceRange?: string;
  availability?: string;
  rating?: string;
}
