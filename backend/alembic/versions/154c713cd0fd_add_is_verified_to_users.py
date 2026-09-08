"""add is_verified to users

Revision ID: 154c713cd0fd
Revises: 
Create Date: 2026-08-01 23:34:54.964659

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '154c713cd0fd'
down_revision: Union[str, None] = "887a89881e02"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        'users',
        sa.Column('is_verified', sa.Boolean(), nullable=False, server_default=sa.false())
    )


def downgrade() -> None:
    op.drop_column('users', 'is_verified')