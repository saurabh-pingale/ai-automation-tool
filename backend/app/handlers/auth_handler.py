from sqlalchemy.orm import Session

from app.models import schemas, models
from app.utils.auth import get_password_hash

class AuthHandler:
    def get_user_by_email(self, db: Session, email: str):
        return db.query(models.User).filter(models.User.email == email).first()

    def create_user(self, db: Session, user: schemas.UserCreate):
        hashed_password = get_password_hash(user.password)
        db_user = models.User(email=user.email, hashed_password=hashed_password)
        db.add(db_user)
        
        db.commit()
        db.refresh(db_user)
        return db_user