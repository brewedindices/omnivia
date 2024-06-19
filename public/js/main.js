// Burger menus

const { db } = require('replit');

const express = require('express');
const app = express();
const { db } = require('replit'); // Import Replit DB

app.use(express.json()); // Enable parsing JSON request bodies

// Helper function to generate unique survey IDs
function generateSurveyId() {
  return 'survey_' + Math.random().toString(36).substring(2, 15);
}

// API endpoint to create a new survey
app.post('/create-survey', async (req, res) => {
  try {
    const surveyId = generateSurveyId(); 
    const surveyData = {
      surveyId: surveyId, 
      title: req.body.title,
      questions: req.body.questions,
      cohortData: req.body.cohortData, 
      createdAt: Date.now(), // Timestamp for sorting
      responses: [] // Initialize an empty array for responses
    };

    db[surveyId] = surveyData; 

    res.status(200).json({ surveyId: surveyId }); 
  } catch (error) {
    console.error('Error creating survey:', error);
    res.status(500).json({ error: 'Failed to create survey.' });
  }
});

// API endpoint to get all surveys for the user (you'll likely need user authentication in the future)
app.get('/get-surveys', async (req, res) => {
  try {
    // Assuming you have user authentication and can get userId
    const userId = req.user.id; // Replace with your auth logic
    const userSurveys = Object.values(db).filter(survey => survey.userId === userId);
    // Sort surveys by createdAt (most recent first)
    userSurveys.sort((a, b) => b.createdAt - a.createdAt); 
    res.status(200).json(userSurveys);
  } catch (error) {
    console.error('Error fetching surveys:', error);
    res.status(500).json({ error: 'Failed to fetch surveys.' });
  }
});

// API endpoint to get a specific survey by ID
app.get('/get-survey/:surveyId', async (req, res) => {
  try {
    const surveyId = req.params.surveyId;
    const surveyData = db[surveyId];
    if (!surveyData) {
      return res.status(404).json({ error: 'Survey not found.' });
    }
    res.status(200).json(surveyData);
  } catch (error) {
    console.error('Error fetching survey:', error);
    res.status(500).json({ error: 'Failed to fetch survey.' });
  }
});

// API endpoint to submit a survey response
app.post('/submit-response/:surveyId', async (req, res) => {
  try {
    const surveyId = req.params.surveyId;
    const response = req.body.response; 
    
    const surveyData = db[surveyId]; 

    if (!surveyData) {
      return res.status(404).json({ error: 'Survey not found.' });
    }

    surveyData.responses.push({
      answer: response,
      createdAt: Date.now() 
    });

    db[surveyId] = surveyData; // Update the survey in the database

    res.status(200).json({ message: 'Response submitted successfully.' });
  } catch (error) {
    console.error('Error submitting response:', error);
    res.status(500).json({ error: 'Failed to submit response.' });
  }
});

// API endpoint to get survey results
app.get('/get-survey-results/:surveyId', async (req, res) => {
  try {
    const surveyId = req.params.surveyId;
    const surveyData = db[surveyId];
    if (!surveyData) {
      return res.status(404).json({ error: 'Survey not found.' });
    }

    // Calculate and aggregate results 
    const aggregatedResults = {};
    const totalResponses = {}; // Tracks total responses for each question

    surveyData.questions.forEach((question, questionIndex) => {
      aggregatedResults[questionIndex] = {}; // Initialize for each question
      totalResponses[questionIndex] = 0; 

      question.options.forEach((option, optionIndex) => {
        aggregatedResults[questionIndex][optionIndex] = 0; // Initialize each option count
      });

      surveyData.responses.forEach(response => {
        const chosenOptionIndex = question.options.indexOf(response.answer); 
        if (chosenOptionIndex !== -1) {
          aggregatedResults[questionIndex][chosenOptionIndex]++;
          totalResponses[questionIndex]++;
        }
      });
    });

    // Example basic insights (you can expand on this)
    let keyInsights = 'No significant insights yet.';
    // ... Add your logic to generate more meaningful insights based on aggregatedResults ...

    // Calculate participation rate
    const estimatedCohortSize = surveyData.cohortData.numBots; // Replace with your cohort estimation logic
    const participationRate = (totalResponses[0] / estimatedCohortSize) * 100; 

    res.status(200).json({
      surveyData: surveyData, 
      aggregatedResults: aggregatedResults,
      totalResponses: totalResponses,
      participationRate: participationRate.toFixed(2), 
      keyInsights: keyInsights
    });

  } catch (error) {
    console.error('Error getting survey results:', error);
    res.status(500).json({ error: 'Failed to get survey results.' });
  }
});


