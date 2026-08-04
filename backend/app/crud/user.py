from sqlalchemy.orm import Session
from app.models.user import User
from app.core.security import hash_password

def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()

def create_user(db: Session, username: str, email: str, password: str):
    user = User(
        username=username,
        email=email,
        password=hash_password(password),
        is_verified=False,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def mark_user_verified(db: Session, user: User):
    user.is_verified = True
    db.commit()
    db.refresh(user)
    return user