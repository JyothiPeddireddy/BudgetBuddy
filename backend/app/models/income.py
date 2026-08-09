from sqlalchemy import Column, Integer, String, Numeric, Date, Text, ForeignKey, CheckConstraint
from sqlalchemy.orm import relationship
from app.database import Base

class Income(Base):
    __tablename__ = "income"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    account_id = Column(Integer, ForeignKey("accounts.id", ondelete="SET NULL"), nullable=True)
    source = Column(String(100), nullable=False)
    amount = Column(Numeric(12, 2), nullable=False)
    date = Column(Date, nullable=False)
    notes = Column(Text, nullable=True)

    __table_args__ = (
        CheckConstraint("amount >= 0", name="income_amount_check"),
    )

    owner = relationship("User", back_populates="incomes")
    account = relationship("Account", back_populates="incomes")