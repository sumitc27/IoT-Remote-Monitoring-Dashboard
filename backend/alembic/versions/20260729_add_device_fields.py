"""Add new device and telemetry fields

Revision ID: 20260729_01
Revises: 
Create Date: 2026-07-29 13:45:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '20260729_01'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add train_no and coach_no to devices
    op.add_column('devices', sa.Column('train_no', sa.String(length=50), nullable=True))
    op.add_column('devices', sa.Column('coach_no', sa.String(length=50), nullable=True))

    # Add main_mcb_status, fsds_mcb_status, battery_status, countdown_timer to telemetry
    op.add_column('telemetry', sa.Column('main_mcb_status', sa.String(length=10), nullable=True))
    op.add_column('telemetry', sa.Column('fsds_mcb_status', sa.String(length=10), nullable=True))
    op.add_column('telemetry', sa.Column('battery_status', sa.String(length=20), nullable=True))
    op.add_column('telemetry', sa.Column('countdown_timer', sa.Integer(), nullable=True))


def downgrade() -> None:
    # Drop columns from telemetry
    op.drop_column('telemetry', 'countdown_timer')
    op.drop_column('telemetry', 'battery_status')
    op.drop_column('telemetry', 'fsds_mcb_status')
    op.drop_column('telemetry', 'main_mcb_status')

    # Drop columns from devices
    op.drop_column('devices', 'coach_no')
    op.drop_column('devices', 'train_no')
