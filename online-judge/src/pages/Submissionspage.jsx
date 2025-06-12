import { useContext } from "react";
import Navbar from "../components/Navbar";
import { AuthContext } from "../context/AuthContext";
import { useParams } from "react-router-dom";
import { useEffect } from "react";
import axios from "axios"
import { useState } from "react";

const Submissionspage = () => {
    const {userinfo} = useContext(AuthContext);
    const {submissionid} = useParams();
    const [problem,setProblem] = useState(null);
    const [submission,setSubmission] = useState(null);
    useEffect(() => {
    if (!userinfo || !Array.isArray(userinfo.submissions)) {
      setSubmission(null);
      return;
    }

    // Find the submission in userinfo.submissions
    const matched = userinfo.submissions.find(
      (sub) => sub._id === submissionid
    );

    setSubmission(matched || null);
  }, [userinfo, submissionid]);

  // 2) Once we have `submission`, fetch its problem
  useEffect(() => {
    const fetchProblem = async () => {
      if (!submission) {
        setProblem(null);
        return;
      }

      try {
        const { problemid } = submission;
        const res = await axios.post(
          "http://localhost:5000/getproblem",
          { problemid }
        );

        if (res.data.success) {
          setProblem(res.data.problem);
        } else {
          console.error("API returned success: false");
          setProblem(null);
        }
      } catch (err) {
        console.error("Failed to fetch problem:", err);
        setProblem(null);
      }
    };

    fetchProblem();
  }, [submission]);
     if (!submission || !problem) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <span className="text-gray-500 text-lg">Loading submission…</span>
        </div>
      </div>
    );
  }

 let statusColorClass = "bg-red-100 text-red-700";
  if (submission?.status === "Accepted") {
    statusColorClass = "bg-green-100 text-green-700";
  }

  return (
    <div className="bg-gray-50 flex flex-col h-screen">
      <Navbar />

      {/* Main content (fills remaining height) */}
      <div className="flex flex-1 overflow-hidden">
        {/* ───────────────────────────────────────────────
            LEFT PANEL (50% width): Problem ID / Title / Status
            ─────────────────────────────────────────────── */}
        <div className="w-1/2 bg-white p-8 overflow-y-auto border-r border-gray-200">
          {!submission || !problem ? (
            <div className="flex items-center justify-center h-full">
              <span className="text-gray-500">Loading…</span>
            </div>
          ) : (
            <>
              {/* Problem ID */}
              <h2 className="text-3xl font-bold text-gray-800">
                Problem #{submission.problemid}
              </h2>

              {/* Problem Title */}
              <h3 className="mt-4 text-2xl font-semibold text-gray-700 font-serif">
                {problem.title}
              </h3>

              {/* Status Badge */}
              <div className="mt-6">
                <span
                  className={`inline-block px-4 py-2 ${statusColorClass} font-semibold text-sm rounded-full uppercase`}
                >
                  {submission.status}
                </span>
              </div>

              {/* ─── Time & Space Complexity Badges ─────────────────────────── */}
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium">
                  Time: {submission.time_complexity}
                </span>
                <span className="bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-sm font-medium">
                  Space: {submission.space_complexity}
                </span>
              </div>
            </>
          )}
        </div>

        {/* ───────────────────────────────────────────────
            RIGHT PANEL (50% width): Code Block
            ─────────────────────────────────────────────── */}
        <div className="w-1/2 bg-gray-100 p-8 overflow-auto">
          {submission ? (
            <pre className="whitespace-pre-wrap break-all text-sm font-mono text-gray-900">
              {submission.code}
            </pre>
          ) : (
            <div className="flex items-center justify-center h-full">
              <span className="text-gray-500">No code to display.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default Submissionspage;