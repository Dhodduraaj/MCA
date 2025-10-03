const express = require("express");
const Transaction = require("../models/Transaction");
const Budget = require("../models/Budget");
const auth = require("../middleware/auth");
const router = express.Router();

// @route GET /api/transactions
// @desc Get all transactions for a user
router.get("/", auth, async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user.id }).sort({ date: -1 });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route POST /api/transactions
// @desc Create a new transaction
router.post("/", auth, async (req, res) => {
  try {
    const transaction = new Transaction({
      ...req.body,
      user: req.user.id
    });
    await transaction.save();
    
    // Update budget spending
    await updateBudgetSpending(req.user.id);
    
    res.status(201).json(transaction);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route PUT /api/transactions/:id
// @desc Update a transaction
router.put("/:id", auth, async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true }
    );
    
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }
    
    // Update budget spending
    await updateBudgetSpending(req.user.id);
    
    res.json(transaction);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route DELETE /api/transactions/:id
// @desc Delete a transaction
router.delete("/:id", auth, async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });
    
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }
    
    // Update budget spending
    await updateBudgetSpending(req.user.id);
    
    res.json({ message: "Transaction deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Helper function to update budget spending
async function updateBudgetSpending(userId) {
  try {
    const budgets = await Budget.find({ user: userId });
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    for (const budget of budgets) {
      const expenses = await Transaction.find({
        user: userId,
        category: budget.category,
        type: "expense",
        date: {
          $gte: new Date(currentYear, currentMonth, 1),
          $lt: new Date(currentYear, currentMonth + 1, 1)
        }
      });
      
      const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
      
      await Budget.findByIdAndUpdate(budget._id, { currentSpent: totalSpent });
    }
  } catch (err) {
    console.error("Error updating budget spending:", err);
  }
}

module.exports = router;
