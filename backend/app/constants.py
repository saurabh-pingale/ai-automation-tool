from enum import Enum

class NodeTypes(str, Enum):
    TEXT_INPUT = "text_input"
    GEMINI_PROMPT = "gemini_prompt" 
    OUTPUT = "output"