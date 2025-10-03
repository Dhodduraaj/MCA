import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Leaf, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Zap, 
  Car, 
  ShoppingBag, 
  Utensils,
  Lightbulb,
  Recycle,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Calendar,
  DollarSign
} from "lucide-react";
import { useFinance } from "../context/FinanceContext";

const Calculate = () => {
  const { transactions } = useFinance();
  const [carbonData, setCarbonData] = useState({
    totalEmissions: 0,
    monthlyLimit: 200, // kg CO2 per month
    categoryBreakdown: {},
    progress: 0,
    status: 'good'
  });

  // Carbon emission factors (kg CO2 per ₹1000 spent)
  const emissionFactors = {
    'Transport': 2.5,
    'Food': 1.8,
    'Shopping': 1.2,
    'Entertainment': 0.8,
    'Healthcare': 0.6,
    'Education': 0.4,
    'Utilities': 1.5,
    'Other': 1.0
  };

  // Calculate carbon emissions from transactions
  const calculateCarbonEmissions = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    // Filter transactions for current month
    const monthlyTransactions = transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return transactionDate.getMonth() === currentMonth && 
             transactionDate.getFullYear() === currentYear &&
             transaction.type === 'expense';
    });

    let totalEmissions = 0;
    const categoryBreakdown = {};

    monthlyTransactions.forEach(transaction => {
      const factor = emissionFactors[transaction.category] || emissionFactors['Other'];
      const emissions = (transaction.amount / 1000) * factor;
      totalEmissions += emissions;
      
      if (categoryBreakdown[transaction.category]) {
        categoryBreakdown[transaction.category] += emissions;
      } else {
        categoryBreakdown[transaction.category] = emissions;
      }
    });

    const progress = Math.min((totalEmissions / carbonData.monthlyLimit) * 100, 100);
    const status = progress > 80 ? 'warning' : progress > 100 ? 'danger' : 'good';

    setCarbonData({
      totalEmissions: Math.round(totalEmissions * 100) / 100,
      monthlyLimit: 200,
      categoryBreakdown,
      progress,
      status
    });
  };

  useEffect(() => {
    calculateCarbonEmissions();
  }, [transactions]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'good': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'danger': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusBgColor = (status) => {
    switch (status) {
      case 'good': return 'bg-green-100';
      case 'warning': return 'bg-yellow-100';
      case 'danger': return 'bg-red-100';
      default: return 'bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'good': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'danger': return <AlertTriangle className="h-5 w-5 text-red-600" />;
      default: return <BarChart3 className="h-5 w-5 text-gray-600" />;
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Transport': return <Car className="h-5 w-5" />;
      case 'Food': return <Utensils className="h-5 w-5" />;
      case 'Shopping': return <ShoppingBag className="h-5 w-5" />;
      case 'Utilities': return <Lightbulb className="h-5 w-5" />;
      default: return <DollarSign className="h-5 w-5" />;
    }
  };

  const getEcoTips = () => {
    const tips = [];
    
    if (carbonData.categoryBreakdown['Transport'] > 50) {
      tips.push("Consider using public transport or cycling to reduce transport emissions");
    }
    if (carbonData.categoryBreakdown['Food'] > 30) {
      tips.push("Try to buy local and seasonal food to reduce your food carbon footprint");
    }
    if (carbonData.categoryBreakdown['Shopping'] > 20) {
      tips.push("Consider buying second-hand items or supporting sustainable brands");
    }
    if (carbonData.totalEmissions > carbonData.monthlyLimit) {
      tips.push("You've exceeded your monthly carbon limit. Try to reduce expenses in high-emission categories");
    }
    
    return tips.length > 0 ? tips : ["Great job! You're within your carbon budget this month"];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e8f5e9] to-[#c8e6c9] pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center gap-3">
            <Leaf className="h-10 w-10 text-green-600" />
            Carbon Footprint Calculator
          </h1>
          <p className="text-gray-600">Track your carbon emissions and work towards a sustainable lifestyle</p>
        </motion.div>

        {/* Main Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          {/* Total Emissions */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Emissions</p>
                <p className="text-3xl font-bold text-gray-800">{carbonData.totalEmissions} kg CO₂</p>
              </div>
              <div className={`p-3 rounded-full ${getStatusBgColor(carbonData.status)}`}>
                {getStatusIcon(carbonData.status)}
              </div>
            </div>
            <div className="text-sm text-gray-500">
              This month's carbon footprint
            </div>
          </div>

          {/* Monthly Limit */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-gray-600 text-sm font-medium">Monthly Limit</p>
                <p className="text-3xl font-bold text-blue-600">{carbonData.monthlyLimit} kg CO₂</p>
              </div>
              <Target className="h-8 w-8 text-blue-500" />
            </div>
            <div className="text-sm text-gray-500">
              Recommended monthly target
            </div>
          </div>

          {/* Progress */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-gray-600 text-sm font-medium">Progress</p>
                <p className={`text-3xl font-bold ${getStatusColor(carbonData.status)}`}>
                  {Math.round(carbonData.progress)}%
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-500" />
            </div>
            <div className="text-sm text-gray-500">
              {carbonData.progress > 100 ? 'Over limit' : 'Within limit'}
            </div>
          </div>
        </motion.div>

        {/* Progress Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200 mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-800">Monthly Carbon Budget Progress</h3>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              carbonData.status === 'good' ? 'bg-green-100 text-green-800' :
              carbonData.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {carbonData.status === 'good' ? 'On Track' : 
               carbonData.status === 'warning' ? 'Warning' : 'Over Limit'}
            </span>
          </div>
          
          <div className="relative">
            <div className="w-full bg-gray-200 rounded-full h-4">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(carbonData.progress, 100)}%` }}
                transition={{ duration: 1, delay: 0.5 }}
                className={`h-4 rounded-full ${
                  carbonData.status === 'good' ? 'bg-gradient-to-r from-green-400 to-green-600' :
                  carbonData.status === 'warning' ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                  'bg-gradient-to-r from-red-400 to-red-600'
                }`}
              />
            </div>
            <div className="flex justify-between mt-2 text-sm text-gray-600">
              <span>0 kg CO₂</span>
              <span className="font-medium">{carbonData.totalEmissions} kg CO₂</span>
              <span>{carbonData.monthlyLimit} kg CO₂</span>
            </div>
          </div>
        </motion.div>

        {/* Category Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200 mb-8"
        >
          <h3 className="text-xl font-semibold text-gray-800 mb-6">Emissions by Category</h3>
          
          {Object.keys(carbonData.categoryBreakdown).length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Leaf className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No emissions data for this month</p>
              <p className="text-sm">Add some transactions to see your carbon footprint</p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(carbonData.categoryBreakdown)
                .sort(([,a], [,b]) => b - a)
                .map(([category, emissions]) => (
                <div key={category} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {getCategoryIcon(category)}
                    <span className="font-medium text-gray-800">{category}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-semibold text-gray-800">{emissions.toFixed(2)} kg CO₂</div>
                      <div className="text-sm text-gray-500">
                        {((emissions / carbonData.totalEmissions) * 100).toFixed(1)}% of total
                      </div>
                    </div>
                    <div className="w-16 h-2 bg-gray-200 rounded-full">
                      <div 
                        className="h-2 bg-gradient-to-r from-green-400 to-green-600 rounded-full"
                        style={{ width: `${(emissions / carbonData.totalEmissions) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Eco Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200"
        >
          <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <Zap className="h-6 w-6 text-yellow-500" />
            Eco-Friendly Tips
          </h3>
          
          <div className="space-y-3">
            {getEcoTips().map((tip, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                className="flex items-start gap-3 p-4 bg-green-50 rounded-lg border border-green-200"
              >
                <Recycle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">{tip}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Calculate;
