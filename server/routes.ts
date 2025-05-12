import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  isAuthenticated, isAuthorized, setupAuth
} from "./auth";
import { setupWebSocketServer } from "./socket";
import { validateZodSchema } from "./utils";
import { 
  insertSessionSchema, 
  insertReviewSchema, 
  insertPaymentMethodSchema,
  insertMessageSchema,
  insertConversationSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Create HTTP server
  const httpServer = createServer(app);
  
  // Setup authentication
  setupAuth(app);
  
  // Setup WebSocket server
  setupWebSocketServer(httpServer);

  // User routes
  app.get("/api/users/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Don't return password
      const { password, ...userWithoutPassword } = user;
      
      return res.json(userWithoutPassword);
    } catch (error) {
      console.error("Get user error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.put("/api/users/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      
      // Check if the user is updating their own profile
      if (req.user.id !== userId) {
        return res.status(403).json({ message: "You can only update your own profile" });
      }
      
      const userData = req.body;
      delete userData.password; // Don't allow password updates through this endpoint
      
      const updatedUser = await storage.updateUser(userId, userData);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Don't return password
      const { password, ...userWithoutPassword } = updatedUser;
      
      return res.json(userWithoutPassword);
    } catch (error) {
      console.error("Update user error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });

  // Tutor profile routes
  app.get("/api/tutors", isAuthenticated, async (req, res) => {
    try {
      // If query parameters are provided, use them
      if (Object.keys(req.query).length > 0) {
        const filters = {
          subjects: req.query.subjects as string,
          program: req.query.program as string,
          semester: req.query.semester as string,
          maxRate: req.query.maxRate ? parseInt(req.query.maxRate as string) : undefined,
          isAvailableNow: req.query.isAvailableNow === 'true'
        };
        
        const tutors = await storage.searchTutorProfiles(filters);
        return res.json(tutors);
      } 
      
      // If no query parameters, match based on student profile
      if (req.user && req.user.role === 'student') {
        console.log("Finding tutors for student user ID:", req.user.id);
        
        // Get student's preferences from their profile
        const student = await storage.getUser(req.user.id);
        if (!student) {
          return res.status(404).json({ message: "Student profile not found" });
        }
        
        // Extract relevant information from student profile for matching
        const filters = {
          subjects: student.subjects?.join(','), // Assuming subjects is stored as an array
          program: student.program,
          semester: student.semester,
          maxRate: student.maxBudget // Assuming student has a budget field
        };
        
        console.log("Matching with filters:", filters);
        const tutors = await storage.searchTutorProfiles(filters);
        return res.json(tutors);
      }
      
      // Fallback to returning all tutors if not a student or no profile data
      const tutors = await storage.searchTutorProfiles({});
      return res.json(tutors);
    } catch (error) {
      console.error("Search tutors error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  // Students routes
  app.get("/api/students", isAuthenticated, isAuthorized('tutor'), async (req, res) => {
    try {
      // Get the tutor subjects to filter students
      const userId = req.user.id!;
      console.log(`Finding students for tutor user ID: ${userId}`);
      
      const tutorProfile = await storage.getTutorProfileByUserId(userId);
      
      if (!tutorProfile) {
        console.log(`No tutor profile found for user ID: ${userId}`);
        return res.status(404).json({ message: "Tutor profile not found" });
      }
      
      // Get tutor details for advanced filtering
      const tutorUser = await storage.getUser(userId);
      if (!tutorUser) {
        return res.status(404).json({ message: "Tutor user not found" });
      }
      
      console.log(`Tutor subjects: ${JSON.stringify(tutorProfile.subjects)}`);
      console.log(`Tutor availability: ${tutorProfile.availability}`);
      console.log(`Tutor hourly rate: ${tutorProfile.hourlyRate}`);
      console.log(`Tutor program: ${tutorUser.program}`);
      console.log(`Tutor semester: ${tutorUser.semester}`);
      
      // Parse program and semester from query params or use from tutor profile
      const programFilter = (req.query.program as string) || undefined;
      const semesterFilter = (req.query.semester as string) || undefined;
      
      const filters = {
        subjects: tutorProfile.subjects,
        program: programFilter,
        semester: semesterFilter,
        availability: tutorProfile.availability, // Add availability for matching
        maxBudget: tutorProfile.hourlyRate // Students with budget >= tutor's hourly rate
      };
      
      console.log(`Search filters: ${JSON.stringify(filters)}`);
      
      const students = await storage.searchStudents(filters);
      console.log(`Found ${students.length} matching students`);
      
      // Don't return passwords
      const studentsWithoutPasswords = students.map(student => {
        const { password, ...studentWithoutPassword } = student;
        return studentWithoutPassword;
      });
      
      return res.json(studentsWithoutPasswords);
    } catch (error) {
      console.error("Search students error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  app.get("/api/students/:id", isAuthenticated, async (req, res) => {
    try {
      const studentId = parseInt(req.params.id);
      const student = await storage.getUser(studentId);
      
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }
      
      // Check if the user being requested is actually a student
      if (student.role !== 'student') {
        return res.status(404).json({ message: "Student not found" });
      }
      
      // Don't return password
      const { password, ...studentWithoutPassword } = student;
      
      return res.json(studentWithoutPassword);
    } catch (error) {
      console.error("Get student error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/tutors/:id", async (req, res) => {
    try {
      const tutorId = parseInt(req.params.id);
      const tutorProfile = await storage.getTutorProfile(tutorId);
      
      if (!tutorProfile) {
        return res.status(404).json({ message: "Tutor profile not found" });
      }
      
      const user = await storage.getUser(tutorProfile.userId);
      
      if (!user) {
        return res.status(404).json({ message: "Tutor user not found" });
      }
      
      // Don't return password
      const { password, ...userWithoutPassword } = user;
      
      return res.json({
        ...tutorProfile,
        user: userWithoutPassword
      });
    } catch (error) {
      console.error("Get tutor error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.put("/api/tutors/:id", isAuthenticated, isAuthorized('tutor'), async (req, res) => {
    try {
      const tutorProfileId = parseInt(req.params.id);
      const tutorProfile = await storage.getTutorProfile(tutorProfileId);
      
      if (!tutorProfile) {
        return res.status(404).json({ message: "Tutor profile not found" });
      }
      
      // Check if the user is updating their own profile
      if (req.user.id !== tutorProfile.userId) {
        return res.status(403).json({ message: "You can only update your own tutor profile" });
      }
      
      const updatedProfile = await storage.updateTutorProfile(tutorProfileId, req.body);
      
      if (!updatedProfile) {
        return res.status(404).json({ message: "Tutor profile not found" });
      }
      
      return res.json(updatedProfile);
    } catch (error) {
      console.error("Update tutor profile error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });

  // Session routes
  app.post("/api/sessions", isAuthenticated, async (req, res) => {
    try {
      console.log("Session data received:", JSON.stringify(req.body, null, 2));
      
      // First fix date if sent as Date object and not string
      if (req.body.date && req.body.date instanceof Date) {
        req.body.date = req.body.date.toISOString();
      }
      
      // Ensure all required fields are present and valid
      const sessionData = {
        studentId: req.body.studentId,
        tutorId: req.body.tutorId,
        subject: req.body.subject || "",
        sessionType: req.body.sessionType || "online",
        date: new Date(req.body.date), // Convert to Date object
        startTime: req.body.startTime || "09:00",
        duration: req.body.duration || 60,
        totalAmount: req.body.totalAmount || 1000,
        status: "pending", // Always start as pending
        description: req.body.description || "",
      };
      
      console.log("Processed session data:", JSON.stringify(sessionData, null, 2));
      
      const result = validateZodSchema(insertSessionSchema, sessionData);
      if (!result.success) {
        console.error("Validation failed:", result.error);
        return res.status(400).json({ message: result.error });
      }
      
      // Allow both students booking for themselves and tutors booking for students
      if (req.user.role === 'student' && result.data.studentId !== req.user.id) {
        return res.status(403).json({ message: "You can only book sessions for yourself" });
      }
      if (req.user.role === 'tutor' && result.data.tutorId !== req.user.id) {
        return res.status(403).json({ message: "You can only book sessions as yourself" });
      }
      
      const session = await storage.createSession({
        ...result.data,
        createdBy: req.user.id // Track who created the session
      });
      console.log("Session created successfully:", session);
      return res.status(201).json(session);
    } catch (error) {
      console.error("Create session error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/sessions", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id!;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      let sessions;
      if (user.role === 'student') {
        sessions = await storage.getSessionsByStudent(userId);
      } else { // tutor
        sessions = await storage.getSessionsByTutor(userId);
      }
      
      // Add tutor/student details to each session
      const sessionsWithDetails = await Promise.all(sessions.map(async (session) => {
        const tutor = await storage.getUser(session.tutorId);
        const student = await storage.getUser(session.studentId);
        
        return {
          ...session,
          tutor: tutor ? { 
            id: tutor.id,
            fullName: tutor.fullName,
            profileImage: tutor.profileImage
          } : undefined,
          student: student ? {
            id: student.id,
            fullName: student.fullName,
            profileImage: student.profileImage
          } : undefined
        };
      }));
      
      return res.json(sessionsWithDetails);
    } catch (error) {
      console.error("Get sessions error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/sessions/pending", isAuthenticated, isAuthorized('tutor'), async (req, res) => {
    try {
      const tutorId = req.query.tutorId ? parseInt(req.query.tutorId as string) : req.user.id!;
      
      // Ensure the user is authorized to view this data (must be the tutor themselves)
      if (tutorId !== req.user.id) {
        return res.status(403).json({ message: "You can only view pending sessions for yourself" });
      }
      
      // Get all sessions for this tutor
      const allSessions = await storage.getSessionsByTutor(tutorId);
      
      // Filter to only pending sessions
      const pendingSessions = allSessions.filter(session => session.status === 'pending');
      
      // Add student details to each session
      const sessionsWithDetails = await Promise.all(pendingSessions.map(async (session) => {
        const student = await storage.getUser(session.studentId);
        
        return {
          ...session,
          student: student ? {
            id: student.id,
            fullName: student.fullName,
            profileImage: student.profileImage,
            program: student.program,
            semester: student.semester,
            university: student.university
          } : undefined
        };
      }));
      
      return res.json(sessionsWithDetails);
    } catch (error) {
      console.error("Get pending sessions error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.put("/api/sessions/:id/status", isAuthenticated, async (req, res) => {
    try {
      const sessionId = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!status || !['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      const session = await storage.getSession(sessionId);
      
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }
      
      // Check authorization
      const userId = req.user.id!;
      if (session.studentId !== userId && session.tutorId !== userId) {
        return res.status(403).json({ message: "You are not authorized to update this session" });
      }
      
      // Handle different status updates
      if (status === 'confirmed') {
        // Only allow confirmation by the non-creator
        if (userId === session.createdBy) {
          return res.status(403).json({ message: "You cannot confirm your own booking request" });
        }
        
        // For student-initiated bookings, only tutor can confirm
        if (session.createdBy === session.studentId && userId !== session.tutorId) {
          return res.status(403).json({ message: "Only tutors can confirm student-initiated sessions" });
        }
        
        // For tutor-initiated bookings, only student can confirm 
        if (session.createdBy === session.tutorId && userId !== session.studentId) {
          return res.status(403).json({ message: "Only students can confirm tutor-initiated sessions" });
        }

        // Move to upcoming when confirmed
        status = 'upcoming';
      }
      else if (status === 'cancelled') {
        // Allow cancellation only by the creator
        if (userId !== session.createdBy) {
          return res.status(403).json({ message: "Only the booking creator can cancel this session" });
        }
      }
      else if (status === 'declined') {
        // Only allow declining by the non-creator
        if (userId === session.createdBy) {
          return res.status(403).json({ message: "You cannot decline your own booking request" });
        }
        
        // For student-initiated bookings, only tutor can decline
        if (session.createdBy === session.studentId && userId !== session.tutorId) {
          return res.status(403).json({ message: "Only tutors can decline student-initiated sessions" });
        }
        
        // For tutor-initiated bookings, only student can decline
        if (session.createdBy === session.tutorId && userId !== session.studentId) {
          return res.status(403).json({ message: "Only students can decline tutor-initiated sessions" });
        }
      }
      
      if (status === 'completed' && userId !== session.tutorId) {
        return res.status(403).json({ message: "Only tutors can mark sessions as completed" });
      }
      
      const updatedSession = await storage.updateSessionStatus(sessionId, status);
      
      if (!updatedSession) {
        return res.status(404).json({ message: "Session not found" });
      }
      
      return res.json(updatedSession);
    } catch (error) {
      console.error("Update session status error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });

  // Reviews routes
  app.post("/api/reviews", isAuthenticated, isAuthorized('student'), async (req, res) => {
    try {
      const result = validateZodSchema(insertReviewSchema, req.body);
      if (!result.success) {
        return res.status(400).json({ message: result.error });
      }
      
      // Make sure the student ID matches the current user
      if (result.data.studentId !== req.user.id) {
        return res.status(403).json({ message: "You can only leave reviews as yourself" });
      }
      
      // Verify that the session exists and is completed
      const session = await storage.getSession(result.data.sessionId);
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }
      
      if (session.status !== 'completed') {
        return res.status(400).json({ message: "You can only review completed sessions" });
      }
      
      // Check if the user was the student for this session
      if (session.studentId !== req.user.id) {
        return res.status(403).json({ message: "You can only review sessions you participated in" });
      }
      
      const review = await storage.createReview(result.data);
      return res.status(201).json(review);
    } catch (error) {
      console.error("Create review error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  // Tutor feedback for sessions (no rating, just comments)
  app.post("/api/sessions/feedback", isAuthenticated, isAuthorized('tutor'), async (req, res) => {
    try {
      const { sessionId, comment } = req.body;
      
      if (!sessionId || !comment) {
        return res.status(400).json({ message: "Session ID and comment are required" });
      }
      
      // Verify that the session exists and is completed
      const session = await storage.getSession(sessionId);
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }
      
      if (session.status !== 'completed') {
        return res.status(400).json({ message: "You can only provide feedback for completed sessions" });
      }
      
      // Check if the user was the tutor for this session
      if (session.tutorId !== req.user.id) {
        return res.status(403).json({ message: "You can only provide feedback for sessions you participated in" });
      }
      
      // For the prototype, we'll just return success - in a real app, this would save to the database
      return res.status(200).json({ 
        success: true, 
        message: "Feedback submitted successfully",
        sessionId,
        tutorId: req.user.id,
        comment
      });
    } catch (error) {
      console.error("Tutor feedback error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/tutors/:id/reviews", async (req, res) => {
    try {
      const tutorId = parseInt(req.params.id);
      const reviews = await storage.getReviewsByTutor(tutorId);
      
      // Add student details to each review
      const reviewsWithStudents = await Promise.all(reviews.map(async (review) => {
        const student = await storage.getUser(review.studentId);
        
        return {
          ...review,
          student: student ? {
            id: student.id,
            fullName: student.fullName,
            profileImage: student.profileImage
          } : undefined
        };
      }));
      
      return res.json(reviewsWithStudents);
    } catch (error) {
      console.error("Get tutor reviews error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });

  // Conversation routes
  app.get("/api/conversations", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id!;
      const conversations = await storage.getConversationsByUser(userId);
      return res.json(conversations);
    } catch (error) {
      console.error("Get conversations error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/conversations", isAuthenticated, async (req, res) => {
    try {
      const result = validateZodSchema(insertConversationSchema, req.body);
      if (!result.success) {
        return res.status(400).json({ message: result.error });
      }
      
      // Check if the conversation already exists
      const existingConversation = await storage.getConversationByParticipants(
        result.data.participantOneId,
        result.data.participantTwoId
      );
      
      if (existingConversation) {
        return res.json(existingConversation); // Return existing conversation
      }
      
      // Make sure one of the participants is the current user
      const userId = req.user.id!;
      if (result.data.participantOneId !== userId && result.data.participantTwoId !== userId) {
        return res.status(403).json({ message: "You can only create conversations that include yourself" });
      }
      
      const conversation = await storage.createConversation(result.data);
      return res.status(201).json(conversation);
    } catch (error) {
      console.error("Create conversation error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });

  // Message routes
  app.get("/api/conversations/:id/messages", isAuthenticated, async (req, res) => {
    try {
      const conversationId = parseInt(req.params.id);
      const conversation = await storage.getConversation(conversationId);
      
      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }
      
      // Check if the user is part of the conversation
      const userId = req.user.id!;
      if (conversation.participantOneId !== userId && conversation.participantTwoId !== userId) {
        return res.status(403).json({ message: "You are not part of this conversation" });
      }
      
      const messages = await storage.getMessagesByConversation(conversationId);
      
      // Mark messages as read if the user is the receiver
      await Promise.all(
        messages
          .filter(message => message.receiverId === userId && message.status !== 'read')
          .map(message => storage.updateMessageStatus(message.id, 'read'))
      );
      
      return res.json(messages);
    } catch (error) {
      console.error("Get messages error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/conversations/:id/messages", isAuthenticated, async (req, res) => {
    try {
      const conversationId = parseInt(req.params.id);
      const conversation = await storage.getConversation(conversationId);
      
      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }
      
      // Check if the user is part of the conversation
      const userId = req.user.id!;
      if (conversation.participantOneId !== userId && conversation.participantTwoId !== userId) {
        return res.status(403).json({ message: "You are not part of this conversation" });
      }
      
      // Determine receiver ID
      const receiverId = conversation.participantOneId === userId
        ? conversation.participantTwoId
        : conversation.participantOneId;
      
      const messageData = {
        ...req.body,
        conversationId,
        senderId: userId,
        receiverId
      };
      
      const result = validateZodSchema(insertMessageSchema, messageData);
      if (!result.success) {
        return res.status(400).json({ message: result.error });
      }
      
      const message = await storage.createMessage(result.data);
      return res.status(201).json(message);
    } catch (error) {
      console.error("Create message error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });

  // Payment methods routes
  // API for students interested in specific subjects
  // API for students interested in specific subjects
  app.get("/api/students/interested", isAuthenticated, isAuthorized('tutor'), async (req, res) => {
    try {
      // Parse filter parameters from query
      const { subject, program, semester } = req.query;
      
      // Get the tutor profile to get their subjects
      const tutorProfile = await storage.getTutorProfileByUserId(req.user.id!);
      
      // Create filter object
      const filters: Partial<{
        subjects: string[];
        program: string;
        semester: string;
      }> = {};
      
      // Add filters based on query parameters
      if (subject) {
        filters.subjects = [subject as string];
      } else if (tutorProfile) {
        // If no specific subject filter is provided, use tutor's subjects
        filters.subjects = tutorProfile.subjects;
      }
      
      if (program) {
        filters.program = program as string;
      }
      
      if (semester) {
        filters.semester = semester as string;
      }
      
      // Get filtered students
      const students = await storage.searchStudents(filters);
      
      // Map to simplified objects for response
      const studentData = students.map(student => ({
        id: student.id,
        fullName: student.fullName || 'Unknown',
        program: student.program || 'Not specified',
        semester: student.semester || 'Not specified',
        university: student.university || 'Not specified',
        subjects: student.subjects || [],
        profileImage: student.profileImage,
        bio: student.bio
      }));
      
      return res.json(studentData);
    } catch (error) {
      console.error("Get interested students error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });

  // Create tutor profile during registration if role is tutor
  app.post("/api/tutors/profile", isAuthenticated, isAuthorized('tutor'), async (req, res) => {
    try {
      const userId = req.user.id!;
      const existingProfile = await storage.getTutorProfileByUserId(userId);
      
      if (existingProfile) {
        return res.status(400).json({ message: "Tutor profile already exists" });
      }

      const profile = await storage.createTutorProfile({
        userId,
        subjects: req.body.subjects || [],
        hourlyRate: req.body.hourlyRate || 0,
        experience: req.body.experience || "",
        availability: req.body.availability || "",
        isAvailableNow: true,
        rating: 0,
        reviewCount: 0
      });

      return res.status(201).json(profile);
    } catch (error) {
      console.error("Create tutor profile error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  app.get("/api/payment-methods", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id!;
      const paymentMethods = await storage.getPaymentMethodsByUser(userId);
      return res.json(paymentMethods);
    } catch (error) {
      console.error("Get payment methods error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/payment-methods", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id!;
      const paymentData = {
        ...req.body,
        userId
      };
      
      const result = validateZodSchema(insertPaymentMethodSchema, paymentData);
      if (!result.success) {
        return res.status(400).json({ message: result.error });
      }
      
      const paymentMethod = await storage.createPaymentMethod(result.data);
      return res.status(201).json(paymentMethod);
    } catch (error) {
      console.error("Create payment method error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.put("/api/payment-methods/:id/default", isAuthenticated, async (req, res) => {
    try {
      const paymentMethodId = parseInt(req.params.id);
      const userId = req.user.id!;
      
      const paymentMethod = await storage.getPaymentMethod(paymentMethodId);
      
      if (!paymentMethod) {
        return res.status(404).json({ message: "Payment method not found" });
      }
      
      // Check if the payment method belongs to the user
      if (paymentMethod.userId !== userId) {
        return res.status(403).json({ message: "You can only set your own payment methods as default" });
      }
      
      await storage.updatePaymentMethodDefault(userId, paymentMethodId);
      return res.json({ message: "Payment method set as default" });
    } catch (error) {
      console.error("Update payment method default error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });

  return httpServer;
}
