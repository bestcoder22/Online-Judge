import express from 'express'
import { login, me , signup , logout } from '../controllers/authController.js';
import verifyToken from '../middlewares/verifyToken.js';
const router = express.Router();

router.post('/login', login);
router.post('/signup', signup);
router.get('/me', verifyToken, me);
router.post('/logout', verifyToken, logout);


export default router;