from pydantic import BaseModel, EmailStr, ConfigDict
from typing import List, Optional, Any, Dict
from datetime import datetime

from app.models.models import ExecutionStatus

class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    is_active: bool
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class WorkflowBase(BaseModel):
    name: str
    nodes: List[Dict[str, Any]]
    edges: List[Dict[str, Any]]

class WorkflowCreate(WorkflowBase):
    pass

class Workflow(WorkflowBase):
    id: int
    owner_id: int
    class Config:
        from_attributes = True

class ExecutionBase(BaseModel):
    status: ExecutionStatus
    results: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: datetime

class Execution(ExecutionBase):
    id: int
    workflow_id: int
    
    model_config = ConfigDict(from_attributes=True)

class ExecutionCreate(ExecutionBase):
    pass