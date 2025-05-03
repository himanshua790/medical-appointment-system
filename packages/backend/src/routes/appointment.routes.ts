import express, { Router } from 'express';
import { 
  getAppointments, 
  getAppointmentById, 
  createAppointment, 
  updateAppointment, 
  deleteAppointment 
} from '../controllers/appointment.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router: Router = express.Router();

// All appointment routes require authentication
router.use(authenticate);

// Routes with role-based authorization
router.get('/', getAppointments);
router.get('/:id', getAppointmentById);
router.post('/', createAppointment);
router.put('/:id', updateAppointment);
router.delete('/:id', deleteAppointment);

export default router; 