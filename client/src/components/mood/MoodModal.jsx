import { useState } from "react"
import { X } from "lucide-react"

const MoodModal = ({ onClose, onSubmit, selectedDate, isLoading }) => {
  const [selectedMood, setSelectedMood] = useState("")
  const [selectedActivity, setSelectedActivity] = useState("")
  const [notes, setNotes] = useState("")

  const moods = [
    { id: "happy", emoji: "😊", label: "Happy", color: "bg-green-100" },
    { id: "content", emoji: "😌", label: "Content", color: "bg-blue-100" },
    { id: "neutral", emoji: "😐", label: "Neutral", color: "bg-gray-100" },
    { id: "stressed", emoji: "😰", label: "Stressed", color: "bg-yellow-100" },
    { id: "sad", emoji: "😢", label: "Sad", color: "bg-blue-200" },
    { id: "angry", emoji: "😠", label: "Angry", color: "bg-red-100" },
  ]

  const activities = [
    { id: "daily-checkin", label: "Daily Check-in" },
    { id: "after-meditation", label: "After Meditation" },
    { id: "after-workout", label: "After Workout" },
  ]

  const handleSubmit = () => {
    if (selectedMood && selectedActivity) {
      onSubmit({
        mood: selectedMood,
        activity: selectedActivity,
        notes,
      })
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Excellent!</h2>
          <button onClick={onClose} disabled={isLoading}>
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <p className="text-gray-600 mb-6">How are you feeling after workout?</p>

        <div className="grid grid-cols-3 gap-3 mb-6">
          {moods.map((mood) => (
            <button
              key={mood.id}
              onClick={() => setSelectedMood(mood.id)}
              disabled={isLoading}
              className={`p-3 rounded-lg text-center ${mood.color} ${
                selectedMood === mood.id ? "ring-2 ring-green-500" : ""
              } disabled:opacity-50`}
            >
              <div className="text-2xl mb-1">{mood.emoji}</div>
              <div className="text-sm font-medium">{mood.label}</div>
            </button>
          ))}
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Activity Type</label>
          <select
            value={selectedActivity}
            onChange={(e) => setSelectedActivity(e.target.value)}
            disabled={isLoading}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:opacity-50"
          >
            <option value="">Select activity</option>
            {activities.map((activity) => (
              <option key={activity.id} value={activity.id}>
                {activity.label}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            disabled={isLoading}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:opacity-50"
            rows="3"
            placeholder="Add any additional notes..."
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={!selectedMood || !selectedActivity || isLoading}
          className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
          ) : (
            "Save Mood"
          )}
        </button>
      </div>
    </div>
  )
}

export default MoodModal;