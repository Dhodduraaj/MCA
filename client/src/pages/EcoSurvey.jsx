import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { calculateEcoProfile, getPersonalizedTips } from "../utils/ecoScore";
import { clearOldUserData, setUserSpecificData } from "../utils/userData";

function EcoSurvey() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [surveyData, setSurveyData] = useState({
    // Travel & Commuting
    commute: "",
    rideHailing: "",
    weeklyKm: "0",
    // Food & Diet
    meatConsumption: "",
    eatingOut: "",
    organicFood: "",
    // Shopping & Consumption
    clothesFrequency: "",
    ecoBrands: "",
    reusableBags: "",
    // Energy & Home
    electricityBill: "",
    switchOffAppliances: "",
    energyEfficient: "",
    // Habits & Mindset
    reusableBottles: "",
    recycling: "",
    goal: ""
  });

  // Real-time eco profile state
  const [ecoProfile, setEcoProfile] = useState({
    score: 0,
    persona: "Eco Explorer",
    xp: 0,
    badges: []
  });

  // UI feedback state (simplified for direct redirect)
  const [showFeedback, setShowFeedback] = useState(false);
  const [currentFact, setCurrentFact] = useState("");

  // Real-time calculation effect (background only)
  useEffect(() => {
    const newProfile = calculateEcoProfile(surveyData);
    setEcoProfile(newProfile);
  }, [surveyData]);

  // No feedback during survey - only after completion
  const showAnswerFeedback = () => {
    // Disabled during survey
  };

  const categories = [
    {
      id: "travel",
      title: "Travel & Commuting",
      icon: "🚗",
      questions: [
        {
          id: "commute",
          title: "How do you usually commute to work/school?",
          type: "radio",
          options: [
            { value: "walk", label: "Walk", emoji: "🚶" },
            { value: "cycle", label: "Cycle", emoji: "🚲" },
            { value: "public", label: "Public Transport", emoji: "🚌" },
            { value: "bike", label: "Bike/Motorcycle", emoji: "🏍️" },
            { value: "carpool", label: "Carpool", emoji: "🚗" },
            { value: "car", label: "Personal Car", emoji: "🚗" }
          ]
        },
        {
          id: "rideHailing",
          title: "How often do you use ride-hailing services (Uber, Ola)?",
          type: "radio",
          options: [
            { value: "never", label: "Never", emoji: "❌" },
            { value: "rarely", label: "Rarely", emoji: "🤔" },
            { value: "few", label: "Few times a week", emoji: "📅" },
            { value: "daily", label: "Daily", emoji: "📱" }
          ]
        },
        {
          id: "weeklyKm",
          title: "How many kilometers do you drive per week?",
          type: "slider",
          min: 0,
          max: 500,
          step: 10,
          unit: "km"
        }
      ]
    },
    {
      id: "food",
      title: "Food & Diet",
      icon: "🍽️",
      questions: [
        {
          id: "meatConsumption",
          title: "How often do you eat meat or fish?",
          type: "radio",
          options: [
            { value: "never", label: "Never (Vegetarian/Vegan)", emoji: "🌱" },
            { value: "rarely", label: "Rarely", emoji: "🥗" },
            { value: "weekly", label: "Weekly", emoji: "🍖" },
            { value: "daily", label: "Daily", emoji: "🥩" }
          ]
        },
        {
          id: "eatingOut",
          title: "How often do you eat out or order food?",
          type: "radio",
          options: [
            { value: "never", label: "Never (Always cook at home)", emoji: "🏠" },
            { value: "monthly", label: "Monthly", emoji: "📅" },
            { value: "weekly", label: "Weekly", emoji: "🍽️" },
            { value: "daily", label: "Daily", emoji: "🍕" }
          ]
        },
        {
          id: "organicFood",
          title: "How often do you buy locally grown or organic food?",
          type: "radio",
          options: [
            { value: "always", label: "Always", emoji: "🌿" },
            { value: "often", label: "Often", emoji: "🥬" },
            { value: "sometimes", label: "Sometimes", emoji: "🥕" },
            { value: "never", label: "Never", emoji: "🏪" }
          ]
        }
      ]
    },
    {
      id: "shopping",
      title: "Shopping & Consumption",
      icon: "🛍️",
      questions: [
        {
          id: "clothesFrequency",
          title: "How often do you buy new clothes?",
          type: "radio",
          options: [
            { value: "rarely", label: "Rarely (Only when needed)", emoji: "👕" },
            { value: "seasonally", label: "Seasonally", emoji: "👗" },
            { value: "monthly", label: "Monthly", emoji: "🛍️" },
            { value: "weekly", label: "Weekly", emoji: "💳" }
          ]
        },
        {
          id: "ecoBrands",
          title: "How often do you choose eco-friendly or sustainable brands?",
          type: "radio",
          options: [
            { value: "always", label: "Always", emoji: "🌿" },
            { value: "often", label: "Often", emoji: "♻️" },
            { value: "sometimes", label: "Sometimes", emoji: "🤔" },
            { value: "never", label: "Never", emoji: "❌" }
          ]
        },
        {
          id: "reusableBags",
          title: "How often do you use reusable shopping bags?",
          type: "radio",
          options: [
            { value: "always", label: "Always", emoji: "🛍️" },
            { value: "often", label: "Often", emoji: "♻️" },
            { value: "sometimes", label: "Sometimes", emoji: "🤔" },
            { value: "never", label: "Never", emoji: "❌" }
          ]
        }
      ]
    },
    {
      id: "energy",
      title: "Energy & Home",
      icon: "⚡",
      questions: [
        {
          id: "electricityBill",
          title: "What's your monthly electricity bill range?",
          type: "radio",
          options: [
            { value: "low", label: "Under ₹1,000", emoji: "💡" },
            { value: "medium", label: "₹1,000 - ₹3,000", emoji: "🔌" },
            { value: "high", label: "Over ₹3,000", emoji: "⚡" }
          ]
        },
        {
          id: "switchOffAppliances",
          title: "How often do you switch off appliances when not in use?",
          type: "radio",
          options: [
            { value: "always", label: "Always", emoji: "✅" },
            { value: "often", label: "Often", emoji: "👍" },
            { value: "sometimes", label: "Sometimes", emoji: "🤔" },
            { value: "never", label: "Never", emoji: "❌" }
          ]
        },
        {
          id: "energyEfficient",
          title: "How many of your appliances are energy-efficient (LED, 5-star rated)?",
          type: "radio",
          options: [
            { value: "all", label: "All of them", emoji: "⭐" },
            { value: "most", label: "Most of them", emoji: "👍" },
            { value: "some", label: "Some of them", emoji: "🤔" },
            { value: "none", label: "None", emoji: "❌" }
          ]
        }
      ]
    },
    {
      id: "habits",
      title: "Habits & Mindset",
      icon: "♻️",
      questions: [
        {
          id: "reusableBottles",
          title: "How often do you use reusable bottles or cups?",
          type: "radio",
          options: [
            { value: "always", label: "Always", emoji: "🍶" },
            { value: "often", label: "Often", emoji: "♻️" },
            { value: "sometimes", label: "Sometimes", emoji: "🤔" },
            { value: "never", label: "Never", emoji: "❌" }
          ]
        },
        {
          id: "recycling",
          title: "How often do you recycle household waste?",
          type: "radio",
          options: [
            { value: "always", label: "Always", emoji: "♻️" },
            { value: "often", label: "Often", emoji: "👍" },
            { value: "sometimes", label: "Sometimes", emoji: "🤔" },
            { value: "never", label: "Never", emoji: "❌" }
          ]
        },
        {
          id: "goal",
          title: "What's one green goal you'd like to achieve this year?",
          type: "text",
          placeholder: "e.g., Reduce my carbon footprint by 20%, Start composting, Use public transport more..."
        }
      ]
    }
  ];

  const handleOptionSelect = (questionId, value) => {
    setSurveyData(prev => ({
      ...prev,
      [questionId]: value
    }));
    
    // Debounce feedback to avoid too frequent updates
    setTimeout(() => {
      showAnswerFeedback();
    }, 500);
  };

  const handleNext = () => {
    if (currentStep < categories.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    // Calculate eco profile with XP and badges
    const finalProfile = calculateEcoProfile(surveyData);
    const tips = getPersonalizedTips(surveyData, finalProfile.score);

    // Clear old user data first
    clearOldUserData();

    // Store user-specific data together for consistency
    setUserSpecificData('ecoSurveyData', surveyData);
    setUserSpecificData('ecoPersona', finalProfile.persona);
    setUserSpecificData('ecoScore', finalProfile.score);
    setUserSpecificData('ecoXP', finalProfile.xp);
    setUserSpecificData('ecoBadges', finalProfile.badges);
    setUserSpecificData('ecoTips', tips);

    // Redirect to dashboard directly (no modal)
    navigate("/dashboard");
  };

  const currentCategory = categories[currentStep];
  const progress = ((currentStep + 1) / categories.length) * 100;
  const isLastStep = currentStep === categories.length - 1;

  // Check if current category is complete
  const isCurrentCategoryComplete = () => {
    return currentCategory.questions.every(question => {
      if (question.type === "text") {
        return surveyData[question.id] && surveyData[question.id].trim() !== "";
      }
      return surveyData[question.id] !== "";
    });
  };

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

        {/* Category Card */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-2xl shadow-lg p-8 mb-8"
        >
          <div className="text-center mb-6">
            <div className="text-4xl mb-4">{currentCategory.icon}</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {currentCategory.title}
            </h2>
            <p className="text-gray-600">
              Step {currentStep + 1} of {categories.length}
            </p>
          </div>

          <div className="space-y-8">
            {currentCategory.questions.map((question, questionIndex) => (
              <div key={question.id} className="border-b border-gray-100 pb-6 last:border-b-0">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  {questionIndex + 1}. {question.title}
                </h3>
                
                {question.type === "radio" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {question.options.map((option) => (
                      <motion.button
                        key={option.value}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleOptionSelect(question.id, option.value)}
                        className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                          surveyData[question.id] === option.value
                            ? "border-green-500 bg-green-50 text-green-700"
                            : "border-gray-200 hover:border-green-300 hover:bg-green-50"
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{option.emoji}</span>
                          <span className="font-medium text-sm">{option.label}</span>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                )}

                {question.type === "slider" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">0 {question.unit}</span>
                      <span className="text-lg font-semibold text-green-600">
                        {surveyData[question.id] || question.min} {question.unit}
                      </span>
                      <span className="text-sm text-gray-600">{question.max} {question.unit}</span>
                    </div>
                    <input
                      type="range"
                      min={question.min}
                      max={question.max}
                      step={question.step}
                      value={surveyData[question.id] || question.min}
                      onChange={(e) => handleOptionSelect(question.id, e.target.value)}
                      className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, #2e7d32 0%, #2e7d32 ${((surveyData[question.id] || question.min) - question.min) / (question.max - question.min) * 100}%, #e5e7eb ${((surveyData[question.id] || question.min) - question.min) / (question.max - question.min) * 100}%, #e5e7eb 100%)`
                      }}
                    />
                  </div>
                )}

                {question.type === "text" && (
                  <textarea
                    value={surveyData[question.id] || ""}
                    onChange={(e) => handleOptionSelect(question.id, e.target.value)}
                    placeholder={question.placeholder}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none resize-none"
                    rows={3}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
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
              disabled={!isCurrentCategoryComplete()}
              className={`px-8 py-3 font-semibold rounded-xl shadow-lg transition-all ${
                !isCurrentCategoryComplete()
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700 text-white"
              }`}
            >
              Complete Survey 🎉
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleNext}
              disabled={!isCurrentCategoryComplete()}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                !isCurrentCategoryComplete()
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700 text-white"
              }`}
            >
              Next →
            </motion.button>
          )}
          </div>
        </motion.div>

      </div>
    </div>
  );
}

export default EcoSurvey;
