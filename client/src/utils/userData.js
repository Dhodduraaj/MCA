// User-specific data management utilities

export const getCurrentUserId = () => {
  const token = localStorage.getItem("token");
  if (!token) return "anonymous";
  
  try {
    // Decode JWT to get user ID from database
    const payload = JSON.parse(atob(token.split('.')[1]));
    // The JWT contains 'id' field which is the MongoDB _id
    return payload.id || "anonymous";
  } catch (error) {
    console.error("Error decoding token:", error);
    return "anonymous";
  }
};

export const getCurrentUserInfo = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;
  
  try {
    // Decode JWT to get user information
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      id: payload.id,
      name: payload.name,
      email: payload.email
    };
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
};

export const getUserSpecificKey = (key) => {
  const userId = getCurrentUserId();
  return `${key}_${userId}`;
};

export const setUserSpecificData = (key, data) => {
  const userKey = getUserSpecificKey(key);
  localStorage.setItem(userKey, JSON.stringify(data));
};

export const getUserSpecificData = (key) => {
  const userKey = getUserSpecificKey(key);
  const data = localStorage.getItem(userKey);
  return data ? JSON.parse(data) : null;
};

export const clearUserSpecificData = (key) => {
  const userKey = getUserSpecificKey(key);
  localStorage.removeItem(userKey);
};

export const clearAllUserSpecificData = () => {
  const userId = getCurrentUserId();
  const keysToRemove = [];
  
  // Find all keys that belong to the current user
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.endsWith(`_${userId}`)) {
      keysToRemove.push(key);
    }
  }
  
  // Remove all user-specific keys
  keysToRemove.forEach(key => localStorage.removeItem(key));
};

export const clearOldUserData = () => {
  const currentUserId = getCurrentUserId();
  
  // Get all localStorage keys
  const allKeys = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) allKeys.push(key);
  }
  
  // Find eco-related keys that don't belong to current user
  const ecoKeys = allKeys.filter(key => {
    // Match eco-related keys that don't end with current user ID
    return (key.startsWith('eco') || 
            key.includes('ecoSurveyData') || 
            key.includes('ecoPersona') || 
            key.includes('ecoScore')) &&
           !key.endsWith(`_${currentUserId}`);
  });
  
  // Remove old eco data
  ecoKeys.forEach(key => {
    console.log(`Clearing old eco data: ${key}`);
    localStorage.removeItem(key);
  });
};

export const hasUserCompletedSurvey = () => {
  const surveyData = getUserSpecificData('ecoSurveyData');
  return surveyData !== null;
};

export const getUserEcoData = () => {
  const surveyData = getUserSpecificData('ecoSurveyData');
  const persona = localStorage.getItem(getUserSpecificKey('ecoPersona'));
  const score = localStorage.getItem(getUserSpecificKey('ecoScore'));
  
  return {
    surveyData,
    persona: persona || "Eco Explorer",
    score: score ? parseInt(score) : 25
  };
};
