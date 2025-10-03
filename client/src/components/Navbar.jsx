import { motion } from "framer-motion";
import { Bell } from "lucide-react"; // 👈 clean notification icon
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Notifications from "./Notifications";
import TranslateToggle from "./TranslateToggle";

function Navbar({ user, setUser }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifications, setNotifications] = useState(3); // 👈 demo badge count

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="bg-gradient-to-r from-[#2e7d32] to-[#4caf50] text-white shadow-lg fixed w-full z-50"
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center px-4 md:px-6 py-3">
        {/* Logo */}
        <motion.div whileHover={{ scale: 1.05 }}>
          <Link
            to="/"
            className="text-2xl font-extrabold tracking-wide hover:text-white transition flex items-center"
          >
            <span className="mr-2 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#2e7d32] to-[#4caf50] shadow-md">🌿</span>
            GREEFIN
          </Link>
        </motion.div>

        {/* Desktop Navigation Links */}
        {user && (
          <div className="hidden md:flex items-center space-x-2">
            <Link to="/" className={`px-3 py-2 rounded-xl font-medium transition ${isActive("/") ? "bg-white/20 text-white shadow-sm" : "text-white/90 hover:text-white hover:bg-white/10"}`}>Dashboard</Link>
            <Link to="/transactions" className={`px-3 py-2 rounded-xl font-medium transition ${isActive("/transactions") ? "bg-white/20 text-white shadow-sm" : "text-white/90 hover:text-white hover:bg-white/10"}`}>Transactions</Link>
            <Link to="/budgets" className={`px-3 py-2 rounded-xl font-medium transition ${isActive("/budgets") ? "bg-white/20 text-white shadow-sm" : "text-white/90 hover:text-white hover:bg-white/10"}`}>Budgets</Link>
            <Link to="/calculate" className={`px-3 py-2 rounded-xl font-medium transition ${isActive("/calculate") ? "bg-white/20 text-white shadow-sm" : "text-white/90 hover:text-white hover:bg-white/10"}`}>Calculate</Link>
            <Link to="/locator" className={`px-3 py-2 rounded-xl font-medium transition ${isActive("/locator") ? "bg-white/20 text-white shadow-sm" : "text-white/90 hover:text-white hover:bg-white/10"}`}>Locator</Link>
            
          </div>
        )}

        {/* Right Side (Translate + Calendar + Notifications + Logout) */}
        {user && (
          <div className="flex items-center space-x-3">
            <TranslateToggle />

            <Notifications />


            {/* Calendar Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/calendar")}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#ffb703] to-[#fd9e02] hover:from-[#f4a409] hover:to-[#f28b00] transition text-white font-semibold shadow-md flex items-center border border-white/20"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6 2a1 1 0 011 1v1h6V3a1 1 0 112 0v1h1a2 2 0 012 2v11a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h1V3a1 1 0 011-1zM5 7v9h10V7H5z" clipRule="evenodd" />
              </svg>
              Calendar
            </motion.button>

            {/* Logout */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="px-5 py-2 rounded-xl bg-[#c1121f] hover:bg-[#9d0d19] transition text-white font-semibold shadow-md border border-white/20"
            >
              Logout
            </motion.button>
          </div>
        )}

        {/* Mobile Hamburger */}
        {user && (
          <div className="md:hidden flex items-center">
            <button onClick={() => setMobileOpen(!mobileOpen)} className="focus:outline-none">
              <motion.div whileTap={{ scale: 0.9 }}>
                {mobileOpen ? <span className="text-3xl font-bold">&times;</span> : <span className="text-3xl font-bold">&#9776;</span>}
              </motion.div>
            </button>
          </div>
        )}
      </div>

      {/* Mobile Menu */}
      {mobileOpen && user && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="md:hidden mx-4 md:mx-6 flex flex-col mt-3 bg-[#1b5e20] rounded-2xl overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.2)]"
        >
          <Link to="/" onClick={() => setMobileOpen(false)} className={`px-6 py-3 transition text-white font-medium text-left w-full ${isActive("/") ? "bg-[#2e7d32]" : "hover:bg-[#2e7d32]"}`}>Dashboard</Link>
          <Link to="/transactions" onClick={() => setMobileOpen(false)} className={`px-6 py-3 transition text-white font-medium text-left w-full ${isActive("/transactions") ? "bg-[#2e7d32]" : "hover:bg-[#2e7d32]"}`}>Transactions</Link>
          <Link to="/calculate" onClick={() => setMobileOpen(false)} className={`px-6 py-3 transition text-white font-medium text-left w-full ${isActive("/calculate") ? "bg-[#2e7d32]" : "hover:bg-[#2e7d32]"}`}>Calculate</Link>
          <Link to="/budgets" onClick={() => setMobileOpen(false)} className={`px-6 py-3 transition text-white font-medium text-left w-full ${isActive("/budgets") ? "bg-[#2e7d32]" : "hover:bg-[#2e7d32]"}`}>Budgets</Link>
          <Link to="/myspace" onClick={() => setMobileOpen(false)} className={`px-6 py-3 transition text-white font-medium text-left w-full ${isActive("/myspace") ? "bg-[#2e7d32]" : "hover:bg-[#2e7d32]"}`}>MySpace</Link>
          <Link to="/locator" onClick={() => setMobileOpen(false)} className={`px-6 py-3 transition text-white font-medium text-left w-full ${isActive("/locator") ? "bg-[#2e7d32]" : "hover:bg-[#2e7d32]"}`}>Locator</Link>
          <Link to="/eco-survey" onClick={() => setMobileOpen(false)} className={`px-6 py-3 transition text-white font-medium text-left w-full ${isActive("/eco-survey") ? "bg-[#2e7d32]" : "hover:bg-[#2e7d32]"}`}>🌱 Eco Survey</Link>

          {/* Notifications (Mobile) */}
          <button
            onClick={() => setMobileOpen(false)}
            className="flex items-center px-6 py-3 hover:bg-[#2e7d32] transition text-white font-medium text-left w-full relative"
          >
            <Bell className="h-5 w-5 mr-2" />
            Notifications
            {notifications > 0 && (
              <span className="absolute right-6 top-2 bg-red-500 text-xs font-bold px-1.5 py-0.5 rounded-full">
                {notifications}
              </span>
            )}
          </button>

          {/* Calendar Button (Mobile) */}
          <Link to="/calendar" onClick={() => setMobileOpen(false)} className="px-6 py-3 hover:bg-[#2e7d32] transition text-white font-medium text-left w-full flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M6 2a1 1 0 011 1v1h6V3a1 1 0 112 0v1h1a2 2 0 012 2v11a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h1V3a1 1 0 011-1zM5 7v9h10V7H5z" clipRule="evenodd" />
            </svg>
            Calendar
          </Link>

          <div className="px-6 py-3">
            <TranslateToggle />
          </div>
          <button
            onClick={() => { handleLogout(); setMobileOpen(false); }}
            className="px-6 py-3 hover:bg-[#2e7d32] transition text-white font-medium text-left w-full"
          >
            Logout
          </button>
        </motion.div>
      )}
    </motion.nav>
  );
}

export default Navbar;
