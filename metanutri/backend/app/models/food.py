import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Numeric, DateTime
from sqlalchemy.dialects.postgresql import UUID, JSONB
from app.db.session import Base


class FoodNutrition(Base):
    __tablename__ = "food_nutrition"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    food_name = Column(String(255), unique=True, nullable=False, index=True)
    category = Column(String(100))
    calories_kcal = Column(Numeric(8, 2))
    protein_g = Column(Numeric(6, 2))
    fat_g = Column(Numeric(6, 2))
    carbs_g = Column(Numeric(6, 2))
    fiber_g = Column(Numeric(6, 2))
    vitamins = Column(JSONB, default=dict)
    minerals = Column(JSONB, default=dict)
    glycemic_index = Column(Numeric(5, 2))
    glycemic_load = Column(Numeric(5, 2))
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
