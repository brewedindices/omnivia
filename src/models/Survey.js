const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    question: String,
    options: [String],
});

const surveySchema = new mongoose.Schema({
    title: String,
    questions: [questionSchema],
    cohortId: String,
    numberOfAIAgents: Number,
    genderRatio: Number,
    minAge: Number,
    maxAge: Number,
    minIncome: Number,
});

module.exports = mongoose.model('Survey', surveySchema);
