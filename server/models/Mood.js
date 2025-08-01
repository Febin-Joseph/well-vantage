const mongoose = require("mongoose")

const moodSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    mood: {
      type: String,
      enum: ["happy", "content", "neutral", "stressed", "sad", "angry"],
      required: true,
    },
    activity: {
      type: String,
      enum: ["daily-checkin", "after-meditation", "after-workout"],
      required: true,
    },
    notes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
)

moodSchema.index({ userId: 1, date: -1 })
moodSchema.index({ userId: 1, activity: 1, date: 1 }, { unique: true })

module.exports = mongoose.model("Mood", moodSchema)