import express from 'express'
import { login, me , signup , logout } from '../controllers/authController.js';
import verifyToken from '../middlewares/verifyToken.js';
const authrouter = express.Router();

authrouter.post('/login', login);
authrouter.post('/signup', signup);
authrouter.get('/me', verifyToken, me);
authrouter.post('/logout', verifyToken, logout);


export default authrouter;