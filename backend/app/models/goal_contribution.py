from sqlalchemy import Column, Integer, Numeric, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class GoalContribution(Base):
    """
    Logs each individual contribution to a savings goal, so we can chart
    contributions over time. SavingsGoal.current_amount remains the fast
    running total (unchanged) -- this table is purely additive history.
    """
    __tablename__ = "goal_contributions"

    id = Column(Integer, primary_key=True, index=True)
    goal_id = Column(Integer, ForeignKey("savings_goals.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    amount = Column(Numeric(12, 2), nullable=False)
    contributed_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    goal = relationship("SavingsGoal", backref="contributions")