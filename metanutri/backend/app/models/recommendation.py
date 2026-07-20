import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, ForeignKey, String, Numeric, DateTime, Text, JSON
from sqlalchemy.dialects.postgresql import UUID
from app.db.session import Base


class NutritionRecommendation(Base):
    __tablename__ = "nutrition_recommendations"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    recommendation_type = Column(String(50))
    food_items = Column(JSON, default=list)
    nutrient_targets = Column(JSON, default=dict)
    confidence_score = Column(Numeric(5, 3))
    explanation = Column(Text)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
