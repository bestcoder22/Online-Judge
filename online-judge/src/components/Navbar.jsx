import { useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import { motion } from "framer-motion";

const Navbar = () => {
  const { userinfo, isAdmin } = useContext(AuthContext);
  const location = useLocation();
  const path = location.pathname;

  // Identify home and leaderboard as “special” pages
  const isHome = path === "/";
  const isLeaderboard = path.startsWith("/leaderboard");
  const isSpecial = isHome || isLeaderboard;

  const handleLogout = async () => {
    try {
      const response = await axios.post(
        "http://localhost:5000/logout",
        {},
        { withCredentials: true }
      );
      alert(response.data.message);
      window.location.replace("/");
    } catch {
      window.location.replace("/");
    }
  };

  // Active-link detection
  const isActive = (route) => {
    if (route === "/") return path === "/";
    return path === route || path.startsWith(route + "/");
  };

  // Title classes
  const titleClass = isSpecial
    ? "font-serif text-3xl font-extrabold text-teal-300 drop-shadow-[0_0_8px_rgba(0,255,255,0.7)] drop-shadow-[0_0_14px_rgba(0,255,255,0.4)]"
    : "font-serif text-2xl font-medium text-black";

  // Link text base
  const linkTextBase = isSpecial
    ? "text-blue-300 font-bold text-xl"
    : "text-black font-medium text-lg";

  // Underline helper
  const underlineClass = "small-underline";

  // Buttons
  const specialBtnClass =
    "bg-animated-gradient bg-300% animate-gradient text-white font-semibold py-2 px-6 rounded-2xl shadow-lg hover:scale-105 transform transition duration-200 hover:opacity-90 focus:outline-none focus:ring-4 focus:ring-purple-300";
  const normalBtnClass =
    "bg-white text-black border border-gray-600 rounded-xl px-4 py-2 hover:shadow-lg transition-shadow transform transition hover:opacity-90 hover:scale-105 duration-200";

  return (
    <div>
      <div className="flex justify-around mt-5 items-center">
        {/* Logo / Title */}
        <Link to="/">
          <motion.h2
            className={titleClass}
            whileHover={ isSpecial ? { scale: 1.1, y: -2 } : { scale: 1.03 } }
            transition={{ type: "spring", stiffness: 300, damping: 10 }}
          >
            &lt;CodeIQ/&gt;
          </motion.h2>
        </Link>

        {/* Navigation Links */}
        <div className="flex justify-around m-2">
          {[
            { to: "/problems", label: "Problems" },
            { to: "/leaderboard", label: "Leaderboard" },
            ...(isAdmin ? [{ to: "/admin",      label: "Admin"       }] : []),
            { to: "/submissions", label: "Submissions" },
          ].map(({ to, label }) => (
            <Link key={to} to={to} style={{ textDecoration: "none" }}>
              <motion.h3
                className={`${linkTextBase} px-5 ${
                  isActive(to) ? underlineClass : ""
                }`}
                whileHover={ isSpecial ? { scale: 1.1, y: -2 } : { scale: 1.05 } }
                transition={{ type: "spring", stiffness: 300, damping: 10 }}
              >
                {label}
              </motion.h3>
            </Link>
          ))}
        </div>

        {/* Login / Logout / Avatar */}
        <div className="flex items-center gap-4">
          {userinfo ? (
            <>
              <button
                onClick={handleLogout}
                className={isSpecial ? specialBtnClass : normalBtnClass}
              >
                Logout
              </button>
              <Link to="/profile">
                {isSpecial ? (
                  // Gradient border effect without rotating photo
                  <div className="relative rounded-full p-0.5">
                    {/* Behind the img: animated gradient background */}
                    <div className="absolute inset-0 rounded-full gradient-border animate-gradient-bg"></div>
                    <img
                      src={`http://localhost:5000${userinfo.avatar_path}`}
                      alt="Profile"
                      className="relative w-10 h-10 rounded-full bg-white hover:scale-105 hover:shadow-lg transition-shadow duration-200 cursor-pointer"
                    />
                  </div>
                ) : (
                  <img
                    src={`http://localhost:5000${userinfo.avatar_path}`}
                    alt="Profile"
                    className="w-10 h-10 rounded-full hover:shadow-xl hover:scale-105 hover:bg-gray-300 duration-200 cursor-pointer"
                  />
                )}
              </Link>
            </>
          ) : (
            <Link to="/login" className="no-underline">
              <button
                type="button"
                className={isSpecial ? specialBtnClass : normalBtnClass}
              >
                Login
              </button>
            </Link>
          )}
        </div>
      </div>

      {/* Divider */}
      <hr className="mt-3.5 border-gray-300" />
    </div>
  );
};

export default Navbar;
