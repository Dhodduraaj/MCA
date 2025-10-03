// src/components/MonthlySummariser.jsx
import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

function MonthlySummariser() {
  const [monthlySummary, setMonthlySummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);

  const fetchMonthlySummary = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "http://localhost:8000/month-summariser",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMonthlySummary(res.data.month_summary);
      setFetched(true);
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.error || "Failed to fetch monthly summary"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-3 rounded-xl shadow-lg w-full max-w-md mx-auto">
      <h2 className="text-lg font-semibold mb-2 text-gray-900">
        📅 Monthly Summary
      </h2>

      {!fetched ? (
        <button
          onClick={fetchMonthlySummary}
          disabled={loading}
          className={`w-full py-2 px-4 rounded-lg font-medium text-white transition transform hover:scale-[1.03] ${
            loading
              ? "bg-purple-300 cursor-not-allowed"
              : "bg-gradient-to-r from-[#7209b7] to-[#9d4edd] shadow-md"
          }`}
        >
          {loading ? "Fetching..." : "✨ Generate Summary"}
        </button>
      ) : (
        <div className="bg-gray-50 p-3 rounded-lg border text-sm text-gray-800 whitespace-pre-line">
          {monthlySummary || "No summary available"}
        </div>
      )}
    </div>
  );
}

export default MonthlySummariser;
