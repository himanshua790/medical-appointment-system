import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import mongoose from 'mongoose';
import 'dotenv/config';
import { routes } from './routes';
import { errorHandler, notFound } from './middlewares/error.middleware';
import ReminderService from './services/reminder.service';

// Create Express app
const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/medical-app';

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api', routes);

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Connect to MongoDB
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('Connected successfully to MongoDB');

    // Start server after establishing MongoDB connection
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);

      // Start reminder service
      if (process.env.NODE_ENV !== 'test') {
        ReminderService.startReminderCron(15); // Check every 15 minutes
      }
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });
