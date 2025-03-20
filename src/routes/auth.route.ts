import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';


const router = Router();
const authController = new AuthController();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/logout', authController.logout);

export default router;
