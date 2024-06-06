// Burger menus
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
            // Handle successful response (e.g., redirect to a success page)
          })
          .catch(function(error) {
            console.error(error);
            // Handle error (e.g., display an error message)
          });

        axios.post(`/run-survey/${surveyId}`, { num_bots: numBots, surveyData })
          .then(function(response) {
            console.log(response.data);
            // Handle successful response (e.g., redirect to a success page)
          })
          .catch(function(error) {
            console.error(error);
            // Handle error (e.g., display an error message)
            if (response.data.success) {
              // Display success message or modal
              alert('Survey created successfully!');
              // Optionally, you can redirect to the survey_results.html page
              // window.location.href = `survey_results.html?id=${response.data.surveyId}`;
            } else {
              // Display error message
              alert(`Error creating survey: ${response.data.message}`);
            }
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
