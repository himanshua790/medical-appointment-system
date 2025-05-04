# Medical Appointment System

A comprehensive medical appointment management system built with a modern tech stack. The system allows patients to book appointments with doctors, doctors to manage their schedules, and administrators to oversee the entire system.

## Features

- User authentication and authorization (patients, doctors, administrators)
- Doctor management (profiles, specializations, availability)
- Appointment scheduling and management
- Automated appointment reminders
- RESTful API with comprehensive documentation

## Tech Stack

### Backend
- Node.js with Express.js
- TypeScript
- MongoDB with Mongoose
- JWT for authentication
- Redis for queue management
- Bull for scheduling appointment reminders

### Frontend
- React.js with TypeScript
- Material-UI for component styling
- Axios for API communication

## Project Structure

The project follows a monorepo structure using PNPM workspaces:

- `packages/backend` - Express.js REST API
- `packages/frontend` - React.js web application
- `packages/shared` - Shared types and utilities

## Setup Instructions

### Prerequisites

- Node.js (v21 or higher) - Current: 22.14.0
- PNPM (v10 or higher)
- MongoDB (v5 or higher)
- Redis (v6 or higher)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd medical-appointment-system
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Create environment files:

   Create `.env` file in the `packages/backend` directory:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/medical-app
   JWT_SECRET=your_jwt_secret
   REDIS_URL=redis://localhost:6379
   ```

   Create `.env` file in the `packages/frontend` directory:
   ```
   REACT_APP_API_URL=http://localhost:5000/api
   ```

4. Start development servers:
   ```bash
   # Start both backend and frontend
   pnpm dev
   
   # Start only backend
   pnpm dev:backend
   
   # Start only frontend
   pnpm dev:frontend
   ```

5. Build for production:
   ```bash
   pnpm build
   ```

## API Documentation

The API documentation is available in two formats:

### Swagger UI
When the backend server is running, you can access the Swagger documentation at:
```
http://localhost:5000/api-docs
```

### Postman Collection
A Postman collection is included in the `packages/backend` directory. To use it:
1. Import `medical-appointment-api.postman_collection.json` into Postman
2. Set up an environment with the following variables:
   - `baseUrl`: `http://localhost:5000`
   - `token`: (leave empty, will be set after login)
   - `doctorId`: (leave empty, will be set after getting doctors)
   - `appointmentId`: (leave empty, will be set after creating appointment)

## Architecture and Design Decisions

### Backend Architecture

The backend follows a layered architecture:

1. **Routes Layer** - Defines API endpoints and routes requests to controllers
2. **Controller Layer** - Handles request processing and response formatting
3. **Service Layer** - Contains business logic
4. **Model Layer** - Defines data models and communicates with MongoDB
5. **Middleware Layer** - Handles authentication, error handling, and request processing

### Authentication and Authorization

- JWT-based authentication
- Role-based authorization (patient, doctor, admin)
- Secure password storage with bcrypt

### Appointment Management

- Doctors can specify their availability (days and time slots)
- Patients can book appointments within available slots
- Validation to prevent double-booking
- Automated reminders using a queue-based system (Bull)

### Data Models

- **User** - Authentication and user profile
- **Doctor** - Doctor profiles with specializations and availability
- **Appointment** - Appointment details and status

## Limitations and Future Improvements

### Current Limitations

1. **Scaling** - The current implementation doesn't include horizontal scaling strategies for high traffic
2. **Testing Coverage** - More comprehensive test coverage needed
3. **Availability Management** - The current system has a simple availability model; a more complex model would handle recurrence and exceptions
4. **Patient Profiles** - Limited patient profile management
5. **Payment Integration** - No payment system is currently implemented

### Future Improvements

1. **Enhanced Security** - Implement rate limiting, additional security headers, and 2FA
2. **Advanced Analytics** - Add analytics dashboard for administrators
3. **Telemedicine** - Integrate video consultation capabilities
4. **Mobile Applications** - Develop native mobile applications
5. **Internationalization** - Support multiple languages
6. **Offline Support** - Implement offline capabilities using service workers

## License

This project is licensed under the MIT License - see the LICENSE file for details. 