import asyncio
from sqlalchemy.orm import Session

from app.models import models
from app.models.models import ExecutionStatus
from app.constants import NodeTypes
from app.external_services.gemini_client import GeminiClient
from app.utils.logger import logger

class ExecutionHandler:
    def __init__(self):
        self.gemini_client = GeminiClient()

    def create_execution_entry(self, db: Session, workflow_id: int):
        db_execution = models.Execution(workflow_id=workflow_id, status=ExecutionStatus.PENDING)
        db.add(db_execution)
        db.commit()
        db.refresh(db_execution)
        return db_execution

    async def run_workflow(self, db: Session, workflow: models.Workflow, execution: models.Execution):
        execution.status = ExecutionStatus.RUNNING
        db.commit()
        
        node_map = {node['id']: node for node in workflow.nodes}
        edge_map = {edge['source']: edge['target'] for edge in workflow.edges}
        
        start_node_id = next((node['id'] for node['id'] in node_map if node['id'] not in {edge['target'] for edge in workflow.edges}), None)
        
        if not start_node_id:
            execution.status = ExecutionStatus.FAILED
            execution.results = {"error": "Could not find a starting node."}
            db.commit()
            return

        current_node_id = start_node_id
        current_data = None
        results = {}

        try:
            while current_node_id:
                node = node_map[current_node_id]
                node_type = node.get('type')
                
                logger.info(f"Executing node {current_node_id} of type {node_type}")

                if node_type == NodeTypes.TEXT_INPUT:
                    current_data = node.get('data', {}).get('text', '')
                elif node_type == NodeTypes.GEMINI_PROMPT:
                    if not isinstance(current_data, str):
                        raise TypeError("Input for Gemini node must be a string.")
                    prompt = current_data
                    current_data = self.gemini_client.generate_text(prompt)
                
                results[current_node_id] = current_data
                current_node_id = edge_map.get(current_node_id)
                await asyncio.sleep(1)

            execution.status = ExecutionStatus.COMPLETED
            execution.results = results
        except Exception as e:
            logger.error(f"Workflow execution failed for execution ID {execution.id}: {e}")
            execution.status = ExecutionStatus.FAILED
            execution.results = {"error": str(e)}
        
        db.commit()

    def get_executions_by_workflow_id(self, db: Session, workflow_id: int, user_id: int):
        """
        Retrieves all executions for a given workflow_id, ensuring the user owns the workflow.
        """
        return (
            db.query(models.Execution)
            .join(models.Workflow)
            .filter(
                models.Execution.workflow_id == workflow_id,
                models.Workflow.owner_id == user_id
            )
            .order_by(models.Execution.created_at.desc())
            .all()
        )

    def get_execution_by_id(self, db: Session, execution_id: int, user_id: int):
        """
        Retrieves a single execution by its ID, ensuring the user owns the parent workflow.
        """
        return (
            db.query(models.Execution)
            .join(models.Workflow)
            .filter(
                models.Execution.id == execution_id,
                models.Workflow.owner_id == user_id
            )
            .first()
        )