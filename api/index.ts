import express from 'express';

// Define types for serverless function
interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: string;
  password?: string;
  profileImage?: string | null;
  phoneNumber?: string | null;
  program?: string | null;
  semester?: string | null;
  university?: string | null;
  bio?: string | null;
  location?: string | null;
  subjects?: string | null;
  availability?: string | null;
  hourlyRate?: number | null;
  joinedAt: Date;
}

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Simple authentication middleware
const isAuthenticated = (req: any, res: any, next: any) => {
  // For demo purposes, always authenticate
  req.user = {
    id: 1,
    username: 'demo-user',
    email: 'demo@example.com',
    fullName: 'Demo User',
    role: 'student',
    joinedAt: new Date()
  };
  next();
};

// Simple in-memory storage for serverless function
const inMemoryStorage = {
  users: [
    {
      id: 1,
      username: 'demo-student',
      email: 'student@demo.com',
      fullName: 'Demo Student',
      role: 'student',
      password: '12345',
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
      password: '12345',
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
      reviewCount: 10,
      program: 'Computer Science',
      semester: '6'
    }
  ],
  sessions: [] as any[],
  conversations: [] as any[],
  messages: [] as any[]
};

// Storage methods for serverless
const storage = {
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
  getSessionsByTutor: async (userId: number) => {
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
  getConversationsByUser: async (userId: number) => {
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
  getMessagesByConversation: async (conversationId: number) => {
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
  getPaymentMethodsByUser: async (userId: number) => {
    return [];
  }
};

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

    // Validate required fields
    if (!userData.username || !userData.password || !userData.email || !userData.fullName || !userData.role) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Check if username already exists
    const existingUser = await storage.getUserByUsername(userData.username);
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }

    // Create user
    const newUser = await storage.createUser(userData);
    console.log("User data saved to users.txt");

    return res.status(201).json({ 
      message: "User registered successfully", 
      user: { 
        id: newUser.id, 
        username: newUser.username, 
        email: newUser.email, 
        fullName: newUser.fullName, 
        role: newUser.role 
      } 
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

    // Find user
    const user = await storage.getUserByUsername(username);
    if (!user) {
      console.log("Login failed - Invalid credentials for:", username);
      return res.status(401).json({ message: "Invalid username or password" });
    }

    // Simple password check (in real app, use bcrypt)
    if (user.password !== password) {
      console.log("Login failed - Invalid credentials for:", username);
      return res.status(401).json({ message: "Invalid username or password" });
    }

    console.log("User authenticated, calling req.login for user ID:", user.id);
    console.log("Login successful for user ID:", user.id);

    return res.json({ 
      message: "Logged in successfully", 
      user: { 
        id: user.id, 
        username: user.username, 
        email: user.email, 
        fullName: user.fullName, 
        role: user.role 
      } 
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

app.get("/api/auth/me", isAuthenticated, async (req, res) => {
  try {
    return res.json({ user: req.user });
  } catch (error) {
    console.error("Get current user error:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/auth/logout", async (req, res) => {
  try {
    return res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

// Tutor routes
app.get("/api/tutors", isAuthenticated, async (req, res) => {
  try {
    console.log("Finding tutors for student user ID:", req.user!.id);
    
    const tutors = await storage.searchTutorProfiles({});
    return res.json(tutors);
  } catch (error) {
    console.error("Search tutors error:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

app.get("/api/tutors/featured", isAuthenticated, async (req, res) => {
  try {
    const user = await storage.getUser(req.user!.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const featuredTutors = await storage.searchTutorProfiles({ featured: true });
    return res.json(featuredTutors);
  } catch (error) {
    console.error("Get featured tutors error:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/tutors/profile", isAuthenticated, async (req, res) => {
  try {
    const profileData = req.body;
    const newProfile = await storage.createTutorProfile({
      ...profileData,
      userId: req.user!.id
    });
    return res.status(201).json(newProfile);
  } catch (error) {
    console.error("Create tutor profile error:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

// Student routes
app.get("/api/students", isAuthenticated, async (req, res) => {
  try {
    console.log("Finding students for tutor user ID:", req.user!.id);
    
    const tutorProfile = await storage.getTutorProfileByUserId(req.user!.id);
    if (!tutorProfile) {
      console.log("No tutor profile found for user ID:", req.user!.id);
      return res.status(404).json({ message: "Tutor profile not found" });
    }

    console.log("Tutor subjects:", JSON.stringify(tutorProfile.subjects));
    console.log("Tutor availability:", tutorProfile.availability);
    console.log("Tutor hourly rate:", tutorProfile.hourlyRate);
    console.log("Tutor program:", tutorProfile.program);
    console.log("Tutor semester:", tutorProfile.semester);

    const searchFilters = {
      subjects: tutorProfile.subjects?.split(','),
      availability: tutorProfile.availability,
      maxBudget: tutorProfile.hourlyRate
    };

    console.log("Search filters:", JSON.stringify(searchFilters));

    const students = await storage.searchStudents(searchFilters);
    console.log("Searching students with filters:", searchFilters);
    console.log("Found", students.length, "students before subject filtering");

    // Filter by subjects
    if (searchFilters.subjects && searchFilters.subjects.length > 0) {
      const filteredStudents = students.filter((student: any) => {
        const studentSubjects = student.subjects?.split(',').map((s: string) => s.trim()) || [];
        return searchFilters.subjects!.some((subject: string) => 
          studentSubjects.some((studentSubject: string) => 
            studentSubject.toLowerCase().includes(subject.toLowerCase())
          )
        );
      });
      console.log("Found", filteredStudents.length, "matching students");
      return res.json(filteredStudents);
    }

    console.log("Found", students.length, "matching students");
    return res.json(students);
  } catch (error) {
    console.error("Search students error:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

// Sessions routes
app.get("/api/sessions", isAuthenticated, async (req, res) => {
  try {
    const sessions = await storage.getSessionsByTutor(req.user!.id);
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
    const conversations = await storage.getConversationsByUser(req.user!.id);
    return res.json(conversations);
  } catch (error) {
    console.error("Get conversations error:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/conversations", isAuthenticated, async (req, res) => {
  try {
    const conversationData = req.body;
    const newConversation = await storage.createConversation({
      ...conversationData,
      participantOneId: req.user!.id
    });
    return res.status(201).json(newConversation);
  } catch (error) {
    console.error("Create conversation error:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

app.get("/api/conversations/:id/messages", isAuthenticated, async (req, res) => {
  try {
    const conversationId = parseInt(req.params.id);
    const messages = await storage.getMessagesByConversation(conversationId);
    return res.json(messages);
  } catch (error) {
    console.error("Get messages error:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/conversations/:id/messages", isAuthenticated, async (req, res) => {
  try {
    const conversationId = parseInt(req.params.id);
    const messageData = req.body;
    const newMessage = await storage.createMessage({
      ...messageData,
      conversationId,
      senderId: req.user!.id
    });
    return res.status(201).json(newMessage);
  } catch (error) {
    console.error("Create message error:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

// Payment methods route
app.get("/api/payment-methods", isAuthenticated, async (req, res) => {
  try {
    const paymentMethods = await storage.getPaymentMethodsByUser(req.user!.id);
    return res.json(paymentMethods);
  } catch (error) {
    console.error("Get payment methods error:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

// Subjects route
app.get("/api/subjects", async (req, res) => {
  try {
    const subjects = [
      "Calculus",
      "Linear Algebra", 
      "Statistics",
      "Physics",
      "Chemistry",
      "Biology",
      "Computer Science",
      "Programming",
      "Data Structures",
      "Algorithms",
      "Machine Learning",
      "Artificial Intelligence",
      "Web Development",
      "Mobile Development",
      "Database Systems",
      "Operating Systems",
      "Computer Networks",
      "Software Engineering",
      "Cybersecurity",
      "Cloud Computing"
    ];
    return res.json(subjects);
  } catch (error) {
    console.error("Get subjects error:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

// Export for Vercel
export default app; 