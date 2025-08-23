from app.custom_fastapi import CustomFastAPI

def init_services(app: CustomFastAPI):
    """Initiate services in the app state"""
    from app.services.auth_service import AuthService
    from app.services.workflow_service import WorkflowService
    from app.services.execution_service import ExecutionService

    app.auth_service = AuthService()
    app.workflow_service = WorkflowService()
    app.execution_service = ExecutionService()