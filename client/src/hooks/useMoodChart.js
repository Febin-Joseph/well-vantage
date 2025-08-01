import { useMemo } from "react"

export const useMoodChart = (moodEntries, viewMode) => {
  const chartData = useMemo(() => {
    if (!moodEntries) moodEntries = []

    const moodValues = {
      happy: 5,
      content: 4,
      neutral: 3,
      stressed: 2,
      sad: 1,
      angry: 0,
    }

    const activities = ["daily-checkin", "after-meditation", "after-workout"]
    const colors = ["#10B981", "#F59E0B", "#DC2626"]

    const daysOfWeek = ["M", "T", "W", "T", "F", "S", "S"]
    
    const datasets = activities.map((activity, index) => {
      const activityEntries = moodEntries.filter((entry) => entry.activity === activity)
      
      const today = new Date()
      const currentDayOfWeek = today.getDay()
      const daysSinceMonday = currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1
      const mondayOfThisWeek = new Date(today)
      mondayOfThisWeek.setDate(today.getDate() - daysSinceMonday)
      
      const data = daysOfWeek.map((day, dayIndex) => {
        const targetDate = new Date(mondayOfThisWeek)
        targetDate.setDate(mondayOfThisWeek.getDate() + dayIndex)
        
        const entryForDay = activityEntries.find(entry => {
          const entryDate = new Date(entry.date)
          const entryDateOnly = new Date(entryDate.getFullYear(), entryDate.getMonth(), entryDate.getDate())
          const targetDateOnly = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate())
          return entryDateOnly.getTime() === targetDateOnly.getTime()
        })
        
        return {
          x: day,
          y: entryForDay ? moodValues[entryForDay.mood] : null,
        }
      })

      return {
        label: activity.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase()),
        data: data,
        borderColor: colors[index],
        backgroundColor: colors[index] + "20",
        tension: 0.4,
        borderWidth: 3,
        pointRadius: 6,
        pointHoverRadius: 8,
        spanGaps: true,
        pointBackgroundColor: colors[index],
        pointBorderColor: colors[index],
      }
    })

    return { datasets }
  }, [moodEntries, viewMode])

  const chartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 5,
          position: "left",
          ticks: {
            callback: (value) => {
              const emojis = ["😠", "😢", "😰", "😐", "😌", "😊"]
              return emojis[value] || ""
            },
            font: {
              size: 16,
            },
            padding: 10,
          },
          grid: {
            display: false,
          },
        },
        y1: {
          beginAtZero: true,
          max: 5,
          position: "right",
          ticks: {
            callback: (value) => {
              const labels = ["Angry", "Sad", "Stressed", "Neutral", "Content", "Happy"]
              return labels[value] || ""
            },
            font: {
              size: 12,
              weight: "500",
            },
            padding: 10,
          },
          grid: {
            display: false,
          },
        },
        x: {
          type: 'category',
          labels: ["M", "T", "W", "T", "F", "S", "S"],
          ticks: {
            font: {
              size: 12,
              weight: "500",
            },
          },
          grid: {
            color: "#f3f4f6",
          },
        },
      },
    }),
    [],
  )

  return { chartData, chartOptions }
};