document.addEventListener('DOMContentLoaded', function() {
  const questionTable = document.getElementById('questionTable').getElementsByTagName('tbody')[0];
  const addQuestionBtn = document.getElementById('addQuestionBtn');
  const questionRowTemplate = document.querySelector('.question-row');

  addQuestionBtn.addEventListener('click', function() {
    const newRow = document.createElement('tr');
    newRow.classList.add('bg-white', 'question-row');
    newRow.innerHTML = `
      <td class="px-2 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
        <input type="text" class="border rounded-md p-2 w-full" placeholder="Enter question">
      </td>
      <td class="px-2 py-4 whitespace-nowrap text-sm text-gray-500">
        <input type="text" class="border rounded-md p-2 w-full" placeholder="Option A">
      </td>
      <td class="px-2 py-4 whitespace-nowrap text-sm text-gray-500">
        <input type="text" class="border rounded-md p-2 w-full" placeholder="Option B">
      </td>
      <td class="px-2 py-4 whitespace-nowrap text-sm text-gray-500">
        <input type="text" class="border rounded-md p-2 w-full" placeholder="Option C">
      </td>
      <td class="px-2 py-4 whitespace-nowrap text-sm text-gray-500">
        <input type="text" class="border rounded-md p-2 w-full" placeholder="Option D">
      </td>
      <td class="px-2 py-4 text-right">
        <button class="text-red-500 hover:text-red-700 focus:outline-none remove-row-btn">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewbox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 011.414 0L10 8.586l4.293-4.293a1 1 111.414 1.414L11.414 10l4.293 4.293a1 1 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 01-1.414-1.414L8.586 10 4.293 5.707a1 1 010-1.414z" clip-rule="evenodd"></path>
          </svg>
        </button>
      </td>
    `;

    questionTable.querySelector('tbody').appendChild(newRow);
    attachRemoveEvent(newRow.querySelector('.remove-row-btn'));
  });

  function attachRemoveEvent(button) {
    button.addEventListener('click', function() {
      const row = this.closest('tr');
      row.remove();
    });
  }

  // Attach the remove event to existing rows
  document.querySelectorAll('.remove-row-btn').forEach(button => {
    attachRemoveEvent(button);

  function addQuestionRow() {
      const newRow = questionRowTemplate.cloneNode(true);
      const removeBtn = newRow.querySelector('.remove-row-btn');
      removeBtn.classList.remove('hidden');
      newRow.querySelector('input[placeholder="Enter question"]').value = '';
      removeBtn.addEventListener('click', function() {
          questionTable.removeChild(newRow);
      });
      questionTable.appendChild(newRow);
  }

  addQuestionBtn.addEventListener('click', addQuestionRow);
});

document.addEventListener('DOMContentLoaded', function() {
    // open
    const burger = document.querySelectorAll('.navbar-burger');
    const menu = document.querySelectorAll('.navbar-menu');
    

    if (burger.length && menu.length) {
        for (var i = 0; i < burger.length; i++) {
            burger[i].addEventListener('click', function() {
                for (var j = 0; j < menu.length; j++) {
                    menu[j].classList.toggle('hidden');
                }
            });
        }
    }

    // close
    const close = document.querySelectorAll('.navbar-close');
    const backdrop = document.querySelectorAll('.navbar-backdrop');

    if (close.length) {
        for (var i = 0; i < close.length; i++) {
            close[i].addEventListener('click', function() {
                for (var j = 0; j < menu.length; j++) {
                    menu[j].classList.toggle('hidden');
                }
            });
        }
    }

    if (backdrop.length) {
        for (var i = 0; i < backdrop.length; i++) {
            backdrop[i].addEventListener('click', function() {
                for (var j = 0; j < menu.length; j++) {
                    menu[j].classList.toggle('hidden');
                }
            });
        }
    }
});

const submitSurveyBtn = document.getElementById('submitSurveyBtn');

submitSurveyBtn.addEventListener('click', function() {
  // Show loading indicator
  submitSurveyBtn.disabled = true;
  submitSurveyBtn.innerHTML = '<span class="spinner"></span> Submitting...';

  try {
        // Get the form data
        const surveyTitle = document.getElementById('surveyTitle').value;
        const cohortId = document.getElementById('cohortId').value;
        const genderRatio = document.getElementById('genderRatio').value;
        const minAge = document.getElementById('minAge').value;
        const maxAge = document.getElementById('maxAge').value;
        const minIncome = document.getElementById('minIncome').value;
        const maxIncome = document.getElementById('maxIncome').value;
        const locationType = document.getElementById('locationType').value;
        const location = document.getElementById('location').value;
        const numBots = document.getElementById('numBots').value;

        // Create the survey data object
        const surveyData = {
          title: surveyTitle,
          cohort: {
            id: cohortId,
            genderRatio: parseFloat(genderRatio),
            ageRange: [parseInt(minAge), parseInt(maxAge)],
            incomeMin: parseInt(minIncome),
            incomeMax: parseInt(maxIncome),
            locationType: locationType,
            location: location
          },
          questions: questions
        };

        // Send the survey data to the server
        axios.post('/create-survey', surveyData)
            .then(function(response) {
              console.log(response.data);
              // Handle successful response
              const surveyId = response.data.survey_id; // Get the surveyId from the response

              // Prompt the user for the number of bots
              const numBots = prompt('Enter the number of bots to simulate:');

              // Send the second request with surveyId and numBots
              axios.post(`/run-survey/${surveyId}`, { num_bots: numBots, surveyData })
                .then(function(response) {
                  console.log(response.data);
                  // Handle successful response (e.g., redirect to a success page)
                })
                .catch(function(error) {
                  console.error(error);
                  // Handle error (e.g., display an error message)
                });
            })
            .catch(function(error) {
              console.error(error);
              // Handle error (e.g., display an error message)
            });
        } catch (error) {
          // Handle error
          console.error('Error creating survey:', error);
          alert('An error occurred while creating the survey.');
        } finally {
          // Hide loading indicator
          submitSurveyBtn.disabled = false;
          submitSurveyBtn.innerHTML = 'Submit Survey';
        }
      });

document.addEventListener('DOMContentLoaded', function() {
    const addQuestionBtn = document.getElementById('addQuestionBtn');
    const questionTable = document.getElementById('questionTable');
  
    addQuestionBtn.addEventListener('click', function() {
      const newRow = document.createElement('tr');
      newRow.classList.add('bg-white', 'question-row');
  
      const questionCell = document.createElement('td');
      questionCell.classList.add('px-2', 'py-4', 'whitespace-nowrap', 'text-sm', 'font-medium', 'text-gray-900');
      const questionInput = document.createElement('input');
      questionInput.type = 'text';
      questionInput.classList.add('border', 'rounded-md', 'p-2', 'w-full');
      questionInput.placeholder = 'Enter question';
      questionCell.appendChild(questionInput);
      newRow.appendChild(questionCell);
  
      for (let i = 0; i < 4; i++) {
        const optionCell = document.createElement('td');
        optionCell.classList.add('px-2', 'py-4', 'whitespace-nowrap', 'text-sm', 'text-gray-500');
        const optionInput = document.createElement('input');
        optionInput.type = 'text';
        optionInput.classList.add('border', 'rounded-md', 'p-2', 'w-full');
        optionInput.placeholder = `Option ${String.fromCharCode(65 + i)}`;
        optionCell.appendChild(optionInput);
        newRow.appendChild(optionCell);
      }
  
      const removeCell = document.createElement('td');
      removeCell.classList.add('px-2', 'py-4', 'text-right');
      const removeBtn = document.createElement('button');
      removeBtn.classList.add('text-red-500', 'hover:text-red-700', 'focus:outline-none', 'remove-row-btn');
      const removeSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      removeSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      removeSvg.classList.add('h-5', 'w-5');
      removeSvg.setAttribute('viewBox', '0 0 20 20');
      removeSvg.setAttribute('fill', 'currentColor');
      const removePath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      removePath.setAttribute('fill-rule', 'evenodd');
      removePath.setAttribute('d', 'M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z');
      removePath.setAttribute('clip-rule', 'evenodd');
      removeSvg.appendChild(removePath);
      removeBtn.appendChild(removeSvg);
      removeCell.appendChild(removeBtn);
      newRow.appendChild(removeCell);
  
      questionTable.querySelector('tbody').appendChild(newRow);
  
      // Add event listener for the remove button
      removeBtn.addEventListener('click', function() {
        const row = this.closest('tr');
        row.remove();
      });
    });
  
    // Add event listener for existing remove buttons
    const existingRemoveBtns = document.querySelectorAll('.remove-row-btn');
    existingRemoveBtns.forEach(function(btn) {
      btn.addEventListener('click', function() {
        const row = this.closest('tr');
        row.remove();
      });
    });

    // Get the questions and options
    const questionRows = document.querySelectorAll('.question-row');
    const questions = [];

    questionRows.forEach(function(row) {
      const questionText = row.querySelector('input').value;
      const options = [];

      const optionInputs = row.querySelectorAll('input');
      optionInputs.forEach(function(input, index) {
        if (index > 0) {
          options.push(input.value);
        }
      });

      questions.push({
        text: questionText,
        options: options
      });
    });
  });
});

