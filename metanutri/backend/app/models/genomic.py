import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, ForeignKey, String, Numeric, DateTime, Text
from sqlalchemy.dialects.postgresql import UUID
from app.db.session import Base


class GenomicData(Base):
    __tablename__ = "genomic_data"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    gene_name = Column(String(100), nullable=False)
    snp_id = Column(String(50))
    genotype = Column(String(10))
    effect_score = Column(Numeric(5, 3))
    trait_description = Column(Text)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
