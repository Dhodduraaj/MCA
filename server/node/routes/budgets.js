const express = require("express");
const Budget = require("../models/Budget");
const Transaction = require("../models/Transaction");
const auth = require("../middleware/auth");
const router = express.Router();

// @route GET /api/budgets
// @desc Get all budgets for a user
router.get("/", auth, async (req, res) => {
  try {
    const budgets = await Budget.find({ user: req.user.id });
    res.json(budgets);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route POST /api/budgets
// @desc Create a new budget
router.post("/", auth, async (req, res) => {
  try {
    console.log("Creating budget for user:", req.user.id);
    console.log("Budget data:", req.body);
    
    // Calculate current spending for the category
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const expenses = await Transaction.find({
      user: req.user.id,
      category: req.body.category,
      type: "expense",
      date: {
        $gte: new Date(currentYear, currentMonth, 1),
        $lt: new Date(currentYear, currentMonth + 1, 1)
      }
    });
    
    const currentSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    const budget = new Budget({
      ...req.body,
      user: req.user.id,
      currentSpent
    });
    
    console.log("Saving budget:", budget);
    await budget.save();
    console.log("Budget saved successfully");
    res.status(201).json(budget);
  } catch (err) {
    console.error("Error creating budget:", err);
    res.status(500).json({ message: err.message });
  }
});

// @route PUT /api/budgets/:id
// @desc Update a budget
router.put("/:id", auth, async (req, res) => {
  try {
    const budget = await Budget.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true }
    );
    
    if (!budget) {
      return res.status(404).json({ message: "Budget not found" });
    }
    
    res.json(budget);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route DELETE /api/budgets/:id
// @desc Delete a budget
router.delete("/:id", auth, async (req, res) => {
  try {
    const budget = await Budget.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });
    
    if (!budget) {
      return res.status(404).json({ message: "Budget not found" });
    }
    
    res.json({ message: "Budget deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
