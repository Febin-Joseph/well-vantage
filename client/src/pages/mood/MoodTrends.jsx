import { useState } from "react"
import { ArrowLeft, Plus, CalendarIcon, ChevronDown } from "lucide-react"
import { Line } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import toast from "react-hot-toast"
import Calendar from "react-calendar"
import { useAuth } from "../../contexts/AuthContext"
import Navigation from "../../components/layout/Navigation"
import MoodModal from "../../components/mood/MoodModal"
import { moodService } from "../../services/moodService"
import { useMoodChart } from "../../hooks/useMoodChart"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

const MoodTrends = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [showMoodModal, setShowMoodModal] = useState(false)
  const [showCalendar, setShowCalendar] = useState(false)
  const [viewMode, setViewMode] = useState("Week")
  const [displayCount, setDisplayCount] = useState(5)

  const { data: moodEntries = [], isLoading, error } = useQuery({
    queryKey: ["moodEntries"],
    queryFn: () => moodService.getMoodEntries(),
    refetchInterval: 5 * 60 * 1000,
    retry: 2,
    retryDelay: 1000,
  })

  const addMoodMutation = useMutation({
    mutationFn: moodService.addMoodEntry,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["moodEntries"] })
      if (data.updated) {
        toast.success("Mood updated successfully!")
      } else {
        toast.success("Mood added successfully!")
      }
      setShowMoodModal(false)
    },
    onError: () => {
      toast.error("Failed to add mood entry")
    },
  })

  const { chartData, chartOptions } = useMoodChart(moodEntries, viewMode)

  const handleAddMood = (moodData) => {
    addMoodMutation.mutate({
      ...moodData,
      date: selectedDate,
    })
  }

  const handleDateChange = (date) => {
    setSelectedDate(date)
    setShowCalendar(false)
  }

  const formatDate = (dateString) => {
    if (!dateString) return "Unknown date"
    
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return "Invalid date"
    
    const options = {
      weekday: 'long',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }
    return date.toLocaleDateString('en-US', options)
  }

  const handleShowMore = () => {
    setDisplayCount(prev => prev + 5)
  }

  const sortedMoodEntries = [...moodEntries].sort((a, b) => {
    const dateA = new Date(a.createdAt || a.date)
    const dateB = new Date(b.createdAt || b.date)
    return dateB - dateA
  })

  const displayedEntries = sortedMoodEntries.slice(0, displayCount)
  const hasMoreEntries = sortedMoodEntries.length > displayCount

  if (isLoading) {
    return <LoadingSpinner type="skeleton" />
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-lg font-semibold mb-2">Failed to load mood data</div>
          <div className="text-gray-600 mb-4">Please try refreshing the page</div>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white shadow-sm">
        <div className="flex items-center p-4">
          <div className="flex items-center space-x-4">
            <ArrowLeft className="w-6 h-6 text-gray-600" />
            <h1 className="text-xl font-semibold">Mood Trends</h1>
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  !showCalendar ? "bg-white text-gray-900 shadow-sm" : "text-gray-600"
                }`}
                onClick={() => {
                  setShowCalendar(false)
                  setShowMoodModal(true)
                }}
              >
                Mood
              </button>
              <div className="w-px h-6 bg-gray-300 mx-1"></div>
              <button
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  showCalendar ? "bg-white text-gray-900 shadow-sm" : "text-gray-600"
                }`}
                onClick={() => {
                  setShowCalendar(!showCalendar)
                  setShowMoodModal(false)
                }}
              >
                Week
              </button>
            </div>
          </div>

          {showCalendar && (
            <div className="mb-4">
              <Calendar
                onChange={handleDateChange}
                value={selectedDate}
                className="react-calendar w-full"
                tileClassName={({ date }) => {
                  const hasEntry = moodEntries.some(
                    (entry) => new Date(entry.date).toDateString() === date.toDateString(),
                  )
                  return hasEntry ? "bg-green-100 text-green-800" : ""
                }}
              />
            </div>
          )}

          <div className="h-96 bg-gray-50 rounded-lg p-4">
            <Line data={chartData} options={chartOptions} />
          </div>
          

          <div className="flex justify-center space-x-6 mt-4">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className="text-sm font-medium text-gray-700">Daily Check-in</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-orange-500 rounded"></div>
              <span className="text-sm font-medium text-gray-700">After Meditation</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-red-600 rounded"></div>
              <span className="text-sm font-medium text-gray-700">After Workout</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4">
          <h2 className="text-lg font-semibold mb-4">Mood Entries</h2>
          <div className="space-y-3">
            {displayedEntries.map((entry, index) => (
              <div key={entry._id || index} className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium capitalize">
                    {entry.activity.replace("-", " ")}: {entry.mood}
                  </p>
                  <p className="text-sm text-gray-500">{formatDate(entry.createdAt || entry.date)}</p>
                  {entry.notes && <p className="text-sm text-gray-400 mt-1">{entry.notes}</p>}
                </div>
                <div className="text-2xl">
                  {entry.mood === "happy" && "😊"}
                  {entry.mood === "content" && "😌"}
                  {entry.mood === "neutral" && "😐"}
                  {entry.mood === "stressed" && "😰"}
                  {entry.mood === "sad" && "😢"}
                  {entry.mood === "angry" && "😠"}
                </div>
              </div>
            ))}
          </div>
          
          {hasMoreEntries && (
            <div className="mt-4 text-center">
              <button
                onClick={handleShowMore}
                className="flex items-center justify-center w-full py-3 px-4 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <span className="mr-2">Show More</span>
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          )}
          
          {!hasMoreEntries && moodEntries.length > 0 && (
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-500">All entries loaded</p>
            </div>
          )}
        </div>
      </div>

      <Navigation />

      {showMoodModal && (
        <MoodModal
          onClose={() => setShowMoodModal(false)}
          onSubmit={handleAddMood}
          selectedDate={selectedDate}
          isLoading={addMoodMutation.isLoading}
        />
      )}
    </div>
  )
}

export default MoodTrends;