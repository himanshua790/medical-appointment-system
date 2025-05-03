import express, { Router } from 'express';
import doctorRoutes from './doctor.routes';
import appointmentRoutes from './appointment.routes';
import authRoutes from './auth.routes';

const router:Router = express.Router();

router.use('/doctors', doctorRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/auth', authRoutes);

export { router as routes }; 