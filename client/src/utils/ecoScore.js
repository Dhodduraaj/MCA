// Eco Score Calculation Utility

export const calculateEcoScore = (surveyData) => {
  const weights = {
    travel: 30,
    food: 20,
    shopping: 15,
    energy: 20,
    habits: 15
  };

  let totalScore = 0;
  let maxPossibleScore = 0;

  // Travel & Commuting (30 points)
  const travelScore = calculateTravelScore(surveyData);
  totalScore += travelScore * (weights.travel / 100);
  maxPossibleScore += weights.travel;

  // Food & Diet (20 points)
  const foodScore = calculateFoodScore(surveyData);
  totalScore += foodScore * (weights.food / 100);
  maxPossibleScore += weights.food;

  // Shopping & Consumption (15 points)
  const shoppingScore = calculateShoppingScore(surveyData);
  totalScore += shoppingScore * (weights.shopping / 100);
  maxPossibleScore += weights.shopping;

  // Energy & Home (20 points)
  const energyScore = calculateEnergyScore(surveyData);
  totalScore += energyScore * (weights.energy / 100);
  maxPossibleScore += weights.energy;

  // Habits & Mindset (15 points)
  const habitsScore = calculateHabitsScore(surveyData);
  totalScore += habitsScore * (weights.habits / 100);
  maxPossibleScore += weights.habits;

  // Normalize to 0-100
  const normalizedScore = Math.round((totalScore / maxPossibleScore) * 100);
  return Math.min(100, Math.max(0, normalizedScore));
};

export const getEcoPersona = (score) => {
  if (score >= 71) return "Green Warrior";
  if (score >= 41) return "Conscious Saver";
  return "Eco Explorer";
};

export const getPersonaDescription = (persona) => {
  const descriptions = {
    "Eco Explorer": "You're just starting your green journey! Every small step counts towards a sustainable future.",
    "Conscious Saver": "You're making great progress! Your eco-friendly choices are making a real difference.",
    "Green Warrior": "You're an eco-champion! Your sustainable lifestyle inspires others to make positive changes."
  };
  return descriptions[persona] || descriptions["Eco Explorer"];
};

// Travel & Commuting Scoring
const calculateTravelScore = (data) => {
  let score = 0;
  
  // Commute mode (0-10 points)
  const commuteScores = {
    walk: 10,
    cycle: 9,
    public: 7,
    bike: 5,
    carpool: 4,
    car: 2
  };
  score += commuteScores[data.commute] || 0;

  // Ride-hailing usage (0-10 points)
  const rideScores = {
    never: 10,
    rarely: 7,
    few: 4,
    daily: 1
  };
  score += rideScores[data.rideHailing] || 0;

  // Weekly km by personal vehicle (0-10 points)
  const km = parseInt(data.weeklyKm) || 0;
  if (km === 0) score += 10;
  else if (km <= 50) score += 8;
  else if (km <= 100) score += 6;
  else if (km <= 200) score += 4;
  else score += 2;

  return Math.min(30, score);
};

// Food & Diet Scoring
const calculateFoodScore = (data) => {
  let score = 0;
  
  // Meat/fish consumption (0-8 points)
  const meatScores = {
    never: 8,
    rarely: 6,
    weekly: 4,
    daily: 2
  };
  score += meatScores[data.meatConsumption] || 0;

  // Eating out frequency (0-6 points)
  const eatingOutScores = {
    never: 6,
    monthly: 5,
    weekly: 3,
    daily: 1
  };
  score += eatingOutScores[data.eatingOut] || 0;

  // Buying locally grown/organic (0-6 points)
  const organicScores = {
    always: 6,
    often: 4,
    sometimes: 2,
    never: 0
  };
  score += organicScores[data.organicFood] || 0;

  return Math.min(20, score);
};

// Shopping & Consumption Scoring
const calculateShoppingScore = (data) => {
  let score = 0;
  
  // Frequency of buying clothes (0-5 points)
  const clothesScores = {
    rarely: 5,
    seasonally: 4,
    monthly: 2,
    weekly: 1
  };
  score += clothesScores[data.clothesFrequency] || 0;

  // Preference for eco brands (0-5 points)
  const ecoBrandScores = {
    always: 5,
    often: 3,
    sometimes: 2,
    never: 0
  };
  score += ecoBrandScores[data.ecoBrands] || 0;

  // Use of reusable shopping bags (0-5 points)
  const bagScores = {
    always: 5,
    often: 3,
    sometimes: 2,
    never: 0
  };
  score += bagScores[data.reusableBags] || 0;

  return Math.min(15, score);
};

// Energy & Home Scoring
const calculateEnergyScore = (data) => {
  let score = 0;
  
  // Monthly electricity bill (0-8 points)
  const billScores = {
    low: 8,
    medium: 5,
    high: 2
  };
  score += billScores[data.electricityBill] || 0;

  // Switching off appliances habit (0-6 points)
  const applianceScores = {
    always: 6,
    often: 4,
    sometimes: 2,
    never: 0
  };
  score += applianceScores[data.switchOffAppliances] || 0;

  // Energy-efficient appliances usage (0-6 points)
  const efficientScores = {
    all: 6,
    most: 4,
    some: 2,
    none: 0
  };
  score += efficientScores[data.energyEfficient] || 0;

  return Math.min(20, score);
};

// Habits & Mindset Scoring
const calculateHabitsScore = (data) => {
  let score = 0;
  
  // Reusable bottle/cup usage (0-8 points)
  const bottleScores = {
    always: 8,
    often: 5,
    sometimes: 3,
    never: 0
  };
  score += bottleScores[data.reusableBottles] || 0;

  // Recycling household waste (0-7 points)
  const recyclingScores = {
    always: 7,
    often: 5,
    sometimes: 3,
    never: 0
  };
  score += recyclingScores[data.recycling] || 0;

  return Math.min(15, score);
};

export const getPersonalizedTips = (surveyData, score) => {
  const tips = [];
  
  // Travel tips
  if (surveyData.commute === "car" || surveyData.rideHailing === "daily") {
    tips.push("Try public transport twice a week → save ₹500 + 2kg CO₂");
  }
  if (parseInt(surveyData.weeklyKm) > 100) {
    tips.push("Consider carpooling or cycling for short trips → reduce emissions");
  }

  // Food tips
  if (surveyData.meatConsumption === "daily") {
    tips.push("Have one meat-free day per week → reduce carbon footprint by 15%");
  }
  if (surveyData.eatingOut === "daily") {
    tips.push("Cook at home more often → save money and reduce packaging waste");
  }

  // Shopping tips
  if (surveyData.clothesFrequency === "weekly") {
    tips.push("Buy second-hand items this month → save money and resources");
  }
  if (surveyData.ecoBrands === "never") {
    tips.push("Try one eco-friendly brand → support sustainable businesses");
  }

  // Energy tips
  if (surveyData.electricityBill === "high") {
    tips.push("Switch to LED bulbs → save ₹200/month on electricity");
  }
  if (surveyData.switchOffAppliances === "never") {
    tips.push("Turn off appliances when not in use → reduce energy waste");
  }

  // Habits tips
  if (surveyData.reusableBottles === "never") {
    tips.push("Get a reusable water bottle → save ₹50/week on bottled water");
  }
  if (surveyData.recycling === "never") {
    tips.push("Start recycling paper and plastic → reduce landfill waste");
  }

  return tips.length > 0 ? tips : ["Start with small changes - every step counts! 🌱"];
};
