import { executeCpp } from "../utils/executeCpp.js";
import { generateFile } from "../utils/generateFile.js";
import axios from "axios"

export const run_code = async (req,res) => {
    const {problemid,code,language,inputArray} = req.body;
    try{
        const filePath = generateFile(code,language);

        if (inputArray) {
          const output = await executeCpp(filePath, inputArray);
          return res.json({
            status: "success",
            filePath,
            output,
          });
        }
        else{
          const response_input = await axios.post("http://localhost:5000/admin/gettestcase", {problemid});
          const output = await executeCpp(filePath,response_input.data.testcase.input);
          return res.json({
          status: "success",
          filePath,
          input:response_input.data.testcase.input,
          expectedOutput:response_input.data.testcase.expectedOutput,
          output,
          });
        }
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