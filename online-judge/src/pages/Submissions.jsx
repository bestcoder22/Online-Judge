import { useContext,useState,useEffect } from "react";
import Navbar from "../components/Navbar";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import { Link } from "react-router-dom";

const Submissions = () => {
    const {userinfo} = useContext(AuthContext);
    const [submissions,setSubmissions] = useState([]);
    useEffect(() => {
    if (userinfo) {
      setSubmissions([...userinfo.submissions].reverse());
    } else {
      setSubmissions([]);
    }
  }, [userinfo]);
    const [problems , setproblems] = useState([]);
    useEffect(()=>{
        const getproblems = async () => {
            const response = await axios.get("http://localhost:5000/problems");
            setproblems(response.data.problems);
            
        }
        getproblems();
    },[])
    return (
      <div>
        <Navbar />
        {userinfo ? (
          <div className="bg-gray-50 p-6 min-h-screen">
            <div className="max-w-4xl mx-auto space-y-4">
              {submissions.map((submissionobj) => {
                const problem = problems[submissionobj.problemid - 1] || {};
                const tagText = (problem.tag || "NO TAG").toUpperCase();
                const status = submissionobj.status;
                let statusColor = "bg-red-100 text-red-700";
                if (status === "Accepted")
                  statusColor = "bg-green-100 text-green-700";
                else if (status === "Error" || status === "Wrong Answer")
                  statusColor = "bg-red-100 text-red-700";

                return (
                <Link key={submissionobj._id} to={`/submissions/${submissionobj._id}`}>
                  <div
                    className="cursor-pointer bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200 p-5 grid grid-cols-[3fr_1fr_1fr] items-center gap-4 m-3"
                  >
                    {/* Left Section: Problem ID + Title */}
                    <div className="flex flex-col space-y-1">
                      <span className="text-xs text-gray-400">
                        Problem ID: {submissionobj.problemid}
                      </span>
                      <span className="text-lg font-semibold text-gray-800">
                        {problem.title || "Untitled Problem"}
                      </span>
                    </div>

                    {/* Middle Section: Tag Pill */}
                    <div className="flex justify-center">
                      <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 font-medium text-xs rounded-full">
                        {tagText}
                      </span>
                    </div>

                    {/* Right Section: Status Pill */}
                    <div className="flex justify-end">
                      <span
                        className={`inline-block px-3 py-1 ${statusColor} font-semibold text-xs rounded-full`}
                      >
                        {status}
                      </span>
                    </div>
                  </div>
                </Link>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="text-center mt-15 font-sans text-xl">
            Login to see Submissions!!
          </div>
        )}
      </div>
    );
}

export default Submissions;