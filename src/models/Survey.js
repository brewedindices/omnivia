// models/Survey.js
const mongoose = require('mongoose');

const optionSchema = new mongoose.Schema({
  optionText: {
    type: String,
    required: true
  }
});

const questionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: true
  },
  options: [optionSchema]
});

const surveySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  questions: [questionSchema],
  cohortId: {
    type: String,
    required: true
  },
  numberOfAIAgents: {
    type: Number,
    required: true
  },
  genderRatio: {
    type: Number,
    required: true
  },
  minAge: {
    type: Number,
    required: true
  },
  maxAge: {
    type: Number,
    required: true
  },
  minIncome: {
    type: Number,
    required: true
  },
  maxIncome: {
    type: Number,
    required: true
  }
});

module.exports = mongoose.model('Survey', surveySchema);
