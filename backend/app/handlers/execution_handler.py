from sqlalchemy.orm import Session
from datetime import datetime

from app.models import models
from app.models.models import ExecutionStatus
from app.constants import NodeTypes
from app.external_services.gemini_client import GeminiClient
from app.utils.database import get_db
from app.utils.exceptions import MissingStartNodeError, InvalidNodeInputError
from app.utils.logger import logger

class ExecutionHandler:
    def __init__(self):
        self.gemini_client = GeminiClient()

    def create_execution_entry(self, db: Session, workflow_id: int):
        db_execution = models.Execution(workflow_id=workflow_id, status=ExecutionStatus.PENDING, updated_at=datetime.utcnow(), )
        db.add(db_execution)
        db.commit()
        db.refresh(db_execution)
        return db_execution

    def run_workflow(self, workflow_id: int, execution_id: int):
        db = next(get_db())
        try:
            workflow = db.query(models.Workflow).get(workflow_id)
            execution = db.query(models.Execution).get(execution_id)

            if not workflow or not execution:
                logger.error(f"Workflow or Execution not found in background task. WF_ID: {workflow_id}, EXEC_ID: {execution_id}")
                return

            execution.status = ExecutionStatus.RUNNING
            db.commit()
        
            node_map = {}
            for node in workflow.nodes:
                node_id = node.get('id')
                node_map[node_id] = node
                logger.info(f"Added node to map: {node_id} -> {node}")
        
            edge_map = {edge['source']: edge['target'] for edge in workflow.edges}
        
            all_targets = {edge['target'] for edge in workflow.edges}
            start_node_id = next((nid for nid in node_map if nid not in all_targets), None)

            if not start_node_id:
                raise MissingStartNodeError("Could not find a starting node.")

            current_node_id = start_node_id
            current_data = None
            results = {}

            logger.info(f"Starting workflow execution with start node: {start_node_id}")

            while current_node_id:
                node = node_map[current_node_id]
                node_type = node.get('type')
                
                logger.info(f"Executing node {current_node_id} of type {node_type}")

                if node_type == NodeTypes.TEXT_INPUT:
                    current_data = node.get('data', {}).get('text', '')
                    logger.info(f"Text input node result: {current_data}")
                elif node_type == NodeTypes.GEMINI_PROMPT:
                    if not isinstance(current_data, str) or not current_data:
                        raise InvalidNodeInputError(f"Input for Gemini node must be a non-empty string. Got: {current_data}")
                    prompt = current_data
                    current_data = self.gemini_client.generate_text(prompt)
                    logger.info(f"Gemini node result: {current_data}")
                elif node_type == NodeTypes.OUTPUT:
                    logger.info(f"Output node result: {current_data}")
                else:
                    logger.warning(f"Unknown node type: {node_type}, skipping processing")
                
                results[current_node_id] = current_data
                logger.info(f"Stored result for {current_node_id}: {current_data}")
                
                # Move to next node
                next_node_id = edge_map.get(current_node_id)
                logger.info(f"Next node: {next_node_id}")
                current_node_id = next_node_id

            logger.info(f"Final results: {results}")
            execution.status = ExecutionStatus.COMPLETED
            execution.results = results
            
        except Exception as e:
            execution = db.query(models.Execution).get(execution_id)
            error_message = getattr(e, 'detail', str(e))
            logger.error(f"Workflow execution failed for execution ID {execution.id}: {error_message}", exc_info=True)
            execution.status = ExecutionStatus.FAILED
            execution.results = {"error": str(e)}
        finally:
            db.commit()
            db.close()
            logger.info(f"Finished execution for workflow {workflow_id}, execution {execution_id}.")

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