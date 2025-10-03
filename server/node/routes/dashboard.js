// routes/dashboard.js
const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

// ================================
// Reference existing collection
// ================================
const Transaction = mongoose.models.Transaction || mongoose.model("Transaction", new mongoose.Schema({}, { strict: false }), "transactions");

// ================================
// Helper: get date ranges
// ================================
function getWeekRange(date) {
    const start = new Date(date);
    start.setDate(date.getDate() - date.getDay());
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return { start, end };
}

function getMonthRange(date) {
    const start = new Date(date.getFullYear(), date.getMonth(), 1);
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    end.setHours(23, 59, 59, 999);
    return { start, end };
}

// ================================
// Routes
// ================================

// GET all transactions (optionally filter by userId)
router.get("/transactions", async (req, res) => {
    try {
        const { userId } = req.query;
        const filter = userId ? { user: userId } : {};
        const transactions = await Transaction.find(filter).sort({ date: -1 });
        res.json(transactions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET recent N transactions
router.get("/transactions/recent/:n", async (req, res) => {
    try {
        const { userId } = req.query;
        const n = parseInt(req.params.n) || 5;
        const filter = userId ? { user: userId } : {};
        const transactions = await Transaction.find(filter).sort({ date: -1 }).limit(n);
        res.json(transactions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET weekly summary
router.get("/summary/week", async (req, res) => {
    try {
        const { userId } = req.query;
        const filter = userId ? { user: userId } : {};

        const now = new Date();
        const { start, end } = getWeekRange(now);

        const thisWeek = await Transaction.find({ ...filter, date: { $gte: start, $lte: end } });
        let totalExpense = 0, totalIncome = 0;
        thisWeek.forEach(t => {
            if (t.type === "expense") totalExpense += t.amount;
            else if (t.type === "income") totalIncome += t.amount;
        });

        const lastWeekStart = new Date(start); lastWeekStart.setDate(start.getDate() - 7);
        const lastWeekEnd = new Date(end); lastWeekEnd.setDate(end.getDate() - 7);
        const lastWeek = await Transaction.find({ ...filter, date: { $gte: lastWeekStart, $lte: lastWeekEnd } });
        let lastExpense = 0, lastIncome = 0;
        lastWeek.forEach(t => {
            if (t.type === "expense") lastExpense += t.amount;
            else if (t.type === "income") lastIncome += t.amount;
        });

        res.json({
            this_week: { total_expense: totalExpense, total_income: totalIncome },
            last_week: { total_expense: lastExpense, total_income: lastIncome },
            comparison: {
                expense_diff: totalExpense - lastExpense,
                income_diff: totalIncome - lastIncome
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET monthly summary
router.get("/summary/month", async (req, res) => {
    try {
        const { userId } = req.query;
        const filter = userId ? { user: userId } : {};

        const now = new Date();
        const { start, end } = getMonthRange(now);

        const thisMonth = await Transaction.find({ ...filter, date: { $gte: start, $lte: end } });
        let totalExpense = 0, totalIncome = 0;
        thisMonth.forEach(t => {
            if (t.type === "expense") totalExpense += t.amount;
            else if (t.type === "income") totalIncome += t.amount;
        });

        const lastMonthStart = new Date(start); lastMonthStart.setMonth(start.getMonth() - 1);
        const lastMonthEnd = new Date(end); lastMonthEnd.setMonth(end.getMonth() - 1);
        const lastMonth = await Transaction.find({ ...filter, date: { $gte: lastMonthStart, $lte: lastMonthEnd } });
        let lastExpense = 0, lastIncome = 0;
        lastMonth.forEach(t => {
            if (t.type === "expense") lastExpense += t.amount;
            else if (t.type === "income") lastIncome += t.amount;
        });

        res.json({
            this_month: { total_expense: totalExpense, total_income: totalIncome },
            last_month: { total_expense: lastExpense, total_income: lastIncome },
            comparison: {
                expense_diff: totalExpense - lastExpense,
                income_diff: totalIncome - lastIncome
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET category-wise expense summary
router.get("/summary/category", async (req, res) => {
    try {
        const { userId } = req.query;
        const filter = userId ? { user: userId } : {};

        const transactions = await Transaction.find(filter);
        const summary = {};
        transactions.forEach(t => {
            if (!summary[t.category]) summary[t.category] = 0;
            if (t.type === "expense") summary[t.category] += t.amount;
        });

        res.json({ category_summary: summary });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ================================
// Export router
// ================================
module.exports = router;
