const express = require('express');
const router = express.Router();
const Survey = require('../models/Survey.js'); // Ensure the model path is correct

// Example route
router.post('/', async (req, res) => {
    try {
        const survey = new Survey(req.body);
        await survey.save();
        res.status(201).send(survey);
    } catch (err) {
        res.status(400).send(err);
    }
});

module.exports = router;
