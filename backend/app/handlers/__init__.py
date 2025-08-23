from app.custom_fastapi import CustomFastAPI

from app.handlers.auth_handler import AuthHandler
from app.handlers.workflow_handler import WorkflowHandler
from app.handlers.execution_handler import ExecutionHandler

def init_handlers(app: CustomFastAPI):
    """Initiate handlers in the app state"""
    app.auth_handler = AuthHandler()
    app.workflow_handler = WorkflowHandler()
    app.execution_handler = ExecutionHandler()