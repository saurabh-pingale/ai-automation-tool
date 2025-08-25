from fastapi import HTTPException, status

class AppError(HTTPException):
    """Base class for custom application exceptions."""
    def __init__(self, status_code: int, detail: str):
        super().__init__(status_code=status_code, detail=detail)

class InvalidCredentialsError(AppError):
    def __init__(self, detail: str = "Incorrect username or password"):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=detail
        )
        self.headers = {"WWW-Authenticate": "Bearer"}

class EmailAlreadyExistsError(AppError):
    def __init__(self, detail: str = "Email is already registered"):
        super().__init__(status_code=status.HTTP_400_BAD_REQUEST, detail=detail)

class WorkflowNotFoundError(AppError):
    def __init__(self, detail: str = "Workflow not found"):
        super().__init__(status_code=status.HTTP_404_NOT_FOUND, detail=detail)

class ExecutionNotFoundError(AppError):
    def __init__(self, detail: str = "Execution not found"):
        super().__init__(status_code=status.HTTP_404_NOT_FOUND, detail=detail)

class WorkflowExecutionError(AppError):
    def __init__(self, detail: str = "An error occurred during workflow execution"):
        super().__init__(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=detail)

class MissingStartNodeError(WorkflowExecutionError):
    def __init__(self, detail: str = "Workflow has no defined starting point"):
        super().__init__(status_code=status.HTTP_400_BAD_REQUEST, detail=detail)

class InvalidNodeInputError(WorkflowExecutionError):
    def __init__(self, detail: str = "A node received an invalid input type"):
        super().__init__(status_code=status.HTTP_400_BAD_REQUEST, detail=detail)