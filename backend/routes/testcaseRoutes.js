import express from 'express'
import { delete_testcase, get_details_input, get_details_output , get_testcase, save_testcase, update_testcase} from '../controllers/testcaseController.js';
import testcase_upload from '../middlewares/temp_store.js';
const testcaserouter = express.Router();

testcaserouter.post("/getdetails_input",testcase_upload.single('file'), get_details_input);
testcaserouter.post("/getdetails_output",testcase_upload.single('file'), get_details_output);
testcaserouter.post("/testcase"  , save_testcase);
testcaserouter.post("/deletetestcases", delete_testcase);
testcaserouter.post("/gettestcase", get_testcase);
testcaserouter.post("/updatetestcase", update_testcase);

export default testcaserouter;