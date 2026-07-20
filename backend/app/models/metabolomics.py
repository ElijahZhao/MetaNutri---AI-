import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, ForeignKey, String, Numeric, Date, DateTime
from sqlalchemy.dialects.postgresql import UUID
from app.db.session import Base


class MetabolomicsData(Base):
    __tablename__ = "metabolomics_data"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    metabolite_name = Column(String(255), nullable=False)
    pathway_name = Column(String(255))
    concentration = Column(Numeric(15, 6))
    unit = Column(String(50))
    z_score = Column(Numeric(10, 4))
    significance = Column(Numeric(10, 6))
    sample_date = Column(Date)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class MetabolomicsPathway(Base):
    __tablename__ = "metabolomics_pathways"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    pathway_name = Column(String(255), nullable=False)
    enrichment_score = Column(Numeric(10, 4))
    p_value = Column(Numeric(15, 10))
    num_metabolites = Column(String(50))
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))