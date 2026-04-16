from langchain_groq import ChatGroq
import os
from dotenv import load_dotenv
from pydantic import BaseModel , Field
from prompts import *
from states import *
from langgraph.constants import END
from langgraph.graph import StateGraph
load_dotenv() 




llm = ChatGroq(model="openai/gpt-oss-120b")


def planner_agent(state:dict)->dict:
    users_prompt = state["user_prompt"]
    resp = llm.with_structured_output(Plan).invoke(planner_prompt(user_prompt))

    if resp is None:
        raise ValueError("Planner agent failed to generate a plan.")
    return {"plan":resp}


def architect_agent(state:dict)->dict:
    plan: Plan = state["plan"]
    resp =llm.with_structured_output(TaskPlan).invoke(architect_prompt(plan))
    if resp is None:
        raise ValueError("Architect agent failed to generate a task plan.")
    
    resp.plan = plan
    return {"task_plan":resp}



graph = StateGraph(dict)

graph.add_node("planner", planner_agent)
graph.add_node("architect", architect_agent)
graph.add_edge("planner", "architect")
graph.set_entry_point("planner")

agent = graph.compile()

user_prompt = "Create a simple calculator web application"
result = agent.invoke({"user_prompt": user_prompt})

print(result)