import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, ForeignKey, Integer, String, Numeric, DateTime, JSON
from sqlalchemy.dialects.postgresql import UUID
from app.db.session import Base


class UserProfile(Base):
    __tablename__ = "user_profiles"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True)
    age = Column(Integer)
    gender = Column(String(10))
    height_cm = Column(Numeric(5, 2))
    weight_kg = Column(Numeric(5, 2))
    activity_level = Column(String(20))
    dietary_goals = Column(JSON, default=dict)
    dietary_restrictions = Column(JSON, default=dict)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
