# Setting Up a Monorepo for Next.js and Express.js with MongoDB

I'll guide you through setting up a monorepo structure for a project with a Next.js frontend and Express.js backend, both using TypeScript, and connecting to MongoDB.

## Project Structure Overview

Here's the structure we'll create:

```
medical-appointment-system/
├── .github/                  # GitHub workflows
├── .vscode/                  # VSCode settings
├── packages/
│   ├── frontend/             # Next.js application
│   ├── backend/              # Express.js application
│   └── shared/               # Shared code, types, utilities
├── .eslintrc.js              # Root ESLint config
├── .gitignore                # Git ignore file
├── .prettierrc               # Prettier config
├── jest.config.js            # Root Jest config
├── package.json              # Root package.json
├── tsconfig.json             # Base TypeScript config
└── README.md                 # Project documentation
```

## Getting Started

Let's create this structure step by step:

### 1. Initialize the Project

```bash
# Create project directory
mkdir medical-appointment-system
cd medical-appointment-system

# Initialize git
git init

# Create package.json
npm init -y

# Create directories
mkdir -p packages/frontend packages/backend packages/shared .github .vscode
```

### 2. Configure Root Package.json

Update your root `package.json` to include:

```json
{
  "name": "medical-appointment-system",
  "version": "0.1.0",
  "private": true,
  "workspaces": [
    "packages/*"
  ],
  "scripts": {
    "dev": "npm-run-all --parallel dev:*",
    "dev:frontend": "npm run dev --workspace=@medical/frontend",
    "dev:backend": "npm run dev --workspace=@medical/backend",
    "build": "npm-run-all --parallel build:*",
    "build:frontend": "npm run build --workspace=@medical/frontend",
    "build:backend": "npm run build --workspace=@medical/backend",
    "start": "npm-run-all --parallel start:*",
    "start:frontend": "npm run start --workspace=@medical/frontend",
    "start:backend": "npm run start --workspace=@medical/backend",
    "lint": "eslint . --ext .ts,.tsx",
    "lint:fix": "eslint . --ext .ts,.tsx --fix",
    "test": "jest"
  },
  "devDependencies": {
    "@typescript-eslint/eslint-plugin": "^5.59.0",
    "@typescript-eslint/parser": "^5.59.0",
    "eslint": "^8.38.0",
    "eslint-config-prettier": "^8.8.0",
    "eslint-plugin-prettier": "^4.2.1",
    "eslint-plugin-react": "^7.32.2",
    "eslint-plugin-react-hooks": "^4.6.0",
    "jest": "^29.5.0",
    "npm-run-all": "^4.1.5",
    "prettier": "^2.8.7",
    "ts-jest": "^29.1.0",
    "typescript": "^5.0.4"
  }
}
```

### 3. Create Base TypeScript Configuration

Create a root `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "declaration": true,
    "baseUrl": ".",
    "paths": {
      "@medical/shared/*": ["packages/shared/src/*"]
    }
  },
  "exclude": ["node_modules"]
}
```

### 4. Setup ESLint and Prettier

Create `.eslintrc.js`:

```javascript
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:prettier/recommended',
  ],
  rules: {
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
  },
};
```

Create `.prettierrc`:

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2
}
```

### 5. Create .gitignore

```
# dependencies
node_modules
.pnp
.pnp.js

# testing
coverage

# production
build
dist
.next
out

# misc
.DS_Store
*.pem
.env.local
.env.development.local
.env.test.local
.env.production.local

# logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# typescript
*.tsbuildinfo

# IDE
.idea
.vscode/*
!.vscode/extensions.json
!.vscode/settings.json
```

### 6. Create the Shared Package

Create `packages/shared/package.json`:

```json
{
  "name": "@medical/shared",
  "version": "0.1.0",
  "private": true,
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch"
  },
  "dependencies": {},
  "devDependencies": {}
}
```

Create `packages/shared/tsconfig.json`:

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"]
}
```

Create `packages/shared/src/index.ts`:

```typescript
// Export types, interfaces, and utilities
export * from './types';
```

Create `packages/shared/src/types/index.ts`:

```typescript
// Common types used across frontend and backend

export interface User {
  _id?: string;
  username: string;
  email: string;
  role: 'patient' | 'doctor' | 'admin';
}

export interface Doctor {
  _id?: string;
  userId: string;
  name: string;
  specialty: string;
  bio?: string;
  workingHours: WorkingHours[];
  unavailableTimes?: UnavailableTime[];
}

export interface WorkingHours {
  dayOfWeek: number; // 0-6, 0 is Sunday
  startTime: string; // format: "HH:MM"
  endTime: string; // format: "HH:MM"
}

export interface UnavailableTime {
  startDateTime: Date;
  endDateTime: Date;
  reason?: string;
}

export interface Appointment {
  _id?: string;
  patientId: string;
  doctorId: string;
  dateTime: Date;
  endTime: Date;
  reasonForVisit: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  notes?: string;
  reminderSent: boolean;
  reminderTime: Date;
}

export interface TimeSlot {
  start: Date;
  end: Date;
  isAvailable: boolean;
}
```

### 7. Setup Express.js Backend

Create `packages/backend/package.json`:

```json
{
  "name": "@medical/backend",
  "version": "0.1.0",
  "private": true,
  "main": "dist/index.js",
  "scripts": {
    "build": "tsc",
    "dev": "ts-node-dev --respawn --transpile-only src/index.ts",
    "start": "node dist/index.js"
  },
  "dependencies": {
    "@medical/shared": "*",
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "dotenv": "^16.0.3",
    "express": "^4.18.2",
    "helmet": "^6.1.5",
    "jsonwebtoken": "^9.0.0",
    "mongoose": "^7.0.4",
    "morgan": "^1.10.0",
    "winston": "^3.8.2"
  },
  "devDependencies": {
    "@types/bcryptjs": "^2.4.2",
    "@types/cors": "^2.8.13",
    "@types/express": "^4.17.17",
    "@types/jsonwebtoken": "^9.0.1",
    "@types/morgan": "^1.9.4",
    "@types/node": "^18.15.12",
    "ts-node-dev": "^2.0.0"
  }
}
```

Create `packages/backend/tsconfig.json`:

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "target": "ES2020",
    "module": "CommonJS",
    "esModuleInterop": true
  },
  "include": ["src/**/*"]
}
```

Create `packages/backend/src/index.ts`:

```typescript
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { routes } from './routes';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/medical-appointments';
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Routes
app.use('/api', routes);

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

