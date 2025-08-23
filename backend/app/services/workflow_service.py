from sqlalchemy.orm import Session
from fastapi import Depends

from app.models import schemas
from app.utils.database import get_db
from app.utils.app_utils import get_app

class WorkflowService:
    def __init__(self):
        pass

    def create_workflow(self, workflow: schemas.WorkflowCreate, user_id: int, db: Session = Depends(get_db)):
        app = get_app()
        return app.workflow_handler.create_workflow(db, workflow, user_id)

    def get_workflows(self, user_id: int, skip: int, limit: int, db: Session = Depends(get_db)):
        app = get_app
        return app.workflow_handler.get_workflows(db, user_id, skip, limit)