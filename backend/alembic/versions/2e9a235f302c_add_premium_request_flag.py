"""add premium request flag

Revision ID: 2e9a235f302c
Revises: a3dadb3045dd
Create Date: 2026-09-02 21:54:29.663025

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '2e9a235f302c'
down_revision: Union[str, None] = 'a3dadb3045dd'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade():
    op.add_column(
        "users",
        sa.Column(
            "premium_requested",
            sa.Boolean(),
            nullable=False,
            server_default=sa.false(),
        ),
    )


def downgrade():
    op.drop_column("users", "premium_requested")