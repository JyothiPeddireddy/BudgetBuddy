from sqlalchemy import Column, Integer, String, Boolean
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    role = Column(String, default="student")
    is_verified = Column(Boolean, default=False, nullable=False)   

    profile = relationship("Profile", back_populates="owner", uselist=False)
    expenses = relationship("Expense", back_populates="owner", cascade="all, delete-orphan")
    incomes = relationship("Income", back_populates="owner", cascade="all, delete-orphan")
    budgets = relationship("Budget", back_populates="owner", cascade="all, delete-orphan")
    accounts = relationship("Account", back_populates="owner", cascade="all, delete-orphan")