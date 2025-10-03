const mongoose = require("mongoose");

const budgetSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  category: {
    type: String,
    required: true
  },
  monthlyLimit: {
    type: Number,
    required: true,
    min: 0
  },
  currentSpent: {
    type: Number,
    default: 0,
    min: 0
  },
  period: {
    type: String,
    enum: ["monthly", "weekly", "yearly"],
    default: "monthly"
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("Budget", budgetSchema);
