# PNPM Monorepo Setup for Medical Appointment System

Here's how to set up your monorepo using PNPM instead of npm:

## 1. Create PNPM Workspace Configuration

Create a `pnpm-workspace.yaml` file in the root directory:

```yaml
packages:
  - 'packages/*'
```

## 2. CLI Commands to Set Up the Project

Here are the commands to set up the project structure and install all dependencies using PNPM:

```bash
# Create project directory and navigate to it
mkdir medical-appointment-system
cd medical-appointment-system

# Initialize git
git init

# Create the directory structure
mkdir -p packages/frontend packages/backend packages/shared .github .vscode

# Create pnpm-workspace.yaml
echo "packages:
  - 'packages/*'" > pnpm-workspace.yaml

# Initialize root package.json
pnpm init

# Update root package.json scripts (you'll need to edit this file manually with the scripts I provided earlier)

# Install root dev dependencies
pnpm add -D typescript @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint eslint-config-prettier eslint-plugin-prettier eslint-plugin-react eslint-plugin-react-hooks jest ts-jest prettier npm-run-all

# Set up shared package
cd packages/shared
pnpm init
echo '{
  "name": "@medical/shared",
  "version": "0.1.0",
  "private": true,
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch"
  }
}' > package.json
mkdir -p src/types
cd ../..

# Set up backend package
cd packages/backend
pnpm init
mkdir -p src/{controllers,models,routes,services,middlewares,utils}
# Install backend dependencies
pnpm add express mongoose cors helmet morgan dotenv bcryptjs jsonwebtoken winston @medical/shared
# Install backend dev dependencies
pnpm add -D @types/bcryptjs @types/cors @types/express @types/jsonwebtoken @types/morgan @types/node ts-node-dev
cd ../..

# Set up frontend with Next.js
cd packages/frontend
# Create Next.js app
pnpm dlx create-next-app@latest . --typescript

# Install frontend dependencies
pnpm add @emotion/react @emotion/styled @mui/material @mui/icons-material @mui/x-date-pickers date-fns axios @medical/shared
cd ../..
```

## 3. Complete Setup Commands

After the initial setup, create the necessary configuration files:

```bash
# Create root tsconfig.json
echo '{
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
}' > tsconfig.json

# Create ESLint config
echo 'module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
    ecmaFeatures: {
      jsx: true,
    },
  },
  settings: {
    react: {
      version: "detect",
    },
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:prettier/recommended",
  ],
  rules: {
    "react/react-in-jsx-scope": "off",
    "react/prop-types": "off",
  },
};' > .eslintrc.js

# Create Prettier config
echo '{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2
}' > .prettierrc

# Create .gitignore
echo '# dependencies
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
pnpm-debug.log*

# typescript
*.tsbuildinfo

# IDE
.idea
.vscode/*
!.vscode/extensions.json
!.vscode/settings.json' > .gitignore

# Create shared package tsconfig
echo '{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"]
}' > packages/shared/tsconfig.json

# Create backend tsconfig
echo '{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "target": "ES2020",
    "module": "CommonJS",
    "esModuleInterop": true
  },
  "include": ["src/**/*"]
}' > packages/backend/tsconfig.json

# Create backend .env file
echo 'PORT=5000
MONGO_URI=mongodb://localhost:27017/medical-appointments
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=1d
NODE_ENV=development' > packages/backend/.env

# Create frontend .env.local file
echo 'NEXT_PUBLIC_API_URL=http://localhost:5000/api' > packages/frontend/.env.local
```

## 4. Create Essential Source Files

Create the shared types:

```bash
# Create shared types
cat > packages/shared/src/types/index.ts << 'EOL'
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
EOL

# Create shared index file
cat > packages/shared/src/index.ts << 'EOL'
// Export types, interfaces, and utilities
export * from './types';
EOL
```

Create the backend entry point:

```bash
# Create backend index.ts
cat > packages/backend/src/index.ts << 'EOL'
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
EOL
```

Create backend routes:

```bash
# Create routes index
cat > packages/backend/src/routes/index.ts << 'EOL'
import { Router } from 'express';
import doctorRoutes from './doctor.routes';
import appointmentRoutes from './appointment.routes';
import authRoutes from './auth.routes';

const router = Router();

router.use('/doctors', doctorRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/auth', authRoutes);

export { router as routes };
EOL

# Create doctor routes
cat > packages/backend/src/routes/doctor.routes.ts << 'EOL'
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
EOL

# Create appointment routes
cat > packages/backend/src/routes/appointment.routes.ts << 'EOL'
import { Router } from 'express';

const router = Router();

// TODO: Implement appointment controllers
router.get('/', (req, res) => {
  res.json({ message: 'Get all appointments' });
});

router.post('/', (req, res) => {
  res.json({ message: 'Create appointment', data: req.body });
});

router.get('/:id', (req, res) => {
  res.json({ message: `Get appointment with id ${req.params.id}` });
});

router.put('/:id', (req, res) => {
  res.json({ message: `Update appointment with id ${req.params.id}`, data: req.body });
});

router.delete('/:id', (req, res) => {
  res.json({ message: `Delete appointment with id ${req.params.id}` });
});

export default router;
EOL

# Create auth routes
cat > packages/backend/src/routes/auth.routes.ts << 'EOL'
import { Router } from 'express';

const router = Router();

// TODO: Implement auth controllers
router.post('/register', (req, res) => {
  res.json({ message: 'Register user', data: req.body });
});

router.post('/login', (req, res) => {
  res.json({ message: 'Login user', data: req.body });
});

export default router;
EOL
```

Create the user model:

```bash
# Create user model
cat > packages/backend/src/models/user.model.ts << 'EOL'
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
EOL
```

Update the root package.json scripts:

```bash
# Update root package.json scripts
cat > package.json << 'EOL'
{
  "name": "medical-appointment-system",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "pnpm -r --parallel run dev",
    "dev:frontend": "pnpm --filter @medical/frontend run dev",
    "dev:backend": "pnpm --filter @medical/backend run dev",
    "build": "pnpm -r run build",
    "build:frontend": "pnpm --filter @medical/frontend run build",
    "build:backend": "pnpm --filter @medical/backend run build",
    "start": "pnpm -r --parallel run start",
    "start:frontend": "pnpm --filter @medical/frontend run start",
    "start:backend": "pnpm --filter @medical/backend run start",
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
EOL
```

## 5. Running the Project

Now you can build and run your project:

```bash
# Install all dependencies recursively in all packages
pnpm install

# Build the shared package first
pnpm --filter @medical/shared build

# Start development servers
pnpm dev
```

## 6. Complete PNPM Commands Reference

Here's a reference of all the PNPM commands you might need:

```bash
# Install a dependency in a specific package
pnpm --filter @medical/backend add express

# Install a dev dependency in a specific package
pnpm --filter @medical/frontend add -D @types/react

# Install a workspace package as a dependency
pnpm --filter @medical/frontend add @medical/shared

# Run a script in all packages
pnpm -r run build

# Run a script in all packages in parallel
pnpm -r --parallel run dev

# Run a script in a specific package
pnpm --filter @medical/backend run dev

# Clean all node_modules
pnpm -r exec -- rm -rf node_modules
```

These commands will set up a complete monorepo structure using PNPM for your medical appointment scheduling system with Next.js, Express.js, and MongoDB.