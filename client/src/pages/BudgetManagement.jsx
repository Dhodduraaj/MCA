import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Edit2, Trash2, Target, AlertTriangle, CheckCircle, DollarSign, TrendingUp, TrendingDown } from "lucide-react";
import { useFinance } from "../context/FinanceContext";

const BudgetManagement = () => {
  const { 
    budgets, 
    addBudget, 
    updateBudget, 
    deleteBudget,
    totalBudget,
    totalSpent,
    totalRemaining
  } = useFinance();
  
  // Debug: Check authentication status
  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log('BudgetManagement - Auth token:', token ? 'Present' : 'Missing');
    console.log('BudgetManagement - Token value:', token ? token.substring(0, 20) + '...' : 'N/A');
  }, []);
  
  const [showForm, setShowForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Budget categories
  const categories = [
    "Food", "Transport", "Entertainment", "Shopping", "Healthcare", 
    "Education", "Utilities", "Other"
  ];


  const [formData, setFormData] = useState({
    category: "",
    monthlyLimit: "",
    period: "monthly"
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form data
    if (!formData.category || !formData.monthlyLimit) {
      alert('Please fill in all required fields');
      return;
    }
    
    if (parseFloat(formData.monthlyLimit) <= 0) {
      alert('Monthly limit must be greater than 0');
      return;
    }
    
    try {
      console.log('Form submitted with data:', formData);
      console.log('Editing budget:', editingBudget);
      
      if (editingBudget) {
        // Update existing budget
        console.log('Updating budget:', formData);
        await updateBudget(editingBudget._id, formData);
      } else {
        // Add new budget
        console.log('Adding new budget:', formData);
        await addBudget(formData);
      }

      // Show success message and reset form
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
      resetForm();
    } catch (error) {
      console.error('Error saving budget:', error);
      console.error('Error details:', error.response?.data);
      console.error('Error status:', error.response?.status);
      alert(`Error saving budget: ${error.message || 'Please try again.'}`);
    }
  };

  const resetForm = () => {
    setFormData({
      category: "",
      monthlyLimit: "",
      period: "monthly"
    });
    setShowForm(false);
    setEditingBudget(null);
  };

  const handleEdit = (budget) => {
    setEditingBudget(budget);
    setFormData({
      category: budget.category,
      monthlyLimit: budget.monthlyLimit.toString(),
      period: budget.period
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    try {
      await deleteBudget(id);
    } catch (error) {
      console.error('Error deleting budget:', error);
      alert('Error deleting budget. Please try again.');
    }
  };


  const getBudgetStatus = (budget) => {
    const percentage = (budget.currentSpent / budget.monthlyLimit) * 100;
    
    if (percentage >= 100) {
      return { status: "over", color: "red", icon: AlertTriangle };
    } else if (percentage >= 80) {
      return { status: "warning", color: "yellow", icon: AlertTriangle };
    } else if (percentage >= 50) {
      return { status: "moderate", color: "blue", icon: Target };
    } else {
      return { status: "good", color: "green", icon: CheckCircle };
    }
  };


  // Check if user is authenticated
  const isAuthenticated = localStorage.getItem('token');
  
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#e8f5e9] to-[#c8e6c9] pt-24 pb-12 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Authentication Required</h1>
          <p className="text-gray-600">Please log in to access budget management.</p>
        </div>
      </div>
    );
  }

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
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Budget Management</h1>
          <p className="text-gray-600">Set budgets and track your spending progress</p>
        </motion.div>

        {/* Success Message */}
        {showSuccessMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg"
          >
            {editingBudget ? 'Budget updated successfully!' : 'Budget added successfully!'}
          </motion.div>
        )}

        {/* Summary Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Budget</p>
                <p className="text-2xl font-bold text-blue-600">₹{totalBudget.toFixed(2)}</p>
              </div>
              <Target className="h-8 w-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Spent</p>
                <p className="text-2xl font-bold text-red-600">₹{totalSpent.toFixed(2)}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-500" />
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Remaining</p>
                <p className={`text-2xl font-bold ${totalRemaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ₹{totalRemaining.toFixed(2)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </div>
        </motion.div>

        {/* Add Budget Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowForm(true)}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Budget
          </motion.button>
        </motion.div>

        {/* Budget Form Modal */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={resetForm}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800">
                  {editingBudget ? 'Edit Budget' : 'Add New Budget'}
                </h3>
                {editingBudget && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                    Editing
                  </span>
                )}
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Select a category</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                {/* Monthly Limit */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Limit</label>
                  <input
                    type="number"
                    name="monthlyLimit"
                    value={formData.monthlyLimit}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>

                {/* Period */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Period</label>
                  <select
                    name="period"
                    value={formData.period}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="weekly">Weekly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>

                {/* Form Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 px-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:shadow-lg transition"
                  >
                    {editingBudget ? 'Update' : 'Add'} Budget
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}

        {/* Budgets List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {budgets.length === 0 ? (
            <div className="col-span-full bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-200 text-center">
              <Target className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500 text-lg">No budgets set</p>
              <p className="text-sm text-gray-400">Create your first budget to start tracking</p>
            </div>
          ) : (
            budgets.map((budget) => {
              const status = getBudgetStatus(budget);
              const percentage = (budget.currentSpent / budget.monthlyLimit) * 100;
              const StatusIcon = status.icon;

              return (
                <motion.div
                  key={budget._id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-full bg-${status.color}-100`}>
                        <StatusIcon className={`h-5 w-5 text-${status.color}-600`} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{budget.category}</h3>
                        <p className="text-sm text-gray-500 capitalize">{budget.period} Budget</p>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleEdit(budget)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit2 className="h-4 w-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDelete(budget._id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </motion.button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>₹{budget.currentSpent.toFixed(2)} spent</span>
                      <span>₹{budget.monthlyLimit.toFixed(2)} limit</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(percentage, 100)}%` }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className={`h-3 rounded-full ${
                          percentage >= 100 
                            ? 'bg-red-500' 
                            : percentage >= 80 
                            ? 'bg-yellow-500' 
                            : percentage >= 50 
                            ? 'bg-blue-500' 
                            : 'bg-green-500'
                        }`}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>{percentage.toFixed(1)}% used</span>
                      <span>₹{(budget.monthlyLimit - budget.currentSpent).toFixed(2)} remaining</span>
                    </div>
                  </div>

                  {/* Status Message */}
                  <div className={`p-3 rounded-lg text-sm font-medium ${
                    status.status === 'over' 
                      ? 'bg-red-50 text-red-700' 
                      : status.status === 'warning' 
                      ? 'bg-yellow-50 text-yellow-700' 
                      : status.status === 'moderate' 
                      ? 'bg-blue-50 text-blue-700' 
                      : 'bg-green-50 text-green-700'
                  }`}>
                    {status.status === 'over' && '⚠️ Over budget! Consider reducing expenses.'}
                    {status.status === 'warning' && '⚠️ Close to budget limit. Watch your spending.'}
                    {status.status === 'moderate' && '🌱 Moderate spending. You\'re on track.'}
                    {status.status === 'good' && '✅ Great job! You\'re well within budget.'}
                  </div>
                </motion.div>
              );
            })
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default BudgetManagement;
