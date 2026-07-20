from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import Dict, Any, List
from pathlib import Path
import json

from app.db.session import get_db
from app.core.security import get_current_active_user
from app.models.user import User
from app.models.food import FoodNutrition
from app.models.microbiome import MicrobiomeData
from app.models.metabolomics import MetabolomicsData, MetabolomicsPathway
from app.ml.dataset_downloader import (
    DatasetDownloader, 
    import_sample_data, 
    PUBLIC_DATASETS,
    TianChiDatasetClient,
    get_available_datasets,
    get_dataset_stats
)

router = APIRouter(prefix="/api/datasets", tags=["datasets"])
DATA_DIR = Path(__file__).parent.parent.parent / "data"


@router.get("/")
async def list_datasets(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    datasets = []
    
    for key, info in PUBLIC_DATASETS.items():
        file_path = DATA_DIR / f"{key}.json"
        if file_path.exists():
            try:
                with open(file_path) as f:
                    data = json.load(f)
                
                count = 0
                for field in ["foods", "taxa", "metabolites", "genes", "studies", "recommendations", "markers"]:
                    if field in data:
                        count = len(data[field])
                        break
                
                datasets.append({
                    "id": key,
                    "name": info["name"],
                    "description": info["description"],
                    "category": info["category"],
                    "source": info["source"],
                    "url": info["url"],
                    "count": count,
                    "file_path": str(file_path),
                    "status": "available"
                })
            except Exception:
                datasets.append({
                    "id": key,
                    "name": info["name"],
                    "description": info["description"],
                    "category": info["category"],
                    "source": info["source"],
                    "url": info["url"],
                    "status": "error"
                })
        else:
            datasets.append({
                "id": key,
                "name": info["name"],
                "description": info["description"],
                "category": info["category"],
                "source": info["source"],
                "url": info["url"],
                "status": "not_downloaded"
            })

    return {"datasets": datasets, "total": len(datasets)}


@router.get("/categories")
async def list_categories():
    categories = {}
    for key, info in PUBLIC_DATASETS.items():
        cat = info["category"]
        if cat not in categories:
            categories[cat] = []
        categories[cat].append({
            "id": key,
            "name": info["name"],
            "description": info["description"]
        })
    
    return {"categories": categories}


@router.post("/download")
async def download_all_datasets(
    current_user: User = Depends(get_current_active_user)
):
    results = DatasetDownloader.download_all_datasets()
    success = sum(1 for v in results.values() if v and v != "Failed")
    return {
        "status": "success" if success == len(results) else "partial",
        "downloaded": success,
        "total": len(results),
        "results": results
    }


@router.post("/download/{dataset_id}")
async def download_dataset(
    dataset_id: str,
    current_user: User = Depends(get_current_active_user)
):
    download_methods = {
        "usda": DatasetDownloader.download_usda_food_database,
        "kegg": DatasetDownloader.download_kegg_pathways,
        "hmp": DatasetDownloader.download_human_microbiome_reference,
        "metabolomics": DatasetDownloader.download_metabolomics_reference,
        "gene_nutrition": DatasetDownloader.download_gene_nutrition_interactions,
        "microbiome_samples": DatasetDownloader.download_microbiome_samples,
        "dietary_guidelines": DatasetDownloader.download_dietary_guidelines,
        "disease_markers": DatasetDownloader.download_disease_markers,
    }
    
    if dataset_id not in download_methods:
        raise HTTPException(status_code=404, detail=f"Dataset {dataset_id} not supported")
    
    try:
        path = download_methods[dataset_id]()
        return {"status": "success", "dataset": dataset_id, "file_path": path}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Download failed: {str(e)}")


@router.post("/import/{dataset_id}")
async def import_dataset(
    dataset_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    if dataset_id == "usda":
        usda_path = DATA_DIR / "usda_food_database.json"
        if not usda_path.exists():
            raise HTTPException(status_code=404, detail="USDA dataset not downloaded")
        
        with open(usda_path) as f:
            usda_data = json.load(f)

        imported = 0
        for food_item in usda_data.get("foods", []):
            existing = await db.execute(
                select(FoodNutrition).where(FoodNutrition.food_name == food_item["name"])
            )
            if not existing.scalar_one_or_none():
                food = FoodNutrition(
                    food_name=food_item["name"],
                    category=food_item.get("category", ""),
                    calories_kcal=food_item.get("calories"),
                    protein_g=food_item.get("protein"),
                    carbs_g=food_item.get("carbs"),
                    fat_g=food_item.get("fat"),
                    fiber_g=food_item.get("fiber"),
                )
                db.add(food)
                imported += 1
        
        await db.commit()
        return {"status": "success", "imported": imported, "dataset": "usda"}

    elif dataset_id == "sample":
        await import_sample_data(db, user_id=current_user.id)
        return {"status": "success", "imported": "sample data", "dataset": "sample"}

    elif dataset_id == "hmp":
        hmp_path = DATA_DIR / "hmp_reference.json"
        if not hmp_path.exists():
            raise HTTPException(status_code=404, detail="HMP dataset not downloaded")
        
        with open(hmp_path) as f:
            hmp_data = json.load(f)

        imported = 0
        for taxon in hmp_data.get("taxa", []):
            existing = await db.execute(
                select(MicrobiomeData).where(
                    MicrobiomeData.user_id == current_user.id,
                    MicrobiomeData.taxon_name == taxon["genus"]
                )
            )
            if not existing.scalar_one_or_none():
                data = MicrobiomeData(
                    user_id=current_user.id,
                    taxon_level="genus",
                    taxon_name=taxon["genus"],
                    relative_abundance=taxon["relative_abundance"],
                    health_score=min(1.0, max(0.0, 0.7 + (taxon["relative_abundance"] - 0.05) * 2)),
                )
                db.add(data)
                imported += 1
        
        await db.commit()
        return {"status": "success", "imported": imported, "dataset": "hmp"}

    elif dataset_id == "metabolomics":
        metab_path = DATA_DIR / "metabolomics_reference.json"
        if not metab_path.exists():
            raise HTTPException(status_code=404, detail="Metabolomics dataset not downloaded")
        
        with open(metab_path) as f:
            metab_data = json.load(f)

        imported = 0
        for metabolite in metab_data.get("metabolites", []):
            existing = await db.execute(
                select(MetabolomicsData).where(
                    MetabolomicsData.user_id == current_user.id,
                    MetabolomicsData.metabolite_name == metabolite["name"]
                )
            )
            if not existing.scalar_one_or_none():
                data = MetabolomicsData(
                    user_id=current_user.id,
                    metabolite_name=metabolite["name"],
                    pathway_name=metabolite.get("pathway", ""),
                    concentration=0.0,
                    unit=metabolite.get("unit", ""),
                    z_score=0.0,
                    significance=0.05,
                )
                db.add(data)
                imported += 1
        
        await db.commit()
        return {"status": "success", "imported": imported, "dataset": "metabolomics"}

    elif dataset_id == "microbiome_samples":
        sample_path = DATA_DIR / "microbiome_samples.json"
        if not sample_path.exists():
            raise HTTPException(status_code=404, detail="Microbiome samples not downloaded")
        
        with open(sample_path) as f:
            sample_data = json.load(f)

        imported = 0
        for study in sample_data.get("studies", []):
            for taxon in study.get("taxa", []):
                existing = await db.execute(
                    select(MicrobiomeData).where(
                        MicrobiomeData.user_id == current_user.id,
                        MicrobiomeData.taxon_name == taxon["genus"]
                    )
                )
                if not existing.scalar_one_or_none():
                    data = MicrobiomeData(
                        user_id=current_user.id,
                        taxon_level="genus",
                        taxon_name=taxon["genus"],
                        relative_abundance=taxon["mean_abundance"],
                        health_score=min(1.0, max(0.0, 0.7 + (taxon["mean_abundance"] - 0.05) * 2)),
                    )
                    db.add(data)
                    imported += 1
        
        await db.commit()
        return {"status": "success", "imported": imported, "dataset": "microbiome_samples"}

    else:
        raise HTTPException(status_code=404, detail=f"Dataset {dataset_id} import not supported")


@router.get("/stats")
async def get_dataset_stats_endpoint(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    food_count = await db.execute(select(func.count(FoodNutrition.id)))
    microbiome_count = await db.execute(
        select(func.count(MicrobiomeData.id)).where(MicrobiomeData.user_id == current_user.id)
    )
    metabolomics_count = await db.execute(
        select(func.count(MetabolomicsData.id)).where(MetabolomicsData.user_id == current_user.id)
    )
    pathway_count = await db.execute(
        select(func.count(MetabolomicsPathway.id)).where(MetabolomicsPathway.user_id == current_user.id)
    )

    file_stats = get_dataset_stats()

    return {
        "database": {
            "food_database": {
                "total_foods": food_count.scalar(),
                "categories": ["Fruits", "Vegetables", "Meat", "Seafood", "Dairy", "Grains", "Legumes", "Nuts", "Beverages"]
            },
            "microbiome": {
                "user_taxa_count": microbiome_count.scalar(),
                "reference_taxa_count": 16
            },
            "metabolomics": {
                "user_metabolites_count": metabolomics_count.scalar(),
                "reference_metabolites_count": 25,
                "user_pathways_count": pathway_count.scalar()
            },
            "gene_nutrition": {
                "interactions_count": 8
            }
        },
        "files": file_stats
    }


@router.get("/tianchi")
async def list_tianchi_datasets(
    current_user: User = Depends(get_current_active_user)
):
    tianchi = TianChiDatasetClient()
    bio_datasets = tianchi.list_available_bioinformatics_datasets()
    
    return {
        "message": "TianChi integration - requires AK/SK for full access",
        "bioinformatics_datasets": bio_datasets,
        "next_steps": [
            "1. Register on TianChi: https://tianchi.aliyun.com",
            "2. Complete student verification (free access)",
            "3. Apply for dataset access or join relevant competitions",
            "4. Configure AK/SK credentials in MetaNutri settings",
        ]
    }


@router.get("/tianchi/search")
async def search_tianchi(
    keyword: str,
    category: str = "",
    current_user: User = Depends(get_current_active_user)
):
    tianchi = TianChiDatasetClient()
    results = tianchi.search_datasets(keyword, category)
    
    return {"results": results, "count": len(results)}


@router.get("/tianchi/{dataset_id}")
async def get_tianchi_dataset_detail(
    dataset_id: str,
    current_user: User = Depends(get_current_active_user)
):
    tianchi = TianChiDatasetClient()
    detail = tianchi.get_dataset_detail(dataset_id)
    
    return detail


@router.post("/tianchi/download/{dataset_id}")
async def download_tianchi_dataset(
    dataset_id: str,
    current_user: User = Depends(get_current_active_user)
):
    tianchi = TianChiDatasetClient()
    result = tianchi.download_dataset(dataset_id, str(DATA_DIR))
    
    if result:
        return {
            "status": "success",
            "message": "Mock download complete - real download requires AK/SK credentials",
            "dataset_id": dataset_id,
            "next_steps": [
                "1. Obtain Alibaba Cloud AK/SK from console",
                "2. Configure in MetaNutri settings",
                "3. Complete TianChi dataset approval",
                "4. Re-run with actual credentials",
            ]
        }
    else:
        raise HTTPException(status_code=401, detail="Authentication required for TianChi downloads")
