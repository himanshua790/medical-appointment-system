import express, { Router } from 'express';

const router:Router = express.Router();

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