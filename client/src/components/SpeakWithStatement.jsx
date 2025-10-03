import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

function SpeakWithStatement() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAsk = async () => {
    if (!question.trim()) {
      toast.error("Please enter a question");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");

      const res = await axios.post(
        "http://localhost:8000/chat-statement",
        { question },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.answer) {
        setAnswer(res.data.answer);
      } else {
        setAnswer("No answer found for your question.");
      }
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.error || "Failed to get response from statement."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-5 h-[260px] flex flex-col">
      {/* Header */}
      <h2 className="text-lg font-semibold mb-3 text-gray-900 border-b pb-2">
        💬 Speak With Your Statement
      </h2>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto bg-gray-50 rounded-lg p-3 border text-sm">
        {answer ? (
          <div className="bg-purple-100 text-gray-800 p-3 rounded-lg shadow-sm w-fit max-w-[90%]">
            <strong>Answer:</strong> {answer}
          </div>
        ) : (
          <p className="text-gray-500 italic">No conversation yet. Ask something!</p>
        )}
      </div>

      {/* Input Area */}
      <div className="mt-3 flex gap-2">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask about your statement..."
          className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
        />
        <button
          onClick={handleAsk}
          disabled={loading}
          className={`px-4 py-2 rounded-lg text-sm font-medium text-white transition ${
            loading
              ? "bg-purple-300 cursor-not-allowed"
              : "bg-gradient-to-r from-[#7209b7] to-[#9d4edd] hover:scale-[1.03]"
          }`}
        >
          {loading ? "..." : "Ask"}
        </button>
      </div>
    </div>
  );
}

export default SpeakWithStatement;
