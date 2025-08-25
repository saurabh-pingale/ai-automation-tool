from datetime import timedelta
from fastapi import Depends
from sqlalchemy.orm import Session

from app.config import settings
from app.utils.auth import create_access_token, verify_password
from app.utils.database import get_db
from app.utils.app_utils import get_app
from app.utils.exceptions import InvalidCredentialsError

class AuthService:
    def __init__(self):
        pass

    def login_for_access_token(self, form_data, db: Session = Depends(get_db)):
        app = get_app()
        user = app.auth_handler.get_user_by_email(db, email=form_data.username)
        if not user or not verify_password(form_data.password, user.hashed_password):
            raise InvalidCredentialsError()
        
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user.email}, expires_delta=access_token_expires
        )
        return {"access_token": access_token, "token_type": "bearer"}