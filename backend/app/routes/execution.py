from fastapi import APIRouter, Depends, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List

from app.models import models, schemas
from app.utils.auth import get_current_user
from app.utils.database import get_db
from app.utils.app_utils import get_app

execution_router = APIRouter(prefix="/execution", tags=["execution"])

@execution_router.post("/workflow/{workflow_id}")
def execute_workflow(
    workflow_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    app = get_app()
    return app.execution_service.execute_workflow(
        workflow_id=workflow_id,
        user_id=current_user.id,
        background_tasks=background_tasks,
        db=db
    )

@execution_router.get("/workflow/{workflow_id}", response_model=List[schemas.Execution])
def get_workflow_executions_list(
    workflow_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Retrieve a list of all executions for a specific workflow owned by the current user.
    """
    app = get_app()
    return app.execution_service.get_workflow_executions(
        workflow_id=workflow_id,
        user_id=current_user.id,
        db=db
    )


@execution_router.get("/{execution_id}", response_model=schemas.Execution)
def get_single_execution_details(
    execution_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Retrieve the details of a single execution, ensuring it belongs to a workflow
    owned by the current user.
    """
    app = get_app()
    return app.execution_service.get_execution_details(
        execution_id=execution_id,
        user_id=current_user.id,
        db=db
    )