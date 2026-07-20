import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, ForeignKey, String, Numeric, Date, DateTime
from sqlalchemy.dialects.postgresql import UUID
from app.db.session import Base


class MicrobiomeData(Base):
    __tablename__ = "microbiome_data"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    taxon_level = Column(String(20))
    taxon_name = Column(String(255), nullable=False)
    relative_abundance = Column(Numeric(10, 8))
    health_score = Column(Numeric(5, 3))
    sample_date = Column(Date)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
