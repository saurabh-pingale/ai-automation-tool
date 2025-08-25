from fastapi import HTTPException, status, BackgroundTasks, Depends
from sqlalchemy.orm import Session

from app.utils.database import get_db
from app.utils.app_utils import get_app
from app.utils.exceptions import WorkflowNotFoundError, ExecutionNotFoundError

class ExecutionService:
    def __init__(self):
        pass

    def execute_workflow(self, workflow_id: int, user_id: int, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
        app = get_app()

        workflow = app.workflow_handler.get_workflow_by_id(db, workflow_id, user_id)
        if not workflow:
            raise WorkflowNotFoundError()
        
        execution = app.execution_handler.create_execution_entry(db, workflow_id)
        
        background_tasks.add_task(app.execution_handler.run_workflow, workflow_id, execution.id)
        
        return {"message": "Workflow execution started", "execution_id": execution.id}
    
    def get_workflow_executions(self, workflow_id: int, user_id: int, db: Session = Depends(get_db)):
        """Service to get all executions for a specific workflow"""
        app = get_app()
        
        workflow = app.workflow_handler.get_workflow_by_id(db, workflow_id, user_id)
        if not workflow:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Workflow not found")
        
        return app.execution_handler.get_executions_by_workflow_id(db, workflow_id, user_id)

    def get_execution_details(self, execution_id: int, user_id: int, db: Session = Depends(get_db)):
        """Service to get the details of a single execution"""
        app = get_app()
        
        execution = app.execution_handler.get_execution_by_id(db, execution_id, user_id)
        if not execution:
            raise ExecutionNotFoundError()
        
        return execution