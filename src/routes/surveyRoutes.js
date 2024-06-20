const express = require('express');
const router = express.Router();
const Survey = require('../models/Survey'); // Make sure this path is correct

router.post('/', async (req, res) => {
  const surveyData = req.body; 

  try {
    const survey = new Survey(surveyData);
    const savedSurvey = await survey.save();
    console.log("Survey saved to MongoDB:", savedSurvey); // Log for debugging
    res.status(200).json(savedSurvey); // Send back the saved survey
  } catch (err) {
    console.error("Error saving survey:", err); // More detailed error logging
    res.status(500).json({ message: "Failed to create survey." }); // More user-friendly
  }
});

module.exports = router;