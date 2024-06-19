const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const surveyRoutes = require('./src/routes/surveyRoutes.js'); 

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use('/api/surveys', surveyRoutes);

mongoose.connect('mongodb://localhost:27017/surveyDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch((err) => console.log(err));

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
