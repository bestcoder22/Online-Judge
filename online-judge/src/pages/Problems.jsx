import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import axios from "axios"
import { Link } from "react-router-dom";

const Problems = () => {
    const [problems , setproblems] = useState([]);
    useEffect(()=>{
        const getproblems = async () => {
            const response = await axios.get("http://localhost:5000/problems");
            setproblems(response.data.problems);
            
        }
        getproblems();
    },[])
   
    return(
    <div>
      <Navbar />
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="space-y-4">
          {problems.map((problem) => (
            <Link key={problem._id} to={`/problems/${problem.problemid}`}><div
                className="cursor-pointer bg-white shadow rounded-lg p-6 hover:shadow-lg transition-shadow my-4"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-500">ID: {problem.problemid}</span>
                  <span className="text-xs font-semibold text-indigo-700 bg-indigo-100 px-2 py-1 rounded">
                    {problem.tag}
                  </span>
                </div>    
                <h2 className="text-lg font-semibold text-gray-800 mb-1">{problem.title}</h2>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
        

    )
    
}   

export default Problems;