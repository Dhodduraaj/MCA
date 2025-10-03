// Enhanced Eco Score Calculation Utility with XP and Badges

export const calculateEcoProfile = (surveyData) => {
  const weights = {
    travel: 30,
    food: 20,
    shopping: 15,
    energy: 20,
    habits: 15
  };

  let totalScore = 0;
  let maxPossibleScore = 0;
  let xp = 0;
  let badges = [];

  // Travel & Commuting (30 points)
  const travelScore = calculateTravelScore(surveyData);
  totalScore += travelScore * (weights.travel / 100);
  maxPossibleScore += weights.travel;
  xp += calculateTravelXP(surveyData);
  badges.push(...calculateTravelBadges(surveyData));

  // Food & Diet (20 points)
  const foodScore = calculateFoodScore(surveyData);
  totalScore += foodScore * (weights.food / 100);
  maxPossibleScore += weights.food;
  xp += calculateFoodXP(surveyData);
  badges.push(...calculateFoodBadges(surveyData));

  // Shopping & Consumption (15 points)
  const shoppingScore = calculateShoppingScore(surveyData);
  totalScore += shoppingScore * (weights.shopping / 100);
  maxPossibleScore += weights.shopping;
  xp += calculateShoppingXP(surveyData);
  badges.push(...calculateShoppingBadges(surveyData));

  // Energy & Home (20 points)
  const energyScore = calculateEnergyScore(surveyData);
  totalScore += energyScore * (weights.energy / 100);
  maxPossibleScore += weights.energy;
  xp += calculateEnergyXP(surveyData);
  badges.push(...calculateEnergyBadges(surveyData));

  // Habits & Mindset (15 points)
  const habitsScore = calculateHabitsScore(surveyData);
  totalScore += habitsScore * (weights.habits / 100);
  maxPossibleScore += weights.habits;
  xp += calculateHabitsXP(surveyData);
  badges.push(...calculateHabitsBadges(surveyData));

  // Normalize to 0-100
  const normalizedScore = Math.round((totalScore / maxPossibleScore) * 100);
  const finalScore = Math.min(100, Math.max(0, normalizedScore));
  
  // Add bonus XP for high scores
  if (finalScore >= 80) xp += 50;
  else if (finalScore >= 60) xp += 30;
  else if (finalScore >= 40) xp += 20;

  return {
    score: finalScore,
    persona: getEcoPersona(finalScore),
    xp: Math.round(xp),
    badges: [...new Set(badges)] // Remove duplicates
  };
};

// Legacy function for backward compatibility
export const calculateEcoScore = (surveyData) => {
  return calculateEcoProfile(surveyData).score;
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

// XP Calculation Functions
const calculateTravelXP = (data) => {
  let xp = 0;
  if (data.commute === "walk") xp += 15;
  else if (data.commute === "cycle") xp += 12;
  else if (data.commute === "public") xp += 10;
  else if (data.commute === "bike") xp += 8;
  else if (data.commute === "carpool") xp += 6;
  
  if (data.rideHailing === "never") xp += 10;
  else if (data.rideHailing === "rarely") xp += 7;
  
  const km = parseInt(data.weeklyKm) || 0;
  if (km === 0) xp += 15;
  else if (km <= 50) xp += 12;
  else if (km <= 100) xp += 8;
  
  return xp;
};

const calculateFoodXP = (data) => {
  let xp = 0;
  if (data.meatConsumption === "never") xp += 12;
  else if (data.meatConsumption === "rarely") xp += 8;
  
  if (data.eatingOut === "never") xp += 8;
  else if (data.eatingOut === "monthly") xp += 6;
  
  if (data.organicFood === "always") xp += 10;
  else if (data.organicFood === "often") xp += 7;
  
  return xp;
};

const calculateShoppingXP = (data) => {
  let xp = 0;
  if (data.clothesFrequency === "rarely") xp += 8;
  else if (data.clothesFrequency === "seasonally") xp += 6;
  
  if (data.ecoBrands === "always") xp += 10;
  else if (data.ecoBrands === "often") xp += 7;
  
  if (data.reusableBags === "always") xp += 8;
  else if (data.reusableBags === "often") xp += 5;
  
  return xp;
};

const calculateEnergyXP = (data) => {
  let xp = 0;
  if (data.electricityBill === "low") xp += 12;
  else if (data.electricityBill === "medium") xp += 8;
  
  if (data.switchOffAppliances === "always") xp += 10;
  else if (data.switchOffAppliances === "often") xp += 7;
  
  if (data.energyEfficient === "all") xp += 10;
  else if (data.energyEfficient === "most") xp += 7;
  
  return xp;
};

const calculateHabitsXP = (data) => {
  let xp = 0;
  if (data.reusableBottles === "always") xp += 12;
  else if (data.reusableBottles === "often") xp += 8;
  
  if (data.recycling === "always") xp += 10;
  else if (data.recycling === "often") xp += 7;
  
  return xp;
};

// Badge Calculation Functions
const calculateTravelBadges = (data) => {
  const badges = [];
  
  if (data.commute === "walk") badges.push("🚶‍♂️ Walker");
  if (data.commute === "cycle") badges.push("🚴‍♂️ Cyclist");
  if (data.rideHailing === "never") badges.push("🚗 Car-Free");
  if (parseInt(data.weeklyKm) === 0) badges.push("🌱 Zero Emissions");
  
  return badges;
};

const calculateFoodBadges = (data) => {
  const badges = [];
  
  if (data.meatConsumption === "never") badges.push("🥬 Plant-Based");
  if (data.eatingOut === "never") badges.push("👨‍🍳 Home Chef");
  if (data.organicFood === "always") badges.push("🌿 Organic Lover");
  
  return badges;
};

const calculateShoppingBadges = (data) => {
  const badges = [];
  
  if (data.clothesFrequency === "rarely") badges.push("👕 Minimalist");
  if (data.ecoBrands === "always") badges.push("🌱 Eco Shopper");
  if (data.reusableBags === "always") badges.push("🛍️ Reusable Hero");
  
  return badges;
};

const calculateEnergyBadges = (data) => {
  const badges = [];
  
  if (data.electricityBill === "low") badges.push("⚡ Energy Saver");
  if (data.switchOffAppliances === "always") badges.push("🔌 Power Conscious");
  if (data.energyEfficient === "all") badges.push("💡 Efficiency Expert");
  
  return badges;
};

const calculateHabitsBadges = (data) => {
  const badges = [];
  
  if (data.reusableBottles === "always") badges.push("🍶 Bottle Champion");
  if (data.recycling === "always") badges.push("♻️ Recycling Master");
  
  return badges;
};

// Eco Facts for real-time feedback
export const getEcoFacts = () => {
  const facts = [
    "🌱 Walking 1km instead of driving saves 0.2kg CO₂!",
    "🚴‍♂️ Cycling to work burns 300 calories per hour!",
    "🥬 Going meat-free one day saves 2,500 liters of water!",
    "♻️ Recycling one aluminum can saves enough energy to power a TV for 3 hours!",
    "💡 LED bulbs use 75% less energy than incandescent bulbs!",
    "🌿 Organic farming reduces pesticide use by 95%!",
    "🚗 Carpooling with 3 people reduces emissions by 75%!",
    "🛍️ A reusable bag can replace 1,000 plastic bags!",
    "💧 A dripping faucet wastes 3,000 gallons of water per year!",
    "🌳 One tree absorbs 22kg of CO₂ per year!"
  ];
  return facts[Math.floor(Math.random() * facts.length)];
};
