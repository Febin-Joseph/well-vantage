const express = require("express")
const Mood = require("../models/Mood")
const { requireAuth } = require("../middleware/auth")
const { validateMood } = require("../middleware/validation")
const router = express.Router()

/**
 * @swagger
 * /mood:
 *   get:
 *     summary: Get mood entries
 *     description: Retrieves mood tracking entries for the authenticated user, optionally filtered by date range
 *     tags: [Mood Tracking]
 *     security:
 *       - sessionAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/startDate'
 *       - $ref: '#/components/parameters/endDate'
 *     responses:
 *       200:
 *         description: Mood entries retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Mood'
 *             example:
 *               - _id: "507f1f77bcf86cd799439012"
 *                 userId: "507f1f77bcf86cd799439011"
 *                 date: "2024-01-15T10:30:00.000Z"
 *                 mood: "happy"
 *                 activity: "daily-checkin"
 *                 notes: "Feeling great after morning workout"
 *                 createdAt: "2024-01-15T10:30:00.000Z"
 *                 updatedAt: "2024-01-15T10:30:00.000Z"
 *               - _id: "507f1f77bcf86cd799439013"
 *                 userId: "507f1f77bcf86cd799439011"
 *                 date: "2024-01-14T18:00:00.000Z"
 *                 mood: "content"
 *                 activity: "after-meditation"
 *                 notes: "Peaceful evening meditation"
 *                 createdAt: "2024-01-14T18:00:00.000Z"
 *                 updatedAt: "2024-01-14T18:00:00.000Z"
 *       401:
 *         description: User not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/", requireAuth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query
    const query = { userId: req.user._id }

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      }
    }

    const moods = await Mood.find(query).sort({ date: -1 })
    res.json(moods)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

/**
 * @swagger
 * /mood:
 *   post:
 *     summary: Create or update mood entry
 *     description: Creates a new mood entry or updates an existing one for the same date and activity. If an entry already exists for the same date and activity, it will be updated.
 *     tags: [Mood Tracking]
 *     security:
 *       - sessionAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - date
 *               - mood
 *               - activity
 *             properties:
 *               date:
 *                 type: string
 *                 format: date-time
 *                 description: Date and time of the mood entry
 *                 example: "2024-01-15T10:30:00.000Z"
 *               mood:
 *                 type: string
 *                 enum: [happy, content, neutral, stressed, sad, angry]
 *                 description: Mood level
 *                 example: "happy"
 *               activity:
 *                 type: string
 *                 enum: [daily-checkin, after-meditation, after-workout]
 *                 description: Activity context when mood was recorded
 *                 example: "daily-checkin"
 *               notes:
 *                 type: string
 *                 description: Additional notes about the mood
 *                 example: "Feeling great after morning workout"
 *           example:
 *             date: "2024-01-15T10:30:00.000Z"
 *             mood: "happy"
 *             activity: "daily-checkin"
 *             notes: "Feeling great after morning workout"
 *     responses:
 *       200:
 *         description: Mood entry updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Mood'
 *                 - type: object
 *                   properties:
 *                     updated:
 *                       type: boolean
 *                       example: true
 *             example:
 *               _id: "507f1f77bcf86cd799439012"
 *               userId: "507f1f77bcf86cd799439011"
 *               date: "2024-01-15T10:30:00.000Z"
 *               mood: "happy"
 *               activity: "daily-checkin"
 *               notes: "Feeling great after morning workout"
 *               createdAt: "2024-01-15T10:30:00.000Z"
 *               updatedAt: "2024-01-15T10:30:00.000Z"
 *               updated: true
 *       201:
 *         description: Mood entry created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Mood'
 *                 - type: object
 *                   properties:
 *                     updated:
 *                       type: boolean
 *                       example: false
 *             example:
 *               _id: "507f1f77bcf86cd799439012"
 *               userId: "507f1f77bcf86cd799439011"
 *               date: "2024-01-15T10:30:00.000Z"
 *               mood: "happy"
 *               activity: "daily-checkin"
 *               notes: "Feeling great after morning workout"
 *               createdAt: "2024-01-15T10:30:00.000Z"
 *               updatedAt: "2024-01-15T10:30:00.000Z"
 *               updated: false
 *       400:
 *         description: Invalid request data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: User not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/", requireAuth, validateMood, async (req, res) => {
  try {
    const { date, mood, activity, notes } = req.body

    const existingEntry = await Mood.findOne({
      userId: req.user._id,
      activity: activity,
      date: {
        $gte: new Date(new Date(date).setHours(0, 0, 0, 0)),
        $lt: new Date(new Date(date).setHours(23, 59, 59, 999))
      }
    })

    let moodEntry

    if (existingEntry) {
      moodEntry = await Mood.findByIdAndUpdate(
        existingEntry._id,
        {
          mood,
          notes: notes || "",
        },
        { new: true }
      )
      res.status(200).json({ ...moodEntry.toObject(), updated: true })
    } else {
      moodEntry = new Mood({
        userId: req.user._id,
        date: new Date(date),
        mood,
        activity,
        notes: notes || "",
      })

      await moodEntry.save()
      res.status(201).json({ ...moodEntry.toObject(), updated: false })
    }
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

/**
 * @swagger
 * /mood/{id}:
 *   put:
 *     summary: Update mood entry
 *     description: Updates an existing mood entry by ID
 *     tags: [Mood Tracking]
 *     security:
 *       - sessionAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/moodId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - mood
 *             properties:
 *               mood:
 *                 type: string
 *                 enum: [happy, content, neutral, stressed, sad, angry]
 *                 description: Updated mood level
 *                 example: "content"
 *               notes:
 *                 type: string
 *                 description: Updated notes about the mood
 *                 example: "Updated notes about my mood"
 *           example:
 *             mood: "content"
 *             notes: "Updated notes about my mood"
 *     responses:
 *       200:
 *         description: Mood entry updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Mood'
 *             example:
 *               _id: "507f1f77bcf86cd799439012"
 *               userId: "507f1f77bcf86cd799439011"
 *               date: "2024-01-15T10:30:00.000Z"
 *               mood: "content"
 *               activity: "daily-checkin"
 *               notes: "Updated notes about my mood"
 *               createdAt: "2024-01-15T10:30:00.000Z"
 *               updatedAt: "2024-01-15T11:00:00.000Z"
 *       401:
 *         description: User not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Mood entry not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Mood entry not found"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put("/:id", requireAuth, async (req, res) => {
  try {
    const { mood, notes } = req.body

    const moodEntry = await Mood.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { mood, notes },
      { new: true },
    )

    if (!moodEntry) {
      return res.status(404).json({ error: "Mood entry not found" })
    }

    res.json(moodEntry)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

/**
 * @swagger
 * /mood/{id}:
 *   delete:
 *     summary: Delete mood entry
 *     description: Deletes a mood entry by ID
 *     tags: [Mood Tracking]
 *     security:
 *       - sessionAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/moodId'
 *     responses:
 *       200:
 *         description: Mood entry deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *             example:
 *               message: "Mood entry deleted successfully"
 *       401:
 *         description: User not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Mood entry not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Mood entry not found"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const moodEntry = await Mood.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    })

    if (!moodEntry) {
      return res.status(404).json({ error: "Mood entry not found" })
    }

    res.json({ message: "Mood entry deleted successfully" })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

module.exports = router