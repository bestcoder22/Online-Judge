import Editor from '@monaco-editor/react';
import axios from 'axios';
import { useEffect, useState } from 'react';

const Compiler = ({ problemid }) => {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('cpp');

  // Holds the full backend response when status === "success"
  const [responseData, setResponseData] = useState(null);

  // Holds error info { errorType, message } if something goes wrong
  const [errorData, setErrorData] = useState(null);

  // Which testcase is currently expanded (by name), or null if none
  const [selectedTestcase, setSelectedTestcase] = useState(null);

  // Default “Hello, World!” snippets by language
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

  // Whenever the language dropdown changes, reset the editor to that language’s default
  useEffect(() => {
    setCode(defaultCodes[language]);
  }, [language]);

  // Called when you click “Submit”
  const run_code = async () => {
    // Clear previous results/errors/selections
    setResponseData(null);
    setErrorData(null);
    setSelectedTestcase(null);

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

      // If backend responds with something like { status: "success", ... }
      if (res.data.status === 'success') {
        setResponseData(res.data);
      } else {
        // If backend returns e.g. { status: "error", errorType, message }
        setErrorData({
          errorType: res.data.errorType || 'Error',
          message: res.data.message || 'An unknown error occurred.',
        });
      }
    } catch (err) {
      // Axios error / network error / server error
      const serverData = err.response?.data || {};
      setErrorData({
        errorType: serverData.errorType || 'Error',
        message: serverData.message || err.message || 'An unknown error occurred.',
      });
    }
  };

  // Helper: normalize a string by replacing \r\n → \n and trimming trailing whitespace
  const normalize = (str) => str.replace(/\r\n/g, '\n').trim();

  // If we have a successful response, build a list of testcaseSummary objects:
  // [ { name, inputRaw, expectedRaw, userRaw, isCorrect }, ... ]
  let testcaseSummaries = [];
  if (responseData) {
    testcaseSummaries = responseData.output.map((outObj) => {
      const name = outObj.name;
      const userRaw = outObj.output || '';
      const userNorm = normalize(userRaw);

      const inputObj = responseData.input.find((i) => i.name === name) || {};
      const inputRaw = inputObj.data || '';

      const expectedObj =
        responseData.expectedOutput.find((e) => e.name === name) || {};
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

  // Close the results/error panel
  const closePanel = () => {
    setResponseData(null);
    setErrorData(null);
    setSelectedTestcase(null);
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* LEFT COLUMN: Problem Description OR Results/Error */}
      <div className="w-1/2 p-6">
        {errorData || responseData ? (
          <div className="relative bg-white rounded-2xl shadow-lg p-6">
            {/* Close (X) button */}
            <button
              onClick={closePanel}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
            >
              ×
            </button>

            {errorData ? (
              // ==== ERROR VIEW ====
              <div>
                <h2 className="text-lg font-semibold text-red-600 mb-2">
                  {errorData.errorType}
                </h2>
                <p className="text-sm text-gray-800 whitespace-pre-line">
                  {errorData.message}
                </p>
              </div>
            ) : (
              // ==== SUCCESS VIEW ====
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Testcase Results
                </h2>

                {/* List of testcases, each with inline expandable details */}
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
                          w-full text-left px-4 py-2 rounded-lg font-medium
                          ${
                            tc.isCorrect
                              ? 'bg-green-100 text-green-800 border border-green-300'
                              : 'bg-red-100 text-red-800 border border-red-300'
                          }
                          hover:opacity-90
                        `}
                      >
                        <span className="text-base">{tc.name}</span>{' '}
                        <span className="ml-2">
                          {tc.isCorrect ? '✅' : '❌'}
                        </span>
                      </button>

                      {selectedTestcase === tc.name && (
                        <div className="mt-2 ml-4 bg-gray-50 border border-gray-200 rounded-lg p-4">
                          <div className="mb-3">
                            <h3 className="text-sm font-medium text-gray-600">
                              Input:
                            </h3>
                            <pre className="text-sm text-gray-800 whitespace-pre-wrap mt-1">
                              {tc.inputRaw.replace(/\r\n/g, '\n')}
                            </pre>
                          </div>

                          <div className="mb-3">
                            <h3 className="text-sm font-medium text-gray-600">
                              Your Output:
                            </h3>
                            <pre className="text-sm text-gray-800 whitespace-pre-wrap mt-1">
                              {tc.userRaw.replace(/\r\n/g, '\n')}
                            </pre>
                          </div>

                          <div>
                            <h3 className="text-sm font-medium text-gray-600">
                              Expected Output:
                            </h3>
                            <pre className="text-sm text-gray-800 whitespace-pre-wrap mt-1">
                              {tc.expectedRaw.replace(/\r\n/g, '\n')}
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
          // Placeholder for Problem Description (initially empty)
          <div className="h-full border-dashed border-2 border-gray-300 rounded-lg flex items-center justify-center">
            <span className="text-gray-400 italic">
              Problem description goes here...
            </span>
          </div>
        )}
      </div>

      {/* RIGHT COLUMN: EDITOR + SUBMIT BUTTON */}
      <div className="w-1/2 flex flex-col items-center p-6">
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Web IDE with Auto-Fix</h1>
        </header>

        {/* Language selector */}
        <select
          name="language"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="px-4 py-2 border rounded-lg bg-white mb-5 cursor-pointer w-48 text-gray-700"
        >
          <option value="cpp">C++</option>
          <option value="js">JavaScript</option>
          <option value="py">Python</option>
          <option value="java">Java</option>
        </select>

        {/* Code editor */}
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

        {/* Submit button */}
        <button
          onClick={run_code}
          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-8 rounded-lg shadow"
        >
          Submit
        </button>
      </div>
    </div>
  );
};

export default Compiler;
