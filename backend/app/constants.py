from enum import Enum

class NodeTypes(str, Enum):
    TEXT_INPUT = "textInput"
    TEXT_OUTPUT = "textOutput"
    GEMINI_PROMPT = "geminiPrompt"