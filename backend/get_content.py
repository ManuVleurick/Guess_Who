import wikipediaapi
import requests
import json
import os
from dotenv import load_dotenv
from rapidfuzz import fuzz

load_dotenv()

PROMPT_INFO = """Act like a certain persona, described below. Answer like you are the character. The game is to not out your name or give too obvious answers about yourself. 
The user will have to guess what your name is. Keep your response to 3 sentences max and 2 sentences minimum. 
Answer in context of the question. Answer very specifically as the character and use speech like the character would, considering their time period and personality."""
PROMPT_MSG = """User message: """

def get_persona_info(persona):
    wiki = wikipediaapi.Wikipedia(user_agent='manu.vleurick@gmail.com',language='en')
    page = wiki.page(persona)
    return page.summary


def get_response(msg, persona):
    info = get_persona_info(persona)
    response = requests.post(
    url="https://openrouter.ai/api/v1/chat/completions",
    headers={
        "Authorization": f"Bearer {os.getenv('OPENROUTER_API_KEY','')}",
        "Content-Type": "application/json"
    },
    data=json.dumps({
        "model": os.getenv("MODEL",""), # Optional
        "messages": [
        {
            "role": "user",
            "content": PROMPT_INFO + info + PROMPT_MSG + msg
        }
        ]
    })
    )
    data = response.json()
    content = data["choices"][0]["message"]["content"]
    return content

def trying_guess(msg,persona):
    info = get_persona_info(persona)
    
    score = fuzz.ratio(msg.lower(), persona.lower())
    content = "False"
    if score >= 75:
        content = "True"
    return content
