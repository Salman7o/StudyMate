import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import bcrypt from "bcrypt";
import fs from "fs";
import { storage } from "./storage";
import { User as SelectUser, InsertUser } from "@shared/schema";
import { insertUserSchema } from "@shared/schema";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

// Use bcrypt for password hashing with 10 salt rounds
const SALT_ROUNDS = 10;

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}

export async function register(req: Request, res: Response) {
  try {
    console.log('Register request body:', req.body);
    // Validate the request body
    const userData = insertUserSchema.parse(req.body);

    // Convert subjects array to comma-separated string for DB
    let subjectsString = "";
    let subjectsArray: string[] = [];
    const rawSubjects: any = userData.subjects;
    if (Array.isArray(rawSubjects)) {
      subjectsString = rawSubjects.join(",");
      subjectsArray = rawSubjects;
    } else if (typeof rawSubjects === "string" && rawSubjects) {
      subjectsString = rawSubjects;
      subjectsArray = rawSubjects.length > 0 ? rawSubjects.split(",") : [];
    } else {
      subjectsString = "";
      subjectsArray = [];
    }

    // Check if user already exists
    const existingUser = await storage.getUserByUsername(userData.username);
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }

    const existingEmail = await storage.getUserByEmail(userData.email);
    if (existingEmail) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Hash the password
    const hashedPassword = await hashPassword(userData.password);

    // Create the user
    const user = await storage.createUser({
      ...userData,
      password: hashedPassword,
      subjects: subjectsString as any // always a string for user
    });

    // Save user data as JSON to users.txt (excluding password)
    console.log('CWD:', process.cwd());
    const userToSave = {
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      createdAt: new Date().toISOString()
    };
    try {
      fs.appendFileSync('users.txt', JSON.stringify(userToSave) + '\n');
      console.log('User data saved to users.txt');
    } catch (error) {
      console.error('Error saving user data to file:', error);
    }

    // If the user is registering as a tutor, automatically create a tutor profile
    if (user.role === 'tutor') {
      try {
        console.log("Creating tutor profile for user:", user.id);
        // Use default subjects if none provided
        const defaultSubjects = ["General Studies"];
        let subjects: string[] = Array.isArray(subjectsArray) && subjectsArray.length > 0 ? subjectsArray : defaultSubjects;
        // Use default availability if none provided
        const availability = user.availability || "Weekdays: 5pm-9pm, Weekends: 10am-6pm";
        // Defensive: Always store subjects as a comma-separated string for the DB
        let tutorSubjectsString = Array.isArray(subjects) ? subjects.join(',') : (typeof subjects === 'string' ? subjects : String(subjects));
        // Create default tutor profile
        const tutorProfile = await storage.createTutorProfile({
          userId: user.id,
          subjects: tutorSubjectsString, // Always a string
          hourlyRate: user.hourlyRate || 1000, // Default hourly rate of 1000
          experience: "New tutor on the platform",
          availability: availability,
          isAvailableNow: 1, // Use integer 1 instead of boolean true
          rating: 0,
          reviewCount: 0
        });
        console.log(`Successfully created tutor profile ID: ${tutorProfile.id} for user ID: ${user.id}`);
      } catch (profileError) {
        console.error("Error creating tutor profile:", profileError);
        // Continue with registration even if profile creation fails
      }
    }

    // Log the user in
    req.login(user, (err) => {
      if (err) {
        return res.status(500).json({ message: "Error during login", error: err.message });
      }
      return res.status(201).json({
        message: "User registered successfully",
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          fullName: user.fullName,
          role: user.role
        }
      });
    });
  } catch (error: any) {
    console.log('Validation error:', error.message);
    return res.status(400).json({ message: "Invalid user data", error: error.message });
  }
}

export async function login(req: Request, res: Response) {
  console.log("Login attempt for username:", req.body.username);

  passport.authenticate("local", (err: any, user: any, info: any) => {
    if (err) {
      console.error("Authentication error:", err);
      return res.status(500).json({ message: "Authentication error", error: err.message });
    }
    if (!user) {
      console.log("Login failed - Invalid credentials for:", req.body.username);
      return res.status(401).json({ message: "Invalid username or password" });
    }

    console.log("User authenticated, calling req.login for user ID:", user.id);
    req.login(user, (err) => {
      if (err) {
        console.error("Error during login (req.login):", err);
        return res.status(500).json({ message: "Error during login", error: err.message });
      }
      console.log("Login successful for user ID:", user.id);
      return res.status(200).json({
        message: "Logged in successfully",
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          fullName: user.fullName,
          role: user.role
        }
      });
    });
  })(req, res);
}

export async function logout(req: Request, res: Response) {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ message: "Error during logout", error: err.message });
    }
    res.status(200).json({ message: "Logged out successfully" });
  });
}

export async function getCurrentUser(req: Request, res: Response) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  return res.status(200).json({
    user: {
      id: req.user.id,
      username: req.user.username,
      email: req.user.email,
      fullName: req.user.fullName,
      role: req.user.role
    }
  });
}

export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ message: "Authentication required" });
}

export function isAuthorized(role: 'student' | 'tutor' | 'both') {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    if (role === 'both') {
      return next();
    }

    if (req.user.role !== role) {
      return res.status(403).json({ message: `Access restricted to ${role}s only` });
    }

    return next();
  };
}

export function setupAuth(app: Express) {
  // Set up session middleware
  app.use(session({
    secret: process.env.SESSION_SECRET || 'studymate-secret-key',
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 24 // 1 day
    }
  }));

  // Initialize Passport
  app.use(passport.initialize());
  app.use(passport.session());

  // Configure local strategy
  passport.use(new LocalStrategy(async (username, password, done) => {
    try {
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return done(null, false, { message: "Invalid username or password" });
      }

      const isValidPassword = await verifyPassword(password, user.password);
      if (!isValidPassword) {
        return done(null, false, { message: "Invalid username or password" });
      }

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }));

  // Serialize and deserialize user
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // Authentication routes
  app.post("/api/auth/register", register);
  app.post("/api/auth/login", login);
  app.post("/api/auth/logout", logout);
  app.get("/api/auth/me", getCurrentUser);
}