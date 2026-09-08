"""create goal contributions table

Revision ID: 3a71639ce731
Revises: 2e9a235f302c
Create Date: 2026-09-08

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "3a71639ce731"
down_revision: Union[str, None] = "2e9a235f302c"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "goal_contributions",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("goal_id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("amount", sa.Numeric(12, 2), nullable=False),
        sa.Column(
            "contributed_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.ForeignKeyConstraint(
            ["goal_id"],
            ["savings_goals.id"],
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_index(
        "ix_goal_contributions_id",
        "goal_contributions",
        ["id"],
        unique=False,
    )

    op.create_index(
        "ix_goal_contributions_goal_id",
        "goal_contributions",
        ["goal_id"],
        unique=False,
    )

    op.create_index(
        "ix_goal_contributions_user_id",
        "goal_contributions",
        ["user_id"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index(
        "ix_goal_contributions_user_id",
        table_name="goal_contributions",
    )
    op.drop_index(
        "ix_goal_contributions_goal_id",
        table_name="goal_contributions",
    )
    op.drop_index(
        "ix_goal_contributions_id",
        table_name="goal_contributions",
    )
    op.drop_table("goal_contributions")