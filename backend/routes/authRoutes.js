import express from 'express'
import { login, me , signup , logout, get_user, update_avatar } from '../controllers/authController.js';
import verifyToken from '../middlewares/verifyToken.js';
import avatar_upload from '../middlewares/avatar_store.js';
const authrouter = express.Router();

authrouter.post('/login', login);
authrouter.post('/signup', signup);
authrouter.get('/me', verifyToken, me);
authrouter.post('/logout', verifyToken, logout);
authrouter.post('/getuser', get_user);
authrouter.post('/profile/avatar',avatar_upload.single('avatar'),update_avatar);

export default authrouter;