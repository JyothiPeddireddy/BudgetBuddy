from sqlalchemy import Column, Integer, String, Numeric, Date, Text, ForeignKey, CheckConstraint
from sqlalchemy.orm import relationship
from app.database import Base

class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    category = Column(String(100), nullable=False)
    amount = Column(Numeric(12, 2), nullable=False)
    description = Column(Text, nullable=True)
    date = Column(Date, nullable=False)

    __table_args__ = (
        CheckConstraint("amount >= 0", name="expenses_amount_check"),
    )

    owner = relationship("User", back_populates="expenses")