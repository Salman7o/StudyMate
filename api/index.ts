import express from 'express';
import { registerRoutes } from '../server/routes';
import { serveStatic } from '../server/vite';

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Register API routes
registerRoutes(app);

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  serveStatic(app);
}

// Export for Vercel
export default app; 