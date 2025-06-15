import { useContext, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { AuthContext } from '../context/AuthContext';

const AddProblem = () => {
  const { isAdmin } = useContext(AuthContext);
  const [open, setOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState('Select Difficulty');
  const [inputFile, setInputFile] = useState(null);
  const [outputFile, setOutputFile] = useState(null);
  const [samplePairs, setSamplePairs] = useState([]);
  const [problem, setProblem] = useState({
    problemid: null,
    tag: "",
    title: "",
    description: "",
    constraints: "",
    sampleCases: [],
  });
  const options = ['Easy', 'Medium', 'Hard', 'Insane'];

  const handleSelect = (option) => {
    setSelectedTag(option);
    setOpen(false);
    setProblem({ ...problem, tag: option });
  };

  const onSampleChange = (id, field, value) => {
    setSamplePairs((prev) =>
      prev.map((pair) =>
        pair.id === id ? { ...pair, [field]: value } : pair
      )
    );
  };

  const addSamplePair = () => {
    if (samplePairs.length >= 5) return;
    const newPair = { id: Date.now(), sampleInput: '', sampleOutput: '' };
    setSamplePairs((prev) => [...prev, newPair]);
  };

  const removeSamplePair = (id) => {
    setSamplePairs((prev) => prev.filter((pair) => pair.id !== id));
  };

  const changeHandler = (e) => {
    setProblem({ ...problem, [e.target.name]: e.target.value });
  };

  const submitHandler = async () => {
    if(!inputFile){
      alert("Input File not added");
      return;
    }
    if(!outputFile){
      alert("Output File not added");
      return;
    }
    if(problem.tag===""){
      alert("Enter Tag");
      return;
    }
    if(problem.title===""){
      alert("Enter Title");
      return;
    }
    if(problem.description===""){
      alert("Enter Description");
      return;
    }

    if(problem.constraints===""){
      alert("Add Constraints");
      return;
    }

    for(let i=0 ; i<samplePairs.length ; i++){
      const pair = samplePairs[i];
      if (pair.sampleInput === '' || pair.sampleOutput === '') {
        alert(`Enter Sample I/O for sample ${i + 1}`);
        return ;
      }
    }
    

    const data_input = new FormData();
    data_input.append('name',inputFile.name);
    data_input.append('file',inputFile);
    const response_input = await axios.post('http://localhost:5000/admin/getdetails_input', data_input , {withCredentials:true});


    const data_output = new FormData();
    data_output.append('name', outputFile.name);
    data_output.append('file', outputFile);
    const response_output = await axios.post('http://localhost:5000/admin/getdetails_output', data_output , {withCredentials:true});
    
    
    const response_testcase = await axios.post("http://localhost:5000/admin/testcase" , {response_input,response_output} , {withCredentials:true});
    
    const finalProblem = {
      ...problem,
      problemid: response_testcase.data.problemid,
      sampleCases: samplePairs,
    };

    const response_problem = await axios.post("http://localhost:5000/admin/addproblem", finalProblem , {withCredentials:true});
    if(response_problem.data.success){
      alert("Problem added successfully");
      window.location.replace("/admin");
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-3xl mx-auto p-6 space-y-8">
        <h2 className="text-3xl font-extrabold text-center text-indigo-600">
          Add New Problem
        </h2>

        {!isAdmin ? (
          <div className="text-center text-red-600 font-semibold">
            Only admins can access this page.
          </div>
        ) : (
          <div
            className="bg-white p-6 rounded-2xl shadow-lg"
            onClick={() => open && setOpen(false)}
          >
            {/* Difficulty Dropdown */}
            <div className="relative">
              <button
                type="button"
                className="w-full flex justify-between items-center px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
                onClick={(e) => { e.stopPropagation(); setOpen((o) => !o); }}
              >
                {selectedTag}
                <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M5.23 7.21a.75.75 0 011.06-.02L10 10.585l3.71-3.395a.75.75 0 111.02 1.097l-4 3.656a.75.75 0 01-1.02 0l-4-3.656a.75.75 0 01-.02-1.06z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
              {open && (
                <div className="absolute z-10 mt-2 w-full bg-white border border-gray-300 rounded-md shadow-lg">
                  {options.map((option) => (
                    <div
                      key={option}
                      className="px-4 py-2 text-gray-700 hover:bg-gray-100 cursor-pointer"
                      onClick={() => handleSelect(option)}
                    >
                      {option}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Text Inputs */}
            <div className="space-y-4 mt-3">
              <div>
              <input
                name="title"
                value={problem.title}
                onChange={changeHandler}
                type="text"
                placeholder="Problem Title"
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-indigo-600 mt-2"
              />
              </div>
              <div>
              <textarea
                name="description"
                value={problem.description}
                onChange={changeHandler}
                placeholder="Problem Description"
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-indigo-600 mt-2"
              />
              </div>
              <div>
              <textarea
                name="constraints"
                value={problem.constraints}
                onChange={changeHandler}
                placeholder="Problem Constraints"
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-indigo-600"
              />
              </div>
            </div>

            {/* Sample I/O */}
            <div className="space-y-4 mt-4">
              <button
                type="button"
                onClick={addSamplePair}
                disabled={samplePairs.length >= 5}
                className={`inline-flex items-center px-4 py-2 bg-cyan-500 text-white rounded-md shadow hover:bg-cyan-600 focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 ${
                  samplePairs.length >= 5 ? 'cursor-not-allowed' : ''
                }`}
              >
                Add Sample I/O ({samplePairs.length}/5)
              </button>

              {samplePairs.map((pair, idx) => (
                <div key={pair.id} className="relative bg-gray-50 p-4 border border-gray-200 rounded-lg">
                  <button
                    type="button"
                    onClick={() => removeSamplePair(pair.id)}
                    className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                  <h3 className="text-gray-700 font-medium mb-2">Sample #{idx + 1}</h3>
                  <textarea
                    value={pair.sampleInput}
                    placeholder="Sample Input"
                    onChange={(e) => onSampleChange(pair.id, 'sampleInput', e.target.value)}
                    className="w-full px-3 py-2 mb-2 border border-gray-300 rounded-md shadow-sm focus:outline-indigo-600"
                    rows={3}
                  />
                  <textarea
                    value={pair.sampleOutput}
                    placeholder="Sample Output"
                    onChange={(e) => onSampleChange(pair.id, 'sampleOutput', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-indigo-600"
                    rows={3}
                  />
                </div>
              ))}
            </div>

            {/* File Uploads */}
            <div className="space-y-4">
              <div className='mt-4'>
                <label className="block mb-1 font-medium text-gray-700 ">
                  Upload Input File
                </label>
                <input
                  type="file"
                  onChange={(e) => setInputFile(e.target.files[0])}
                  className="w-full text-sm cursor-pointer text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold hover:file:bg-gray-100"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium text-gray-700">
                  Upload Output File
                </label>
                <input
                  type="file"
                  onChange={(e) => setOutputFile(e.target.files[0])}
                  className="w-full text-sm cursor-pointer text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold hover:file:bg-gray-100"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={submitHandler}
              className="mt-7 w-full py-3 mt-4 bg-indigo-600 text-white font-semibold rounded-2xl shadow-lg hover:bg-indigo-700 transition-transform transform hover:-translate-y-1"
            >
              Submit Problem
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddProblem;
