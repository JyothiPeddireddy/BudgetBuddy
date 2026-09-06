from decimal import Decimal
from sqlalchemy.orm import Session
from app.models.savings_goal import SavingsGoal
from app.models.account import Account
from app.models.goal_contribution import GoalContribution  # <-- NEW
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

    updates = goal_in.model_dump(exclude_unset=True)
    for field, value in updates.items():
        setattr(goal, field, value)

    # Auto-correct status if current/target amount changed
    if "current_amount" in updates or "target_amount" in updates:
        goal.status = "completed" if goal.current_amount >= goal.target_amount else "in_progress"

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

def contribute_to_goal(db: Session, goal_id: int, user_id: int, account_id: int, amount: float):
    """
    Deducts `amount` from the given account's balance and adds it to the goal's current_amount.
    Also logs a GoalContribution row so contribution history can be charted over time.
    Returns "not_found", "invalid_account", "insufficient_funds", or (goal, previous_amount).
    """
    goal = get_goal(db, goal_id, user_id)
    if not goal:
        return "not_found"

    account = db.query(Account).filter(Account.id == account_id, Account.user_id == user_id).first()
    if not account:
        return "invalid_account"

    contribution = Decimal(str(amount))
    if account.balance < contribution:
        return "insufficient_funds"

    previous_amount = goal.current_amount
    account.balance -= contribution
    goal.current_amount = goal.current_amount + contribution
    if goal.current_amount >= goal.target_amount:
        goal.status = "completed"

    # NEW: log this contribution with a timestamp for trend charting
    log_entry = GoalContribution(goal_id=goal.id, user_id=user_id, amount=contribution)
    db.add(log_entry)

    db.commit()
    db.refresh(goal)
    db.refresh(account)
    return goal, previous_amount


def get_goal_contribution_trend(db: Session, goal_id: int, user_id: int):
    """
    Returns the contribution history for one goal, ordered oldest-first,
    with a running cumulative total -- ready for a line/area chart.
    Returns None if the goal doesn't exist or doesn't belong to user_id.
    """
    goal = get_goal(db, goal_id, user_id)
    if not goal:
        return None

    rows = (
        db.query(GoalContribution)
        .filter(GoalContribution.goal_id == goal_id, GoalContribution.user_id == user_id)
        .order_by(GoalContribution.contributed_at.asc())
        .all()
    )

    points = []
    running_total = 0.0
    for row in rows:
        running_total += float(row.amount)
        points.append({
            "date": row.contributed_at.date().isoformat(),
            "amount": float(row.amount),
            "cumulative": round(running_total, 2),
        })

    return points