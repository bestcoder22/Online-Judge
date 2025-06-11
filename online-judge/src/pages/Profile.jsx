import { useContext, useEffect, useRef, useState } from "react";
import Navbar from "../components/Navbar";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import { Link } from "react-router-dom";

const Profile = () => {
  const { userinfo } = useContext(AuthContext);
  const fileInputRef = useRef();

  const [submissions, setSubmissions] = useState([]);
  const [problems, setProblems] = useState([]);
  const [stats, setStats] = useState({
    totalProblems: 0,
    totalSolved: 0,
    byTag: {
      easy: { total: 0, solved: 0 },
      medium: { total: 0, solved: 0 },
      hard: { total: 0, solved: 0 },
      insane: { total: 0, solved: 0 },
    },
  });
  const [acceptedList, setAcceptedList] = useState([]);
  const [attemptedList, setAttemptedList] = useState([]);

  // Fetch submissions
  useEffect(() => {
    if (!userinfo) return;
    const getSubmissions = async () => {
      const response = await axios.post(
        "http://localhost:5000/getsubmissions",
        { userid: userinfo._id }
      );
      setSubmissions(response.data.submissions || []);
    };
    getSubmissions();
  }, [userinfo]);

  // Fetch problems
  useEffect(() => {
    if (!userinfo) return;
    const getProblems = async () => {
      const response = await axios.get("http://localhost:5000/problems");
      setProblems(response.data.problems || []);
    };
    getProblems();
  }, [userinfo]);

  // Compute derived stats & lists once we have both problems & submissions
  useEffect(() => {
    if (problems.length === 0) return;

    // initialize tag buckets
    const byTag = {
      easy: { total: 0, solved: 0 },
      medium: { total: 0, solved: 0 },
      hard: { total: 0, solved: 0 },
      insane: { total: 0, solved: 0 },
    };

    // count total problems per tag
    problems.forEach((p) => {
      const t = p.tag.toLowerCase();
      if (byTag[t]) {
        byTag[t].total += 1;
      }
    });

    // enrich submissions with problem data
    const enriched = submissions
      .map((s) => {
        const prob = problems.find((p) => p.problemid === s.problemid);
        if (!prob) return null;
        return {
          id: s.id,
          problemid: s.problemid,
          title: prob.title,
          tag: prob.tag.toLowerCase(),
          status: s.status,
        };
      })
      .filter((e) => e !== null);

    // split accepted vs attempted
    const accepted = enriched.filter((e) => e.status === "Accepted");
    const attempted = enriched.filter((e) => e.status !== "Accepted");

    // count solved per tag
    accepted.forEach((a) => {
      if (byTag[a.tag]) byTag[a.tag].solved += 1;
    });

    setStats({
      totalProblems: problems.length,
      totalSolved: accepted.length,
      byTag,
    });
    setAcceptedList(accepted);
    setAttemptedList(attempted);
  }, [problems, submissions]);

  const editAvatar = () => {
    fileInputRef.current?.click();
  };
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("avatar", file);
    formData.append("userId", userinfo._id);
    const res = await axios.post(
      "http://localhost:5000/profile/avatar",
      formData
    );
    if (res.data.success) {
      alert("Avatar Updated Successfully!");
      window.location.reload();
    }
  };

  return (
    <>
      <Navbar />

      <div className="max-w-4xl mx-auto py-12 px-4">
        {/* Profile card */}
        <div className="flex items-center space-x-6 mb-12">
          <div className="relative">
            <img
              className="w-32 h-32 rounded-full object-cover"
              src={`http://localhost:5000${userinfo?.avatar_path}`}
              alt="Profile"
            />
            <div onClick={editAvatar} className="cursor-pointer absolute bottom-1 right-2 bg-white rounded-full p-1 shadow">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3.5 w-3.5 text-gray-700"
              fill="none"
              viewBox="0 0 512 512"
              stroke="currentColor"
            >
              <path
                fill="#000000"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M410.3 231l11.3-11.3-33.9-33.9-62.1-62.1L291.7 89.8l-11.3 11.3-22.6 22.6L58.6 322.9c-10.4 10.4-18 23.3-22.2 37.4L1 480.7c-2.5 8.4-.2 17.5 6.1 23.7s15.3 8.5 23.7 6.1l120.3-35.4c14.1-4.2 27-11.8 37.4-22.2L387.7 253.7 410.3 231zM160 399.4l-9.1 22.7c-4 3.1-8.5 5.4-13.3 6.9L59.4 452l23-78.1c1.4-4.9 3.8-9.4 6.9-13.3l22.7-9.1 0 32c0 8.8 7.2 16 16 16l32 0zM362.7 18.7L348.3 33.2 325.7 55.8 314.3 67.1l33.9 33.9 62.1 62.1 33.9 33.9 11.3-11.3 22.6-22.6 14.5-14.5c25-25 25-65.5 0-90.5L453.3 18.7c-25-25-65.5-25-90.5 0zm-47.4 168l-144 144c-6.2 6.2-16.4 6.2-22.6 0s-6.2-16.4 0-22.6l144-144c6.2-6.2 16.4-6.2 22.6 0s6.2 16.4 0 22.6z"
              />
            </svg>
            </div>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
          <div>
            <h2 className="text-2xl font-semibold">
              Welcome, {userinfo?.username}!
            </h2>
            <h1 className="text-gray-600">{userinfo?.email}</h1>
          </div>
        </div>

        {/* Stats badges */}
        <div className="grid grid-cols-3 gap-4 mb-12">
          <div className="p-4 bg-white shadow rounded-lg text-center">
            <h1 className="text-sm text-gray-500">Total Solved</h1>
            <h1 className="text-xl font-bold">
              {stats.totalSolved} / {stats.totalProblems}
            </h1>
          </div>
          {["easy", "medium", "hard", "insane"].map((tag) => (
            <div
              key={tag}
              className="p-4 bg-white shadow rounded-lg text-center"
            >
              <h1 className="text-sm capitalize">{tag}</h1>
              <h1 className="text-xl font-bold">
                {stats.byTag[tag].solved} / {stats.byTag[tag].total}
              </h1>
            </div>
          ))}
        </div>

        {/* Submissions lists */}
        <div className="space-y-8">
          <div>
            <h3 className="text-xl font-semibold mb-2">Accepted Submissions</h3>
            {acceptedList.length === 0 ? (
              <h1 className="text-gray-500">No accepted submissions yet.</h1>
            ) : (
              <ul >
                {acceptedList.map((s) => (
                  <Link to={`/problems/${s.problemid}`}>
                    <li key={s.id} className="p-2 bg-green-50 rounded mt-1">
                      <span className="font-medium">{s.title}</span>
                      <span className="ml-2 text-sm text-gray-500">
                        [{s.tag}]
                      </span>
                      <span className="ml-2 text-xs text-gray-400">
                        #{s.problemid}
                      </span>
                    </li>
                  </Link>
                ))}
              </ul>
            )}
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">
              Attempted Submissions
            </h3>
            {attemptedList.length === 0 ? (
              <h1 className="text-gray-500">No attempted submissions yet.</h1>
            ) : (
              <ul className="space-y-1">
                {attemptedList.map((s) => (
                  <Link to={`/problems/${s.problemid}`}>
                    <li key={s.id} className="p-2 bg-yellow-50 rounded mt-1">
                      <span className="font-medium">{s.title}</span>
                      <span className="ml-2 text-sm text-gray-500">
                        [{s.tag}]
                      </span>
                      <span className="ml-2 text-xs text-gray-400">
                        #{s.problemid}
                      </span>
                    </li>
                  </Link>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
