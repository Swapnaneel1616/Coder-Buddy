from langchain_groq import ChatGroq
import os
from dotenv import load_dotenv
from pydantic import BaseModel
load_dotenv() 


user_prompt = "Create a simple calculator web application"



prompt = f"""
You are a Planner agent . Convert the user prompt into a Complete engineering project plan

User request: {user_prompt}"""






class Plan(BaseModel):
    price:float
    eps:float

llm = ChatGroq(model="openai/gpt-oss-120b")

resp = llm.with_structured_output(Schema).invoke("Extract Price and EPS from this"
                                                 "Nvidea's stock price is $500 and its EPS is $10.")

print(resp)