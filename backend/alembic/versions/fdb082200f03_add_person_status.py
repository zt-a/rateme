"""add person status
Revision ID: fdb082200f03
Revises: b6719a75f1ce
Create Date: 2026-03-19 21:51:20.835693
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = 'fdb082200f03'
down_revision: Union[str, Sequence[str], None] = 'b6719a75f1ce'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

personstatus = sa.Enum('pending', 'contacted', 'agreed', 'rejected', 'published', name='personstatus')

def upgrade() -> None:
    personstatus.create(op.get_bind())
    op.add_column('persons', sa.Column('status', personstatus, nullable=False, server_default='published'))
    op.add_column('persons', sa.Column('contact_email', sa.String(length=256), nullable=True))
    op.add_column('persons', sa.Column('consent_note', sa.Text(), nullable=True))
    op.add_column('persons', sa.Column('submitted_by', sa.BigInteger(), nullable=True))
    op.create_foreign_key(None, 'persons', 'users', ['submitted_by'], ['id'])

def downgrade() -> None:
    op.drop_constraint(None, 'persons', type_='foreignkey')
    op.drop_column('persons', 'submitted_by')
    op.drop_column('persons', 'consent_note')
    op.drop_column('persons', 'contact_email')
    op.drop_column('persons', 'status')
    personstatus.drop(op.get_bind())