const mongoose = require("mongoose")

const userSchema = new mongoose.Schema(
  {
    googleId: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    avatar: {
      type: String,
    },
    tokenVersion: {
      type: Number,
      default: 0,
    },
    preferences: {
      dailyCalorieGoal: { type: Number, default: 2000 },
      dailyProteinGoal: { type: Number, default: 150 },
      dailyCarbGoal: { type: Number, default: 250 },
      dailyFatGoal: { type: Number, default: 65 },
      waterGoal: { type: Number, default: 2.2 },
    },
  },
  {
    timestamps: true,
  },
)

module.exports = mongoose.model("User", userSchema)