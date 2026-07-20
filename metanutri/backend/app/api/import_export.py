from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from datetime import datetime
import json
import csv
from io import StringIO, BytesIO

from app.db.session import get_db
from app.core.security import get_current_active_user
from app.models.user import User
from app.models.genomic import GenomicData
from app.models.microbiome import MicrobiomeData
from app.models.metabolomics import MetabolomicsData
from app.models.food import FoodNutrition
from app.services.data_import_export import DataExporter, DataImporter, validate_data

router = APIRouter(prefix="/api/import-export", tags=["import-export"])


@router.post("/import/{data_type}")
async def import_data(
    data_type: str,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    content = await file.read()
    
    if file.filename.endswith('.csv'):
        data = DataImporter.import_from_csv(content.decode('utf-8'))
    elif file.filename.endswith('.json'):
        data = DataImporter.import_from_json(content.decode('utf-8'))
    else:
        raise HTTPException(status_code=400, detail="Unsupported file format. Use CSV or JSON.")
    
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
                    effect_score=float(record.get("effect_score", 0)),
                    trait_description=record.get("trait_description"),
                )
                db.add(genomic)
            elif data_type == "microbiome":
                microbiome = MicrobiomeData(
                    user_id=current_user.id,
                    taxon_level=record.get("taxon_level", "genus"),
                    taxon_name=record.get("taxon_name"),
                    relative_abundance=float(record.get("relative_abundance", 0)),
                    health_score=float(record.get("health_score", 0.5)),
                )
                db.add(microbiome)
            elif data_type == "metabolomics":
                metabolomics = MetabolomicsData(
                    user_id=current_user.id,
                    metabolite_name=record.get("metabolite_name"),
                    pathway_name=record.get("pathway_name"),
                    concentration=float(record.get("concentration", 0)),
                    unit=record.get("unit", "μM"),
                    z_score=float(record.get("z_score", 0)),
                    significance=float(record.get("significance", 0.05)),
                )
                db.add(metabolomics)
            else:
                raise HTTPException(status_code=400, detail=f"Unsupported data type: {data_type}")
            imported += 1
        except Exception as e:
            errors.append({"record": record, "error": str(e)})
    
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