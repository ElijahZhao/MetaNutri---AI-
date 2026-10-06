from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime
import csv
import logging
from io import StringIO

from app.db.session import get_db
from app.core.security import get_current_active_user
from app.models.user import User
from app.models.genomic import GenomicData
from app.models.microbiome import MicrobiomeData
from app.models.metabolomics import MetabolomicsData
from app.services.data_import_export import DataImporter

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/import-export", tags=["import-export"])


@router.post("/import/{data_type}")
async def import_data(
    data_type: str,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    content = await file.read()

    if len(content) > 5 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="File too large (max 5 MB)")
    if not file.filename or "." not in file.filename:
        raise HTTPException(status_code=400, detail="File must have a .csv or .json extension")

    # Validate the data type up front. It used to be checked inside the per-record
    # loop, where the broad `except Exception` swallowed the HTTPException, so an
    # unsupported type returned 200 with every record listed as an error.
    if data_type not in ("genomic", "microbiome", "metabolomics"):
        raise HTTPException(status_code=400, detail=f"Unsupported data type: {data_type}")

    if file.filename.endswith('.csv'):
        try:
            data = DataImporter.import_from_csv(content.decode('utf-8'))
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Invalid CSV content: {e}")
    elif file.filename.endswith('.json'):
        try:
            data = DataImporter.import_from_json(content.decode('utf-8'))
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Invalid JSON content: {e}")
    else:
        raise HTTPException(status_code=400, detail="Unsupported file format. Use CSV or JSON.")

    # Basic numeric range validation to keep analysis inputs sane.
    def _bounded(value, lo, hi, default):
        try:
            v = float(value)
        except (TypeError, ValueError):
            return default
        return max(lo, min(hi, v))

    imported = 0
    errors = []
    
    for record in data:
        try:
            if data_type == "genomic":
                genomic = GenomicData(
                    user_id=current_user.id,
                    gene_name=record.get("gene_name"),
                    snp_id=record.get("snp_id"),
                    genotype=record.get("genotype"),
                    effect_score=_bounded(record.get("effect_score", 0), -1, 1, 0),
                    trait_description=record.get("trait_description"),
                )
                db.add(genomic)
            elif data_type == "microbiome":
                microbiome = MicrobiomeData(
                    user_id=current_user.id,
                    taxon_level=record.get("taxon_level", "genus"),
                    taxon_name=record.get("taxon_name"),
                    relative_abundance=_bounded(record.get("relative_abundance", 0), 0, 1, 0),
                    health_score=_bounded(record.get("health_score", 0.5), 0, 1, 0.5),
                )
                db.add(microbiome)
            elif data_type == "metabolomics":
                metabolomics = MetabolomicsData(
                    user_id=current_user.id,
                    metabolite_name=record.get("metabolite_name"),
                    pathway_name=record.get("pathway_name"),
                    concentration=_bounded(record.get("concentration", 0), 0, 1e9, 0),
                    unit=record.get("unit", "μM"),
                    z_score=_bounded(record.get("z_score", 0), -100, 100, 0),
                    significance=_bounded(record.get("significance", 0.05), 0, 1, 0.05),
                )
                db.add(metabolomics)
            imported += 1
        except Exception:
            # Don't echo raw exception text (it can contain DB internals) to the
            # client; keep the full detail in the server log instead.
            logger.exception("Import failed for a %s record", data_type)
            errors.append({"record": record, "error": "record could not be imported"})
    
    await db.commit()
    
    return {
        "status": "success",
        "imported": imported,
        "errors": len(errors),
        "error_details": errors[:5] if errors else [],
    }


@router.get("/export/{data_type}")
async def export_data(
    data_type: str,
    format: str = "json",
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    if data_type == "genomic":
        result = await db.execute(
            select(GenomicData).where(GenomicData.user_id == current_user.id)
        )
        records = result.scalars().all()
        data = [{
            "gene_name": r.gene_name,
            "snp_id": r.snp_id,
            "genotype": r.genotype,
            "effect_score": float(r.effect_score) if r.effect_score else None,
            "trait_description": r.trait_description,
            "created_at": r.created_at.isoformat() if r.created_at else None,
        } for r in records]
    elif data_type == "microbiome":
        result = await db.execute(
            select(MicrobiomeData).where(MicrobiomeData.user_id == current_user.id)
        )
        records = result.scalars().all()
        data = [{
            "taxon_name": r.taxon_name,
            "taxon_level": r.taxon_level,
            "relative_abundance": float(r.relative_abundance) if r.relative_abundance else None,
            "health_score": float(r.health_score) if r.health_score else None,
            "created_at": r.created_at.isoformat() if r.created_at else None,
        } for r in records]
    elif data_type == "metabolomics":
        result = await db.execute(
            select(MetabolomicsData).where(MetabolomicsData.user_id == current_user.id)
        )
        records = result.scalars().all()
        data = [{
            "metabolite_name": r.metabolite_name,
            "pathway_name": r.pathway_name,
            "concentration": float(r.concentration) if r.concentration else None,
            "unit": r.unit,
            "z_score": float(r.z_score) if r.z_score else None,
            "significance": float(r.significance) if r.significance else None,
            "created_at": r.created_at.isoformat() if r.created_at else None,
        } for r in records]
    else:
        raise HTTPException(status_code=400, detail=f"Unsupported data type: {data_type}")
    
    if format == "csv":
        output = StringIO()
        if data:
            writer = csv.DictWriter(output, fieldnames=data[0].keys())
            writer.writeheader()
            writer.writerows(data)
        return StreamingResponse(
            iter([output.getvalue()]),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename={data_type}_export.csv"}
        )
    elif format == "json":
        return {
            "data": data,
            "count": len(data),
            "exported_at": datetime.utcnow().isoformat(),
        }
    else:
        raise HTTPException(status_code=400, detail="Unsupported format. Use csv or json.")


@router.get("/templates/{data_type}")
async def get_import_template(
    data_type: str,
    current_user: User = Depends(get_current_active_user)
):
    templates = {
        "genomic": {
            "fields": ["gene_name", "snp_id", "genotype", "effect_score", "trait_description"],
            "example": {
                "gene_name": "FTO",
                "snp_id": "rs9939609",
                "genotype": "AT",
                "effect_score": 0.85,
                "trait_description": "Associated with obesity risk"
            }
        },
        "microbiome": {
            "fields": ["taxon_name", "taxon_level", "relative_abundance", "health_score"],
            "example": {
                "taxon_name": "Bacteroides",
                "taxon_level": "genus",
                "relative_abundance": 0.25,
                "health_score": 0.85
            }
        },
        "metabolomics": {
            "fields": ["metabolite_name", "pathway_name", "concentration", "unit", "z_score", "significance"],
            "example": {
                "metabolite_name": "Glucose",
                "pathway_name": "Glycolysis",
                "concentration": 5.5,
                "unit": "mM",
                "z_score": 1.2,
                "significance": 0.03
            }
        }
    }
    
    if data_type not in templates:
        raise HTTPException(status_code=400, detail=f"No template for: {data_type}")
    
    return templates[data_type]