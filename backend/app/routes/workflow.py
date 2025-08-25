from fastapi import APIRouter, Depends, HTTPException
from typing import List
from sqlalchemy.orm import Session

from app.models import schemas, models
from app.utils.auth import get_current_user
from app.utils.database import get_db
from app.utils.app_utils import get_app

workflow_router = APIRouter(prefix="/workflow", tags=["workflow"])

@workflow_router.post("/", response_model=schemas.Workflow)
def create_workflow(
    workflow: schemas.WorkflowCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    app = get_app()
    return app.workflow_service.create_workflow(workflow=workflow, user_id=current_user.id, db=db)

@workflow_router.get("/", response_model=List[schemas.Workflow])
def read_workflows(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    app = get_app()
    return app.workflow_service.get_workflows(user_id=current_user.id, skip=skip, limit=limit, db=db)

@workflow_router.get("/{workflow_id}", response_model=schemas.Workflow)
def read_workflow(
    workflow_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    app = get_app()
    workflow = app.workflow_service.get_workflow_by_id(workflow_id=workflow_id, user_id=current_user.id, db=db)
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return workflow

@workflow_router.put("/{workflow_id}", response_model=schemas.Workflow)
def update_workflow(
    workflow_id: int,
    workflow_data: schemas.WorkflowCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    app = get_app()
    workflow = app.workflow_service.update_workflow(
        workflow_id=workflow_id,
        user_id=current_user.id,
        workflow_data=workflow_data,
        db=db
    )
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return workflow