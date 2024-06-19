const express = require('express');
const router = express.Router();
const Survey = require('../models/Survey');

router.post('/', async (req, res) => {
    const survey = new Survey(req.body);
    try {
        const savedSurvey = await survey.save();
        res.json(savedSurvey);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
