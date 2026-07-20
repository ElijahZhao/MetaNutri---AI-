# 数据集文档

## 概述

MetaNutri 使用多种公共数据集来支持精准营养代谢预测，包括食物营养数据、代谢组学数据、微生物组数据和基因-营养关联数据。

## 数据集列表

### 1. USDA食物营养数据库

**来源**: USDA National Nutrient Database for Standard Reference

**描述**: 包含各种食物的营养成分信息

**数据内容**:

| 字段 | 描述 | 示例 |
|------|------|------|
| food_name | 食物名称 | Apple |
| calories | 热量 (kcal) | 95 |
| protein | 蛋白质 (g) | 0.5 |
| carbohydrates | 碳水化合物 (g) | 25 |
| fat | 脂肪 (g) | 0.3 |
| fiber | 膳食纤维 (g) | 4.4 |
| vitamin_a | 维生素A (IU) | 98 |
| vitamin_c | 维生素C (mg) | 8.4 |
| calcium | 钙 (mg) | 10 |
| iron | 铁 (mg) | 0.3 |

**数据量**: ~30,000 条记录

**获取方式**:

```bash
python -m app.scripts.dataset_downloader --dataset usda
```

### 2. KEGG代谢通路数据

**来源**: KEGG (Kyoto Encyclopedia of Genes and Genomes)

**描述**: 包含代谢通路、酶、基因和化合物的信息

**数据内容**:

| 字段 | 描述 | 示例 |
|------|------|------|
| pathway_id | 通路ID | ko00010 |
| pathway_name | 通路名称 | Glycolysis |
| enzyme_id | 酶ID | EC:2.7.1.1 |
| gene_id | 基因ID | hsa:3098 |
| compound_id | 化合物ID | C00031 |

**数据量**: ~1,000 条通路记录

**获取方式**:

```bash
python -m app.scripts.dataset_downloader --dataset kegg
```

### 3. 人类微生物组计划(HMP)数据

**来源**: Human Microbiome Project

**描述**: 包含健康人群的微生物组参考数据

**数据内容**:

| 字段 | 描述 | 示例 |
|------|------|------|
| sample_id | 样本ID | HMP001 |
| taxon_id | 分类单元ID | OTU001 |
| taxon_name | 分类单元名称 | Bacteroides |
| abundance | 相对丰度 | 0.15 |
| body_site | 身体部位 | gut |

**数据量**: ~5,000 条样本记录

**获取方式**:

```bash
python -m app.scripts.dataset_downloader --dataset hmp
```

### 4. 代谢组学参考数据

**来源**: MetaboLights

**描述**: 包含代谢物浓度参考数据

**数据内容**:

| 字段 | 描述 | 示例 |
|------|------|------|
| metabolite_id | 代谢物ID | HMDB0001 |
| metabolite_name | 代谢物名称 | Glucose |
| concentration | 浓度 (μM) | 5.2 |
| unit | 单位 | μM |
| reference_range | 参考范围 | 3.9-6.1 |

**数据量**: ~10,000 条代谢物记录

**获取方式**:

```bash
python -m app.scripts.dataset_downloader --dataset metabolomics
```

### 5. 基因-营养相互作用数据

**来源**: GWAS Catalog

**描述**: 包含基因与营养相关性状的关联数据

**数据内容**:

| 字段 | 描述 | 示例 |
|------|------|------|
| gene_id | 基因ID | rs123456 |
| gene_name | 基因名称 | FTO |
| trait | 性状 | Body mass index |
| nutrient | 相关营养素 | Fat |
| p_value | P值 | 1e-8 |
| effect_size | 效应量 | 0.15 |

**数据量**: ~2,000 条关联记录

**获取方式**:

```bash
python -m app.scripts.dataset_downloader --dataset gene_nutrition
```

## 数据导入

### 导入所有数据集

```bash
python -m app.scripts.dataset_downloader --all
python -m app.scripts.import_sample_data
```

### 导入指定数据集

```bash
python -m app.scripts.dataset_downloader --dataset usda
python -m app.scripts.import_sample_data --dataset usda
```

## 数据格式

### CSV格式

```csv
food_name,calories,protein,carbohydrates,fat,fiber
Apple,95,0.5,25,0.3,4.4
Banana,105,1.3,27,0.4,3.1
```

### JSON格式

```json
{
  "food_name": "Apple",
  "nutrients": {
    "calories": 95,
    "protein": 0.5,
    "carbohydrates": 25,
    "fat": 0.3
  }
}
```

## 数据预处理

### 数据清洗

- 去除重复记录
- 处理缺失值
- 标准化单位
- 验证数据范围

### 特征工程

- 计算营养素比例
- 创建食物类别特征
- 编码分类变量
- 标准化数值特征

### 数据划分

- 训练集: 70%
- 验证集: 15%
- 测试集: 15%

## 数据存储

### 数据库表结构

```sql
CREATE TABLE foods (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    calories REAL,
    protein REAL,
    carbohydrates REAL,
    fat REAL,
    fiber REAL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE metabolites (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    reference_range_low REAL,
    reference_range_high REAL,
    unit TEXT
);

CREATE TABLE microbiome_taxa (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    taxonomic_level TEXT,
    parent_id INTEGER
);
```

### 缓存策略

- 热门食物数据缓存到Redis
- 设置缓存过期时间为24小时
- 使用LRU策略淘汰缓存

## 数据更新

### 定期更新

```bash
python -m app.scripts.dataset_downloader --all --update
```

### 更新频率

| 数据集 | 更新频率 |
|--------|----------|
| USDA食物数据库 | 每年 |
| KEGG代谢通路数据 | 每月 |
| HMP参考数据 | 每季度 |
| 代谢组学参考数据 | 每季度 |
| 基因-营养相互作用数据 | 每月 |

## 数据质量

### 验证规则

- 热量值必须为正数
- 营养素比例之和应接近100%
- 参考范围应合理
- 分类单元应符合命名规范

### 质量报告

```bash
python -m app.scripts.data_quality_check
```

## 数据隐私

### 用户数据

- 用户数据加密存储
- 脱敏处理敏感信息
- 仅存储必要的最小数据

### 公共数据

- 使用公开可访问的数据集
- 确保数据来源合法
- 遵守数据使用协议

## 许可证

| 数据集 | 许可证 |
|--------|--------|
| USDA食物数据库 | Public Domain |
| KEGG代谢通路数据 | Creative Commons Attribution |
| HMP参考数据 | Public Domain |
| MetaboLights | Creative Commons Attribution |
| GWAS Catalog | Open Access |
