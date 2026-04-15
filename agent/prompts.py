def planner_prompt(user_prompt:str)-> str:
    PLANNER_PROMPT  = f"""
    You are a Planner agent . Convert the user prompt into a Complete engineering project plan

    User request: {user_prompt}"""

    return PLANNER_PROMPT
