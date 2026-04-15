from langchain_groq import ChatGroq
import os
from dotenv import load_dotenv
from pydantic import BaseModel , Field
from prompts import *
from states import *
load_dotenv() 


user_prompt = "Create a simple calculator web application"



prompt = planner_prompt(user_prompt)



llm = ChatGroq(model="openai/gpt-oss-120b")

resp = llm.with_structured_output(Plan).invoke(prompt)

print(resp)