import axios from "axios";
import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import FinancialNewsCarouselLanding from "../components/FinancialNewsCarouselLanding";
import ExchangeRateChart from "../components/ExchangeRateChart";
import Quotes from "../components/quotes";

function LandingPage() {
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/finance", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMessage(res.data.message);
      } catch (error) {
        console.error("Error fetching data:", error);
        localStorage.removeItem("token");
        navigate("/login");
      }
    };
    fetchData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e0c3fc] to-[#8ec5fc] pt-24">
      {/* Financial News Section */}
      <div className="px-4 pt-8 pb-12 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.7 }}
        >
          <FinancialNewsCarouselLanding />
        </motion.div>
      </div>

      {/* Charts + Quotes Row */}
      <div className="px-4 pb-12 max-w-7xl mx-auto flex flex-col md:flex-row gap-6">
        {/* USD → INR Exchange Rate Chart */}
        <motion.div
          className="flex-1 min-w-[300px]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.7 }}
        >
          <ExchangeRateChart />
        </motion.div>


        {/* Quotes Component */}
        <motion.div
          className="flex-1 min-w-[300px]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0, duration: 0.7 }}
        >
          <Quotes />
        </motion.div>
      </div>
    </div>
  );
}

export default LandingPage;
