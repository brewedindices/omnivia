// controllers/surveyController.js
const Survey = require('../models/Survey.js');

exports.createSurvey = async (req, res) => {
  try {
    const survey = new Survey(req.body);
    await survey.save();
    res.status(201).json(survey);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
