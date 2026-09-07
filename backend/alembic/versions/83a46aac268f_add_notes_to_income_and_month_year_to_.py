"""add notes to income and month_year to budgets

Revision ID: 83a46aac268f
Revises: 154c713cd0fd
Create Date: 2026-08-03 21:46:05.625434

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '83a46aac268f'
down_revision: Union[str, None] = '154c713cd0fd'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('income', sa.Column('notes', sa.Text(), nullable=True))
    op.add_column('budgets', sa.Column('month_year', sa.String(length=7), nullable=True))


def downgrade() -> None:
    op.drop_column('budgets', 'month_year')
    op.drop_column('income', 'notes')