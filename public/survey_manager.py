from crewai import Agent, Task, Crew, Process
import os
import concurrent.futures
from tqdm import tqdm
import time
import math
import pandas as pd
import random
from flask import Flask, request, jsonify
from replit import db  # Import Replit Database

app = Flask(__name__)

# ... (Groq API Key, model, and base URL go here) ...
os.environ["OPENAI_API_BASE"] = "https://api.groq.com/openai/v1/chat/completions"
os.environ["OPENAI_MODEL_NAME"] = "llama3-8b-8192"
os.environ["OPENAI_API_KEY"] = "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"

# --- Persona Generation ---

def create_personas(cohort_demographics, num_personas):
    """Creates a list of personas based on cohort demographics."""
    personas = []
    for _ in range(num_personas):
        persona = {
            'id': str(random.randint(100000, 999999)),  # Unique persona ID
            'name': f"User {random.randint(1, 1000)}",  # Placeholder name
            'age': random.randint(cohort_demographics['ageRange'][0], cohort_demographics['ageRange'][1]),
            'gender': random.choices(['Male', 'Female'], weights=[cohort_demographics['genderRatio'] / 100, 1 - (cohort_demographics['genderRatio'] / 100)])[0],
            'income': random.randint(cohort_demographics['incomeMin'], cohort_demographics['incomeMax']),
            # ... (Add other demographics as needed)
        }
        personas.append(persona)
    return personas

def create_persona_backstory(persona, survey_question):
    """Generates a backstory based on the persona and the survey question."""
    backstory = f"""
    You are a {persona['age']} year old {persona['gender']} who earns an income of ${persona['income']:,} per year. 
    You are being asked the following survey question: "{survey_question}"
    """ 
    return backstory

# --- Survey Management Functions ---

def create_survey(survey_data):
    """
    Stores the submitted survey data in the database. 
    Generates a unique survey ID.
    """
    survey_id = str(random.randint(10000, 99999)) # Simple unique ID generation
    db[survey_id] = survey_data 
    return survey_id

def get_survey(survey_id):
    """Retrieves survey data from the database."""
    return db.get(survey_id)

def record_response(survey_id, response_data, persona_id=None):  # Add persona_id (optional)
    """Stores a user's response to a survey in the database."""
    responses_key = f"{survey_id}_responses"
    if responses_key not in db:
        db[responses_key] = []
    db[responses_key].append({'persona_id': persona_id, **response_data}) 


# ---  CrewAI Agents and Tasks ---

# Define the Ticket Classifier Agent
classifier = Agent(
    role="Survey Classifier",
    goal="Classify the survey response into one of the given options.",
    backstory="You are an AI assistant tasked with classifying survey responses into the provided options.",
    verbose=False,
    allow_delegation=False
)

# Define the Ticket Action Agent
action_taker = Agent(
    role="Survey Response Handler",
    goal="Record the survey response and maintain a running tally of the responses.",
    backstory="You are an AI assistant responsible for collecting survey responses and keeping track of the response counts.",
    verbose=False,
    allow_delegation=False
)

def process_response(survey_question, options, response, persona_backstory):
    """Process a single survey response using CrewAI."""
    # Define the Task: Classify the Survey Response
    classify_survey_response = Task(
        description=f"Classify the following survey response for '{survey_question}' with options: {', '.join(options)} \r\nRespond with the option letter only (A, B, C, or D).",
        agent=classifier,
        expected_output="One of the following options: 'A', 'B', 'C', or 'D'"
    )

    # Define the Task: Record and Tally the Survey Response
    record_survey_response = Task(
        description=f"The response was classified as option {classify_survey_response.output}. Record this response and maintain a running tally.",
        agent=action_taker,
        expected_output="A record of the survey response and a running tally of the responses."
    )

    # Update the Task: Record and Tally the Survey Response to include persona_id
    record_survey_response = Task(
        description=f"""The response was classified as option {classify_survey_response.output}.
        Record this response for the persona with the following backstory: {persona_backstory} and maintain a running tally.""",
        agent=action_taker,
        expected_output="A record of the survey response and a running tally of the responses."
    )
    
    # Create the Crew
    crew = Crew(
        agents=[classifier, action_taker],
        tasks=[classify_survey_response, record_survey_response],
        verbose=0,
        process=Process.sequential
    )

    return crew.execute(inputs={'response': response})

# --- API Endpoints --- 

    @app.route('/create-survey', methods=['POST'])
    def create_survey_endpoint():
        survey_data = request.get_json()
        survey_id = create_survey(survey_data)
        return jsonify({'survey_id': survey_id})

    @app.route('/run-survey/<survey_id>', methods=['POST'])
    def run_survey(survey_id):
        data = request.get_json()
        num_bots = int(data.get("num_bots", 10))

        bot_responses = {}
        MAX_CONCURRENT_THREADS = 25
        batch_size = MAX_CONCURRENT_THREADS
        num_batches = math.ceil(num_bots / batch_size)

        # Get the survey from the database
        survey_data = get_survey(survey_id)
        survey_question = survey_data['questions'][0]['text']
        options = survey_data['questions'][0]['options']

        # Create personas based on the cohort demographics from survey data
        personas = create_personas(survey_data['cohort'], num_bots)

        def execute_crew_for_bot(persona):
            # Choose a random response
            response = random.choice(options)
            # Create a persona backstory
            backstory = create_persona_backstory(persona, survey_question)
            # Process the response using CrewAI
            result = process_response(survey_question, options, response, backstory)
            return persona['id'], result

        # Execute the Crew for each bot with personas in batches
        for batch_num in range(num_batches):
            start_index = batch_num * batch_size
            end_index = min(start_index + batch_size, num_bots)
            personas_batch = personas[start_index:end_index]

            with concurrent.futures.ThreadPoolExecutor(max_workers=MAX_CONCURRENT_THREADS) as executor:
                futures = [executor.submit(execute_crew_for_bot, persona) for persona in personas_batch]
                for future in tqdm(concurrent.futures.as_completed(futures), total=len(personas_batch), unit="bot", desc=f"Processing batch {batch_num+1}/{num_batches}"):
                    persona_id, result = future.result()
                    # Record response, associating it with the persona ID
                    record_response(survey_id, {'response': result['response']}, persona_id)

            time.sleep(1)  

        return jsonify({'message': 'Survey simulated successfully', 'personas': personas})

    @app.route('/submit-response/<survey_id>', methods=['POST'])
    def submit_response_endpoint(survey_id):
        response_data = request.get_json()
        record_response(survey_id, response_data)  # No need to pass persona_id here

        # Return a simple acknowledgment for the user
        return jsonify({'message': 'Response submitted successfully!'})

    if __name__ == '__main__':
        app.run(host='0.0.0.0', port=5000)