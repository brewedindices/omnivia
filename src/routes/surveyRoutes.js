const express = require('express');
const router = express.Router();
const Survey = require('../models/Survey');

router.post('/', async (req, res) => {
    const surveyData = req.body; // Get the data from the request

    // Basic data validation:
    if (!surveyData.title || surveyData.title.trim() === "") {
        return res.status(400).json({ message: "Survey title is required." });
    }
    if (!surveyData.questions || surveyData.questions.length === 0) {
        return res.status(400).json({ message: "Survey must have at least one question." });
    }
    // ... Add more validation checks for cohort data ...

    const survey = new Survey(surveyData);
    try {
        const savedSurvey = await survey.save();
        res.json(savedSurvey);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;