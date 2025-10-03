import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import { Maximize2, MessageCircle, Minimize2, Send, X } from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";

function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [showButton, setShowButton] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi! How can I help you today?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const scrollRef = useRef(null);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, loading]);

  // Send message
  const sendMessage = useCallback(async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    const newMessages = [...messages, { role: "user", content: userMessage }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:8000/chat", {
        message: userMessage,
        session_id: "user1",
      });
      setMessages([...newMessages, { role: "assistant", content: res.data.reply }]);
    } catch (err) {
      console.error("Chat error:", err);
      setMessages([...newMessages, {
        role: "assistant",
        content: "I'm having trouble connecting. Please try again later.",
      }]);
    } finally {
      setLoading(false);
    }
  }, [input, messages, loading]);

  // Open/Close handling
  const handleOpen = useCallback(() => {
    setShowButton(false);
    setIsOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setIsFullscreen(false);
    setTimeout(() => setShowButton(true), 400); // wait for exit animation
  }, []);

  const handleKeyPress = useCallback(
    (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    },
    [sendMessage]
  );

  // Chat window animation variants
  const chatVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.8, transformOrigin: "bottom right" },
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 400, damping: 25 } },
    exit: { opacity: 0, y: 50, scale: 0.8, transition: { duration: 0.3, ease: "easeInOut" } },
  };

  const messageVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.2 } },
  };

  return (
    <div
      className={`${
        isFullscreen
          ? "fixed inset-x-0 bottom-0 top-16 z-40 flex flex-col items-stretch"
          : "fixed bottom-6 right-6 z-50 flex flex-col items-end space-y-2"
      }`}
    >

      {/* Floating Chat Button (instant render, no fade) */}
      {showButton && !isOpen && (
        <button
          onClick={handleOpen}
          className="p-5 rounded-full bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300 relative overflow-hidden"
        >
          <MessageCircle size={24} className="relative z-10" />
          <div className="absolute inset-0 rounded-full bg-purple-400 opacity-20 animate-ping" />
        </button>
      )}

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="chat-window"
            variants={chatVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={`bg-white shadow-2xl flex flex-col overflow-hidden border border-gray-200 ${
              isFullscreen
                ? "w-full h-full rounded-none"
                : "w-[380px] h-[500px] rounded-2xl"
            }`}
          >
            {/* Header */}
            <div className="flex justify-between items-center bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-600 text-white px-5 py-4">
              <div>
                <h3 className="font-semibold text-lg">Finance Assistant</h3>
                <p className="text-purple-100 text-xs opacity-90">Always here to help</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsFullscreen((v) => !v)}
                  className="p-2 hover:bg-white/20 rounded-full"
                  aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                >
                  {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                </button>
                <button onClick={handleClose} className="p-2 hover:bg-white/20 rounded-full">
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div
              ref={scrollRef}
              className="flex-1 p-4 overflow-y-auto space-y-3 text-sm bg-gray-50"
            >
              <AnimatePresence>
                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    variants={messageVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    className={`p-3 rounded-xl max-w-[80%] break-words ${
                      msg.role === "user"
                        ? "ml-auto bg-gradient-to-br from-purple-500 to-purple-600 text-white"
                        : "mr-auto bg-white border border-gray-100 text-gray-800"
                    }`}
                  >
                    {msg.content}
                  </motion.div>
                ))}
              </AnimatePresence>

              {loading && (
                <motion.div className="flex space-x-1 text-gray-500 ml-4">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-150" />
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-300" />
                  <span className="text-sm italic ml-2">Assistant is typing...</span>
                </motion.div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 border-t bg-white">
              <div className="flex items-center space-x-3">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  disabled={loading}
                  className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 disabled:opacity-50"
                  placeholder="Type your message..."
                />
                <button
                  onClick={sendMessage}
                  disabled={loading || !input.trim()}
                  className="bg-gradient-to-br from-purple-600 to-indigo-600 text-white p-3 rounded-xl hover:shadow-lg disabled:opacity-50"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Chatbot;
