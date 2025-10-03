import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

function EcoSurvey() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [surveyData, setSurveyData] = useState({
    travel: "",
    food: "",
    shopping: "",
    energy: "",
    habits: "",
    goal: ""
  });

  const questions = [
    {
      id: "travel",
      title: "How do you usually travel?",
      icon: "🚲",
      options: [
        { value: "car", label: "Car", emoji: "🚗" },
        { value: "bike", label: "Bike/Motorcycle", emoji: "🏍️" },
        { value: "public", label: "Public Transport", emoji: "🚌" },
        { value: "cycle", label: "Cycle", emoji: "🚲" },
        { value: "walk", label: "Walk", emoji: "🚶" }
      ]
    },
    {
      id: "food",
      title: "What's your food preference?",
      icon: "🌱",
      options: [
        { value: "veg", label: "Vegetarian", emoji: "🥬" },
        { value: "mixed", label: "Mixed Diet", emoji: "🥗" },
        { value: "meat", label: "Mostly Meat", emoji: "🥩" }
      ]
    },
    {
      id: "shopping",
      title: "How do you prefer to shop?",
      icon: "🛍️",
      options: [
        { value: "eco", label: "Eco-friendly brands", emoji: "🌿" },
        { value: "second", label: "Second-hand items", emoji: "♻️" },
        { value: "fast", label: "Fast fashion", emoji: "👕" }
      ]
    },
    {
      id: "energy",
      title: "What's your monthly electricity bill range?",
      icon: "⚡",
      options: [
        { value: "low", label: "Under ₹1,000", emoji: "💡" },
        { value: "medium", label: "₹1,000 - ₹3,000", emoji: "🔌" },
        { value: "high", label: "Over ₹3,000", emoji: "⚡" }
      ]
    },
    {
      id: "habits",
      title: "Do you use reusable bottles and bags?",
      icon: "♻️",
      options: [
        { value: "yes", label: "Yes, always", emoji: "✅" },
        { value: "sometimes", label: "Sometimes", emoji: "🤔" },
        { value: "no", label: "No", emoji: "❌" }
      ]
    }
  ];

  const handleOptionSelect = (questionId, value) => {
    setSurveyData(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    // Mock API call
    console.log("Survey submitted:", surveyData);
    
    // Store in localStorage for demo
    localStorage.setItem("ecoSurveyData", JSON.stringify(surveyData));
    localStorage.setItem("ecoPersona", "Eco Explorer");
    localStorage.setItem("ecoScore", "25");
    
    // Show welcome modal and redirect
    navigate("/dashboard", { state: { showWelcomeModal: true } });
  };

  const currentQuestion = questions[currentStep];
  const progress = ((currentStep + 1) / questions.length) * 100;
  const isLastStep = currentStep === questions.length - 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 pt-24 pb-12">
      <div className="max-w-2xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-green-800 mb-4">
            🌱 Eco Survey
          </h1>
          <p className="text-green-600 text-lg">
            Help us understand your lifestyle to personalize your eco-journey!
          </p>
        </motion.div>

        {/* Progress Bar */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          className="mb-8"
        >
          <div className="bg-green-200 rounded-full h-3 overflow-hidden">
            <motion.div
              className="bg-gradient-to-r from-green-500 to-green-600 h-full rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <p className="text-center text-green-700 mt-2 font-medium">
            {Math.round(progress)}% Complete
          </p>
        </motion.div>

        {/* Question Card */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-2xl shadow-lg p-8 mb-8"
        >
          <div className="text-center mb-6">
            <div className="text-4xl mb-4">{currentQuestion.icon}</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {currentQuestion.title}
            </h2>
            <p className="text-gray-600">
              Step {currentStep + 1} of {questions.length}
            </p>
          </div>

          <div className="space-y-3">
            {currentQuestion.options.map((option) => (
              <motion.button
                key={option.value}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleOptionSelect(currentQuestion.id, option.value)}
                className={`w-full p-4 rounded-xl border-2 transition-all duration-200 ${
                  surveyData[currentQuestion.id] === option.value
                    ? "border-green-500 bg-green-50 text-green-700"
                    : "border-gray-200 hover:border-green-300 hover:bg-green-50"
                }`}
              >
                <div className="flex items-center justify-center space-x-3">
                  <span className="text-2xl">{option.emoji}</span>
                  <span className="font-medium">{option.label}</span>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Optional Goal Question */}
        {isLastStep && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg p-8 mb-8"
          >
            <div className="text-center mb-6">
              <div className="text-4xl mb-4">🎯</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                What's one green goal for this year?
              </h2>
              <p className="text-gray-600">(Optional - but we'd love to know!)</p>
            </div>
            <textarea
              value={surveyData.goal}
              onChange={(e) => setSurveyData(prev => ({ ...prev, goal: e.target.value }))}
              placeholder="e.g., Reduce my carbon footprint by 20%, Start composting, Use public transport more..."
              className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none resize-none"
              rows={3}
            />
          </motion.div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleBack}
            disabled={currentStep === 0}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              currentStep === 0
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-gray-500 hover:bg-gray-600 text-white"
            }`}
          >
            ← Back
          </motion.button>

          {isLastStep ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSubmit}
              className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl shadow-lg transition-all"
            >
              Complete Survey 🎉
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleNext}
              disabled={!surveyData[currentQuestion.id]}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                !surveyData[currentQuestion.id]
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700 text-white"
              }`}
            >
              Next →
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
}

export default EcoSurvey;
