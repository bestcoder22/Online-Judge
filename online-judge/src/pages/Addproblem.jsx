import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';

const Addproblem = () => {
  const [open, setOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState('Tag');
  const [inputfile , setInputfile] = useState(null);
  const [outputfile , setOutputfile] = useState(null);
  const [problem , setProblem] = useState({
    problemid : null,
    tag : "",
    title: "",
    description:"",
  });
  const options = ['Easy', 'Medium', 'Hard', 'Insane'];

  useEffect(()=>{
      const sendproblem = async () => {
        if(problem.problemid!=null){
         const response_problem = await axios.post("http://localhost:5000/admin/addproblem" , problem);
          if(response_problem.data.success){
            alert("Problem added successfully");
            window.location.replace("/admin");
          }
        }
      }
      sendproblem();
    },[problem]);


  const handleSelect = (option) => {
    setSelectedTag(option);
    setOpen(false);
    setProblem({...problem,"tag":option});
  };
  
  const changeHandler = (e) => {
    setProblem({...problem,[e.target.name]:e.target.value});
  }

  const submithandler = async () => {
    if(!inputfile){
      alert("Input File not added");
      return;
    }
    if(!outputfile){
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

    const data_input = new FormData();
    data_input.append('name',inputfile.name);
    data_input.append('file',inputfile);
    const response_input = await axios.post('http://localhost:5000/admin/getdetails_input', data_input);


    const data_output = new FormData();
    data_output.append('name', outputfile.name);
    data_output.append('file', outputfile);
    const response_output = await axios.post('http://localhost:5000/admin/getdetails_output', data_output);
    
    
    const response_testcase = await axios.post("http://localhost:5000/admin/testcase" , {response_input,response_output});
    setProblem({...problem, problemid:response_testcase.data.problemid});
  }

  return (
    <div>
      <Navbar />
      <div onClick={() => open && setOpen(false)}>
        <div className="block mx-10 my-2">
          <div className="font-bold py-5 text-2xl">Problem Input</div>
              <div
              className="relative inline-block w-full"
              onClick={(e) => e.stopPropagation()}
              >
              <button
              type="button"
              className="inline-flex gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm text-gray-400 shadow-xs ring-1 ring-gray-300 ring-inset hover:bg-gray-50"
              id="menu-button"
              aria-expanded={open}
              aria-haspopup="true"
              onClick={() => setOpen((o) => !o)}
              >
              {selectedTag}
              <svg
                  className="-mr-1 size-5 text-gray-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                  data-slot="icon"
              >
                  <path
                  fillRule="evenodd"
                  d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
                  clipRule="evenodd"
                  />
              </svg>
              </button>

              {open && (
              <div className="mt-2 w-full bg-white border border-gray-300 rounded-md shadow-lg">
                  {options.map((option) => (
                  <div
                      key={option}
                      className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                      onClick={() => handleSelect(option)}
                  >
                      {option}
                  </div>
                  ))}
              </div>
              )}

              <input
              name="title"
              value={problem.title}
              type="text"
              placeholder="Problem title"
              className="block w-full rounded-md bg-white px-3 py-1.5 my-5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
              onChange={changeHandler}
              />
              <textarea
              name="description"
              value={problem.description}
              placeholder="Enter Problem Description"
              className="block w-full rounded-md bg-white px-3 py-1.5 my-5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
              onChange={changeHandler}
              />
              <div>
                  <label className="block my-2 text-m font-sans tracking-tight text-gray-900 white:text-black" >Upload Input file</label>
                  <input className="block cursor-pointer border border-gray-200 shadow-sm rounded-lg text-sm focus:z-10 focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 white:bg-neutral-900 white:border-neutral-700 white:text-neutral-400
                  file:bg-gray-200
                  file:me-4
                  file:py-2 file:px-3
                  white:file:bg-neutral-700 white:file:text-neutral-400" id="file_input" type="file" onChange={(e)=>setInputfile(e.target.files[0])}/>
              </div>
              <div className='my-5'>
                  <label className="block my-2 text-m font-sans tracking-tight text-gray-900 white:text-black" >Upload Output file</label>
                  <input className="block cursor-pointer border border-gray-200 shadow-sm rounded-lg text-sm focus:z-10 focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 white:bg-neutral-900 white:border-neutral-700 white:text-neutral-400
                  file:bg-gray-200
                  file:me-4
                  file:py-2 file:px-3
                  white:file:bg-neutral-700 white:file:text-neutral-400" id="file_output" type="file" onChange={(e)=>setOutputfile(e.target.files[0])}/>
              </div>
              <button className="cursor-pointer border rounded-xl hover:shadow-xl/15 px-4 py-2 mt-8" onClick={submithandler}>Submit</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Addproblem;
