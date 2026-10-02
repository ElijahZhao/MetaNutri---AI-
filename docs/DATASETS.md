# 数据集文档（MetaNutri）

MetaNutri 使用多种公共数据集来支持精准营养代谢预测。数据集的实际管理入口是后端 `/api/datasets/*` 路由（对应 [`backend/app/api/datasets.py`](../backend/app/api/datasets.py)）、底层下载器（[`backend/app/ml/dataset_downloader.py`](../backend/app/ml/dataset_downloader.py)）。下载后的 JSON 落在 [`backend/data/`](../backend/data/) 目录，典型样例已随仓库提交。

> 所有 datasets 接口都需要**登录认证**（httpOnly Cookie），公有数据集本身是只读的参考数据，下载和导入会被记录为请求。

## 1. 数据集清单（PUBLIC_DATASETS）

定义在 `dataset_downloader.py` 中的 `PUBLIC_DATASETS`，共 8 个：

| key | 名称 | 分类 | 来源 |
|-----|------|------|------|
| `usda` | USDA Food Database | nutrition | USDA FoodData Central |
| `kegg` | KEGG Pathways | metabolic | KEGG |
| `hmp` | HMP Microbiome Reference | microbiome | Human Microbiome Project |
| `metabolomics` | Metabolomics Reference | metabolomics | HMDB |
| `gene_nutrition` | Gene-Nutrition Interactions | genetics | SNPedia, GWAS Catalog |
| `microbiome_samples` | Microbiome Sample Data | microbiome | MetaNutri Demo |
| `dietary_guidelines` | Dietary Guidelines | nutrition | WHO, USDA |
| `disease_markers` | Disease Biomarkers | clinical | MetaNutri Research |

对应落地文件（`backend/data/*.json`）：`usda_food_database.json`、`kegg_pathways.json`、`hmp_reference.json`、`metabolomics_reference.json`、`gene_nutrition_interactions.json`、`microbiome_samples.json`、`dietary_guidelines.json`、`disease_markers.json`。

> 这些参考数据由脚本生成/下载得到，真实训练所用权重位于 `backend/app/ml/weights/`。详情见 [API.md](./API.md)。

## 2. API 入口

以下接口均有鉴权，`BASE` 为后端根地址（如 `https://metanutri-backend.onrender.com`）。

### GET `/api/datasets`
列出所有数据集及其状态（`available` / `not_downloaded` / `error`）与记录条数。

```bash
curl -b cookies.txt "$BASE/api/datasets"
```

### GET `/api/datasets/categories`
按分类归组返回数据集。

### POST `/api/datasets/download` · POST `/api/datasets/download/{dataset_id}`
下载全部 / 指定数据集（写入 `backend/data/*.json`）。`dataset_id` 为上表 key。

```bash
curl -b cookies.txt -X POST "$BASE/api/datasets/download/usda"
# => {"status": "success", "dataset": "usda"}
```

### POST `/api/datasets/import/{dataset_id}`
将已下载的 JSON 导入数据库（如 `usda` 食物写入 `FoodNutrition` 表），幂等（按名称去重）。

### GET `/api/datasets/stats`
返回每一数据集的记录数、文件大小（KB）等统计信息。

### TianChi 集成（天池）
- `GET /api/datasets/tianchi` — 列出可用的生物信息学数据集
- `GET /api/datasets/tianchi/search?keyword=...` — 搜索
- `GET /api/datasets/tianchi/{dataset_id}` — 详情
- `POST /api/datasets/tianchi/download/{dataset_id}` — 下载

> 说明：TianChi 客户端为接入框架（映射 [`TianChiDatasetClient`](../backend/app/ml/dataset_downloader.py)）。真实下载需要阿里云 AK/SK + 数据授权，未配置时会返回 mock 数据提示。

## 3. 直接运行下载器（本地/非 HTTP）

作为参考，也可以在服务端进程内调用，而不走 HTTP：

```python
from app.ml.dataset_downloader import (
    DatasetDownloader,
    get_available_datasets,
    get_dataset_stats,
)

DatasetDownloader.download_all_datasets()   # 下载全部到 backend/data/
print(get_available_datasets())            # key -> 元数据 + available
print(get_dataset_stats())                 # 记录数 / 大小
```

## 4. 数据导入到业务表

- 食物：`/api/datasets/import/usda` 把 `usda_food_database.json` 的 `foods` 写入 `FoodNutrition`。
- 微生物组 / 代谢组学：推荐使用 `/api/import-export` 的用户数据导入（上传 CSV/JSON），或通过对应 `analysis` 分析；公有参考数据供分析时比对（如 HMP 参考、代谢物参考范围）。

## 5. 维护与更新

- 更新参考数据：重新运行下载器即可覆盖 `backend/data/*.json`；再次 `/api/datasets/import/{id}` 会按名称去重。
- 数据集 JSON 结构（例）：
  - usda：`{"description": ..., "version": ..., "foods": [{"name","category","calories","protein","carbs","fat","fiber","sugar"}, ...]}`
  - kegg：`[{"name","prefix"}, ...]`（数组，非对象）
  - hmp：`{"taxa": [{"phylum","genus","relative_abundance","health_role"}, ...]}`
  - metabolomics：`{"metabolites": [{"name","hmdb_id","pathway","unit"}, ...]}`
  - gene_nutrition：`{"genes": [{"gene","rsid","trait","effect","nutrition_interaction","recommendation"}, ...]}`
  - microbiome_samples：`{"studies": [{"study_name","sample_count","population","geographic_region","taxa":[...]}, ...]}`
  - dietary_guidelines：`{"recommendations": {...}}`
  - disease_markers：`{"markers": [{"disease","risk_factors":[{"biomarker","threshold","unit","direction"}],"microbiome_signature":{...}}, ...]}`

## 6. 隐私与许可

- **用户数据**：个人组学数据经鉴权隔离存储，不经本模块暴露。
- **公共数据**：来源于上述公开数据库，归档用于演示与研究；使用前请遵守各上游的数据使用协议。