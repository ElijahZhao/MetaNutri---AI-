# 机器学习模型文档

## 概述

MetaNutri 使用三种深度学习模型来实现精准营养代谢预测：

1. **代谢响应Transformer** - 预测食物对用户代谢的影响
2. **基因营养GNN** - 预测营养素吸收效率
3. **微生物组VAE** - 分析微生物组组成与健康状态

## 模型架构

### 1. 代谢响应Transformer

#### 输入

| 特征类型 | 描述 | 维度 |
|----------|------|------|
| 食物成分 | 碳水化合物、蛋白质、脂肪等 | 20 |
| 用户基因型 | 与代谢相关的基因变异 | 50 |
| 微生物组组成 | 主要菌群丰度 | 30 |

#### 输出

| 输出类型 | 描述 | 维度 |
|----------|------|------|
| 代谢物变化 | 血糖、胰岛素等指标变化 | 10 |
| 置信度 | 预测置信度 | 1 |

#### 架构

```
输入层 → Transformer Encoder (6层) → MLP Head → 输出层
```

#### 训练配置

```python
{
    "epochs": 100,
    "batch_size": 64,
    "learning_rate": 1e-4,
    "hidden_dim": 512,
    "num_heads": 8,
    "dropout": 0.1
}
```

### 2. 基因营养GNN

#### 输入

| 特征类型 | 描述 | 格式 |
|----------|------|------|
| 基因-营养网络 | 基因与营养素的相互作用图 | Graph |
| 用户基因型 | 用户的基因变异状态 | Node Features |

#### 输出

| 输出类型 | 描述 | 维度 |
|----------|------|------|
| 吸收效率 | 各营养素的吸收效率 | 20 |

#### 架构

```
Graph Input → GraphSAGE (3层) → Attention Pooling → MLP → 输出层
```

#### 训练配置

```python
{
    "epochs": 50,
    "batch_size": 32,
    "learning_rate": 5e-4,
    "hidden_dim": 256,
    "num_layers": 3,
    "dropout": 0.2
}
```

### 3. 微生物组VAE

#### 输入

| 特征类型 | 描述 | 维度 |
|----------|------|------|
| 微生物组丰度 | 各菌群的相对丰度 | 100 |

#### 输出

| 输出类型 | 描述 | 维度 |
|----------|------|------|
| 潜在表示 | 微生物组的低维表示 | 64 |
| 健康状态 | 预测的健康状态 | 5 |

#### 架构

```
Encoder: MLP (3层) → 潜在空间
Decoder: MLP (3层) → 重构输出
Classifier: MLP (2层) → 健康状态预测
```

#### 训练配置

```python
{
    "epochs": 150,
    "batch_size": 128,
    "learning_rate": 1e-3,
    "latent_dim": 64,
    "hidden_dim": 256,
    "beta": 1.0
}
```

## 模型训练

### 训练脚本

```bash
# 训练所有模型
python -m app.ml.train --all

# 训练指定模型
python -m app.ml.train --model transformer --epochs 100
python -m app.ml.train --model gnn --epochs 50
python -m app.ml.train --model vae --epochs 150
```

### 训练数据

模型使用以下数据集进行训练：

| 数据集 | 用途 | 样本量 |
|--------|------|--------|
| USDA食物数据库 | 食物成分信息 | ~30,000 |
| 代谢组学数据集 | 代谢物浓度数据 | ~10,000 |
| 微生物组数据集 | 肠道菌群数据 | ~5,000 |
| 基因-营养关联数据 | 基因与营养的关联 | ~2,000 |

### 评估指标

| 模型 | 评估指标 |
|------|----------|
| 代谢响应Transformer | MAE, RMSE, R² |
| 基因营养GNN | Accuracy, F1-score |
| 微生物组VAE | Reconstruction Loss, AUC-ROC |

## 模型推理

### 预测接口

```python
from app.ml.predict import predict_metabolic_response

result = predict_metabolic_response(
    food_name="Apple",
    quantity=100,
    user_id=1
)
```

### 批量预测

```python
from app.ml.predict import batch_predict

results = batch_predict(
    foods=[
        {"name": "Apple", "quantity": 100},
        {"name": "Banana", "quantity": 100}
    ],
    user_id=1
)
```

## 模型可解释性

### SHAP分析

```python
from app.ml.explain import shap_explain

explanation = shap_explain(
    model_name="transformer",
    sample_data=sample
)
```

### LIME分析

```python
from app.ml.explain import lime_explain

explanation = lime_explain(
    model_name="transformer",
    sample_data=sample
)
```

### 解释结果

解释结果包含：

1. **特征重要性** - 各特征对预测的贡献度
2. **局部解释** - 特定样本的预测解释
3. **可视化** - SHAP值、特征重要性图

## 模型部署

### 模型权重

模型权重存储在 `backend/app/ml/weights/` 目录：

```
weights/
├── transformer/
│   ├── model.pt
│   └── config.json
├── gnn/
│   ├── model.pt
│   └── config.json
└── vae/
    ├── model.pt
    └── config.json
```

### 模型加载

```python
from app.ml.models import load_model

model = load_model("transformer")
```

### API部署

模型通过FastAPI API提供预测服务：

```http
POST /api/v1/predictions/metabolic-response
```

## 模型更新

### 重新训练

```bash
python -m app.ml.train --model transformer --retrain
```

### 增量训练

```bash
python -m app.ml.train --model transformer --incremental --new_data data.json
```

### 模型版本管理

每个模型版本包含：

- 模型权重文件
- 训练配置
- 评估指标
- 数据快照

## 性能优化

### 模型压缩

```bash
python -m app.ml.compress --model transformer --target_size 50MB
```

### 推理加速

- 使用 PyTorch JIT 编译
- 使用 ONNX 格式导出
- 使用 TensorRT 优化

### 缓存策略

- 缓存频繁查询的预测结果
- 使用 Redis 缓存用户特征
- 设置合理的缓存过期时间
