from sqlalchemy.orm import Session
from app.models import models, schemas

class WorkflowHandler:
    def create_workflow(self, db: Session, workflow: schemas.WorkflowCreate, user_id: int):
        db_workflow = models.Workflow(**workflow.dict(), owner_id=user_id)
        db.add(db_workflow)
        db.commit()
        db.refresh(db_workflow)
        return db_workflow

    def get_workflows(self, db: Session, user_id: int, skip: int = 0, limit: int = 100):
        return db.query(models.Workflow).filter(models.Workflow.owner_id == user_id).offset(skip).limit(limit).all()
        
    def get_workflow_by_id(self, db: Session, workflow_id: int, user_id: int):
        return db.query(models.Workflow).filter(models.Workflow.id == workflow_id, models.Workflow.owner_id == user_id).first()