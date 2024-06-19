require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors'); // Add cors middleware
const surveyRoutes = require('./src/routes/surveyRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for your Replit app
app.use(cors()); 

app.use(bodyParser.json());
app.use('/api/surveys', surveyRoutes);

// MongoDB Atlas connection string
const mongoURI = 'mongodb+srv://brewedinsights:Johnmayer01%21@omnivia.k7suy4j.mongodb.net/surveyDB?retryWrites=true&w=majority&appName=Omnivia';

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.log(err));

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});