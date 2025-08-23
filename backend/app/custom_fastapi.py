from fastapi import FastAPI

class CustomFastAPI(FastAPI):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        from app.services.auth_service import AuthService
        from app.services.workflow_service import WorkflowService
        from app.services.execution_service import ExecutionService

        from app.handlers.auth_handler import AuthHandler
        from app.handlers.workflow_handler import WorkflowHandler
        from app.handlers.execution_handler import ExecutionHandler

        self.auth_service = AuthService()
        self.workflow_service = WorkflowService()
        self.execution_service = ExecutionService()

        self.auth_handler = AuthHandler()
        self.workflow_handler = WorkflowHandler()
        self.execution_handler = ExecutionHandler()