import { useContext, useEffect, useRef, useState } from "react";
import Navbar from "../components/Navbar";
import { AuthContext } from "../context/AuthContext";
import { useParams } from "react-router-dom";
import axios from "axios";
import { ClipboardCopyIcon, CheckIcon } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { motion } from 'framer-motion';

const Submissionspage = () => {
  const { userinfo } = useContext(AuthContext);
  const { submissionid } = useParams();
  const [problem, setProblem] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!userinfo?.submissions) return;
    const matched = userinfo.submissions.find(sub => sub._id === submissionid);
    setSubmission(matched || null);
  }, [userinfo, submissionid]);

  useEffect(() => {
    const fetchProblem = async () => {
      if (!submission) return;
      try {
        const { problemid } = submission;
        const res = await axios.post("http://localhost:5000/getproblem", { problemid });
        setProblem(res.data.problem || null);
      } catch {
        setProblem(null);
      }
    };
    fetchProblem();
  }, [submission]);

  const handleCopy = () => {
    if (!submission?.code) return;
    navigator.clipboard.writeText(submission.code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  let statusColor = submission?.status === 'Accepted'
    ? 'bg-green-100 text-green-700'
    : 'bg-red-100 text-red-700';

  if (!submission || !problem) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center animate-pulse">
          <span className="text-gray-500 text-lg">Loading submission…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 flex flex-col h-screen font-sans">
      <Navbar />
      <motion.div
        className="flex flex-1 overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* LEFT PANEL */}
        <motion.div
          className="w-1/2 bg-white p-8 overflow-y-auto border-r border-gray-200 scrollbar-thin scrollbar-thumb-indigo-300 scrollbar-track-gray-100"
          initial={{ x: -50 }}
          animate={{ x: 0 }}
          transition={{ type: 'spring', stiffness: 100 }}
        >
          <h2 className="text-3xl font-bold text-gray-800">Problem #{submission.problemid}</h2>
          <h3 className="mt-4 text-2xl font-semibold text-gray-700 font-serif">{problem.title}</h3>
          <div className="mt-6">
            <motion.span
              className={`inline-block px-4 py-2 ${statusColor} font-semibold text-sm rounded-full uppercase`}
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              {submission.status}
            </motion.span>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <motion.span
              className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium"
              whileHover={{ scale: 1.1 }}
            >
              Time: {submission.time_complexity}
            </motion.span>
            <motion.span
              className="bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-sm font-medium"
              whileHover={{ scale: 1.1 }}
            >
              Space: {submission.space_complexity}
            </motion.span>
          </div>
        </motion.div>

        {/* RIGHT PANEL */}
        <motion.div
          className="w-1/2 bg-gray-100 p-8 overflow-auto scrollbar-thin scrollbar-thumb-indigo-300 scrollbar-track-gray-100 relative"
          initial={{ x: 50 }}
          animate={{ x: 0 }}
          transition={{ type: 'spring', stiffness: 100 }}
        >
          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className="absolute top-4 right-4 p-2 bg-white rounded-full shadow hover:bg-indigo-50 focus:outline-none"
          >
            {copied ? <CheckIcon className="w-5 h-5 text-green-500" /> : <ClipboardCopyIcon className="w-5 h-5 text-gray-600" />}
          </button>

          {/* VSCode‑style highlighting without opaque bg */}
          <SyntaxHighlighter
            language={submission.language || 'cpp'}
            showLineNumbers
            wrapLines
            customStyle={{ backgroundColor: 'transparent', color: '#000', border: 'none', fontSize: '0.9rem', lineHeight: '1.5' }}
            lineNumberStyle={{ color: '#999', paddingRight: '1em' }}
          >
            {submission.code}
          </SyntaxHighlighter>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Submissionspage;