from fastapi import Request
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.orm import Session

from app.utils.database import get_db
from app.models import models
from app.config import settings

oauth2_schema = OAuth2PasswordBearer(tokenUrl='auth/token')

async def auth_middleware(request: Request, call_next):
    token = None
    authorization: str = request.headers.get("Authorization")

    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]

    if token:
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
            email: str = payload.get("sub")
            if email:
                db: Session = next(get_db())
                user = db.query(models.User).filter(models.User.email == email).first()
                if user:
                    request.state.user = user
        except JWTError:
            request.state.user = None
    else:
        request.state.user = None

    response = await call_next(request)
    return response