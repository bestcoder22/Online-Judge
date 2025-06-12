import Editor from '@monaco-editor/react';
import axios from 'axios';
import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Clock, Database } from 'lucide-react'
import ReactMarkdown from 'react-markdown';

const Compiler = ({ problemid }) => {
  const {userinfo} = useContext(AuthContext);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('cpp');
  const [responseData, setResponseData] = useState(null);
  const [errorData, setErrorData] = useState(null);
  const [selectedTestcase, setSelectedTestcase] = useState(null);
  const [problem, setProblem] = useState(null);
  const [isSampleRun, setIsSampleRun] = useState(false);
  const [isCustomOpen, setIsCustomOpen] = useState(false);
  const [customInput, setCustomInput] = useState('');
  const [customOutput, setCustomOutput] = useState('');
  const [customError, setCustomError] = useState(null);
  const [timecomplexity , setTimeComplexity] = useState(null);
  const [spacecomplexity , setSpaceComplexity] = useState(null);
  const [codereview, setCodeReview] = useState(null)
  const [showReview, setShowReview] = useState(false);
  const [errorsuggestion , setErrorSuggestion] = useState(null);


  const defaultCodes = {
    cpp: `#include <iostream>
int main() {
    std::cout << "Hello, World!" << std::endl;
    return 0;
}`,
    js: `console.log("Hello, World!");`,
    py: `print("Hello, World!")`,
    java: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}`,
  };



  useEffect(() => {
    const getProblem = async () => {
      try {
        const response = await axios.post('http://localhost:5000/getproblem', { problemid });
        setProblem(response.data.problem);
      } catch {
        setProblem(null);
      }
    };
    getProblem();
  }, [problemid]);

  useEffect(() => {
    setCode(defaultCodes[language]);
  }, [language]);

  const run_code = async () => {
    setResponseData(null);
    setErrorData(null);
    setSelectedTestcase(null);
    setIsSampleRun(false);

    if (code.trim() === '') {
      alert('Write Some Code');
      return;
    }

    try {
      const res = await axios.post('http://localhost:5000/run', {
        problemid,
        code,
        language,
      });

      if (res.data.status === 'success') {
        const response_complexity = await axios.post('http://localhost:5000/get_complexity', {language,code});
        const raw = response_complexity.data.complexity;        // e.g. "```txt\nO(n)\nO(1)\n```"
        const lines = raw
          .replace(/```[\s\S]*?```/, match => match  // strip only the fences
            .replace(/^```.*\n/, '')
            .replace(/```$/, '')
          )
          .split('\n')
          .filter(Boolean);

        setTimeComplexity(lines[0].trim());    // first line ⇒ time
        setSpaceComplexity(lines[1].trim());   // second line ⇒ space
        setResponseData(res.data);

      } else {
        // Backend returned a JSON with status: "error"
        const errorType = res.data.errorType || 'Error';
        const message = res.data.message || 'An unknown error occurred.'
        const response = await axios.post("http://localhost:5000/errorsuggestion", {language,code,problem,errorType,message});
        setErrorSuggestion(response.data.suggestion);
        setErrorData({
          errorType: errorType,
          message: message,
        });
      }
    } catch (err) {
      // Axios/network error
      const serverData = err.response?.data || {};
      setErrorData({
        errorType: serverData.errorType || 'Error',
        message: serverData.message || err.message || 'An unknown error occurred.',
      });
    }
  };

  const run_sample_code = async () => {
    setResponseData(null);
    setErrorData(null);
    setSelectedTestcase(null);
    setIsSampleRun(true);

    if (code.trim() === '') {
      alert('Write Some Code');
      return;
    }

    if (!problem?.sampleCases) {
      alert('Sample cases not yet loaded.');
      return;
    }

    // Build input array from sampleCases
    const inputArray = problem.sampleCases.map((sc, idx) => ({
      name: `Sample #${idx}`,
      data: sc.sampleInput,
    }));

    // Build expected output array from sampleCases
    const expectedOutputArray = problem.sampleCases.map((sc, idx) => ({
      name: `Sample #${idx}`,
      data: sc.sampleOutput,
    }));

    try {
      const res = await axios.post('http://localhost:5000/run', {
        problemid,
        code,
        language,
        inputArray,
      });

      if (res.data.status === 'success') {
        // Manually construct responseData to match the same shape as a full submission
        setResponseData({
          status: 'success',
          input: inputArray,
          expectedOutput: expectedOutputArray,
          output: res.data.output,
        });
      } else {
        // Backend returned status: "error"
        setErrorData({
          errorType: res.data.errorType || 'Error',
          message: res.data.message || 'An unknown error occurred.',
        });
      }
    } catch (err) {
      const serverData = err.response?.data || {};
      setErrorData({
        errorType: serverData.errorType || 'Error',
        message: serverData.message || err.message || 'An unknown error occurred.',
      });
    }
  };

  const open_custom_testcase = async () => {
    setIsCustomOpen(true);
  }

  const run_custom_code = async () => {
    setCustomOutput("");
    setCustomError(null);

    if (!customInput.trim()) {
      alert("Enter custom input");
      return;
    }

    try {
      const res = await axios.post("http://localhost:5000/run", {
        problemid,
        code,
        language,
        inputArray: [{ name: "Custom", data: customInput }],
      });

      if (res.data.status === "success") {
        setCustomOutput(res.data.output?.[0]?.output || "");
      } else {
        setCustomError(res.data.message || "Unknown error");
      }
    } catch (err) {
      setCustomError(err.response?.data?.message || err.message);
    }
  };

  const normalize = (str) => str.replace(/\r\n/g, '\n').trim();

  let testcaseSummaries = [];
  if (responseData) {
    testcaseSummaries = (responseData.output || []).map((outObj) => {
      const name = outObj.name;
      const userRaw = outObj.output || '';
      const userNorm = normalize(userRaw);

      const inputObj = (responseData.input || []).find((i) => i.name === name) || {};
      const inputRaw = inputObj.data || '';

      const expectedObj =
        (responseData.expectedOutput || []).find((e) => e.name === name) || {};
      const expectedRaw = expectedObj.data || '';
      const expectedNorm = normalize(expectedRaw);

      const isCorrect = userNorm === expectedNorm;

      return {
        name,
        inputRaw,
        userRaw,
        expectedRaw,
        isCorrect,
      };
    });
  }

  const closePanel = () => {
    setResponseData(null);
    setErrorData(null);
    setSelectedTestcase(null);
  };

  // Check if all testcases passed (only for full submissions)
  const allPassed =
    responseData &&
    !isSampleRun &&
    testcaseSummaries.length > 0 &&
    testcaseSummaries.every((tc) => tc.isCorrect);

  useEffect(()=>{
      const save_submission = async () => {
      if(errorData && !isSampleRun){
        const data = {
          userid:userinfo._id,
          problemid:problemid,
          code:code,
          status:errorData.errorType
        }
        await axios.post("http://localhost:5000/submission",data);
      }
      if(responseData && !isSampleRun){
        
        if(allPassed){
            const data = {
            userid:userinfo._id,
            problemid:problemid,
            code:code,
            status:"Accepted",
            time_complexity:timecomplexity,
            space_complexity:spacecomplexity
          }

          await axios.post("http://localhost:5000/submission",data);
        }
        else{
          const data = {
            userid:userinfo._id,
            problemid:problemid,
            code:code,
            status:"Wrong Answer"
          }
          await axios.post("http://localhost:5000/submission",data);
        }
      }
    }
    save_submission();
  },[errorData,responseData])

  const ai_smart_fix = async() => {
    const data = {
      language:language,
      code:code,
    }
    const response = await axios.post("http://localhost:5000/smartfix", data);
    let rawCode = response.data.code;

    // Remove markdown-style code fences
    if (rawCode.startsWith("```")) {
      rawCode = rawCode.replace(/^```[\s\S]*?\n/, ""); 
      rawCode = rawCode.replace(/```$/, "");           
    }

    setCode(rawCode.trim());
  } 

  const ai_code_review = async() => {
    const data = {
      language:language,
      code:code,
      problem:problem
    }
    const response = await axios.post("http://localhost:5000/codereview", data);
    setCodeReview(response.data.codereview);
    setShowReview(true);  

  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* LEFT COLUMN: Problem or Results/Error */}
      <div className="w-1/2 p-6 flex flex-col">
        {isCustomOpen ? (
          <div className="relative bg-white rounded-2xl shadow-lg p-6 flex-1 overflow-y-auto">
            {/* × close */}
            <button
              onClick={() => {
                setIsCustomOpen(false);
                setCustomInput("");
                setCustomOutput("");
                setCustomError(null);
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              ×
            </button>

            {/* Heading */}
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Custom Testcase Run
            </h2>

            {/* Input box */}
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-600">Input:</h3>
              <textarea
                rows={6}
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md font-mono text-sm"
              />
            </div>

            {/* Output / Error */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-600">Output:</h3>
              <pre className="w-full mt-1 p-2 border border-gray-300 rounded-md font-mono text-sm min-h-[100px]">
                {customError ? `Error: ${customError}` : customOutput}
              </pre>
            </div>

            {/* Run button */}
            <button
              onClick={run_custom_code}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg shadow"
            >
              Run Custom Test
            </button>
          </div>
        ) : errorData || responseData ? (
          <div className="relative bg-white rounded-2xl shadow-lg p-6 flex-1 overflow-y-auto">
            <button
              onClick={closePanel}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              ×
            </button>

            {errorData ? (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-4 max-w-md">
  {/* 1) Error Type */}
  <h2 className="text-lg font-semibold text-red-600 font-sans">
    {errorData.errorType}
  </h2>

  {/* 2) AI Suggestion */}
   {errorsuggestion && (
    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg shadow-sm">
      <h3 className="text-sm font-medium text-blue-700 mb-1">💡 AI Suggestion</h3>
      <h2 className="text-sm text-gray-800 whitespace-pre-line">
        {errorsuggestion}
      </h2>
    </div>
  )}
  

  {/* 3) Error Message */}
  <span className="text-sm text-gray-800 whitespace-pre-line font-sans">
    {errorData.message}
  </span>
</div>
            ) : (
              <div>
                {/* If this was a sample‐run, the heading says “Sample Testcase Results” */}
                {isSampleRun && (
                  <h2 className="text-xl font-semibold text-gray-800 mb-4 font-sans">
                    Sample Testcase Results
                  </h2>
                )}

                {/* If this was a full submit and all testcases passed, show “Accepted” */}
                {!isSampleRun && allPassed && (
                  <>
                    <h2 className="text-2xl font-bold text-green-700 mb-2">
                      Accepted
                    </h2>
                    <div className="mt-5 flex flex-wrap items-center gap-3 mb-5">
                      <span className="inline-flex items-center space-x-1 bg-blue-50 text-blue-800 px-3 py-1 rounded-full font-medium">
                        <Clock className="w-4 h-4" />
                        <span>Time: {timecomplexity}</span>
                      </span>
                      <span className="inline-flex items-center space-x-1 bg-purple-50 text-purple-800 px-3 py-1 rounded-full font-medium">
                        <Database className="w-4 h-4" />
                        <span>Space: {spacecomplexity}</span>
                      </span>
                    </div>
                    <button
                      onClick={ai_code_review}
                      className="mb-5 cursor-pointer bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white font-semibold py-2 px-6 rounded-xl shadow-lg transform transition hover:scale-105 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-pink-300"
                    >
                      Ai Code Review
                    </button>
                  </>
                )}

                {/* If this was a full submit but not all passed, show “Testcase Results” */}
                {!isSampleRun && !allPassed && (
                  <h2 className="text-2xl text-red-800 mb-4 font-sans font-bold">
                    Wrong Answer
                  </h2>
                )}

                <div className="flex flex-col space-y-2">
                  {testcaseSummaries.map((tc) => (
                    <div key={tc.name}>
                      <button
                        onClick={() =>
                          setSelectedTestcase((prev) =>
                            prev === tc.name ? null : tc.name
                          )
                        }
                        className={`
                          w-full text-left px-4 py-2 rounded-lg font-medium font-sans
                          ${
                            tc.isCorrect
                              ? "bg-green-100 text-green-800 border border-green-300"
                              : "bg-red-100 text-red-800 border border-red-300"
                          }
                          hover:opacity-90
                        `}
                      >
                        <span className="text-base">{tc.name}</span>{" "}
                        <span className="ml-2">
                          {tc.isCorrect ? "✅" : "❌"}
                        </span>
                      </button>

                      {selectedTestcase === tc.name && (
                        <div className="mt-2 ml-4 bg-gray-50 border border-gray-200 rounded-lg p-4">
                          <div className="mb-3">
                            <h3 className="text-sm font-medium text-gray-600 font-sans">
                              Input:
                            </h3>
                            <pre className="text-sm text-gray-800 whitespace-pre-wrap mt-1 font-mono">
                              {tc.inputRaw.replace(/\r\n/g, "\n")}
                            </pre>
                          </div>

                          <div className="mb-3">
                            <h3 className="text-sm font-medium text-gray-600 font-sans">
                              Your Output:
                            </h3>
                            <pre className="text-sm text-gray-800 whitespace-pre-wrap mt-1 font-mono">
                              {tc.userRaw.replace(/\r\n/g, "\n")}
                            </pre>
                          </div>

                          <div>
                            <h3 className="text-sm font-medium text-gray-600 font-sans">
                              Expected Output:
                            </h3>
                            <pre className="text-sm text-gray-800 whitespace-pre-wrap mt-1 font-mono">
                              {tc.expectedRaw.replace(/\r\n/g, "\n")}
                            </pre>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg p-6 flex-1 overflow-y-auto">
            {problem ? (
              <>
                {/* Tag & Title */}
                <div className="mb-4 flex justify-between">
                  <h1 className="mt-1 text-3xl font-bold text-gray-800 font-sans">
                    {problem.title}
                  </h1>
                  <span className="mt-2.5 text-sm font-semibold text-indigo-600 uppercase font-sans">
                    {problem.tag}
                  </span>
                </div>

                {/* Description */}
                <h2 className="text-xl font-medium text-gray-700 mb-2 font-sans">
                  Description
                </h2>
                <div className="mb-6 max-h-44 overflow-y-auto border border-gray-200 rounded-md p-4">
                  <h2 className="text-base text-gray-700 whitespace-pre-wrap font-sans">
                    {problem.description}
                  </h2>
                </div>

                {/* Constraints */}
                <h2 className="text-xl font-medium text-gray-700 mb-2 font-sans">
                  Constraints
                </h2>
                <div className="mb-6 max-h-28 overflow-y-auto bg-gray-50 border border-gray-200 rounded-md p-4">
                  <h2 className="text-sm text-gray-600 whitespace-pre-wrap font-serif">
                    {problem.constraints}
                  </h2>
                </div>

                {/* Sample Cases */}
                <h2 className="text-xl font-medium text-gray-700 mb-4 font-sans">
                  Sample Cases
                </h2>
                <div className="grid gap-4">
                  {(problem.sampleCases || []).map((sc, idx) => (
                    <div
                      key={sc.id}
                      className="bg-gray-50 border border-gray-200 rounded-lg p-4"
                    >
                      <h2 className="text-lg font-semibold text-gray-800 mb-2 font-sans">
                        Sample #{idx}
                      </h2>

                      <div className="mb-4">
                        <h2 className="text-base font-medium text-gray-600 mb-1 font-sans">
                          Input
                        </h2>
                        <pre className="bg-white border border-gray-200 rounded-md p-3 text-sm text-gray-800 whitespace-pre-wrap font-mono">
                          {sc.sampleInput}
                        </pre>
                      </div>

                      <div>
                        <h2 className="text-base font-medium text-gray-600 mb-1 font-sans">
                          Output
                        </h2>
                        <pre className="bg-white border border-gray-200 rounded-md p-3 text-sm text-gray-800 whitespace-pre-wrap font-mono">
                          {sc.sampleOutput}
                        </pre>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex h-full items-center justify-center">
                <span className="text-gray-400 italic">Loading problem…</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* RIGHT COLUMN: Editor + Submit */}
      <div className="w-1/2 p-6 flex flex-col items-center overflow-hidden">
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            Web IDE with Auto-Fix
          </h1>
        </header>
        <div className="w-full flex mb-5 relative">
          {/* Flex container inside right column */}
          <div className="w-full flex justify-center relative">
            {/* Centered Select */}
            <div className="absolute left-1/2 -translate-x-1/2">
              <select
                name="language"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="px-4 py-2 border rounded-lg bg-white cursor-pointer w-48 text-gray-700"
              >
                <option value="cpp">C++</option>
                <option value="js">JavaScript</option>
                <option value="py">Python</option>
                <option value="java">Java</option>
              </select>
            </div>

            {/* RHS Custom Testcase Button (non-absolute, stays in flow) */}
            <div className="ml-auto pr-6 pt-2">
              <button
                onClick={() => {
                  setIsCustomOpen(true);
                  setResponseData(null);
                  setErrorData(null);
                }}
                className="text-blue-600 underline underline-offset-4 font-medium hover:text-blue-800 transition cursor-pointer"
              >
                Custom Testcase
              </button>
            </div>
          </div>
        </div>

        <div className="w-full max-w-3xl border rounded-xl shadow-md overflow-hidden mb-4">
          <Editor
            height="450px"
            defaultLanguage="cpp"
            language={language}
            value={code}
            onChange={(value) => setCode(value)}
            options={{ automaticLayout: true, minimap: { enabled: false } }}
          />
        </div>

        <div className="flex justify-around w-[600px]">
          <button
            onClick={run_sample_code}
            className="mt-4 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-8 rounded-lg shadow"
          >
            Run
          </button>
          {userinfo ? (
            <button
              onClick={run_code}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-8 rounded-lg shadow"
            >
              Submit
            </button>
          ) : (
            <button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-8 rounded-lg shadow cursor-not-allowed opacity-50">
              Submit
            </button>
          )}
          <button
            onClick={ai_smart_fix}
            className="mt-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-8 rounded-lg shadow"
          >
            Smart Fix
          </button>
        </div>
      </div>
      {showReview && (
  <div className="fixed inset-0 flex">
    {/* 1) Blur only left half */}
    <div
      className="absolute inset-y-0 left-0 w-1/2 backdrop-blur-sm"
      onClick={() => setShowReview(false)}
    />

    {/* 2) Centered panel container within left half */}
    <div className="absolute inset-y-0 left-0 w-1/2 flex items-center justify-center">
      <div className="relative z-10 bg-white rounded-2xl shadow-xl p-6 w-96 max-h-[80vh] overflow-auto font-serif">
        {/* Close button */}
        <button
          onClick={() => setShowReview(false)}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          ×
        </button>

        {/* Markdown content with bold headings & serif text */}
        <ReactMarkdown
          components={{
            h1: ({node, ...props}) => (
              <div className="font-bold text-lg text-gray-900 mb-2" {...props} />
            ),
            h2: ({node, ...props}) => (
              <div className="font-bold text-lg text-gray-900 mb-2" {...props} />
            ),
            p: ({node, ...props}) => (
              <div className="text-sm text-gray-800 mb-2" {...props} />
            ),
            ul: ({node, ...props}) => (
              <ul className="list-disc list-inside ml-4 mb-2" {...props} />
            ),
            li: ({node, ...props}) => (
              <li className="text-sm text-gray-800 mb-1" {...props} />
            ),
          }}
        >
          {codereview}
        </ReactMarkdown>
      </div>
    </div>
  </div>
)}

    </div>
  );
};

export default Compiler;
