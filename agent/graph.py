from langchain_groq import ChatGroq
import os
import json
import time
from concurrent.futures import ThreadPoolExecutor, TimeoutError as FutureTimeoutError
from dotenv import load_dotenv
from prompts import *
from states import *
from tools import *
from langgraph.graph import StateGraph
load_dotenv() 




llm = ChatGroq(
    model=os.getenv("GROQ_MODEL", "openai/gpt-oss-120b"),
    temperature=float(os.getenv("GROQ_TEMPERATURE", "0.5")),
    timeout=float(os.getenv("GROQ_TIMEOUT_SECONDS", "20")),
)
MAX_IMPLEMENTATION_STEPS = int(os.getenv("MAX_IMPLEMENTATION_STEPS", "3"))
LLM_CALL_TIMEOUT_SECONDS = float(os.getenv("LLM_CALL_TIMEOUT_SECONDS", "18"))


def invoke_with_retry(callable_fn, retries: int = 1, base_delay: float = 2.0):
    last_error = None
    for attempt in range(retries):
        executor = ThreadPoolExecutor(max_workers=1)
        try:
            future = executor.submit(callable_fn)
            result = future.result(timeout=LLM_CALL_TIMEOUT_SECONDS)
            executor.shutdown(wait=False, cancel_futures=True)
            return result
        except Exception as exc:
            executor.shutdown(wait=False, cancel_futures=True)
            last_error = exc
            message = str(exc).lower()
            is_timeout = isinstance(exc, FutureTimeoutError) or "timeout" in message
            is_rate_limited = "rate limit" in message or "429" in message
            if not is_timeout and not is_rate_limited:
                raise
            if attempt < retries - 1:
                time.sleep(base_delay * (attempt + 1))
    raise last_error


def planner_agent(state:dict)->dict:
    users_prompt = state["user_prompt"]
    project_files = list_files.run(".")
    try:
        resp = invoke_with_retry(
            lambda: llm.with_structured_output(Plan, method="json_mode").invoke(
                planner_prompt(users_prompt, project_files)
            )
        )
    except Exception:
        resp = Plan(
            name="Generated App",
            description=users_prompt[:200],
            techstack="Python",
            features=["Core functionality"],
            files=[File(path="main.py", purpose="Main application entrypoint")],
        )

    if resp is None:
        raise ValueError("Planner agent failed to generate a plan.")
    return {"plan":resp}


def architect_agent(state:dict)->dict:
    plan: Plan = state["plan"]
    try:
        raw_resp = invoke_with_retry(lambda: llm.invoke(architect_prompt(plan)))
        raw_text = str(raw_resp.content).strip()
        parsed = json.loads(raw_text)
    except Exception:
        fallback_steps = [
            {
                "filepath": file_item.path,
                "task_description": f"Implement {file_item.path} for: {file_item.purpose}",
            }
            for file_item in plan.files
        ]
        resp = TaskPlan(implementation_steps=fallback_steps)
        resp.plan = plan
        return {"task_plan": resp}

    steps = parsed.get("implementation_steps")
    if isinstance(steps, list):
        normalized_steps = []
        for step in steps:
            if not isinstance(step, dict):
                continue
            filepath = step.get("filepath") or step.get("file")
            task_description = step.get("task_description") or step.get("description")
            if filepath and task_description:
                normalized_steps.append(
                    {
                        "filepath": filepath,
                        "task_description": task_description,
                    }
                )
        steps = normalized_steps

    if not steps:
        steps = []
        for item in parsed.get("tasks", []):
            if not isinstance(item, dict):
                continue
            container_file = item.get("file") or item.get("filepath")
            nested = item.get("tasks")
            if isinstance(nested, list):
                for nested_task in nested:
                    if not isinstance(nested_task, dict):
                        continue
                    desc = nested_task.get("description") or nested_task.get("task_description")
                    if container_file and desc:
                        steps.append(
                            {
                                "filepath": container_file,
                                "task_description": desc,
                            }
                        )
            else:
                desc = item.get("description") or item.get("task_description")
                filepath = item.get("filepath") or item.get("file")
                if filepath and desc:
                    steps.append({"filepath": filepath, "task_description": desc})

    if not steps:
        steps = [
            {
                "filepath": file_item.path,
                "task_description": f"Implement {file_item.path} for: {file_item.purpose}",
            }
            for file_item in plan.files
        ]

    steps = steps[:MAX_IMPLEMENTATION_STEPS]
    resp = TaskPlan(implementation_steps=steps)
    if resp is None:
        raise ValueError("Architect agent failed to generate a task plan.")
    
    resp.plan = plan
    return {"task_plan":resp}

def coder_agent(state:dict)->dict:
    """Direct coder agent that writes all planned files in one run."""
    coder_state: CoderState = state.get("coder_state")
    if coder_state is None:
        coder_state = CoderState(task_plan=state["task_plan"], current_step_idx=0)

    steps = coder_state.task_plan.implementation_steps
    while coder_state.current_step_idx < len(steps):
        current_task = steps[coder_state.current_step_idx]
        existing_content = read_file.run(current_task.filepath)
        all_project_files = list_files.run(".")

        system_prompt = coder_system_prompt()
        user_prompt = (
            f"Task: {current_task.task_description}\n"
            f"File: {current_task.filepath}\n"
            f"Current step: {coder_state.current_step_idx + 1}/{len(steps)}\n"
            f"Project files:\n{all_project_files}\n"
            f"Existing content:\n{existing_content}\n"
            "Return ONLY the full updated file content.\n"
            "Do not include markdown fences."
        )

        try:
            result = invoke_with_retry(
                lambda: llm.invoke(
                    [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt},
                    ]
                )
            )
            generated_content = str(result.content).strip()
        except Exception:
            generated_content = existing_content or f"# TODO: Implement {current_task.filepath}\n"

        if generated_content.startswith("```"):
            generated_content = generated_content.strip("`").strip()
            if generated_content.lower().startswith("python") or generated_content.lower().startswith("javascript"):
                generated_content = generated_content.split("\n", 1)[1]

        write_file.run({"path": current_task.filepath, "content": generated_content})
        coder_state.current_file_content = generated_content
        coder_state.current_step_idx += 1

    return {"coder_state": coder_state, "status": "DONE"}



graph = StateGraph(dict)

graph.add_node("planner", planner_agent)
graph.add_node("architect", architect_agent)
graph.add_node("coder", coder_agent)
graph.add_edge("planner", "architect")
graph.add_edge("architect", "coder")
graph.set_entry_point("planner")
agent = graph.compile()



if __name__ == "__main__":
    user_prompt = "Create a good tic tac toe game"
    result = agent.invoke({"user_prompt": user_prompt})

    print(json.dumps(result, default=str, ensure_ascii=True, indent=2))

