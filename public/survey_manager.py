from crewai import Agent, Task, Crew, Process
import os
import concurrent.futures
from tqdm import tqdm
import time
import math
import random
from flask import Flask, request, jsonify
from replit import db  # Import Replit Database
from datetime import datetime

app = Flask(__name__)

# Environment variables for Groq API Key, model, and base URL
os.environ["OPENAI_API_BASE"] = "https://api.groq.com/openai/v1/chat/completions"
os.environ["OPENAI_MODEL_NAME"] = "llama3-8b-8192"
os.environ["OPENAI_API_KEY"] = "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"

# Subscription tiers and user subscriptions
subscription_tiers = {
    'basic': 10,
    'standard': 50,
    'premium': 100
}

user_subscriptions = {}

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
    """Stores the submitted survey data in the database and generates a unique survey ID."""
    survey_id = str(random.randint(10000, 99999))  # Simple unique ID generation
    db[survey_id] = survey_data 
    return survey_id

def get_survey(survey_id):
    """Retrieves survey data from the database."""
    return db.get(survey_id)

def record_response(survey_id, response_data, persona_id=None):
    """Stores a user's response to a survey in the database."""
    timestamp = datetime.now().isoformat()
    response_key = f"response_{survey_id}_{persona_id}_{response_data['questionId']}"
    response = {
        'surveyId': survey_id,
        'userId': persona_id,
        'questionId': response_data['questionId'],
        'responseContent': response_data['response'],
        'timestamp': timestamp
    }
    db[response_key] = response

def aggregate_responses(survey_id):
    """Aggregates responses for a given survey."""
    responses = db.prefix(f"response_{survey_id}_")
    aggregated_responses = {}

    for response_key, response_data in responses.items():
        question_id = response_data['questionId']
        response_content = response_data['responseContent']

        if question_id not in aggregated_responses:
            aggregated_responses[question_id] = {}

        if response_content not in aggregated_responses[question_id]:
            aggregated_responses[question_id][response_content] = 0

        aggregated_responses[question_id][response_content] += 1

    return aggregated_responses

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

# Placeholder function to get the user's ID
def get_user_id():
    return 'user_123'  # Example user ID

# Placeholder function to get the user's remaining AI agents
def get_user_remaining_agents(user_id):
    return 50  # Example remaining AI agents

def process_response(survey_question, options, response, persona_backstory):
    """Process a single survey response using CrewAI."""
    classify_survey_response = Task(
        description=f"Classify the following survey response for '{survey_question}' with options: {', '.join(options)} \r\nRespond with the option letter only (A, B, C, or D).",
        agent=classifier,
        expected_output="One of the following options: 'A', 'B', 'C', or 'D'"
    )

    record_survey_response = Task(
        description=f"""The response was classified as option {classify_survey_response.output}.
        Record this response for the persona with the following backstory: {persona_backstory} and maintain a running tally.""",
        agent=action_taker,
        expected_output="A record of the survey response and a running tally of the responses."
    )

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
    survey_data = data.get("surveyData")

    user_id = get_user_id()
    max_bots_allowed = 100  # Example subscription limit

    if num_bots > max_bots_allowed:
        return jsonify({'error': 'Requested number of AI agents exceeds your subscription limit.'}), 400

    update_user_remaining_agents(user_id, num_bots)

    bot_responses = {}
    MAX_CONCURRENT_THREADS = 25
    batch_size = MAX_CONCURRENT_THREADS
    num_batches = math.ceil(num_bots / batch_size)

    survey_data = get_survey(survey_id)
    survey_question = survey_data['questions'][0]['text']
    options = survey_data['questions'][0]['options']

    personas = create_personas(survey_data['cohort'], num_bots)

    def execute_crew_for_bot(persona):
        response = random.choice(options)
        backstory = create_persona_backstory(persona, survey_question)
        result = process_response(survey_question, options, response, backstory)
        return persona['id'], result

    for batch_num in range(num_batches):
        start_index = batch_num * batch_size
        end_index = min(start_index + batch_size, num_bots)
        personas_batch = personas[start_index:end_index]

        with concurrent.futures.ThreadPoolExecutor(max_workers=MAX_CONCURRENT_THREADS) as executor:
            futures = [executor.submit(execute_crew_for_bot, persona) for persona in personas_batch]
            for future in tqdm(concurrent.futures.as_completed(futures), total=len(personas_batch), unit="bot", desc=f"Processing batch {batch_num+1}/{num_batches}"):
                persona_id, result = future.result()
                record_response(survey_id, {'response': result['response']}, persona_id)

        time.sleep(1)  

    return jsonify({'message': 'Survey simulated successfully', 'personas': personas})

@app.route('/submit-response/<survey_id>', methods=['POST'])
def submit_response_endpoint(survey_id):
    response_data = request.get_json()
    record_response(survey_id, response_data)  # No need to pass persona_id here
    return jsonify({'message': 'Response submitted successfully!'})

@app.route('/get-remaining-agents', methods=['GET'])
def get_remaining_agents():
    user_id = get_user_id()
    remaining_agents = get_user_remaining_agents(user_id)
    return jsonify({'remaining_agents': remaining_agents})

@app.route('/get-survey-results/<survey_id>', methods=['GET'])
def get_survey_results(survey_id):
    aggregated_responses = aggregate_responses(survey_id)
    return jsonify(aggregated_responses)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
