from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.modules.auth.models import UserModel

class UserRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all(self) -> list[UserModel]:
        return self.db.query(UserModel).order_by(UserModel.id).all()

    def get_by_id(self, user_id: int) -> UserModel | None:
        return self.db.query(UserModel).filter(UserModel.id == user_id).first()

    def get_by_email_or_username(self, identifier: str) -> UserModel:
        return self.db.query(UserModel).filter(
            or_(UserModel.username == identifier, UserModel.email == identifier)
        ).first()

    def get_by_email(self, email: str) -> UserModel:
        return self.db.query(UserModel).filter(UserModel.email == email).first()

    def get_by_username(self, username: str) -> UserModel:
        return self.db.query(UserModel).filter(UserModel.username == username).first()

    def create(self, data: dict) -> UserModel:
        db_user = UserModel(**data)
        self.db.add(db_user)
        return db_user
