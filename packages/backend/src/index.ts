import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import mongoose from 'mongoose';
import 'dotenv/config';
import { routes } from './routes';
import { errorHandler, notFound } from './middlewares/error.middleware';
import { initializeReminderProcessor } from './services/reminder.service';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';

// Create Express app
const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/medical-app';

// Load Swagger document
const swaggerDocument = YAML.load(path.resolve(__dirname, 'swagger.yaml'));

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

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
    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`API Documentation available at http://localhost:${PORT}/api-docs`);
      
      // Initialize the reminder processor
      initializeReminderProcessor();
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });
