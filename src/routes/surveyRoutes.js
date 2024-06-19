const express = require('express');
const Survey = require('../models/Survey');

const router = express.Router();

// Create a new survey
router.post('/', async (req, res) => {
    try {
        const newSurvey = new Survey(req.body);
        const savedSurvey = await newSurvey.save();
        res.status(201).json(savedSurvey);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;
