import express from 'express'
import { ai_smart_fix, ai_complexity, run_code, ai_code_review, ai_error_suggestion } from '../controllers/submissionController.js';
const submissionrouter = express.Router();

submissionrouter.post('/run', run_code);
submissionrouter.post('/smartfix', ai_smart_fix)
submissionrouter.post('/get_complexity' , ai_complexity);
submissionrouter.post('/codereview', ai_code_review);
submissionrouter.post('/errorsuggestion' , ai_error_suggestion)

export default submissionrouter;