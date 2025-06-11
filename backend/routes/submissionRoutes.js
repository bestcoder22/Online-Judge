import express from 'express'
import { run_code } from '../controllers/submissionController.js';
const submissionrouter = express.Router();

submissionrouter.post('/run', run_code);


export default submissionrouter;