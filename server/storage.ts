import { 
  users, User, InsertUser, 
  tutorProfiles, TutorProfile, InsertTutorProfile,
  sessions, Session, InsertSession,
  reviews, Review, InsertReview,
  conversations, Conversation, InsertConversation,
  messages, Message, InsertMessage,
  paymentMethods, PaymentMethod, InsertPaymentMethod
} from "@shared/schema";
import memorystore from 'memorystore';
import expressSession from 'express-session';
import fs from 'fs';
import path from 'path';

export interface IStorage {
  // User related methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  searchStudents(filters: Partial<{
    subjects: string[];
    program: string;
    semester: string;
    availability: string;
    maxBudget: number;
  }>): Promise<User[]>;
  
  // Tutor profile related methods
  getTutorProfile(id: number): Promise<TutorProfile | undefined>;
  getTutorProfileByUserId(userId: number): Promise<TutorProfile | undefined>;
  createTutorProfile(profile: InsertTutorProfile): Promise<TutorProfile>;
  updateTutorProfile(id: number, profileData: Partial<TutorProfile>): Promise<TutorProfile | undefined>;
  searchTutorProfiles(filters: Partial<{
    subjects: string;
    program: string;
    semester: string;
    maxRate: number;
    isAvailableNow: boolean;
  }>): Promise<(TutorProfile & { user: User })[]>;
  
  // Session related methods
  getSession(id: number): Promise<Session | undefined>;
  getAllSessions(): Promise<Session[]>;
  getSessionsByStudent(studentId: number): Promise<Session[]>;
  getSessionsByTutor(tutorId: number): Promise<Session[]>;
  createSession(session: InsertSession): Promise<Session>;
  updateSessionStatus(id: number, status: 'pending' | 'confirmed' | 'completed' | 'cancelled'): Promise<Session | undefined>;
  
  // Review related methods
  getReview(id: number): Promise<Review | undefined>;
  getReviewsByTutor(tutorId: number): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;
  
  // Conversation related methods
  getConversation(id: number): Promise<Conversation | undefined>;
  getConversationByParticipants(userOneId: number, userTwoId: number): Promise<Conversation | undefined>;
  getConversationsByUser(userId: number): Promise<(Conversation & { 
    otherParticipant: User,
    lastMessage?: Message
  })[]>;
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  
  // Message related methods
  getMessage(id: number): Promise<Message | undefined>;
  getMessagesByConversation(conversationId: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  updateMessageStatus(id: number, status: 'sent' | 'delivered' | 'read'): Promise<Message | undefined>;
  
  // Payment method related methods
  getPaymentMethod(id: number): Promise<PaymentMethod | undefined>;
  getPaymentMethodsByUser(userId: number): Promise<PaymentMethod[]>;
  createPaymentMethod(paymentMethod: InsertPaymentMethod): Promise<PaymentMethod>;
  updatePaymentMethodDefault(userId: number, paymentMethodId: number): Promise<void>;
  
  // Session store for authentication
  sessionStore: any;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private tutorProfiles: Map<number, TutorProfile>;
  private sessions: Map<number, Session>;
  private reviews: Map<number, Review>;
  private conversations: Map<number, Conversation>;
  private messages: Map<number, Message>;
  private paymentMethods: Map<number, PaymentMethod>;
  
  private userId: number = 1;
  private tutorProfileId: number = 1;
  private sessionId: number = 1;
  private reviewId: number = 1;
  private conversationId: number = 1;
  private messageId: number = 1;
  private paymentMethodId: number = 1;
  
  // Add session store
  sessionStore: any;

  constructor() {
    this.users = new Map();
    this.tutorProfiles = new Map();
    this.sessions = new Map();
    this.reviews = new Map();
    this.conversations = new Map();
    this.messages = new Map();
    this.paymentMethods = new Map();
    
    // Initialize session store (in-memory)
    const MemoryStore = memorystore(expressSession);
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    });
    
    // No demo data initialization - only real registered users
  }



  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase()
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase()
    );
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.userId++;
    const newUser = { ...user, id, joinedAt: new Date() };
    this.users.set(id, newUser);
    return newUser;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;

    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }
  
  async searchStudents(filters: Partial<{
    subjects: string[];
    program: string;
    semester: string;
    availability: string;
    maxBudget: number;
  }>): Promise<User[]> {
    let students = Array.from(this.users.values()).filter(user => 
      user.role === 'student'
    );
    
    console.log(`Found ${students.length} total students`);
    
    // Filter by subjects - these are the most important matching criteria
    if (filters.subjects && filters.subjects.length > 0) {
      console.log(`Filtering students by subjects: ${JSON.stringify(filters.subjects)}`);
      
      students = students.filter(student => {
        // Check if student has listed subjects that match any of the filter subjects
        // If student doesn't have subjects, include them in results to maximize matches
        if (!student.subjects || student.subjects.length === 0) {
          console.log(`Student ${student.id} has no subjects, including them in results`);
          return true;
        }
        
        const matchFound = filters.subjects!.some(tutorSubject => 
          student.subjects?.some(studentSubject => {
            // Normalize both strings for more lenient matching
            const normalizedTutorSubject = tutorSubject.toLowerCase().trim();
            const normalizedStudentSubject = studentSubject.toLowerCase().trim();
            
            // Check for exact matches or partial matches in either direction
            const isMatch = normalizedStudentSubject === normalizedTutorSubject ||
                   normalizedStudentSubject.includes(normalizedTutorSubject) ||
                   normalizedTutorSubject.includes(normalizedStudentSubject);
            
            if (isMatch) {
              console.log(`Subject match found between tutor subject "${tutorSubject}" and student subject "${studentSubject}"`);
            }
            
            return isMatch;
          })
        );
        
        if (matchFound) {
          console.log(`Student ${student.id} matches subject criteria`);
        }
        
        return matchFound;
      });
      console.log(`After subjects filter: ${students.length} students`);
    }
    
    // Filter by program if specified
    if (filters.program) {
      students = students.filter(student => 
        !student.program || student.program === filters.program
      );
      console.log(`After program filter: ${students.length} students`);
    }
    
    // Filter by semester if specified
    if (filters.semester) {
      students = students.filter(student => 
        !student.semester || student.semester === filters.semester
      );
      console.log(`After semester filter: ${students.length} students`);
    }
    
    // Filter by availability if the tutor's availability is known
    if (filters.availability) {
      // Match based on overlapping availability windows
      const tutorAvailability = filters.availability.toLowerCase();
      
      students = students.filter(student => {
        // If student doesn't specify availability, include them anyway to maximize matches
        if (!student.availability) return true;
        
        const studentAvailability = student.availability.toLowerCase();
        
        // More comprehensive day matching including abbreviations and full names
        const dayPatterns = [
          // Full names
          'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday',
          // Abbreviations
          'mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun',
          // General terms
          'weekend', 'weekday', 'weekdays', 'weekends',
          // Day ranges
          'mon-fri', 'sat-sun'
        ];
        
        const dayMatch = dayPatterns.some(day => 
          tutorAvailability.includes(day) && studentAvailability.includes(day)
        );
        
        // More comprehensive time period matching
        const timePeriods = [
          'morning', 'afternoon', 'evening', 'night', 
          'am', 'pm', 'noon', 'midnight',
          'early', 'late'
        ];
        
        const timeMatch = timePeriods.some(period => 
          tutorAvailability.includes(period) && studentAvailability.includes(period)
        );
        
        // Advanced time matching (handles formats like 2PM, 14:00, 2-4pm, etc.)
        const extractTimeInfo = (availText: string) => {
          const times: any[] = [];
          
          // Match simple time formats: 2PM, 3:00, etc.
          const simpleMatches = availText.match(/\d+[\s]*(am|pm|:\d+)/gi) || [];
          times.push(...simpleMatches);
          
          // Match time ranges: 2-4PM, 9:00-11:00, etc.
          const rangeMatches = availText.match(/\d+[\s]*(-|to|–)[\s]*\d+[\s]*(am|pm)/gi) || [];
          times.push(...rangeMatches);
          
          return times;
        };
        
        const tutorTimes = extractTimeInfo(tutorAvailability);
        const studentTimes = extractTimeInfo(studentAvailability);
        
        const timeOverlapMatch = tutorTimes.length === 0 || studentTimes.length === 0 || 
          tutorTimes.some(tutorTime => 
            studentTimes.some(studentTime => 
              tutorTime.includes(studentTime) || 
              studentTime.includes(tutorTime) ||
              // For more generic comparison
              tutorTime.replace(/\s+/g, '').includes(studentTime.replace(/\s+/g, '')) ||
              studentTime.replace(/\s+/g, '').includes(tutorTime.replace(/\s+/g, ''))
            )
          );
        
        // If either days match OR times match, consider it a match
        // This is more flexible and yields more potential student-tutor matches
        return dayMatch || timeMatch || timeOverlapMatch;
      });
      
      console.log(`After availability filter: ${students.length} students`);
    }
    
    // Filter by maximum budget/hourly rate if specified
    // The idea is to match students who can afford the tutor's rate
    if (filters.maxBudget) {
      // Since we don't store budget explicitly for students, use a heuristic:
      // Filter out graduate students if rate is very high, etc.
      // This is a simplified approach
      
      if (filters.maxBudget > 2000) {
        // Very high-priced tutors, only match specific programs
        students = students.filter(student => 
          student.program?.toLowerCase().includes('business') || 
          student.program?.toLowerCase().includes('finance') ||
          student.program?.toLowerCase().includes('medical') ||
          student.program?.toLowerCase().includes('law')
        );
      } else if (filters.maxBudget > 1000) {
        // Medium-high price, exclude early semester students
        students = students.filter(student => {
          const semesterNum = parseInt(student.semester || '1');
          return semesterNum >= 3; // 3rd semester or higher
        });
      }
      
      console.log(`After budget filter: ${students.length} students`);
    }
    
    return students;
  }

  // Tutor profile methods
  async getTutorProfile(id: number): Promise<TutorProfile | undefined> {
    return this.tutorProfiles.get(id);
  }

  async getTutorProfileByUserId(userId: number): Promise<TutorProfile | undefined> {
    return Array.from(this.tutorProfiles.values()).find(
      (profile) => profile.userId === userId
    );
  }

  async createTutorProfile(profile: InsertTutorProfile): Promise<TutorProfile> {
    const id = this.tutorProfileId++;
    const newProfile = { ...profile, id };
    this.tutorProfiles.set(id, newProfile);
    return newProfile;
  }

  async updateTutorProfile(id: number, profileData: Partial<TutorProfile>): Promise<TutorProfile | undefined> {
    const profile = this.tutorProfiles.get(id);
    if (!profile) return undefined;

    const updatedProfile = { ...profile, ...profileData };
    this.tutorProfiles.set(id, updatedProfile);
    return updatedProfile;
  }

  async searchTutorProfiles(filters: Partial<{
    subjects: string;
    program: string;
    semester: string;
    maxRate: number;
    isAvailableNow: boolean;
  }>): Promise<(TutorProfile & { user: User })[]> {
    let tutorProfiles = Array.from(this.tutorProfiles.values());
    console.log(`Found ${tutorProfiles.length} total tutor profiles`);
    
    // Join with user data first
    let tutorsWithUserData = tutorProfiles.map(profile => {
      const user = this.users.get(profile.userId);
      if (!user) {
        console.error(`User not found for tutor profile with user ID ${profile.userId}`);
        return null; // Skip this tutor
      }
      return { ...profile, user };
    }).filter(item => item !== null) as (TutorProfile & { user: User })[];
    
    console.log(`After filtering out missing users: ${tutorsWithUserData.length} tutor profiles`);
    
    // Apply filters on the combined data
    if (filters.subjects && filters.subjects !== "All Subjects") {
      // Split the comma-separated subjects
      const studentSubjectsArray = filters.subjects.split(',')
        .map(subject => subject.trim().toLowerCase())
        .filter(subject => subject.length > 0);
      
      console.log(`Looking for tutor profiles matching subjects: ${JSON.stringify(studentSubjectsArray)}`);
      
      if (studentSubjectsArray.length > 0) {
        tutorsWithUserData = tutorsWithUserData.filter(profile => {
          const tutorSubjects = profile.subjects.map(subject => subject.toLowerCase());
          
          // Check if any of the tutor subjects matches (or contains) any of the student subjects
          return studentSubjectsArray.some(studentSubject => 
            tutorSubjects.some(tutorSubject => 
              // Partial matching for more flexibility
              tutorSubject.includes(studentSubject) || 
              studentSubject.includes(tutorSubject)
            )
          );
        });
      }
      console.log(`After subjects filter: ${tutorsWithUserData.length} tutor profiles`);
    }
    
    if (filters.program && filters.program !== "All Programs") {
      tutorsWithUserData = tutorsWithUserData.filter(profile => 
        profile.user.program === filters.program
      );
      console.log(`After program filter: ${tutorsWithUserData.length} tutor profiles`);
    }
    
    if (filters.semester && filters.semester !== "All Semesters") {
      tutorsWithUserData = tutorsWithUserData.filter(profile => 
        profile.user.semester === filters.semester
      );
      console.log(`After semester filter: ${tutorsWithUserData.length} tutor profiles`);
    }
    
    if (filters.maxRate) {
      tutorsWithUserData = tutorsWithUserData.filter(profile => 
        profile.hourlyRate <= filters.maxRate
      );
      console.log(`After maxRate filter: ${tutorsWithUserData.length} tutor profiles`);
    }
    
    if (filters.isAvailableNow) {
      tutorsWithUserData = tutorsWithUserData.filter(profile => 
        profile.isAvailableNow
      );
      console.log(`After isAvailableNow filter: ${tutorsWithUserData.length} tutor profiles`);
    }
    
    return tutorsWithUserData;
  }

  // Session methods
  async getSession(id: number): Promise<Session | undefined> {
    return this.sessions.get(id);
  }

  async getAllSessions(): Promise<Session[]> {
    return Array.from(this.sessions.values());
  }

  async getSessionsByStudent(studentId: number): Promise<Session[]> {
    return Array.from(this.sessions.values()).filter(
      (session) => session.studentId === studentId
    );
  }

  async getSessionsByTutor(tutorId: number): Promise<Session[]> {
    return Array.from(this.sessions.values()).filter(
      (session) => session.tutorId === tutorId
    );
  }

  async createSession(session: InsertSession): Promise<Session> {
    const id = this.sessionId++;
    const now = new Date();
    const newSession = {
      ...session,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.sessions.set(id, newSession);
    return newSession;
  }

  async updateSessionStatus(id: number, status: 'pending' | 'confirmed' | 'completed' | 'cancelled'): Promise<Session | undefined> {
    const session = this.sessions.get(id);
    if (!session) return undefined;

    const updatedSession = {
      ...session,
      status,
      updatedAt: new Date()
    };
    this.sessions.set(id, updatedSession);
    return updatedSession;
  }

  // Review methods
  async getReview(id: number): Promise<Review | undefined> {
    return this.reviews.get(id);
  }

  async getReviewsByTutor(tutorId: number): Promise<Review[]> {
    return Array.from(this.reviews.values()).filter(
      (review) => review.tutorId === tutorId
    );
  }

  async createReview(review: InsertReview): Promise<Review> {
    const id = this.reviewId++;
    const newReview = { ...review, id, createdAt: new Date() };
    this.reviews.set(id, newReview);
    
    // Update tutor's rating
    const tutorProfile = await this.getTutorProfileByUserId(review.tutorId);
    if (tutorProfile) {
      const reviews = await this.getReviewsByTutor(review.tutorId);
      const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0) + review.rating;
      const newReviewCount = reviews.length + 1;
      const newRating = Math.round(totalRating / newReviewCount * 10) / 10;
      
      await this.updateTutorProfile(tutorProfile.id, {
        rating: newRating,
        reviewCount: newReviewCount
      });
    }
    
    return newReview;
  }

  // Conversation methods
  async getConversation(id: number): Promise<Conversation | undefined> {
    return this.conversations.get(id);
  }

  async getConversationByParticipants(userOneId: number, userTwoId: number): Promise<Conversation | undefined> {
    return Array.from(this.conversations.values()).find(
      (conversation) => 
        (conversation.participantOneId === userOneId && conversation.participantTwoId === userTwoId) ||
        (conversation.participantOneId === userTwoId && conversation.participantTwoId === userOneId)
    );
  }

  async getConversationsByUser(userId: number): Promise<(Conversation & { 
    otherParticipant: User,
    lastMessage?: Message
  })[]> {
    const userConversations = Array.from(this.conversations.values()).filter(
      (conversation) => 
        conversation.participantOneId === userId || conversation.participantTwoId === userId
    );
    
    return Promise.all(userConversations.map(async (conversation) => {
      const otherParticipantId = conversation.participantOneId === userId 
        ? conversation.participantTwoId 
        : conversation.participantOneId;
      
      const otherParticipant = this.users.get(otherParticipantId);
      if (!otherParticipant) throw new Error(`User not found for conversation ${conversation.id}`);
      
      // Get the last message
      const conversationMessages = await this.getMessagesByConversation(conversation.id);
      const lastMessage = conversationMessages.length > 0 
        ? conversationMessages.sort((a, b) => b.sentAt.getTime() - a.sentAt.getTime())[0]
        : undefined;
      
      return {
        ...conversation,
        otherParticipant,
        lastMessage
      };
    }));
  }

  async createConversation(conversation: InsertConversation): Promise<Conversation> {
    const id = this.conversationId++;
    const now = new Date();
    const newConversation = {
      ...conversation,
      id,
      lastMessageAt: now,
      createdAt: now
    };
    this.conversations.set(id, newConversation);
    return newConversation;
  }

  // Message methods
  async getMessage(id: number): Promise<Message | undefined> {
    return this.messages.get(id);
  }

  async getMessagesByConversation(conversationId: number): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(message => message.conversationId === conversationId)
      .sort((a, b) => a.sentAt.getTime() - b.sentAt.getTime());
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const id = this.messageId++;
    const now = new Date();
    const newMessage = { ...message, id, sentAt: now };
    this.messages.set(id, newMessage);
    
    // Update last message time in conversation
    const conversation = await this.getConversation(message.conversationId);
    if (conversation) {
      const updatedConversation = {
        ...conversation,
        lastMessageAt: now
      };
      this.conversations.set(conversation.id, updatedConversation);
    }
    
    return newMessage;
  }

  async updateMessageStatus(id: number, status: 'sent' | 'delivered' | 'read'): Promise<Message | undefined> {
    const message = this.messages.get(id);
    if (!message) return undefined;

    const updatedMessage = { ...message, status };
    this.messages.set(id, updatedMessage);
    return updatedMessage;
  }

  // Payment method methods
  async getPaymentMethod(id: number): Promise<PaymentMethod | undefined> {
    return this.paymentMethods.get(id);
  }

  async getPaymentMethodsByUser(userId: number): Promise<PaymentMethod[]> {
    return Array.from(this.paymentMethods.values()).filter(
      (method) => method.userId === userId
    );
  }

  async createPaymentMethod(paymentMethod: InsertPaymentMethod): Promise<PaymentMethod> {
    const id = this.paymentMethodId++;
    const newPaymentMethod = { ...paymentMethod, id, createdAt: new Date() };
    
    // If this is set as default, unset any other default payment methods for this user
    if (paymentMethod.isDefault) {
      for (const [paymentId, payment] of this.paymentMethods.entries()) {
        if (payment.userId === paymentMethod.userId && payment.isDefault) {
          this.paymentMethods.set(paymentId, { ...payment, isDefault: false });
        }
      }
    }
    
    this.paymentMethods.set(id, newPaymentMethod);
    return newPaymentMethod;
  }

  async updatePaymentMethodDefault(userId: number, paymentMethodId: number): Promise<void> {
    // Unset any default payment methods for this user
    for (const [id, payment] of this.paymentMethods.entries()) {
      if (payment.userId === userId && payment.isDefault) {
        this.paymentMethods.set(id, { ...payment, isDefault: false });
      }
    }
    
    // Set the specified payment method as default
    const paymentMethod = this.paymentMethods.get(paymentMethodId);
    if (paymentMethod && paymentMethod.userId === userId) {
      this.paymentMethods.set(paymentMethodId, { ...paymentMethod, isDefault: true });
    }
  }
}

