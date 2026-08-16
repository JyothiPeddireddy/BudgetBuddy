from decimal import Decimal
from sqlalchemy.orm import Session
from app.models.savings_goal import SavingsGoal
from app.schemas.savings_goal import SavingsGoalCreate, SavingsGoalUpdate

def create_goal(db: Session, user_id: int, goal_in: SavingsGoalCreate) -> SavingsGoal:
    goal = SavingsGoal(user_id=user_id, **goal_in.model_dump())
    db.add(goal)
    db.commit()
    db.refresh(goal)
    return goal

def get_goals_by_user(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    return (
        db.query(SavingsGoal)
        .filter(SavingsGoal.user_id == user_id)
        .order_by(SavingsGoal.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

def get_goal(db: Session, goal_id: int, user_id: int):
    return (
        db.query(SavingsGoal)
        .filter(SavingsGoal.id == goal_id, SavingsGoal.user_id == user_id)
        .first()
    )

def update_goal(db: Session, goal_id: int, user_id: int, goal_in: SavingsGoalUpdate):
    goal = get_goal(db, goal_id, user_id)
    if not goal:
        return None
    for field, value in goal_in.model_dump(exclude_unset=True).items():
        setattr(goal, field, value)
    db.commit()
    db.refresh(goal)
    return goal

def delete_goal(db: Session, goal_id: int, user_id: int) -> bool:
    goal = get_goal(db, goal_id, user_id)
    if not goal:
        return False
    db.delete(goal)
    db.commit()
    return True

def contribute_to_goal(db: Session, goal_id: int, user_id: int, amount: float):
    """Adds `amount` to current_amount. Returns (goal, previous_amount) or None if not found."""
    goal = get_goal(db, goal_id, user_id)
    if not goal:
        return None
    previous_amount = goal.current_amount
    goal.current_amount = goal.current_amount + Decimal(str(amount))
    if goal.current_amount >= goal.target_amount:
        goal.status = "completed"
    db.commit()
    db.refresh(goal)
    return goal, previous_amount