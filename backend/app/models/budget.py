from sqlalchemy import Column, Integer, String, Numeric, ForeignKey, CheckConstraint
from sqlalchemy.orm import relationship
from app.database import Base

class Budget(Base):
    __tablename__ = "budgets"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    category = Column(String(100), nullable=False)
    monthly_limit = Column(Numeric(12, 2), nullable=False)
    month_year = Column(String(7), nullable=False)  # NEW — format "2026-08"

    __table_args__ = (
        CheckConstraint("monthly_limit >= 0", name="budgets_monthly_limit_check"),
    )

    owner = relationship("User", back_populates="budgets")