function updateRemainingAgents() {
  // Make an AJAX request to fetch the user's remaining AI agents from the server
  axios.get('/get-remaining-agents')
    .then(function(response) {
      const remainingAgents = response.data.remaining_agents;
      document.getElementById('remainingAgents').textContent = remainingAgents;
    })
    .catch(function(error) {
      console.error(error);
    });
}

// Call the updateRemainingAgents function when the page loads
document.addEventListener('DOMContentLoaded', function() {
  updateRemainingAgents();
});

let surveys = [];

function saveSurvey() {
  const surveyTitle = document.getElementById('surveyTitle').value;
  const questions = Array.from(document.querySelectorAll('.question-row')).map(row => ({
    text: row.querySelector('input[type="text"]').value,
    options: Array.from(row.querySelectorAll('input[type="text"]:not(:first-child)')).map(input => input.value)
  }));
  const cohortId = document.getElementById('cohortId').value;
  const genderRatio = genderRatioSlider.noUiSlider.get();
  const ageRange = ageRangeSlider.noUiSlider.get();
  const incomeRange = incomeRangeSlider.noUiSlider.get();
  const locationType = document.getElementById('locationType').value;
  const location = Array.from(document.getElementById('location').options)
                        .filter(option => option.selected)
                        .map(option => option.value);

  const survey = {
    title: surveyTitle,
    questions,
    demographics: {
      cohortId,
      genderRatio,
      ageRange,
      incomeRange,
      locationType,
      location
    }
  };

  surveys.push(survey);
  localStorage.setItem('surveys', JSON.stringify(surveys));
}

