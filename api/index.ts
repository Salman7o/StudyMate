import express from 'express';
import { storage } from '../server/storage';
import { 
  isAuthenticated, isAuthorized, setupAuth
} from '../server/auth';
import { validateZodSchema } from '../server/utils';

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Setup authentication
setupAuth(app);

// Simple in-memory storage for serverless function
const inMemoryStorage = {
  users: [
    {
      id: 1,
      username: 'demo-student',
      email: 'student@demo.com',
      fullName: 'Demo Student',
      role: 'student',
      subjects: 'calculus,linear algebra',
      program: 'Computer Science',
      semester: '6',
      university: 'Demo University',
      availability: 'monday 2-5pm',
      hourlyRate: 1000,
      joinedAt: new Date()
    },
    {
      id: 2,
      username: 'demo-tutor',
      email: 'tutor@demo.com',
      fullName: 'Demo Tutor',
      role: 'tutor',
      subjects: 'calculus,linear algebra',
      program: 'Computer Science',
      semester: '6',
      university: 'Demo University',
      availability: 'tuesday 2-5pm',
      hourlyRate: 1000,
      joinedAt: new Date()
    }
  ],
  tutorProfiles: [
    {
      id: 1,
      userId: 2,
      subjects: 'calculus,linear algebra',
      hourlyRate: 1000,
      experience: '5 years',
      availability: 'tuesday 2-5pm',
      isAvailableNow: true,
      rating: 4.5,
      reviewCount: 10
    }
  ],
  sessions: [] as any[],
  conversations: [] as any[],
  messages: [] as any[]
};

