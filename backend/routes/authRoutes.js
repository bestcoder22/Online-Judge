import express from 'express'
import { login, me , signup , logout, get_user, update_avatar, save_submission, get_submissions, get_leaderboard } from '../controllers/authController.js';
import verifyToken from '../middlewares/verifyToken.js';
import avatar_upload from '../middlewares/avatar_store.js';
const authrouter = express.Router();

authrouter.post('/login', login);
authrouter.post('/signup', signup);
authrouter.get('/me', verifyToken, me);
authrouter.post('/logout', verifyToken, logout);
authrouter.post('/getuser', get_user);
authrouter.post('/profile/avatar',avatar_upload.single('avatar'),update_avatar);
authrouter.post('/submission',save_submission);
authrouter.post('/getsubmissions', get_submissions);
authrouter.get('/leaderboard', get_leaderboard)

export default authrouter;