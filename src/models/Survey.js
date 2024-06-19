const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    question: { type: String, required: true },
    options: [{ type: String }]
});

const surveySchema = new mongoose.Schema({
    title: { type: String, required: true },
    questions: [questionSchema],
    cohortId: String,
    numberOfAIAgents: Number,
    genderRatio: Number,
    minAge: Number,
    maxAge: Number,
    minIncome: Number
});

module.exports = mongoose.model('Survey', surveySchema);
