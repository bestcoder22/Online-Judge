import { useContext, useState, useEffect, useMemo, useRef } from "react";
import Navbar from "../components/Navbar";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import { Link } from "react-router-dom";
import { Search, Sliders, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Submissions = () => {
  const { userinfo } = useContext(AuthContext);
  // 1️⃣ raw submissions & problems
  const [submissions, setSubmissions] = useState([]);
  const [problems, setProblems]       = useState([]);

  // 2️⃣ controls
  const [searchTerm,   setSearchTerm]   = useState("");
  const [selectedTag,  setSelectedTag]  = useState("All");
  const [sortField,    setSortField]    = useState("date");    // default latest
  const [sortOrder,    setSortOrder]    = useState("desc");    // newest first
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage,  setCurrentPage]  = useState(1);

  // 3️⃣ UI toggles
  const [searchOpen,   setSearchOpen]   = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const settingsRef = useRef(null);

  // 4️⃣ fetch submissions from userinfo and problems list
  useEffect(() => {
    if (userinfo) {
      // assume userinfo.submissions is already sorted oldest→newest
      setSubmissions([...userinfo.submissions].reverse());
    } else {
      setSubmissions([]);
    }
  }, [userinfo]);

  useEffect(() => {
    (async () => {
      const res = await axios.get("http://localhost:5000/problems");
      setProblems(res.data.problems || []);
    })();
  }, []);

  // 5️⃣ derive unique tags from problem list
  const tagOptions = useMemo(() => {
    const tags = Array.from(new Set(problems.map(p => p.tag))).filter(Boolean);
    tags.sort();
    return ["All", ...tags];
  }, [problems]);

  // 6️⃣ filter by search & tag
  const filtered = useMemo(() => {
    return submissions.filter(sub => {
      // problem lookup
      const prob = problems[sub.problemid - 1] || {};
      // tag filter
      if (selectedTag !== "All" && prob.tag !== selectedTag) return false;
      // search term in ID, title or status
      const term = searchTerm.trim().toLowerCase();
      if (!term) return true;
      const inId     = String(sub.problemid).includes(term);
      const inTitle  = (prob.title || "").toLowerCase().includes(term);
      const inStatus = sub.status.toLowerCase().includes(term);
      return inId || inTitle || inStatus;
    });
  }, [submissions, problems, selectedTag, searchTerm]);

  // 7️⃣ sort
  const sorted = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a,b) => {
      let av, bv;
      switch(sortField) {
        case "id":
          av = a.problemid; bv = b.problemid; break;
        case "status":
          av = a.status;    bv = b.status;    break;
        case "date":
        default:
          av = a._id;       bv = b._id;       // use reversed array order as proxy
      }
      if (typeof av === "string") {
        const cmp = av.localeCompare(bv);
        return sortOrder === "asc" ? cmp : -cmp;
      }
      return sortOrder === "asc" ? av - bv : bv - av;
    });
    return arr;
  }, [filtered, sortField, sortOrder]);

  // 8️⃣ pagination
  const totalPages = Math.max(1, Math.ceil(sorted.length / itemsPerPage));
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages]);
  const paginated = useMemo(() => {
    const start = (currentPage-1)*itemsPerPage;
    return sorted.slice(start, start+itemsPerPage);
  }, [sorted, currentPage, itemsPerPage]);

  const goToPage = page => {
    if (page<1||page>totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // 9️⃣ outside‑click close for settings
  useEffect(() => {
    const listener = e => {
      if (settingsRef.current && !settingsRef.current.contains(e.target))
        setSettingsOpen(false);
    };
    document.addEventListener("mousedown", listener);
    return () => document.removeEventListener("mousedown", listener);
  }, []);

  // ⓿ animations variants
  const inputVariants = {
    hidden: { width:0, opacity:0 },
    visible: { width:200, opacity:1 },
    exit: { width:0, opacity:0 }
  };
  const panelVariants = {
    hidden: { opacity:0, scale:0.95 },
    visible:{ opacity:1, scale:1 },
    exit:   { opacity:0, scale:0.95 }
  };

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      <Navbar />

      <div className="max-w-5xl mx-auto py-8 px-4 space-y-6">
        {/* Top bar */}
        <div className="flex justify-end items-center space-x-4 relative">
          {/* Search */}
          <div className="flex items-center">
            <AnimatePresence>
              {searchOpen && (
                <motion.div
                  key="search-input"
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={inputVariants}
                  transition={{ duration:0.2 }}
                  className="overflow-hidden"
                >
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                    placeholder="Search..."
                    className="border border-gray-300 rounded-l-md p-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    autoFocus
                  />
                </motion.div>
              )}
            </AnimatePresence>
            <button
              onClick={() => {
                setSearchOpen(o => !o);
                if (searchOpen) setSearchTerm("");
              }}
              className="p-2 bg-white border border-gray-300 rounded-r-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              <Search size={16}/>
            </button>
          </div>

          {/* Settings */}
          <div ref={settingsRef} className="relative">
            <button
              onClick={() => setSettingsOpen(o => !o)}
              className="p-2 bg-white border border-gray-300 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              <Sliders size={16}/>
            </button>
            <AnimatePresence>
              {settingsOpen && (
                <motion.div
                  key="settings"
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={panelVariants}
                  transition={{ duration:0.15 }}
                  className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-md shadow-lg z-10 p-4 space-y-4"
                >
                  <button
                    onClick={()=>setSettingsOpen(false)}
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                  ><X size={16}/></button>

                  {/* Search & Reset */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={e=>{ setSearchTerm(e.target.value); setCurrentPage(1); }}
                      placeholder="Title / ID / Status"
                      className="block w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-indigo-400"
                    />
                  </div>

                  {/* Filter by Tag */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Tag</label>
                    <select
                      value={selectedTag}
                      onChange={e=>{ setSelectedTag(e.target.value); setCurrentPage(1); }}
                      className="block w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-indigo-400"
                    >
                      {tagOptions.map(tag=>(
                        <option key={tag} value={tag}>{tag}</option>
                      ))}
                    </select>
                  </div>

                  {/* Sort */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                    <div className="flex space-x-2">
                      <select
                        value={sortField}
                        onChange={e=>{ setSortField(e.target.value); setCurrentPage(1); }}
                        className="flex-1 border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-indigo-400"
                      >
                        <option value="date">Date</option>
                        <option value="id">Problem ID</option>
                        <option value="status">Status</option>
                      </select>
                      <button
                        onClick={()=>{ setSortOrder(o=>o==="asc"?"desc":"asc"); setCurrentPage(1); }}
                        className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                      >
                        {sortOrder==="asc"?"↑":"↓"}
                      </button>
                    </div>
                  </div>

                  {/* Items per Page */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Items per Page</label>
                    <select
                      value={itemsPerPage}
                      onChange={e=>{ setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                      className="block w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-indigo-400"
                    >
                      {[5,10,20,50].map(n=>(
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Submission cards */}
        <div className="space-y-4">
          {paginated.length === 0
            ? <p className="text-gray-500">No submissions found.</p>
            : paginated.map(sub => {
                const prob = problems[sub.problemid - 1] || {};
                const tag  = (prob.tag || "UNTAGGED").toUpperCase();
                let statusColor = "bg-red-100 text-red-700";
                if (sub.status==="Accepted") statusColor="bg-green-100 text-green-700";

                return (
                  <Link key={sub._id} to={`/submissions/${sub._id}`}>
                    <div className="m-3 cursor-pointer bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow p-5 grid grid-cols-[3fr_1fr_1fr] items-center gap-4">
                      <div className="flex flex-col space-y-1">
                        <span className="text-xs text-gray-400">Problem ID: {sub.problemid}</span>
                        <span className="text-lg font-semibold text-gray-800">{prob.title||"Untitled"}</span>
                      </div>
                      <div className="flex justify-center">
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">{tag}</span>
                      </div>
                      <div className="flex justify-end">
                        <span className={`px-3 py-1 ${statusColor} text-xs font-semibold rounded-full`}>{sub.status}</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
        </div>

        {/* Pagination */}
        <div className="flex justify-center items-center space-x-2 mt-6 flex-wrap">
          <button
            onClick={()=>goToPage(currentPage-1)}
            disabled={currentPage===1}
            className={`px-3 py-1 rounded-md border ${currentPage===1? "text-gray-400 border-gray-200 cursor-not-allowed":"text-gray-700 border-gray-300 hover:bg-gray-100"}`}
          >
            « Prev
          </button>
          {Array.from({length: totalPages},(_,i)=>i+1).map(pg=>(
            <button
              key={pg}
              onClick={()=>goToPage(pg)}
              className={`px-3 py-1 rounded-md border ${pg===currentPage? "bg-indigo-500 text-white border-indigo-500":"text-gray-700 border-gray-300 hover:bg-gray-100"}`}
            >
              {pg}
            </button>
          ))}
          <button
            onClick={()=>goToPage(currentPage+1)}
            disabled={currentPage===totalPages}
            className={`px-3 py-1 rounded-md border ${currentPage===totalPages? "text-gray-400 border-gray-200 cursor-not-allowed":"text-gray-700 border-gray-300 hover:bg-gray-100"}`}
          >
            Next »
          </button>
        </div>
      </div>
    </div>
  );
};

export default Submissions;
