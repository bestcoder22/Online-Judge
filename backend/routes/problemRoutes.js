import express from 'express'
import { addproblem, deleteproblem, get_problem, getproblems, update_problem } from '../controllers/problemController.js';
const problemrouter = express.Router();

problemrouter.post('/admin/addproblem',addproblem)
problemrouter.get('/problems', getproblems);
problemrouter.post('/admin/deleteproblem', deleteproblem);
problemrouter.post('/admin/updateproblem',update_problem);
problemrouter.post('/getproblem',get_problem);

export default problemrouter;