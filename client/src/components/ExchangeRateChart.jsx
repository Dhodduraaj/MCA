import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function ExchangeRateChart() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchRates = async () => {
    try {
      setLoading(true);
      setError("");

      const end = new Date();
      const start = new Date();
      start.setDate(end.getDate() - 30);

      const startDate = start.toISOString().split("T")[0];
      const endDate = end.toISOString().split("T")[0];

      const url = `https://api.frankfurter.app/${startDate}..${endDate}?from=USD&to=INR`;
      const res = await axios.get(url);

      if (!res.data || !res.data.rates) {
        setError("No data returned from API.");
        return;
      }

      const chartData = Object.keys(res.data.rates)
        .sort()
        .map((date) => ({
          date: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          INR: res.data.rates[date]["INR"],
        }));

      setData(chartData);
    } catch (err) {
      console.error("Error fetching rates:", err);
      setError("Failed to fetch exchange rates.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRates();
    const interval = setInterval(fetchRates, 5 * 60 * 1000); // update every 5 min
    return () => clearInterval(interval);
  }, []);

  if (loading) return <p className="text-gray-500">Loading exchange rates...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  const minY = Math.min(...data.map(d => d.INR)) - 0.2;
  const maxY = Math.max(...data.map(d => d.INR)) + 0.2;

  return (
    <div className="w-full max-w-md h-72 p-4 bg-gradient-to-br from-white/90 to-green-50 shadow-lg rounded-2xl border border-green-200">
      <div className="mb-2">
        <h3 className="font-semibold text-gray-800 text-lg">USD → INR</h3>
        <p className="text-gray-500 text-xs">Last 30 Days</p>
      </div>
      <ResponsiveContainer width="100%" height="85%">
        <LineChart data={data} margin={{ top: 10, right: 30, bottom: 10, left: 0 }}>
          <CartesianGrid strokeDasharray="4 4" stroke="#e0e0e0" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: "#555" }}
            interval="preserveEnd"
            angle={0}
            textAnchor="middle"
          />
          <YAxis
            domain={[minY, maxY]}
            tick={{ fontSize: 11, fill: "#555" }}
            tickFormatter={(value) => value.toFixed(2)}
          />
          <Tooltip
            contentStyle={{ borderRadius: "8px", border: "1px solid #ddd" }}
            formatter={(value) => value.toFixed(2)}
            labelFormatter={(label) => `Date: ${label}`}
          />
          <Line
            type="monotone"
            dataKey="INR"
            stroke="url(#gradientLine)"
            strokeWidth={3}
            dot={{ r: 3, fill: "#2e7d32" }}
            activeDot={{ r: 5 }}
          />
          <defs>
            <linearGradient id="gradientLine" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#4caf50" />
              <stop offset="100%" stopColor="#2e7d32" />
            </linearGradient>
          </defs>
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default ExchangeRateChart;
