// src/components/WeeklySummariser.jsx
import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

function WeeklySummariser() {
  const [weeklySummary, setWeeklySummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);

  const fetchWeeklySummary = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "http://localhost:8000/week-summariser",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setWeeklySummary(res.data.week_summary);
      setFetched(true);
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.error || "Failed to fetch weekly summary"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-4 rounded-2xl shadow-lg w-full max-w-md mx-auto border border-purple-100">
      <h2 className="text-lg font-semibold mb-3 text-gray-900 border-b pb-2">
        📆 Weekly Summary
      </h2>

      {!fetched ? (
        <button
          onClick={fetchWeeklySummary}
          disabled={loading}
          className={`w-full py-2 px-4 rounded-lg font-medium text-white transition transform hover:scale-[1.03] ${
            loading
              ? "bg-purple-300 cursor-not-allowed"
              : "bg-gradient-to-r from-[#2e7d32] to-[#4caf50] shadow-md"
          }`}
        >
          {loading ? "Fetching..." : "✨ Generate Weekly Summary"}
        </button>
      ) : (
        <div className="bg-purple-50 p-3 rounded-lg border border-purple-200 text-sm text-gray-800 whitespace-pre-line">
          {weeklySummary || "No summary available"}
        </div>
      )}
    </div>
  );
}

export default WeeklySummariser;
