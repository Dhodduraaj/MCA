import axios from "axios";
import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ExchangeRateChart from "../components/ExchangeRateChart";
import FinancialNewsCarouselLanding from "../components/FinancialNewsCarouselLanding";
import Quotes from "../components/quotes";
import WelcomeModal from "../components/WelcomeModal";

function LandingPage() {
  const [message, setMessage] = useState("");
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [ecoPersona, setEcoPersona] = useState("Eco Explorer");
  const [ecoScore, setEcoScore] = useState(25);
  const [surveyData, setSurveyData] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

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

    // Check for welcome modal
    if (location.state?.showWelcomeModal) {
      setShowWelcomeModal(true);
    }

    // Load eco data from localStorage
    const savedPersona = localStorage.getItem("ecoPersona");
    const savedScore = localStorage.getItem("ecoScore");
    const savedSurveyData = localStorage.getItem("ecoSurveyData");
    
    if (savedPersona) setEcoPersona(savedPersona);
    if (savedScore) setEcoScore(parseInt(savedScore));
    if (savedSurveyData) setSurveyData(JSON.parse(savedSurveyData));

    // Check if user has completed eco survey - if not, redirect to survey
    if (!savedSurveyData) {
      navigate("/eco-survey");
    }
  }, [navigate, location.state]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  // Generate personalized tips based on survey data
  const getPersonalizedTips = () => {
    if (!surveyData) return [];
    
    const tips = [];
    
    if (surveyData.travel === "car") {
      tips.push("Try public transport twice a week → save ₹500 + 2kg CO₂");
    }
    if (surveyData.food === "meat") {
      tips.push("Have one meat-free day per week → reduce carbon footprint by 15%");
    }
    if (surveyData.shopping === "fast") {
      tips.push("Buy one second-hand item this month → save money and resources");
    }
    if (surveyData.energy === "high") {
      tips.push("Switch to LED bulbs → save ₹200/month on electricity");
    }
    if (surveyData.habits === "no") {
      tips.push("Get a reusable water bottle → save ₹50/week on bottled water");
    }
    
    return tips.length > 0 ? tips : ["Start with small changes - every step counts! 🌱"];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e8f5e9] to-[#c8e6c9] pt-24">
      {/* Eco Dashboard Section */}
      <div className="px-4 pt-8 pb-8 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8"
        >
          {/* Eco Persona Card */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-500"
          >
            <div className="flex items-center mb-4">
              <span className="text-3xl mr-3">
                {ecoPersona === "Eco Explorer" ? "🌱" : ecoPersona === "Conscious Saver" ? "🌍" : "💚"}
              </span>
              <div>
                <h3 className="text-xl font-bold text-green-800">{ecoPersona}</h3>
                <p className="text-green-600 text-sm">Your eco-personality</p>
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-700 mb-2">
                Eco Score: {ecoScore}/100
              </div>
              <div className="w-full bg-green-200 rounded-full h-3 mb-2">
                <div 
                  className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-1000"
                  style={{ width: `${ecoScore}%` }}
                />
              </div>
              <p className="text-sm text-green-600">
                {ecoScore < 30 ? "Keep growing! 🌱" : ecoScore < 70 ? "Great progress! 🌍" : "Eco champion! 💚"}
              </p>
            </div>
          </motion.div>

          {/* Badges Section */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <span className="text-2xl mr-2">🏆</span>
              Badges
            </h3>
            <div className="space-y-3">
              <div className="flex items-center p-3 bg-green-50 rounded-lg">
                <span className="text-2xl mr-3">🌱</span>
                <div>
                  <p className="font-semibold text-green-800">First Step Green Saver</p>
                  <p className="text-sm text-green-600">Completed eco-survey</p>
                </div>
              </div>
              {ecoScore >= 50 && (
                <div className="flex items-center p-3 bg-green-50 rounded-lg">
                  <span className="text-2xl mr-3">🌍</span>
                  <div>
                    <p className="font-semibold text-green-800">Eco Progress</p>
                    <p className="text-sm text-green-600">Reached 50+ eco score</p>
                  </div>
                </div>
              )}
              {ecoScore >= 80 && (
                <div className="flex items-center p-3 bg-green-50 rounded-lg">
                  <span className="text-2xl mr-3">💚</span>
                  <div>
                    <p className="font-semibold text-green-800">Green Warrior</p>
                    <p className="text-sm text-green-600">Eco champion level</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Personalized Tips */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <span className="text-2xl mr-2">💡</span>
              Personalized Tips
            </h3>
            <div className="space-y-3">
              {getPersonalizedTips().map((tip, index) => (
                <div key={index} className="flex items-start p-3 bg-green-50 rounded-lg">
                  <span className="text-green-500 mr-2 mt-1">✓</span>
                  <p className="text-sm text-gray-700">{tip}</p>
                </div>
              ))}
            </div>
            {!surveyData && (
              <div className="text-center mt-4">
                <button
                  onClick={() => navigate("/eco-survey")}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all"
                >
                  Take Eco Survey 🌱
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      </div>

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

      {/* Welcome Modal */}
      <WelcomeModal
        isOpen={showWelcomeModal}
        onClose={() => setShowWelcomeModal(false)}
        persona={ecoPersona}
        ecoScore={ecoScore}
      />
    </div>
  );
}

export default LandingPage;
