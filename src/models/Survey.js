const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    text: String,
    options: [String],
});

const cohortDataSchema = new mongoose.Schema({
  cohortId: String,
  genderRatio: Number,
  ageRange: [Number], 
  incomeRange: [Number], 
  locationType: String,
  location: [String],
  numBots: Number
});

const surveySchema = new mongoose.Schema({
  title: String,
  questions: [questionSchema],
  cohortData: cohortDataSchema 
});

module.exports = mongoose.model('Survey', surveySchema);