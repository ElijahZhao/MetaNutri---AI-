# API 参考（MetaNutri Backend）

后端为 FastAPI 应用（入口 [`backend/app/main.py`](../backend/app/main.py)），所有业务接口挂载在 `/api/*` 下。交互式文档：
- Swagger UI：`<BASE>/docs`
- ReDoc：`<BASE>/redoc`

其中 `<BASE>` 为后端根地址（本地 `http://localhost:8000`，生产 `https://metanutri-backend.onrender.com`）。

> ⚠️ **诚实说明（演示性质）**：`/api/predict/*`、`/api/metabolomics/analysis`、`/api/recommendations/food-score` 等"AI"接口当前返回的是**确定性启发式**，**不是**神经网络推理；`research/prototypes/` 下的模型代码为**研究原型，未接入线上 API**，其 `weights/` 权重也**从不加载**。数据集相关接口为演示占位，见 [DATASETS.md](./DATASETS.md)。详见根目录 README 的「Project Status / Limitations & Scope」。

---

## 1. 认证机制

**认证采用 httpOnly Cookie（不是 Bearer + 无 Cookie）。**

- 登录/刷新后，后端通过 `Set-Cookie` 下发两个 **httpOnly** Cookie：
  - `metanutri_access`：access token（JWT），短期（默认 30 分钟）
  - `metanutri_refresh`：refresh token（JWT），长期（默认 14 天）
- 浏览器会自动携带这些 Cookie 访问受保护接口，**前端 JS 无需手动附加 `Authorization` 头**。
- 后端也会校验 Redis 中缓存的 token，支持会话失效 / 登出。
- 刷新令牌每次使用时轮换，重放旧刷新令牌会判定为会话可能被盗用并直接销毁会话。

> 用 curl 测试时需用 `-c cookies.txt` 保存、`-b cookies.txt` 携带 Cookie；省略 `-b` 的调用访问受保护接口会返回 `401`。

### 接口鉴权速查

| 是否鉴权 | 接口 |
|----------|------|
| 公开 | `/api/auth/*`（登录/注册/刷新/登出/找回密码）、`/health` |
| 需登录 | `/api/foods/*`、`/users/*`、`/api/genomic/*`、`/api/microbiome/*`、`/api/metabolomics/*`、`/api/predict/*`、`/api/recommendations/*`、`/api/datasets/*`、`/api/nutrition-alerts/*`、`/api/import-export/*` |

---

## 2. 认证接口 `/api/auth`

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/auth/register` | 注册，`{email, username, password}` |
| POST | `/api/auth/login` | 登录 `{username, password}`，返回 `{expires_in,...}` + 写 Cookie |
| POST | `/api/auth/refresh` | 用 refresh Cookie 换取新令牌对（轮换） |
| POST | `/api/auth/logout` | 登出，清除 Cookie 并作废会话（幂等，无需有效 access） |
| POST | `/api/auth/forgot-password` | 请求重置 `{email}`；默认不返回令牌。仅当 `PASSWORD_RESET_RETURN_TOKEN=true`（本地开发）时才回传 `reset_token` / `reset_url` |
| POST | `/api/auth/reset-password` | 重置 `{token, new_password}`（≥8 位且含字母+数字，单次有效） |

登录存在**内存限速**：单 IP+用户名窗口内最多 5 次失败、IP 级突发上限，超限返回 `429`。

---

## 3. 用户与资料

### `/api/users`
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/users/me` | 当前用户信息 |
| POST | `/api/users/change-password` | 修改密码 `{old_password, new_password}` |
| GET | `/api/users/profile` | 当前用户资料 |
| PUT | `/api/users/profile` | 更新资料（年龄/性别/身高/体重/活动水平/饮食目标等） |

---

## 4. 食物