document.querySelector('.submit-survey-btn').addEventListener('click', saveSurvey);

document.getElementById('survey-form').addEventListener('submit', async (event) => {
  event.preventDefault();

  const title = document.querySelector('input[name="surveyTitle"]').value;
  const questions = Array.from(document.querySelectorAll('.question-row')).map(row => ({
      question: row.querySelector('input[placeholder="Enter question"]').value,
      options: [
          row.querySelector('input[placeholder="Option A"]').value,
          row.querySelector('input[placeholder="Option B"]').value,
          row.querySelector('input[placeholder="Option C"]').value,
          row.querySelector('input[placeholder="Option D"]').value,
      ]
  }));
  const cohortId = document.querySelector('input[name="cohortId"]').value;
  const numberOfAIAgents = document.querySelector('input[name="numberOfAIAgents"]').value;
  const genderRatio = document.querySelector('input[name="genderRatio"]').value;
  const minAge = document.querySelector('input[name="minAge"]').value;
  const maxAge = document.querySelector('input[name="maxAge"]').value;
  const minIncome = document.querySelector('input[name="minIncome"]').value;

  const surveyData = {
      title,
      questions,
      cohortId,
      numberOfAIAgents,
      genderRatio,
      minAge,
      maxAge,
      minIncome
  };

  try {
      const response = await fetch('/api/surveys', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify(surveyData),
      });

      if (!response.ok) {
          throw new Error('Network response was not ok');
      }

      const responseData = await response.json();
      console.log('Survey created successfully:', responseData);
  } catch (error) {
      console.error('Error creating survey:', error);
  }
});


app.listen(3000, () => {
  console.log('Server listening on port 3000');
}); 
