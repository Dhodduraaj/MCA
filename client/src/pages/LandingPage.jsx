import axios from "axios";
import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ExchangeRateChart from "../components/ExchangeRateChart";
import FinancialNewsCarouselLanding from "../components/FinancialNewsCarouselLanding";
import Quotes from "../components/quotes";
import WelcomeModal from "../components/WelcomeModal";
import { getPersonalizedTips } from "../utils/ecoScore";
import { clearAllUserSpecificData, clearOldUserData, getCurrentUserInfo, getUserEcoData, hasUserCompletedSurvey } from "../utils/userData";

function LandingPage() {
  const [message, setMessage] = useState("");
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [ecoPersona, setEcoPersona] = useState("Eco Explorer");
  const [ecoScore, setEcoScore] = useState(25);
  const [ecoXP, setEcoXP] = useState(0);
  const [ecoBadges, setEcoBadges] = useState([]);
  const [surveyData, setSurveyData] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
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

    // Get current user info
    const currentUser = getCurrentUserInfo();
    setUserInfo(currentUser);

    // Clear old user data when new user logs in
    clearOldUserData();

    // Load user-specific eco data
    const ecoData = getUserEcoData();
    
    if (ecoData.surveyData) {
      setSurveyData(ecoData.surveyData);
      setEcoPersona(ecoData.persona);
      setEcoScore(ecoData.score);
      setEcoXP(ecoData.xp || 0);
      setEcoBadges(ecoData.badges || []);
    }

    // Check if user has completed eco survey - if not, redirect to survey
    if (!hasUserCompletedSurvey()) {
      navigate("/eco-survey");
    }
  }, [navigate, location.state]);

  const handleLogout = () => {
    // Clear all user-specific data on logout
    clearAllUserSpecificData();
    
    localStorage.removeItem("token");
    navigate("/login");
  };

  // Get personalized tips using the utility function
  const personalizedTips = surveyData ? getPersonalizedTips(surveyData, ecoScore) : ["Start with small changes - every step counts! 🌱"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e8f5e9] to-[#c8e6c9] pt-24">
      {/* Welcome Message */}
      {userInfo && (
        <div className="px-4 pt-8 pb-6 max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-green-800 mb-3">
              Welcome back, {userInfo.name}! 🌱
            </h1>
            <p className="text-lg text-green-600 max-w-2xl mx-auto">
              Let's continue your eco-friendly journey together and make every day a little greener
            </p>
          </motion.div>
        </div>
      )}

      {/* Eco Dashboard Section */}
      <div className="px-4 pt-4 pb-8 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7 }}
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8"
        >
          {/* Eco Persona Card */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-500 md:col-span-2 xl:col-span-1"
          >
            <div className="flex flex-col sm:flex-row items-center sm:items-start mb-6">
              <div className="text-4xl mb-3 sm:mb-0 sm:mr-4">
                {ecoPersona === "Eco Explorer" ? "🌱" : ecoPersona === "Conscious Saver" ? "🌍" : "💚"}
              </div>
              <div className="text-center sm:text-left">
                <h3 className="text-2xl font-bold text-green-800 mb-1">{ecoPersona}</h3>
                <p className="text-green-600 text-sm">Your eco-personality</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-700 mb-3">
                  Eco Score: {ecoScore}/100
                </div>
                <div className="w-full bg-green-200 rounded-full h-4 mb-3">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-green-600 h-4 rounded-full transition-all duration-1000"
                    style={{ width: `${ecoScore}%` }}
                  />
                </div>
                <p className="text-sm font-medium text-green-600 mb-3">
                  {ecoScore < 30 ? "Keep growing! 🌱" : ecoScore < 70 ? "Great progress! 🌍" : "Eco champion! 💚"}
                </p>
                
                {/* XP Display */}
                <div className="bg-green-50 rounded-lg p-3">
                  <div className="text-2xl font-bold text-green-700 mb-1">
                    {ecoXP} XP
                  </div>
                  <div className="text-xs text-green-600">Experience Points</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Badges Section */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center justify-center sm:justify-start">
              <span className="text-2xl mr-2">🏆</span>
              Badges
            </h3>
            <div className="space-y-4">
              {/* Always show First Step badge */}
              <div className="flex items-center p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border border-green-200">
                <span className="text-3xl mr-4">🌱</span>
                <div className="flex-1">
                  <p className="font-bold text-green-800 text-lg">First Step Green Saver</p>
                  <p className="text-sm text-green-600">Completed eco-survey</p>
                </div>
              </div>
              
              {/* Dynamic badges from survey */}
              {ecoBadges.map((badge, index) => (
                <div key={index} className="flex items-center p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border border-green-200">
                  <span className="text-3xl mr-4">🏆</span>
                  <div className="flex-1">
                    <p className="font-bold text-green-800 text-lg">{badge}</p>
                    <p className="text-sm text-green-600">Eco achievement unlocked</p>
                  </div>
                </div>
              ))}
              
              {/* Score-based badges */}
              {ecoScore >= 50 && (
                <div className="flex items-center p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border border-green-200">
                  <span className="text-3xl mr-4">🌍</span>
                  <div className="flex-1">
                    <p className="font-bold text-green-800 text-lg">Eco Progress</p>
                    <p className="text-sm text-green-600">Reached 50+ eco score</p>
                  </div>
                </div>
              )}
              {ecoScore >= 80 && (
                <div className="flex items-center p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border border-green-200">
                  <span className="text-3xl mr-4">💚</span>
                  <div className="flex-1">
                    <p className="font-bold text-green-800 text-lg">Green Warrior</p>
                    <p className="text-sm text-green-600">Eco champion level</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Personalized Tips */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-2xl shadow-lg p-6 md:col-span-2 xl:col-span-1"
          >
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center justify-center sm:justify-start">
              <span className="text-2xl mr-2">💡</span>
              Personalized Tips
            </h3>
            <div className="space-y-4">
              {personalizedTips.map((tip, index) => (
                <div key={index} className="flex items-start p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border border-green-200">
                  <span className="text-green-500 mr-3 mt-1 text-lg">✓</span>
                  <p className="text-sm text-gray-700 leading-relaxed">{tip}</p>
                </div>
              ))}
            </div>
            {!surveyData && (
              <div className="text-center mt-6">
                <button
                  onClick={() => navigate("/eco-survey")}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl text-sm font-semibold transition-all shadow-lg hover:shadow-xl"
                >
                  Take Eco Survey 🌱
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      </div>

      {/* Green Goal Reminder Section */}
      {surveyData && surveyData.goal && (
        <div className="px-4 pb-8 max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.7 }}
            className="bg-gradient-to-r from-green-100 to-green-200 rounded-2xl p-6 border border-green-300"
          >
            <div className="flex items-center justify-center sm:justify-start mb-4">
              <span className="text-3xl mr-3">🎯</span>
              <h3 className="text-xl font-bold text-green-800">Your Green Goal</h3>
            </div>
            <div className="text-center sm:text-left">
              <p className="text-green-700 text-lg font-medium mb-2">
                "{surveyData.goal}"
              </p>
              <p className="text-green-600 text-sm">
                Keep working towards this goal! Every small step counts. 🌱
              </p>
            </div>
          </motion.div>
        </div>
      )}

      {/* Financial News Section */}
      <div className="px-4 pt-8 pb-8 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.7 }}
        >
          <FinancialNewsCarouselLanding />
        </motion.div>
      </div>

      {/* Charts + Quotes Section */}
      <div className="px-4 pb-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* USD → INR Exchange Rate Chart */}
          <motion.div
            className="w-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.7 }}
          >
            <ExchangeRateChart />
          </motion.div>

          {/* Quotes Component */}
          <motion.div
            className="w-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0, duration: 0.7 }}
          >
            <Quotes />
          </motion.div>
        </div>
      </div>

      {/* Welcome Modal */}
      <WelcomeModal
        isOpen={showWelcomeModal}
        onClose={() => setShowWelcomeModal(false)}
        persona={ecoPersona}
        ecoScore={ecoScore}
        ecoXP={ecoXP}
        ecoBadges={ecoBadges}
      />
    </div>
  );
}

export default LandingPage;
