from sqlalchemy import Column, Integer, String, Numeric, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class Account(Base):
    __tablename__ = "accounts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    account_name = Column(String(100), nullable=False)
    bank_name = Column(String(100), nullable=True)
    account_type = Column(String(50), nullable=False)  # e.g. "Bank", "Wallet", "Credit Card"
    balance = Column(Numeric(12, 2), nullable=False, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    owner = relationship("User", back_populates="accounts")
    incomes = relationship("Income", back_populates="account")
    expenses = relationship("Expense", back_populates="account")