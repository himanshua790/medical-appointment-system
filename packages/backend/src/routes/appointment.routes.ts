import express, { Router } from 'express';

const router:Router = express.Router();

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