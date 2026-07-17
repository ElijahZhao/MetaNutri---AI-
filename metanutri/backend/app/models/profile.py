import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, ForeignKey, Integer, String, Numeric, DateTime
from sqlalchemy.dialects.postgresql import UUID, JSONB
from app.db.session import Base


class UserProfile(Base):
    __tablename__ = "user_profiles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True)
    age = Column(Integer)
    gender = Column(String(10))
    height_cm = Column(Numeric(5, 2))
    weight_kg = Column(Numeric(5, 2))
    activity_level = Column(String(20))
    dietary_goals = Column(JSONB, default=dict)
    dietary_restrictions = Column(JSONB, default=dict)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
