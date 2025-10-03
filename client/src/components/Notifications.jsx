import { AnimatePresence, motion } from "framer-motion";
import { Bell } from "lucide-react";
import { useEffect, useRef, useState } from "react";

function Notifications() {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null); // 👈 reference to dropdown

  // Notifications state
  const [notifications, setNotifications] = useState([
    { id: 1, title: "Payment Successful", message: "Your transfer of ₹5,000 was completed.", unread: true, time: "2m ago" },
    { id: 2, title: "Budget Reminder", message: "You’re close to exceeding your Food budget.", unread: true, time: "1h ago" },
    { id: 3, title: "Offer Alert", message: "Flat 20% cashback on utility payments today!", unread: false, time: "Yesterday" },
  ]);

  const unreadCount = notifications.filter(n => n.unread).length;

  // Mark single notification as read
  const markAsRead = (id) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, unread: false } : n))
    );
  };

  // Clear all notifications
  const clearAll = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-full bg-white/10 hover:bg-white/20 transition shadow-md"
      >
        <Bell className="h-6 w-6 text-white" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-xs font-bold px-1.5 py-0.5 rounded-full animate-pulse">
            {unreadCount}
          </span>
        )}
      </motion.button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-3 w-80 bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl overflow-hidden border border-white/20 z-50"
          >
            <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-[#7209b7]/80 to-[#9d4edd]/80 text-white">
              <span className="font-semibold">Notifications</span>
              <button
                onClick={clearAll}
                className="text-sm hover:underline"
              >
                Clear All
              </button>
            </div>

            <div className="max-h-64 overflow-y-auto">
              {notifications.length > 0 ? (
                <AnimatePresence>
                  {notifications.map((n) => (
                    <motion.div
                      key={n.id}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20, scale: 0.95 }}
                      layout
                      whileHover={{ backgroundColor: "rgba(114,9,183,0.05)" }}
                      onClick={() => markAsRead(n.id)}
                      className={`px-4 py-3 cursor-pointer flex flex-col border-b border-gray-100 relative ${
                        n.unread ? "bg-purple-50" : "bg-white"
                      }`}
                    >
                      {/* Animated dot for unread */}
                      {n.unread && (
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
                      )}

                      <div className="flex justify-between items-center">
                        <h4 className="text-sm font-semibold text-gray-800">
                          {n.title}
                        </h4>
                        <span className="text-xs text-gray-500">{n.time}</span>
                      </div>
                      <p className="text-sm text-gray-600">{n.message}</p>
                    </motion.div>
                  ))}
                </AnimatePresence>
              ) : (
                <div className="p-6 text-center text-gray-500 text-sm">
                  No new notifications
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Notifications;
