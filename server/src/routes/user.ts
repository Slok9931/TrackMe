import { Router } from 'express';
import UserController from '../controllers/user';

const router = Router();
const userController = new UserController();

router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);

export default router;