export class FileStorage implements IStorage {
  private users: Map<number, User>;
  private tutorProfiles: Map<number, TutorProfile>;
  private sessions: Map<number, Session>;
  private reviews: Map<number, Review>;
  private conversations: Map<number, Conversation>;
  private messages: Map<number, Message>;
  private paymentMethods: Map<number, PaymentMethod>;
  
  private userId: number = 1;
  private tutorProfileId: number = 1;
  private sessionId: number = 1;
  private reviewId: number = 1;
  private conversationId: number = 1;
  private messageId: number = 1;
  private paymentMethodId: number = 1;
  
  sessionStore: any;
  private dataDir: string;

  constructor() {
    this.users = new Map();
    this.tutorProfiles = new Map();
    this.sessions = new Map();
    this.reviews = new Map();
    this.conversations = new Map();
    this.messages = new Map();
    this.paymentMethods = new Map();
    
    // Initialize session store (in-memory)
    const MemoryStore = memorystore(expressSession);
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    });
    
    // Create data directory
    this.dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
    
    // Load existing data
    this.loadData();
  }

  private getDataFilePath(filename: string): string {
    return path.join(this.dataDir, `${filename}.json`);
  }

  private saveData(filename: string, data: any): void {
    const filePath = this.getDataFilePath(filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  }

  private loadData(): void {
    try {
      // Load users
      const usersFile = this.getDataFilePath('users');
      if (fs.existsSync(usersFile)) {
        const usersData = JSON.parse(fs.readFileSync(usersFile, 'utf8'));
        this.users = new Map(usersData.map((user: User) => [user.id, user]));
        if (this.users.size > 0) {
          this.userId = Math.max(...this.users.keys()) + 1;
        }
      }

      // Load tutor profiles
      const tutorProfilesFile = this.getDataFilePath('tutorProfiles');
      if (fs.existsSync(tutorProfilesFile)) {
        const tutorProfilesData = JSON.parse(fs.readFileSync(tutorProfilesFile, 'utf8'));
        this.tutorProfiles = new Map(tutorProfilesData.map((profile: TutorProfile) => [profile.id, profile]));
        if (this.tutorProfiles.size > 0) {
          this.tutorProfileId = Math.max(...this.tutorProfiles.keys()) + 1;
        }
      }

      // Load sessions
      const sessionsFile = this.getDataFilePath('sessions');
      if (fs.existsSync(sessionsFile)) {
        const sessionsData = JSON.parse(fs.readFileSync(sessionsFile, 'utf8'));
        this.sessions = new Map(sessionsData.map((session: Session) => [session.id, session]));
        if (this.sessions.size > 0) {
          this.sessionId = Math.max(...this.sessions.keys()) + 1;
        }
      }

      // Load reviews
      const reviewsFile = this.getDataFilePath('reviews');
      if (fs.existsSync(reviewsFile)) {
        const reviewsData = JSON.parse(fs.readFileSync(reviewsFile, 'utf8'));
        this.reviews = new Map(reviewsData.map((review: Review) => [review.id, review]));
        if (this.reviews.size > 0) {
          this.reviewId = Math.max(...this.reviews.keys()) + 1;
        }
      }

      // Load conversations
      const conversationsFile = this.getDataFilePath('conversations');
      if (fs.existsSync(conversationsFile)) {
        const conversationsData = JSON.parse(fs.readFileSync(conversationsFile, 'utf8'));
        this.conversations = new Map(conversationsData.map((conversation: Conversation) => [conversation.id, conversation]));
        if (this.conversations.size > 0) {
          this.conversationId = Math.max(...this.conversations.keys()) + 1;
        }
      }

      // Load messages
      const messagesFile = this.getDataFilePath('messages');
      if (fs.existsSync(messagesFile)) {
        const messagesData = JSON.parse(fs.readFileSync(messagesFile, 'utf8'));
        this.messages = new Map(messagesData.map((message: Message) => [message.id, message]));
        if (this.messages.size > 0) {
          this.messageId = Math.max(...this.messages.keys()) + 1;
        }
      }

      // Load payment methods
      const paymentMethodsFile = this.getDataFilePath('paymentMethods');
      if (fs.existsSync(paymentMethodsFile)) {
        const paymentMethodsData = JSON.parse(fs.readFileSync(paymentMethodsFile, 'utf8'));
        this.paymentMethods = new Map(paymentMethodsData.map((method: PaymentMethod) => [method.id, method]));
        if (this.paymentMethods.size > 0) {
          this.paymentMethodId = Math.max(...this.paymentMethods.keys()) + 1;
        }
      }

      console.log('Data loaded successfully from files');
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }

  private saveAllData(): void {
    try {
      this.saveData('users', Array.from(this.users.values()));
      this.saveData('tutorProfiles', Array.from(this.tutorProfiles.values()));
      this.saveData('sessions', Array.from(this.sessions.values()));
      this.saveData('reviews', Array.from(this.reviews.values()));
      this.saveData('conversations', Array.from(this.conversations.values()));
      this.saveData('messages', Array.from(this.messages.values()));
      this.saveData('paymentMethods', Array.from(this.paymentMethods.values()));
    } catch (error) {
      console.error('Error saving data:', error);
    }
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase()
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase()
    );
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.userId++;
    const newUser = { ...user, id, joinedAt: new Date() };
    this.users.set(id, newUser);
    this.saveAllData();
    return newUser;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;

    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    this.saveAllData();
    return updatedUser;
  }
  
  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }
  
  async searchStudents(filters: Partial<{
    subjects: string[];
    program: string;
    semester: string;
    availability: string;
    maxBudget: number;
  }>): Promise<User[]> {
    let students = Array.from(this.users.values()).filter(user => 
      user.role === 'student'
    );
    
    console.log(`Found ${students.length} total students`);
    
    // Filter by subjects - these are the most important matching criteria
    if (filters.subjects && filters.subjects.length > 0) {
      console.log(`Filtering students by subjects: ${JSON.stringify(filters.subjects)}`);
      
      students = students.filter(student => {
        // Check if student has listed subjects that match any of the filter subjects
        // If student doesn't have subjects, include them in results to maximize matches
        if (!student.subjects || student.subjects.length === 0) {
          console.log(`Student ${student.id} has no subjects, including them in results`);
          return true;
        }
        
        const matchFound = filters.subjects!.some(tutorSubject => 
          student.subjects?.some(studentSubject => {
            // Normalize both strings for more lenient matching
            const normalizedTutorSubject = tutorSubject.toLowerCase().trim();
            const normalizedStudentSubject = studentSubject.toLowerCase().trim();
            
            // Check for exact matches or partial matches in either direction
            const isMatch = normalizedStudentSubject === normalizedTutorSubject ||
                   normalizedStudentSubject.includes(normalizedTutorSubject) ||
                   normalizedTutorSubject.includes(normalizedStudentSubject);
            
            if (isMatch) {
              console.log(`Subject match found between tutor subject "${tutorSubject}" and student subject "${studentSubject}"`);
            }
            
            return isMatch;
          })
        );
        
        if (matchFound) {
          console.log(`Student ${student.id} matches subject criteria`);
        }
        
        return matchFound;
      });
      console.log(`After subjects filter: ${students.length} students`);
    }
    
    // Filter by program if specified
    if (filters.program) {
      students = students.filter(student => 
        !student.program || student.program === filters.program
      );
      console.log(`After program filter: ${students.length} students`);
    }
    
    // Filter by semester if specified
    if (filters.semester) {
      students = students.filter(student => 
        !student.semester || student.semester === filters.semester
      );
      console.log(`After semester filter: ${students.length} students`);
    }
    
    // Filter by availability if the tutor's availability is known
    if (filters.availability) {
      // Match based on overlapping availability windows
      const tutorAvailability = filters.availability.toLowerCase();
      
      students = students.filter(student => {
        // If student doesn't specify availability, include them anyway to maximize matches
        if (!student.availability) return true;
        
        const studentAvailability = student.availability.toLowerCase();
        
        // More comprehensive day matching including abbreviations and full names
        const dayPatterns = [
          // Full names
          'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday',
          // Abbreviations
          'mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun',
          // General terms
          'weekend', 'weekday', 'weekdays', 'weekends',
          // Day ranges
          'mon-fri', 'sat-sun'
        ];
        
        const dayMatch = dayPatterns.some(day => 
          tutorAvailability.includes(day) && studentAvailability.includes(day)
        );
        
        // More comprehensive time period matching
        const timePeriods = [
          'morning', 'afternoon', 'evening', 'night', 
          'am', 'pm', 'noon', 'midnight',
          'early', 'late'
        ];
        
        const timeMatch = timePeriods.some(period => 
          tutorAvailability.includes(period) && studentAvailability.includes(period)
        );
        
        // Advanced time matching (handles formats like 2PM, 14:00, 2-4pm, etc.)
        const extractTimeInfo = (availText: string) => {
          const times: any[] = [];
          
          // Match simple time formats: 2PM, 3:00, etc.
          const simpleMatches = availText.match(/\d+[\s]*(am|pm|:\d+)/gi) || [];
          times.push(...simpleMatches);
          
          // Match time ranges: 2-4PM, 9:00-11:00, etc.
          const rangeMatches = availText.match(/\d+[\s]*(-|to|–)[\s]*\d+[\s]*(am|pm)/gi) || [];
          times.push(...rangeMatches);
          
          return times;
        };
        
        const tutorTimes = extractTimeInfo(tutorAvailability);
        const studentTimes = extractTimeInfo(studentAvailability);
        
        const timeOverlapMatch = tutorTimes.length === 0 || studentTimes.length === 0 || 
          tutorTimes.some(tutorTime => 
            studentTimes.some(studentTime => 
              tutorTime.includes(studentTime) || 
              studentTime.includes(tutorTime) ||
              // For more generic comparison
              tutorTime.replace(/\s+/g, '').includes(studentTime.replace(/\s+/g, '')) ||
              studentTime.replace(/\s+/g, '').includes(tutorTime.replace(/\s+/g, ''))
            )
          );
        
        // If either days match OR times match, consider it a match
        // This is more flexible and yields more potential student-tutor matches
        return dayMatch || timeMatch || timeOverlapMatch;
      });
      
      console.log(`After availability filter: ${students.length} students`);
    }
    
    // Filter by maximum budget/hourly rate if specified
    // The idea is to match students who can afford the tutor's rate
    if (filters.maxBudget) {
      // Since we don't store budget explicitly for students, use a heuristic:
      // Filter out graduate students if rate is very high, etc.
      // This is a simplified approach
      
      if (filters.maxBudget > 2000) {
        // Very high-priced tutors, only match specific programs
        students = students.filter(student => 
          student.program?.toLowerCase().includes('business') || 
          student.program?.toLowerCase().includes('finance') ||
          student.program?.toLowerCase().includes('medical') ||
          student.program?.toLowerCase().includes('law')
        );
      } else if (filters.maxBudget > 1000) {
        // Medium-high price, exclude early semester students
        students = students.filter(student => {
          const semesterNum = parseInt(student.semester || '1');
          return semesterNum >= 3; // 3rd semester or higher
        });
      }
      
      console.log(`After budget filter: ${students.length} students`);
    }
    
    return students;
  }

  // Tutor profile methods
  async getTutorProfile(id: number): Promise<TutorProfile | undefined> {
    return this.tutorProfiles.get(id);
  }

  async getTutorProfileByUserId(userId: number): Promise<TutorProfile | undefined> {
    return Array.from(this.tutorProfiles.values()).find(
      (profile) => profile.userId === userId
    );
  }

  async createTutorProfile(profile: InsertTutorProfile): Promise<TutorProfile> {
    const id = this.tutorProfileId++;
    const newProfile = { ...profile, id };
    this.tutorProfiles.set(id, newProfile);
    this.saveAllData();
    return newProfile;
  }

  async updateTutorProfile(id: number, profileData: Partial<TutorProfile>): Promise<TutorProfile | undefined> {
    const profile = this.tutorProfiles.get(id);
    if (!profile) return undefined;

    const updatedProfile = { ...profile, ...profileData };
    this.tutorProfiles.set(id, updatedProfile);
    this.saveAllData();
    return updatedProfile;
  }

  async searchTutorProfiles(filters: Partial<{
    subjects: string;
    program: string;
    semester: string;
    maxRate: number;
    isAvailableNow: boolean;
  }>): Promise<(TutorProfile & { user: User })[]> {
    let tutorProfiles = Array.from(this.tutorProfiles.values());
    console.log(`Found ${tutorProfiles.length} total tutor profiles`);
    
    // Join with user data first
    let tutorsWithUserData = tutorProfiles.map(profile => {
      const user = this.users.get(profile.userId);
      if (!user) {
        console.error(`User not found for tutor profile with user ID ${profile.userId}`);
        return null; // Skip this tutor
      }
      return { ...profile, user };
    }).filter(item => item !== null) as (TutorProfile & { user: User })[];
    
    console.log(`After filtering out missing users: ${tutorsWithUserData.length} tutor profiles`);
    
    // Apply filters on the combined data
    if (filters.subjects && filters.subjects !== "All Subjects") {
      // Split the comma-separated subjects
      const studentSubjectsArray = filters.subjects.split(',')
        .map(subject => subject.trim().toLowerCase())
        .filter(subject => subject.length > 0);
      
      console.log(`Looking for tutor profiles matching subjects: ${JSON.stringify(studentSubjectsArray)}`);
      
      if (studentSubjectsArray.length > 0) {
        tutorsWithUserData = tutorsWithUserData.filter(profile => {
          const tutorSubjects = profile.subjects.map(subject => subject.toLowerCase());
          
          // Check if any of the tutor subjects matches (or contains) any of the student subjects
          return studentSubjectsArray.some(studentSubject => 
            tutorSubjects.some(tutorSubject => 
              // Partial matching for more flexibility
              tutorSubject.includes(studentSubject) || 
              studentSubject.includes(tutorSubject)
            )
          );
        });
      }
      console.log(`After subjects filter: ${tutorsWithUserData.length} tutor profiles`);
    }
    
    if (filters.program && filters.program !== "All Programs") {
      tutorsWithUserData = tutorsWithUserData.filter(profile => 
        profile.user.program === filters.program
      );
      console.log(`After program filter: ${tutorsWithUserData.length} tutor profiles`);
    }
    
    if (filters.semester && filters.semester !== "All Semesters") {
      tutorsWithUserData = tutorsWithUserData.filter(profile => 
        profile.user.semester === filters.semester
      );
      console.log(`After semester filter: ${tutorsWithUserData.length} tutor profiles`);
    }
    
    if (filters.maxRate) {
      tutorsWithUserData = tutorsWithUserData.filter(profile => 
        profile.hourlyRate <= filters.maxRate
      );
      console.log(`After maxRate filter: ${tutorsWithUserData.length} tutor profiles`);
    }
    
    if (filters.isAvailableNow) {
      tutorsWithUserData = tutorsWithUserData.filter(profile => 
        profile.isAvailableNow
      );
      console.log(`After isAvailableNow filter: ${tutorsWithUserData.length} tutor profiles`);
    }
    
    return tutorsWithUserData;
  }

  // Session methods
  async getSession(id: number): Promise<Session | undefined> {
    return this.sessions.get(id);
  }

  async getAllSessions(): Promise<Session[]> {
    return Array.from(this.sessions.values());
  }

  async getSessionsByStudent(studentId: number): Promise<Session[]> {
    return Array.from(this.sessions.values()).filter(
      (session) => session.studentId === studentId
    );
  }

  async getSessionsByTutor(tutorId: number): Promise<Session[]> {
    return Array.from(this.sessions.values()).filter(
      (session) => session.tutorId === tutorId
    );
  }

  async createSession(session: InsertSession): Promise<Session> {
    const id = this.sessionId++;
    const now = new Date();
    const newSession = {
      ...session,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.sessions.set(id, newSession);
    this.saveAllData();
    return newSession;
  }

  async updateSessionStatus(id: number, status: 'pending' | 'confirmed' | 'completed' | 'cancelled'): Promise<Session | undefined> {
    const session = this.sessions.get(id);
    if (!session) return undefined;

    const updatedSession = {
      ...session,
      status,
      updatedAt: new Date()
    };
    this.sessions.set(id, updatedSession);
    this.saveAllData();
    return updatedSession;
  }

  // Review methods
  async getReview(id: number): Promise<Review | undefined> {
    return this.reviews.get(id);
  }

  async getReviewsByTutor(tutorId: number): Promise<Review[]> {
    return Array.from(this.reviews.values()).filter(
      (review) => review.tutorId === tutorId
    );
  }

  async createReview(review: InsertReview): Promise<Review> {
    const id = this.reviewId++;
    const newReview = { ...review, id, createdAt: new Date() };
    this.reviews.set(id, newReview);
    
    // Update tutor's rating
    const tutorProfile = await this.getTutorProfileByUserId(review.tutorId);
    if (tutorProfile) {
      const reviews = await this.getReviewsByTutor(review.tutorId);
      const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0) + review.rating;
      const newReviewCount = reviews.length + 1;
      const newRating = Math.round(totalRating / newReviewCount * 10) / 10;
      
      await this.updateTutorProfile(tutorProfile.id, {
        rating: newRating,
        reviewCount: newReviewCount
      });
    }
    
    this.saveAllData();
    return newReview;
  }

  // Conversation methods
  async getConversation(id: number): Promise<Conversation | undefined> {
    return this.conversations.get(id);
  }

  async getConversationByParticipants(userOneId: number, userTwoId: number): Promise<Conversation | undefined> {
    return Array.from(this.conversations.values()).find(
      (conversation) => 
        (conversation.participantOneId === userOneId && conversation.participantTwoId === userTwoId) ||
        (conversation.participantOneId === userTwoId && conversation.participantTwoId === userOneId)
    );
  }

  async getConversationsByUser(userId: number): Promise<(Conversation & { 
    otherParticipant: User,
    lastMessage?: Message
  })[]> {
    const userConversations = Array.from(this.conversations.values()).filter(
      (conversation) => 
        conversation.participantOneId === userId || conversation.participantTwoId === userId
    );
    
    return Promise.all(userConversations.map(async (conversation) => {
      const otherParticipantId = conversation.participantOneId === userId 
        ? conversation.participantTwoId 
        : conversation.participantOneId;
      
      const otherParticipant = this.users.get(otherParticipantId);
      if (!otherParticipant) throw new Error(`User not found for conversation ${conversation.id}`);
      
      // Get the last message
      const conversationMessages = await this.getMessagesByConversation(conversation.id);
      const lastMessage = conversationMessages.length > 0 
        ? conversationMessages.sort((a, b) => b.sentAt.getTime() - a.sentAt.getTime())[0]
        : undefined;
      
      return {
        ...conversation,
        otherParticipant,
        lastMessage
      };
    }));
  }

  async createConversation(conversation: InsertConversation): Promise<Conversation> {
    const id = this.conversationId++;
    const now = new Date();
    const newConversation = {
      ...conversation,
      id,
      lastMessageAt: now,
      createdAt: now
    };
    this.conversations.set(id, newConversation);
    this.saveAllData();
    return newConversation;
  }

  // Message methods
  async getMessage(id: number): Promise<Message | undefined> {
    return this.messages.get(id);
  }

  async getMessagesByConversation(conversationId: number): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(message => message.conversationId === conversationId)
      .sort((a, b) => a.sentAt.getTime() - b.sentAt.getTime());
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const id = this.messageId++;
    const now = new Date();
    const newMessage = { ...message, id, sentAt: now };
    this.messages.set(id, newMessage);
    
    // Update last message time in conversation
    const conversation = await this.getConversation(message.conversationId);
    if (conversation) {
      const updatedConversation = {
        ...conversation,
        lastMessageAt: now
      };
      this.conversations.set(conversation.id, updatedConversation);
    }
    
    this.saveAllData();
    return newMessage;
  }

  async updateMessageStatus(id: number, status: 'sent' | 'delivered' | 'read'): Promise<Message | undefined> {
    const message = this.messages.get(id);
    if (!message) return undefined;

    const updatedMessage = { ...message, status };
    this.messages.set(id, updatedMessage);
    this.saveAllData();
    return updatedMessage;
  }

  // Payment method methods
  async getPaymentMethod(id: number): Promise<PaymentMethod | undefined> {
    return this.paymentMethods.get(id);
  }

  async getPaymentMethodsByUser(userId: number): Promise<PaymentMethod[]> {
    return Array.from(this.paymentMethods.values()).filter(
      (method) => method.userId === userId
    );
  }

  async createPaymentMethod(paymentMethod: InsertPaymentMethod): Promise<PaymentMethod> {
    const id = this.paymentMethodId++;
    const newPaymentMethod = { ...paymentMethod, id, createdAt: new Date() };
    
    // If this is set as default, unset any other default payment methods for this user
    if (paymentMethod.isDefault) {
      for (const [paymentId, payment] of this.paymentMethods.entries()) {
        if (payment.userId === paymentMethod.userId && payment.isDefault) {
          this.paymentMethods.set(paymentId, { ...payment, isDefault: false });
        }
      }
    }
    
    this.paymentMethods.set(id, newPaymentMethod);
    this.saveAllData();
    return newPaymentMethod;
  }

  async updatePaymentMethodDefault(userId: number, paymentMethodId: number): Promise<void> {
    // Unset any default payment methods for this user
    for (const [id, payment] of this.paymentMethods.entries()) {
      if (payment.userId === userId && payment.isDefault) {
        this.paymentMethods.set(id, { ...payment, isDefault: false });
      }
    }
    
    // Set the specified payment method as default
    const paymentMethod = this.paymentMethods.get(paymentMethodId);
    if (paymentMethod && paymentMethod.userId === userId) {
      this.paymentMethods.set(paymentMethodId, { ...paymentMethod, isDefault: true });
    }
    
    this.saveAllData();
  }
}

// Import DatabaseStorage
import { DatabaseStorage } from "./db-storage";

// Use file-based storage for local development (when DATABASE_URL is not set)
// Use DatabaseStorage for PostgreSQL (when DATABASE_URL is set)
export const storage = process.env.DATABASE_URL 
  ? new DatabaseStorage() 
  : new FileStorage();
