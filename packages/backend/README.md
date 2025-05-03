# Medical Appointment System Backend

A RESTful API backend for the Medical Appointment System built with Express.js, TypeScript, and MongoDB.

## Features

- User authentication and authorization
- Doctor management
- Appointment scheduling and management
- Availability calculation
- Automated appointment reminders

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get JWT token

### Doctors
- `GET /api/doctors` - Get all doctors
- `GET /api/doctors/:id` - Get a specific doctor
- `POST /api/doctors` - Create a new doctor profile (admin only)
- `PUT /api/doctors/:id` - Update a doctor profile
- `DELETE /api/doctors/:id` - Delete a doctor profile (admin only)
- `GET /api/doctors/:id/availability` - Get doctor's availability for a specific date

### Appointments
- `GET /api/appointments` - Get all appointments (filtered by user role)
- `GET /api/appointments/:id` - Get a specific appointment
- `POST /api/appointments` - Create a new appointment
- `PUT /api/appointments/:id` - Update an appointment
- `DELETE /api/appointments/:id` - Delete an appointment

## Setup

1. Install dependencies:
```bash
pnpm install
```

2. Configure environment variables by creating a `.env` file:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/medical-app
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d
```

3. Run in development mode:
```bash
pnpm run dev
```

4. Build for production:
```bash
pnpm run build
```

5. Run in production mode:
```bash
pnpm start
```

## Tech Stack

- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT
- **Validation**: Mongoose schemas
- **Error Handling**: Custom middleware
- **Logging**: Morgan and Console 