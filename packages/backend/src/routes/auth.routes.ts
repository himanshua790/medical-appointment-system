import * as express from 'express';
import { login, me, register } from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth.middleware';

// Use explicit type annotation to satisfy the compiler
const router: express.Router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticate, me);

export default router;