Create a basic folder structure for the backend:

```bash
mkdir -p packages/backend/src/{controllers,models,routes,services,middlewares,utils}
```

Create `packages/backend/src/routes/index.ts`:

```typescript
import { Router } from 'express';
import doctorRoutes from './doctor.routes';
import appointmentRoutes from './appointment.routes';
import authRoutes from './auth.routes';

const router = Router();

router.use('/doctors', doctorRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/auth', authRoutes);

export { router as routes };
```

Create basic route files:

For `packages/backend/src/routes/doctor.routes.ts`:

```typescript
import { Router } from 'express';

const router = Router();

// TODO: Implement doctor controllers
router.get('/', (req, res) => {
  res.json({ message: 'Get all doctors' });
});

router.get('/:id', (req, res) => {
  res.json({ message: `Get doctor with id ${req.params.id}` });
});

router.get('/:id/availability', (req, res) => {
  res.json({ message: `Get availability for doctor with id ${req.params.id}` });
});

export default router;
```

Create `packages/backend/src/routes/appointment.routes.ts` and `packages/backend/src/routes/auth.routes.ts` following similar patterns.

### 8. Setup Next.js Frontend

Create the Next.js app:

```bash
cd packages/frontend
npx create-next-app@latest . --typescript
```

Update `packages/frontend/package.json` to include the shared package:

```json
{
  "name": "@medical/frontend",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "@emotion/react": "^11.10.6",
    "@emotion/styled": "^11.10.6",
    "@medical/shared": "*",
    "@mui/icons-material": "^5.11.16",
    "@mui/material": "^5.12.1",
    "@mui/x-date-pickers": "^6.2.1",
    "axios": "^1.3.6",
    "date-fns": "^2.29.3",
    "next": "13.3.1",
    "react": "18.2.0",
    "react-dom": "18.2.0"
  },
  "devDependencies": {
    "@types/node": "18.15.12",
    "@types/react": "18.0.37",
    "@types/react-dom": "18.0.11",
    "eslint-config-next": "13.3.1"
  }
}
```

Create `.env.local` in the frontend directory:

```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Create `packages/frontend/src/utils/api.ts`:

```typescript
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
```

### 9. MongoDB Setup

1. Create a `.env` file in the backend directory:

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/medical-appointments
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=1d
```

2. Create MongoDB models in the backend:

Create `packages/backend/src/models/user.model.ts`:

```typescript
import mongoose, { Schema, Document } from 'mongoose';
import { User as UserType } from '@medical/shared';
import bcrypt from 'bcryptjs';

export interface UserDocument extends UserType, Document {
  password: string;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema: Schema = new Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['patient', 'doctor', 'admin'], default: 'patient' },
  },
  { timestamps: true }
);

// Hash password before saving
UserSchema.pre('save', async function (next) {
  const user = this as UserDocument;

  // Only hash the password if it has been modified or is new
  if (!user.isModified('password')) return next();

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
  next();
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<UserDocument>('User', UserSchema);
```

Create similar model files for doctors and appointments.

### 10. Setup Configuration Files

Create `packages/backend/.env`:

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/medical-appointments
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=1d
NODE_ENV=development
```

Create `packages/frontend/.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 11. Create Project README.md

```markdown
# Medical Appointment Scheduling System

A full-stack application for scheduling medical appointments, built with Next.js, Express.js, and MongoDB.

## Project Structure

This is a monorepo containing:
- `packages/frontend`: Next.js application with Material UI
- `packages/backend`: Express.js API with MongoDB
- `packages/shared`: Shared TypeScript interfaces and utilities

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- MongoDB (local or cloud instance)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create environment files:
   - `packages/backend/.env`
   - `packages/frontend/.env.local`

### Development

Run all services in development mode:
```bash
npm run dev
```

Or run services individually:
```bash
# For frontend only
npm run dev:frontend

# For backend only
npm run dev:backend
```

### Building

```bash
npm run build
```

### Production

```bash
npm run start
```

## Features

- Appointment Booking
- Doctor Availability
- Time Slot Management
- Appointment Reminders
```

## Starting the Project

After setting up your folder structure, you can install the dependencies and start development:

```bash
# Install dependencies at root level
npm install

# Build shared package first
npm run build --workspace=@medical/shared

# Start development servers
npm run dev
```

## Next Steps

Now that you have a basic monorepo structure set up, here are the next steps to implement:

1. Complete the backend API implementation:
   - Authentication controllers
   - Doctor and appointment controllers
   - MongoDB models
   - Business logic services

2. Build the frontend UI:
   - Implement Material UI components
   - Create pages for appointment booking
   - Set up authentication
   - Build the doctor listing and profile pages

3. Implement appointment reminders:
   - Set up a job scheduler
   - Create the reminder processing logic

This setup gives you a solid foundation for your medical appointment scheduling system using a monorepo architecture with Next.js, Express.js, and MongoDB.