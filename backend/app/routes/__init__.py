from app.custom_fastapi import CustomFastAPI

from app.routes.auth import auth_router
from app.routes.workflow import workflow_router
from app.routes.execution import execution_router

def init_routes(app: CustomFastAPI):
    """Initiate routes in the app state"""

    app.include_router(auth_router)
    app.include_router(workflow_router)
    app.include_router(execution_router)