import { motion } from "framer-motion";
import { getCurrentUserInfo } from "../utils/userData";

function WelcomeModal({ isOpen, onClose, persona, ecoScore }) {
  if (!isOpen) return null;

  const userInfo = getCurrentUserInfo();
  const personaData = {
    "Eco Explorer": {
      emoji: "🌱",
      title: "Eco Explorer",
      description: "You're just starting your green journey! Every small step counts.",
      tips: ["Try walking to nearby places", "Use reusable water bottles", "Turn off lights when not needed"]
    },
    "Conscious Saver": {
      emoji: "🌍",
      title: "Conscious Saver", 
      description: "You're making great progress! Keep up the eco-friendly habits.",
      tips: ["Consider public transport more often", "Buy second-hand when possible", "Reduce food waste"]
    },
    "Green Warrior": {
      emoji: "💚",
      title: "Green Warrior",
      description: "You're an eco-champion! Inspire others with your sustainable lifestyle.",
      tips: ["Share your eco-tips with friends", "Volunteer for environmental causes", "Lead by example"]
    }
  };

  const currentPersona = personaData[persona] || personaData["Eco Explorer"];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8"
      >
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-3xl font-bold text-green-800 mb-2">
            Welcome to Greefin{userInfo ? `, ${userInfo.name}` : ''}!
          </h2>
          <p className="text-gray-600">
            Based on your choices, you're an <span className="font-semibold text-green-600">{currentPersona.title}</span> 🌍
          </p>
        </div>

        {/* Persona Card */}
        <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-center mb-4">
            <span className="text-4xl mr-3">{currentPersona.emoji}</span>
            <div>
              <h3 className="text-xl font-bold text-green-800">{currentPersona.title}</h3>
              <p className="text-green-600">{currentPersona.description}</p>
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
              Let's grow your eco-score together!
            </p>
          </div>
        </div>

        {/* Quick Tips */}
        <div className="mb-6">
          <h4 className="font-semibold text-gray-800 mb-3">Quick Tips for You:</h4>
          <ul className="space-y-2">
            {currentPersona.tips.map((tip, index) => (
              <li key={index} className="flex items-center text-sm text-gray-600">
                <span className="text-green-500 mr-2">✓</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>

        {/* Action Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onClose}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg transition-all"
        >
          Start My Journey 🚀
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

export default WelcomeModal;
