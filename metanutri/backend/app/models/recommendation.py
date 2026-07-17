import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, ForeignKey, String, Numeric, DateTime, Text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from app.db.session import Base


class NutritionRecommendation(Base):
    __tablename__ = "nutrition_recommendations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    recommendation_type = Column(String(50))
    food_items = Column(JSONB, default=list)
    nutrient_targets = Column(JSONB, default=dict)
    confidence_score = Column(Numeric(5, 3))
    explanation = Column(Text)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