// Override storage methods for serverless
const serverlessStorage = {
  getUser: async (id: number) => {
    return inMemoryStorage.users.find(u => u.id === id) || null;
  },
  getUserByUsername: async (username: string) => {
    return inMemoryStorage.users.find(u => u.username === username) || null;
  },
  createUser: async (userData: any) => {
    const newUser = {
      id: inMemoryStorage.users.length + 1,
      ...userData,
      joinedAt: new Date()
    };
    inMemoryStorage.users.push(newUser);
    return newUser;
  },
  searchTutorProfiles: async (filters: any) => {
    return inMemoryStorage.tutorProfiles;
  },
  searchStudents: async (filters: any) => {
    return inMemoryStorage.users.filter(u => u.role === 'student');
  },
  getAllUsers: async () => {
    return inMemoryStorage.users;
  },
  getTutorProfileByUserId: async (userId: number) => {
    return inMemoryStorage.tutorProfiles.find(p => p.userId === userId) || null;
  },
  createTutorProfile: async (profileData: any) => {
    const newProfile = {
      id: inMemoryStorage.tutorProfiles.length + 1,
      ...profileData
    };
    inMemoryStorage.tutorProfiles.push(newProfile);
    return newProfile;
  },
  getSessionsByUserId: async (userId: number) => {
    return inMemoryStorage.sessions.filter((s: any) => s.studentId === userId || s.tutorId === userId);
  },
  createSession: async (sessionData: any) => {
    const newSession = {
      id: inMemoryStorage.sessions.length + 1,
      ...sessionData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    inMemoryStorage.sessions.push(newSession);
    return newSession;
  },
  getConversationsByUserId: async (userId: number) => {
    return inMemoryStorage.conversations.filter((c: any) => 
      c.participantOneId === userId || c.participantTwoId === userId
    );
  },
  createConversation: async (conversationData: any) => {
    const newConversation = {
      id: inMemoryStorage.conversations.length + 1,
      ...conversationData,
      createdAt: new Date()
    };
    inMemoryStorage.conversations.push(newConversation);
    return newConversation;
  },
  getMessagesByConversationId: async (conversationId: number) => {
    return inMemoryStorage.messages.filter((m: any) => m.conversationId === conversationId);
  },
  createMessage: async (messageData: any) => {
    const newMessage = {
      id: inMemoryStorage.messages.length + 1,
      ...messageData,
      sentAt: new Date()
    };
    inMemoryStorage.messages.push(newMessage);
    return newMessage;
  },
  getPaymentMethodsByUserId: async (userId: number) => {
    return [];
  }
};

// Use serverless storage instead of SQLite storage
const originalStorage = storage;
Object.assign(storage, serverlessStorage);

// Basic health check
app.get('/api', (req, res) => {
  res.json({ message: 'StudyMate API is running' });
});

// User routes
app.get("/api/users/:id", isAuthenticated, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const user = await storage.getUser(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Don't return password
    const { password, ...userWithoutPassword } = user as any;

    return res.json(userWithoutPassword);
  } catch (error) {
    console.error("Get user error:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

// Auth routes
app.post("/api/auth/register", async (req, res) => {
  try {
    const userData = req.body;
    console.log("Register request body:", userData);

    // Check if username already exists
    const existingUser = await storage.getUserByUsername(userData.username);
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }

    // Create user
    const newUser = await storage.createUser(userData);
    if (!newUser) {
      return res.status(500).json({ message: "Failed to create user" });
    }

    // Create tutor profile if role is tutor
    if (userData.role === 'tutor' && userData.tutorProfile) {
      try {
        await storage.createTutorProfile({
          userId: newUser.id,
          ...userData.tutorProfile
        });
      } catch (error) {
        console.error("Error creating tutor profile:", error);
        // Don't fail the registration if tutor profile creation fails
      }
    }

    // Don't return password
    const { password, ...userWithoutPassword } = newUser as any;

    return res.status(201).json({ 
      message: "User registered successfully", 
      user: userWithoutPassword 
    });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log("Login attempt for username:", username);

    const user = await storage.getUserByUsername(username);
    if (!user) {
      console.log("Login failed - User not found for:", username);
      return res.status(401).json({ message: "Invalid username or password" });
    }

    // Simple password check (in production, use bcrypt)
    if ((user as any).password !== password) {
      console.log("Login failed - Invalid credentials for:", username);
      return res.status(401).json({ message: "Invalid username or password" });
    }

    // Set up session
    req.login(user, (err) => {
      if (err) {
        console.error("Login error:", err);
        return res.status(500).json({ message: "Login failed" });
      }

      console.log("Login successful for user ID:", user.id);
      
      // Don't return password
      const { password, ...userWithoutPassword } = user as any;
      
      return res.json({ 
        message: "Logged in successfully", 
        user: userWithoutPassword 
      });
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/auth/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error("Logout error:", err);
      return res.status(500).json({ message: "Logout failed" });
    }
    return res.json({ message: "Logged out successfully" });
  });
});

app.get("/api/auth/me", (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  
  // Don't return password
  const { password, ...userWithoutPassword } = req.user as any;
  return res.json({ user: userWithoutPassword });
});

// Tutor routes
app.get("/api/tutors", async (req, res) => {
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

      let tutors = await storage.searchTutorProfiles(filters) as any;
      // Convert subjects string to array for each tutor
      tutors = tutors.map((tutor: any) => ({
        ...tutor,
        subjects: typeof tutor.subjects === 'string' ? tutor.subjects.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
      }));
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
        subjects: (student as any).subjects || "", // searchTutorProfiles expects string
        program: (student as any).program || undefined,
        semester: (student as any).semester || undefined,
      };

      console.log("Matching with filters:", filters);
      let tutors = await storage.searchTutorProfiles(filters) as any;
      // Convert subjects string to array for each tutor
      tutors = tutors.map((tutor: any) => ({
        ...tutor,
        subjects: typeof tutor.subjects === 'string' ? tutor.subjects.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
      }));
      return res.json(tutors);
    }

    // Fallback to returning all tutors if not a student or no profile data
    let tutors = await storage.searchTutorProfiles({}) as any;
    // Convert subjects string to array for each tutor
    tutors = tutors.map((tutor: any) => ({
      ...tutor,
      subjects: typeof tutor.subjects === 'string' ? tutor.subjects.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
    }));
    return res.json(tutors);
  } catch (error) {
    console.error("Search tutors error:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

// Students routes
app.get("/api/students", async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      // Return all students if user is not authenticated
      const allStudents = await storage.getAllUsers();
      const students = allStudents.filter(user => user.role === 'student');
      return res.json(students);
    }
    
    // Get the tutor subjects to filter students if authenticated
    const userId = req.user.id;
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
    console.log(`Tutor program: ${(tutorUser as any).program}`);
    console.log(`Tutor semester: ${(tutorUser as any).semester}`);

    // Parse program and semester from query params or use from tutor profile
    const programFilter = (req.query.program as string) || undefined;
    const semesterFilter = (req.query.semester as string) || undefined;

    const filters = {
      subjects: Array.isArray(tutorProfile.subjects)
        ? tutorProfile.subjects
        : (typeof tutorProfile.subjects === 'string' ? tutorProfile.subjects.split(',').map(s => s.trim()) : []),
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
      const { password, ...studentWithoutPassword } = student as any;
      return studentWithoutPassword;
    });

    return res.json(studentsWithoutPasswords);
  } catch (error) {
    console.error("Search students error:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

// Sessions routes
app.get("/api/sessions", isAuthenticated, async (req, res) => {
  try {
    const sessions = await storage.getSessionsByUserId(req.user!.id);
    return res.json(sessions);
  } catch (error) {
    console.error("Get sessions error:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/sessions", isAuthenticated, async (req, res) => {
  try {
    const sessionData = req.body;
    console.log("Session booking attempt:", {
      userRole: req.user!.role,
      userId: req.user!.id,
      requestedStudentId: sessionData.studentId,
      requestedTutorId: sessionData.tutorId
    });

    // Create session
    const newSession = await storage.createSession(sessionData);
    if (!newSession) {
      return res.status(500).json({ message: "Failed to create session" });
    }

    console.log("Session created successfully:", newSession);
    return res.status(201).json(newSession);
  } catch (error) {
    console.error("Create session error:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

// Conversations routes
app.get("/api/conversations", isAuthenticated, async (req, res) => {
  try {
    const conversations = await storage.getConversationsByUserId(req.user!.id);
    return res.json(conversations);
  } catch (error) {
    console.error("Get conversations error:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/conversations", isAuthenticated, async (req, res) => {
  try {
    const conversationData = {
      ...req.body,
      participantOneId: req.user!.id
    };

    const newConversation = await storage.createConversation(conversationData);
    if (!newConversation) {
      return res.status(500).json({ message: "Failed to create conversation" });
    }

    return res.status(201).json(newConversation);
  } catch (error) {
    console.error("Create conversation error:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

// Messages routes
app.get("/api/conversations/:id/messages", isAuthenticated, async (req, res) => {
  try {
    const conversationId = parseInt(req.params.id);
    const messages = await storage.getMessagesByConversationId(conversationId);
    return res.json(messages);
  } catch (error) {
    console.error("Get messages error:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/conversations/:id/messages", isAuthenticated, async (req, res) => {
  try {
    const conversationId = parseInt(req.params.id);
    const messageData = {
      ...req.body,
      conversationId,
      senderId: req.user!.id
    };

    const newMessage = await storage.createMessage(messageData);
    if (!newMessage) {
      return res.status(500).json({ message: "Failed to create message" });
    }

    return res.status(201).json(newMessage);
  } catch (error) {
    console.error("Create message error:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

// Subjects route
app.get("/api/subjects", async (req, res) => {
  try {
    const subjects = [
      "Mathematics", "Physics", "Chemistry", "Biology", "Computer Science",
      "English", "History", "Geography", "Economics", "Psychology",
      "Calculus", "Linear Algebra", "Statistics", "Programming", "Data Structures",
      "Algorithms", "Database Systems", "Web Development", "Machine Learning",
      "Artificial Intelligence", "Software Engineering", "Computer Networks",
      "Operating Systems", "Computer Architecture", "Cybersecurity"
    ];
    return res.json(subjects);
  } catch (error) {
    console.error("Get subjects error:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

// Payment methods route
app.get("/api/payment-methods", isAuthenticated, async (req, res) => {
  try {
    const paymentMethods = await storage.getPaymentMethodsByUserId(req.user!.id);
    return res.json(paymentMethods);
  } catch (error) {
    console.error("Get payment methods error:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

// Tutor profile routes
app.post("/api/tutors/profile", isAuthenticated, async (req, res) => {
  try {
    const profileData = {
      ...req.body,
      userId: req.user!.id
    };

    const newProfile = await storage.createTutorProfile(profileData);
    if (!newProfile) {
      return res.status(500).json({ message: "Failed to create tutor profile" });
    }

    return res.status(201).json(newProfile);
  } catch (error) {
    console.error("Create tutor profile error:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

// Catch-all route for static files
app.get('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Export for Vercel
export default app; 