### `/api/foods`
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/foods/search` | 搜索食物（需登录） |
| GET | `/api/foods/{food_id}` | 食物营养详情（需登录） |

---

## 5. 组学数据（上传、查询、分析）

### `/api/genomic`
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/genomic/upload` | 上传基因组数据，返回列表 |
| GET | `/api/genomic/user` | 当前用户的基因数据 |
| POST | `/api/genomic/analysis` | 基因组分析 |

### `/api/microbiome`
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/microbiome/upload` | 上传微生物组数据，返回列表 |
| GET | `/api/microbiome/user` | 当前用户的微生物组数据 |
| POST | `/api/microbiome/analysis` | 微生物组分析（多样性等） |

### `/api/metabolomics`
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/metabolomics/upload` | 上传代谢组学数据 |
| GET | `/api/metabolomics/user` | 当前用户的代谢物数据 |
| POST | `/api/metabolomics/analysis` | 代谢通路富集 / 分析（`enrichment_score` / `p_value` 为**确定性启发式**，由通路计数推导，**非统计检验**） |
| DELETE | `/api/metabolomics/{data_id}` | 删除一条代谢物记录 |

---

## 6. AI 预测 `/api/predict`

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/predict/glucose-response` | 血糖响应预测 `{user_id, food_ids, portion_sizes?}` → 血糖曲线/峰值/AUC/解读 |
| POST | `/api/predict/nutrient-absorption` | 营养素吸收预测 `{user_id, nutrient, amount_mg}` → 吸收率/生物利用率/特征贡献 |
| GET | `/api/predict/risk-assessment` | 慢病风险评估 → 糖尿病/肥胖/心血管风险分 + 建议 |

> **实现说明（诚实）**：以上接口当前均由**确定性规则/启发式**实现——`glucose-response` 为确定性公式，`risk-assessment` 为启发式打分，`nutrient-absorption` 为确定性剂量-吸收曲线；返回的 `feature_contributions` 是**比例摊派的启发式贡献权重**，并非 SHAP。`research/prototypes/` 下的代谢响应模型、基因-营养 GNN、微生物组 VAE 均为**研究原型，未接入线上 API**；其 `weights/` 权重在合成数据上训练且从不加载。

## 7. 推荐 `/api/recommendations`

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/recommendations/personalized` | 最近 10 条个性化推荐 |
| POST | `/api/recommendations/food-score` | 食物营养评分 `{food_id}` |
| POST | `/api/recommendations/meal-plan` | 生成饮食计划（按能量目标贪心挑选低 GI 食物，保证蛋白质来源） |

---

## 8. 数据集 `/api/datasets`

详见 [DATASETS.md](./DATASETS.md)。概要：

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/datasets` | 所有数据集及状态 |
| GET | `/api/datasets/categories` | 按分类归组 |
| POST | `/api/datasets/download` | （重新）生成本地样例数据（不联网） |
| POST | `/api/datasets/download/{id}` | 生成指定数据集的本地样例（不联网） |
| POST | `/api/datasets/import/{id}` | 导入指定数据集到数据库 |
| GET | `/api/datasets/stats` | 数据集统计 |
| GET | `/api/datasets/tianchi...` | 天池集成（框架/mock） |

---

## 9. 营养警报 `/api/nutrition-alerts`

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/nutrition-alerts/deficiencies` | 基于近期摄入分析营养素缺乏风险 |
| GET | `/api/nutrition-alerts/summary` | 营养警报摘要 |

## 10. 数据导入导出 `/api/import-export`

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/import-export/import/{data_type}` | 上传 CSV/JSON 导入（`data_type` ∈ `genomic`/`microbiome`/`metabolomics`，≤5MB） |
| GET | `/api/import-export/export/{data_type}` | 导出当前用户数据为 CSV/JSON |
| GET | `/api/import-export/templates/{data_type}` | 获取导入模板 |

---

## 11. 健康检查

```
GET /health
```
返回 `{"status": "ok", "service": "MetaNutri", "database": "ok"}`，`database` 表示 PostgreSQL 连通状态。