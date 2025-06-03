import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import axios from "axios";

const Updateproblem = () => {
  const [problems, setproblems] = useState([]);
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [selectedTestcase, setselectedTestcase] = useState(null);

  useEffect(() => {
    const getproblems = async () => {
      const response = await axios.get("http://localhost:5000/problems");
      setproblems(response.data.problems);
    };
    getproblems();
  }, []);

  const addSamplePair = () => {
    if (selectedProblem.sampleCases.length >= 5) return;
    const newPair = {
      id: Date.now() + Math.random(), // simple unique key
      sampleInput: '',
      sampleOutput: '',
    };
    setSelectedProblem(prev => ({
      ...prev,
      sampleCases: [...prev.sampleCases, newPair],
      }));
    };

  const removeSampleCases = (id) => {
    setSelectedProblem((prev) => ({
      ...prev,
      sampleCases: prev.sampleCases.filter((pair) => pair.id !== id),
      }));
    };

    const onSampleChange = (id, field, value) => {
      setSelectedProblem((prev) => ({
        ...prev,
        sampleCases:prev.sampleCases.map((pair) =>
          pair.id === id ? { ...pair, [field]: value } : pair
        )
      })
      
    );
  };

  const handledelete = async (problemid) => {
    const response = await axios.post(
      "http://localhost:5000/admin/deleteproblem",
      { problemid }
    );
    if (response.data.success) {
      alert(response.data.message);
      window.location.replace("/admin/updateproblem");
    }
  };
  

  const handleEdit = async (problem) => {
    setSelectedProblem(problem);
    const response = await axios.post("http://localhost:5000/admin/gettestcase", problem);
    setselectedTestcase(response.data.testcase); 
    
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSelectedProblem((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = async (e) => {
    
    if(e.target.name === "inputFile"){
        const data_input = new FormData();
        const inputfile = e.target.files[0];
        data_input.append('name',inputfile.name);
        data_input.append('file',inputfile);
        const response_input = await axios.post('http://localhost:5000/admin/getdetails_input', data_input);
        setselectedTestcase((prev) => ({...prev, input:response_input.data.input}));
    }
    if(e.target.name === "outputFile"){
        const data_output = new FormData();
        const outputfile=e.target.files[0]
        data_output.append('name', outputfile.name);
        data_output.append('file', outputfile);
        const response_output = await axios.post('http://localhost:5000/admin/getdetails_output', data_output);
        setselectedTestcase((prev) => ({...prev, expectedOutput:response_output.data.output}));
    }
  };

  const handleUpdate = async () => {
    if(selectedProblem.title===""){
      alert("Enter Title");
      return;
    }
    if(selectedProblem.description===""){
      alert("Enter Description");
      return;
    }

    if(selectedProblem.constraints===""){
      alert("Add Constraints");
      return;
    }

    for(let i=0 ; i<selectedProblem.sampleCases.length ; i++){
      const pair = selectedProblem.sampleCases[i];
      if (pair.sampleInput === '' || pair.sampleOutput === '') {
        alert(`Enter Sample I/O for sample ${i + 1}`);
        return ;
      }
    }
    // send updated details and files using axios here
    if(selectedProblem===null && selectedTestcase===null){
        alert("You haven't change anything for update!!")
        return;
    }
    if(selectedProblem!=null){
        await axios.post("http://localhost:5000/admin/updateproblem", selectedProblem);
    }
    if(selectedTestcase!=null){
        await axios.post("http://localhost:5000/admin/updatetestcase", selectedTestcase);
    }
    alert("Details Updated Successfully!");
    window.location.replace("/admin/updateproblem");

  };

  return (
    <div>
      <Navbar />
      <div className="max-w-5xl mx-auto py-10 px-6 bg-white">
        <div className="overflow-x-auto border rounded-lg shadow">
          <table className="min-w-full text-sm text-left text-gray-700">
            <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
              <tr>
                <th className="px-6 py-3">ID</th>
                <th className="px-6 py-3">Title</th>
                <th className="px-6 py-3">Tag</th>
                <th className="px-6 py-3 text-right">
                  <div className="mr-10">Actions</div>
                </th>
              </tr>
            </thead>
            <tbody>
              {problems.map((problem) => (
                <tr key={problem._id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-800 whitespace-nowrap">
                    {problem.problemid}
                  </td>
                  <td className="px-6 py-4 text-gray-900">{problem.title}</td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-semibold text-indigo-700 bg-indigo-100 px-2 py-1 rounded">
                      {problem.tag}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      className="cursor-pointer text-white font-sans px-3 py-0.5 mx-5 rounded-sm hover:text-blue-800 font-medium bg-blue-500"
                      onClick={() => handleEdit(problem)}
                    >
                      Edit
                    </button>
                    <button
                      className="cursor-pointer text-white font-sans px-2 py-0.5 bg-red-500 hover:text-red-800 font-medium rounded-xl"
                      onClick={() => handledelete(problem.problemid)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Edit Form Section */}
        {selectedProblem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
            {/* Modal Container */}
            <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl p-6 relative">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Edit Problem
              </h2>

              {/* Form Fields */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Problem ID
                  </label>
                  <input
                    type="text"
                    value={selectedProblem.problemid}
                    readOnly
                    className="w-full px-4 py-2 border rounded-lg bg-gray-100 text-gray-700 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={selectedProblem.title}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Tag
                  </label>
                  <select
                    name="tag"
                    value={selectedProblem.tag}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg bg-white"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                    <option value="Insane">Insane</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={selectedProblem.description}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg resize-none max-h-40 overflow-y-auto"
                    rows={5}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Constraints
                  </label>
                  <textarea
                    name="constraints"
                    value={selectedProblem.constraints}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg resize-none max-h-40 overflow-y-auto"
                    rows={5}
                  />
                </div>

                <button
                  type="button"
                  onClick={addSamplePair}
                  disabled={selectedProblem.sampleCases.length >= 5}
                  className={`inline-flex items-center justify-center rounded-md bg-cyan-500 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-indigo-500
                  ${selectedProblem.sampleCases.length >= 5 ? "opacity-50 cursor-not-allowed" : ""}
                  `}
                >
                  Add Sample I/O ({selectedProblem.sampleCases.length}/5)
                </button>

                <div className="mt-4 space-y-6">
                  {selectedProblem.sampleCases.map((pair, idx) => (
                    <div
                      key={pair.id}
                      className="relative bg-white border border-gray-200 rounded-lg p-4"
                    >
                      {/* Remove (×) button in top-right */}
                      <button
                        type="button"
                        onClick={() => removeSampleCases(pair.id)}
                        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                      >
                        ×
                      </button>

                      {/* Optional: Label “Sample Pair #” */}
                      <h3 className="text-sm font-medium text-gray-700 mb-2">
                        Sample #{idx + 1}
                      </h3>

                      {/* Sample Input textarea */}
                      <textarea
                        name={`sampleInput-${pair.id}`}
                        value={pair.sampleInput}
                        placeholder="Enter Sample Input"
                        className="block w-full rounded-md bg-gray-50 px-3 py-1.5 mb-4 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                        onChange={(e) =>
                          onSampleChange(pair.id, "sampleInput", e.target.value)
                        }
                      />

                      {/* Sample Output textarea */}
                      <textarea
                        name={`sampleOutput-${pair.id}`}
                        value={pair.sampleOutput}
                        placeholder="Enter Sample Output"
                        className="block w-full rounded-md bg-gray-50 px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                        onChange={(e) =>
                          onSampleChange(pair.id, "sampleOutput", e.target.value)
                        }
                      />
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Input File
                    </label>
                    <input
                      type="file"
                      name="inputFile"
                      onChange={handleFileChange}
                      className="flex cursor-pointer hover:border hover:border-indigo-500  shadow-sm rounded-lg text-sm focus:z-10 focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 white:bg-neutral-900 white:border-neutral-700 white:text-neutral-400
                  file:bg-gray-200
                  file:me-4
                  file:py-2 file:px-3
                  white:file:bg-neutral-700 white:file:text-neutral-400"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Output File
                    </label>
                    <input
                      type="file"
                      name="outputFile"
                      onChange={handleFileChange}
                      className="flex cursor-pointer hover:border hover:border-indigo-500 shadow-sm rounded-lg text-sm focus:z-10 focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 white:bg-neutral-900 white:border-neutral-700 white:text-neutral-400
                  file:bg-gray-200
                  file:me-4
                  file:py-2 file:px-3
                  white:file:bg-neutral-700 white:file:text-neutral-400"
                    />
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex justify-end mt-6 space-x-4">
                <button
                  onClick={() => {setSelectedProblem(null);setselectedTestcase(null)}}
                  className="px-4 py-2 bg-gray-200 text-gray-800 hover:bg-gray-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdate}
                  className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg"
                >
                  Update
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Updateproblem;
