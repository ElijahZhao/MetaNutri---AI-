# API 文档

## 基础信息

- **基础 URL**: `http://localhost:8000/api/v1/`
- **认证方式**: JWT Bearer Token
- **API 文档**: `http://localhost:8000/docs` (Swagger UI)
- **Redoc 文档**: `http://localhost:8000/redoc`

## 认证

### 登录

```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password"
}
```

响应：

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

### 注册

```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password",
  "full_name": "John Doe"
}
```

### 刷新 Token

```http
POST /auth/refresh
Content-Type: application/json

{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## 用户管理

### 获取当前用户

```http
GET /users/me
Authorization: Bearer <access_token>
```

响应：

```json
{
  "id": 1,
  "email": "user@example.com",
  "full_name": "John Doe",
  "created_at": "2024-01-01T00:00:00Z"
}
```

### 更新用户信息

```http
PUT /users/me
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "full_name": "John Doe",
  "height": 180,
  "weight": 75,
  "age": 30,
  "gender": "male",
  "activity_level": "moderate"
}
```

## 食物日志

### 获取食物日志列表

```http
GET /food-logs?date=2024-01-01&page=1&limit=20
Authorization: Bearer <access_token>
```

响应：

```json
{
  "data": [
    {
      "id": 1,
      "food_name": "Apple",
      "quantity": 1,
      "unit": "piece",
      "calories": 95,
      "protein": 0.5,
      "carbohydrates": 25,
      "fat": 0.3,
      "meal_type": "breakfast",
      "created_at": "2024-01-01T08:00:00Z"
    }
  ],
  "total": 100,
  "page": 1,
  "limit": 20
}
```

### 添加食物日志

```http
POST /food-logs
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "food_name": "Apple",
  "quantity": 1,
  "unit": "piece",
  "meal_type": "breakfast"
}
```

## 营养分析

### 获取营养摄入统计

```http
GET /nutrition/intake?start_date=2024-01-01&end_date=2024-01-31
Authorization: Bearer <access_token>
```

响应：

```json
{
  "calories": {
    "total": 2000,
    "recommended": 2200,
    "percentage": 90.9
  },
  "protein": {
    "total": 80,
    "recommended": 70,
    "percentage": 114.3
  },
  "carbohydrates": {
    "total": 250,
    "recommended": 300,
    "percentage": 83.3
  },
  "fat": {
    "total": 65,
    "recommended": 70,
    "percentage": 92.9
  }
}
```

### 获取营养预警

```http
GET /nutrition/alerts
Authorization: Bearer <access_token>
```

响应：

```json
[
  {
    "nutrient": "Vitamin D",
    "level": "deficient",
    "current_intake": 200,
    "recommended": 600,
    "severity": "high"
  }
]
```

## AI 预测

### 预测代谢响应

```http
POST /predictions/metabolic-response
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "food_name": "Apple",
  "quantity": 100,
  "unit": "g"
}
```

响应：

```json
{
  "prediction_id": "abc123",
  "food_name": "Apple",
  "metabolic_changes": {
    "glucose": {
      "change": 5.2,
      "unit": "mg/dL"
    },
    "insulin": {
      "change": 2.1,
      "unit": "μU/mL"
    }
  },
  "confidence": 0.85
}
```

### 评估健康风险

```http
POST /predictions/health-risk
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "risk_type": "diabetes"
}
```

### 获取预测解释

```http
GET /predictions/explain/{prediction_id}
Authorization: Bearer <access_token>
```

响应：

```json
{
  "prediction_id": "abc123",
  "shap_values": [
    {
      "feature": "carbohydrates",
      "importance": 0.35
    },
    {
      "feature": "fiber",
      "importance": 0.25
    }
  ],
  "lime_explanation": "The prediction is primarily driven by the carbohydrate content..."
}
```

## 组学数据

### 上传基因组数据

```http
POST /genomics/upload
Authorization: Bearer <access_token>
Content-Type: multipart/form-data

file: <vcf_file>
```

### 获取微生物组分析结果

```http
GET /microbiome/analysis
Authorization: Bearer <access_token>
```

### 上传代谢组数据

```http
POST /metabolomics/upload
Authorization: Bearer <access_token>
Content-Type: multipart/form-data

file: <metabolomics_file>
```

## 错误处理

API 返回以下错误格式：

```json
{
  "detail": "Error message"
}
```

### 常见错误码

| 状态码 | 描述 |
|--------|------|
| 400 | 错误请求 |
| 401 | 未授权 |
| 403 | 禁止访问 |
| 404 | 资源未找到 |
| 500 | 服务器内部错误 |
