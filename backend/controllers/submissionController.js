import { executeCpp } from "../utils/executeCpp.js";
import { generateFile } from "../utils/generateFile.js";
import axios from "axios"

export const run_code = async (req,res) => {
    const {problemid,code,language} = req.body;
    try{
        const filePath = generateFile(code,language);
        const response_input = await axios.post("http://localhost:5000/admin/gettestcase", {problemid});
        const output = await executeCpp(filePath,response_input.data.testcase.input);
        return res.json({
        status: "success",
        filePath,
        input:response_input.data.testcase.input,
        expectedOutput:response_input.data.testcase.expectedOutput,
        output,
        });
    } catch (err) {
        const { step, errorType, error } = err;
    return res.json({
      status: "error",
      step,
      errorType,
      message: error,
    });
  }
}