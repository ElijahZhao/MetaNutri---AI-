# MetaNutri 提升路线图（Roadmap）

> 目的：把 MetaNutri 从"工程成熟、AI 空缺"的作品集，升级为**工程 + 真实 AI 研究**双叙事，用于 AI / AI+交叉 方向硕士申请。
>
> 状态：**P0–P3 已完成**。P3 Demo 已部署至 Streamlit Community Cloud（`ElijahZhao/ppgr-predictor`），并在页面上提供只读的**外部验证面板**；BIG IDEAs 外部验证（stretch goal）已完成；**P4 回接平台已决定不做**。P0 为文案级诚实化，不涉及任何逻辑改动。
>
> 遗留项状态：CSRF 专项核查 ✅ 已完成（无阻断项，1 处配置隐患已记入 `AUDIT-FINDINGS.md` 第六节）；技术报告 PDF ✅ 已导出；`.deploy` 误当子模块、遗留 `ppgr-predictor-space.zip` 两处版本库卫生问题 ✅ 已修复。
>
> 评估强化（2026-10-03）：技术报告新增 §4.5，把汇总相关系数拆成**个体内 / 个体间**两部分，并补上**中位数二分 ROC-AUC**；结论：AUC 的高相关主要来自"认出谁反应更高"，iAUC 才更接近真实的餐次信号。对应代码 `research/src/evaluate.py`、图 6、`experiments/results.csv`。
>
> 两仓库关系（本仓库 ↔ `ElijahZhao/ppgr-predictor`）见两份 README 的 "Related Repositories" 章节。
>
> 最后更新：2026-10-03

---

## 0. 两条硬约束（已与项目所有者确认）

1. **现有前端、后端、数据库全部保留，逻辑不做改动**——这是费了大力气建成的工程主体，不推翻。
2. **真实 AI 的工作走旁路新建**：独立目录、独立依赖、独立部署，与现有平台解耦。

允许的例外（仅限"诚实化"，均为文案级、零逻辑风险）：
- `README.md` / `README.zh-CN.md` / `docs/*.md` 的措辞修正
- `frontend/src/lib/i18n.tsx` 中若干**文案字符串**（不碰任何组件、接口、状态逻辑）

---

## 1. 审查结论（11 轮，含 4 路并行仓库审查 + 2 路外部调研 + 逐条复核 + 2 轮实证）

### 1.1 分层评级

| 层级 | 内容 | 判断 |
|---|---|---|
| **A · 真材实料** | 后端认证/食物检索/导入导出（真 DB 逻辑）、前端 11 个页面与 ECharts 可视化、CI/Docker/云部署/SEO | ✅ 可放心写入文书 |
| **B · 规则实现** | 血糖响应（确定性公式）、风险评估（启发式）、餐食规划（贪心规则）、"SHAP 解释"（比例摊派） | ⚠️ 诚实但措辞需修正 |
| **C · 名不副实** | 数据集"下载器"不联网、数据为手写样例、权重由随机噪声训练、模型从未被调用、三个端点掺随机数、首页宣称 deep learning | ❌ 必须处理（申请风险点） |

### 1.2 C 级问题证据清单

| # | 问题 | 证据位置 | 说明 |
|---|---|---|---|
| C1 | "下载器"不下载 | `backend/app/ml/dataset_downloader.py:91-185` | `download_usda_food_database()` 把硬编码列表写入本地文件，无任何网络请求；KEGG / HMP 同理 |
| C2 | 数据是手写样例 | `backend/data/*.json` | 实测 8 个文件合计约 300 条记录：usda 75 / metabolomics 25 / hmp 16 / gene_nutrition 8 / kegg 8 / disease_markers 4 / microbiome_samples 3 / dietary_guidelines 2 |
| C3 | 权重由噪声训练 | `backend/app/ml/train_models.py:19-97` | 全部输入为 `torch.randn` / `torch.rand`，50 epoch，无真实数据、无验证集、无指标 |
| C4 | 模型从未被调用 | `backend/app/ml/weights/`、`backend/app/api/predict.py:93-127` | `get_predictor()` / `get_gnn_model()` / `get_vae_model()` 仅定义未调用；线上走确定性启发式。<br>**项目自身审查已记录此点**（`docs/AUDIT-FINDINGS.md:215-218`），但归类为"低优先级 · 死代码" |
| C5 | 即便调用，输入也是伪造 | `backend/app/ml/metabolic_response_model.py:73-130` | `predict()` 内 genomic / microbiome 输入为 `torch.randn` 现场生成；`microbiome_vae.py:49-90` 的 `suggest_diet()` 返回硬编码文本 |
| C6 | 端点掺随机数 | `api/metabolomics.py:104-148`、`api/predict.py:186-222`、`api/recommendation.py:37-67` | 代谢组 p 值 / 营养素吸收率 / 食物评分均含 `np.random`、`random` |
| C7 | 文档夸大 | `README.md:58,91,92,270,295,376-382`、`docs/DATASETS.md:24`、`docs/API.md:96-104` | README L91 有诚实披露，但被其余措辞淹没；DATASETS.md L24 称"真实训练所用权重"，比 README 更失真 |
| C8 | 首页用户可见夸大 | `frontend/src/lib/i18n.tsx:29,40,42,50,51,53` | "Powered by deep learning" / "state-of-the-art neural networks and attention mechanisms" / "Continuous Learning" |
| C9 | CI 完全不覆盖 ML | `.github/workflows/ci.yml:91-98` | 后端 job 仅 `compileall` + import 冒烟，ML 代码从未被执行 |

### 1.3 为什么此前会得出"竣工"结论

前期审查（`docs/AUDIT-FINDINGS.md`，13 轮）覆盖了工程与文档一致性，并将权重未加载记为"死代码"。**偏差在于**：把"模型没接线"当成清理项，而没有意识到它**使全部 AI 宣传失效**。本路线图修正该判断。

### 1.4 补充审查（第 9–10 轮）

**测试覆盖现实**（`frontend/tests/e2e/smoke.spec.ts`、`frontend/vitest.config.mjs`）

- E2E **用 `page.route('**/api/**')` 打桩**，不依赖真实后端 → **不验证前后端真实集成**，只验证 UI 与路由行为
- E2E 断言覆盖：landing 渲染、未登录访问 `/dashboard` 重定向到 `/login`、登录后进入 dashboard、受保护路由的 app shell
- Vitest 仅匹配 `src/**/*.{test,spec}.*`；已确认的单元测试文件为 `authStore.test.ts`、`BodyMetricsCard.test.tsx`、`OmicsCards.test.tsx`、`Navbar.test.tsx`、`i18n.test.tsx`
- 判断：**核心 AI / 预测路径无任何测试**

**根工具链与新增目录的兼容性**

- 根 `package.json` 仅含 husky（`prepare: husky`）；`.husky/pre-commit` 内容为 `cd frontend && npx lint-staged`
- 但 `core.hooksPath` 未设置、`.husky/_/` 不存在 → **husky 实际未激活**，且 `lint-staged` 并非任何依赖 → 该钩子当前处于休眠状态
- `start.sh` 只引用 `backend/` 与 `frontend/`，`docker-compose.yml` 同理 → **新增 `research/` 不会产生冲突**
- 唯一需注意：根 `.gitignore` 不含 `research/data/`，而 CGMacros 解压后 628 MB+ → **必须为研究数据单独加忽略规则，绝不能提交进仓库**

**认证实现（公开仓库前参考）**

- JWT：access token 默认 15 分钟过期；`decode_token` 校验 `type` 与 `sub`，防 token 类型混淆
- Cookie：`httponly=True`，`secure` / `samesite` 由配置控制
- token 同时写入 Redis 并做一致性校验
- CSRF 防护：**已专项取证（2026-10-03，见 `docs/AUDIT-FINDINGS.md` 第六节）。结论：防护充分，无阻断项。** 要点：认证确实由 Cookie 承载（故 CSRF 是真问题）→ 主防线是 `COOKIE_SAMESITE=lax`（默认）+ 前端同源代理（无需放宽）→ 关键前提是**20 条 GET 全部只读**（28 处写调用全在 POST/PUT/DELETE 内），Lax 不会被"顶级 GET 导航"绕过。**唯一隐患**：`COOKIE_SAMESITE=none` 会一次性移除全部 CSRF 防护且无 token 兜底，叠加 `allow_origin_regex` 放行全部 `*.vercel.app` 即为可利用；当前默认未触发，按 §0 冻结约束不改代码，已记入交接。

### 1.5 第 11 轮增量发现（2026-10-03）

| # | 问题 | 证据位置 |
|---|---|---|
| N1 | 假下载器 / 假天池**已暴露为线上鉴权 API**（`POST /api/datasets/download`、`/download/{id}`、`GET /tianchi*`、`POST /tianchi/download/{id}`） | `backend/app/api/datasets.py:98-135,315-378` |
| N2 | `TianChiDatasetClient.search_datasets()` 返回**编造的数据集 ID + 网址**；`authenticate()` 不发任何请求即 `return True` | `backend/app/ml/dataset_downloader.py:651-693` |
| N3 | `LIMEExplainer._generate_lime_explanation()` 用 `np.random.uniform(-0.1,0.1)*values[i]` 造贡献——连"解释器"本身都是噪声 | `backend/app/ml/explainability.py:90-101` |
| N4 | README **自相矛盾**：L91 有诚实披露，但 L58/L67/L92/L270 仍写 Transformer/GNN/VAE、SHAP-LIME | `README.md`（本轮已修正） |

**处置决定（已与项目所有者确认）**：

- A 线（前端 / 后端 / 数据库）**除首页 i18n 的 6 个纯文本字符串外，全部冻结**，不碰任何逻辑。
- N1 / N2 的线上 API **不改代码**，仅在 `README` / `docs/API.md` / `docs/DATASETS.md` 标注为**演示占位**。
- 诚实化统一叙事：**平台 = 工程演示；真 AI 在独立 `research/` 线**。

---

## 2. 战略决策

```
MetaNutri---AI-/
├── backend/ frontend/ docs/     ← 冻结（仅允许 §0 的文案级修正）
└── research/                    ← 新建：真实 AI 研究模块，独立依赖 / 独立部署
    ├── data/          真实公开数据集（下载脚本 + provenance 说明）
    ├── src/           数据管线 / 特征 / 模型 / 评估
    ├── experiments/   可复现实验（固定种子，一条命令重训）
    ├── reports/       技术报告（可作为写作样本）
    └── app/           Streamlit Demo（独立部署）
```

**叙事分工**：平台 = 工程与产品能力；`research/` = 研究能力。二者互不牵连、互不污染。

Demo 部署平台：**Hugging Face Spaces（Streamlit SDK）**——复用熟悉的 Streamlit，同时获得社区曝光与现成算力。

---

## 3. 研究方向：餐后血糖响应预测（PPGR）

### 3.1 为什么选它

1. **直接对撞项目最大软肋**：现有 `_predict_glucose_response()` 是手调公式。研究报告可写成"把人工启发式替换为真数据训练的模型，性能提升 ΔR"。
2. **有真实、开放、可对标的数据**（见 §3.2）。
3. **天然要求严谨评估**（按受试者划分、跨个体泛化），正是 AI 硕士看重的成熟度。

### 3.2 数据集决策

| 数据集 | 规模 | 餐次宏量营养素 | CGM | 获取 | 许可 | 体积 |
|---|---|---|---|---|---|---|
| **CGMacros（首选）** | 45 人（15 健康 / 16 糖尿病前期 / 14 T2D），10 天，每日早中晚三餐 | ✅ 精确（热量/碳水/蛋白/脂肪/纤维） | Libre Pro 15min + Dexcom G6 Pro 5min，插值至 1min | **开放** | CC BY-NC-SA 4.0（**非商业**） | 628 MB |
| BIG IDEAs Lab | 16 人，8–10 天 | ✅（自由生活自报） | Dexcom G6 5min，mg/dL | **开放** | ODC-BY 1.0 | 4.7 GB（解压 34.1 GB） |
| ShanghaiT2DM | 100 人 T2D | ❌ 仅食物名 + 克数 | 15min | **开放** | — | — |
| OhioT1DM | 12 人，8 周 | ❌ 仅碳水估计 | 5min | ❌ 需 DUA + 机构邮箱 | 受限 | — |
| Zeevi 2015（Cell） | 800 人 | 有 | — | ❌ **不公开** | — | — |

- CGMacros：PhysioNet DOI `10.13026/3z8q-x658`；论文 Das et al., *Sci Data* 12, 1557 (2025)
- 关键点：**CGMacros 是唯一同时具备"餐次时间戳 + 精确宏量营养素 + CGM"的开放数据集**，且自带可复现基线代码
- 注意：CC BY-NC-SA 为非商业许可，作品集用途合规，但需在使用时注明
- 备选/外部验证：BIG IDEAs（同任务、不同人群）、ShanghaiT2DM（跨人群 T2D）
- 已知局限：CGMacros 同时佩戴两台 CGM，两者存在系统性差异（Dexcom G6 读数偏高，最大约 58.7 mg/dL），选哪台会影响结果，须在报告中说明

**已实证（第 9 轮：真实抓取，2026-10-02）**

- **可访问性**：无需凭据、无登录页。但 `physionet.org/files/` 实测限速约 68 KB/s（627 MB 全量不可行）；走官方开放端点 `physionet-open.s3.amazonaws.com/cgmacros/1.0.0/` 实测 264–885 KB/s，**这是唯一可行的下载通道**
- **包结构**：ZIP 657,187,340 字节（626.7 MB），内含 3593 个条目 —— 45 个 `CGMacros-0XX/CGMacros-0XX.csv` + 约 3545 张餐食照片 + `bio.csv` / `microbes.csv` / `gut_health_test.csv`（**这些 CSV 未作为独立顶层文件暴露，只能从 ZIP 内取**）
- **主表真实列名（逐字）**：
  `Unnamed: 0, Timestamp, Libre GL, Dexcom GL, HR, Calories (Activity), METs, Meal Type, Calories, Carbs, Protein, Fat, Fiber, Amount Consumed , Image path`
- **餐食标记方式**：进餐起始行填 `Meal Type`，同一行给出该餐的 Calories/Carbs/Protein/Fat/Fiber/Amount Consumed/Image path，非进餐行为空。实测取值含 `Snacks`（**数据字典只写了 Breakfast/Lunch/Dinner，已过时**）
- **时间戳**：`YYYY-MM-DD HH:MM:SS`，1 分钟网格（Libre 原生 15 min、Dexcom 原生 5 min，均插值到 1 min）
- **样本**：45 人（受试者 24 / 25 / 37 / 40 未完成研究，编号跳空）
- **补充表**：`bio.csv` 45 行（年龄/性别/BMI/A1c/空腹血糖/胰岛素/血脂全套/3 次指尖血糖）；`microbes.csv` 45 行 × 1980 列（1979 个菌种，0/1 二值）；`gut_health_test.csv` 45 行 × 23 列（Viome 肠道健康评分）
- **合规注意**：ZIP 内 `LICENSE.txt` 为 **0 字节空文件**，许可仅以网页声明形式存在（CC BY-NC-SA 4.0）；引用与再分发时需注意此不一致

### 3.3 评估协议（避免数据泄漏，这是报告的核心卖点）

- **划分**：Leave-One-Subject-Out / grouped k-fold。绝不用随机按样本划分。
  - 依据：有研究证明同一数据在随机划分下 RMSE 11.9 mg/dL，而按受试者划分（LOPO）为 21.22 mg/dL——**误差近乎翻倍，即随机划分严重高估性能**
  - 预处理（标准化等）只能在训练折上拟合
- **指标**：
  - 主指标：**R / R²**（预测反应 vs 观测反应，领域标准）
  - 响应量：**iAUC**（2 小时增量曲线下面积）与 **Glu_max / peak rise**
  - 判别能力：以中位数二分类的 **ROC-AUC**
  - 若报告 RMSE/MAE，必须说明是对"血糖值"还是对"反应量"求误差
  - 单位：mg/dL（美国惯例）或 mmol/L，换算 1 mmol/L ≈ 18 mg/dL
- **基线三件套**（缺一不可）：
  1. mean predictor（预测训练集均值）
  2. carb-only 线性模型（"升糖负荷式"启发式的操作化）
  3. energy-only 线性模型
- **重复餐处理**：混合效应模型（subject 随机截距）+ 个体内中心化；分层报告个体内 / 个体间指标

### 3.4 可对标的公开数字

| 来源 | 模型 | 协议 | 性能 |
|---|---|---|---|
| Zeevi 2015 (Cell) | 梯度提升 | LOPO CV | R = 0.68 |
| Zeevi 2015 | 梯度提升 | 100 人独立队列 | R = 0.70 |
| Zeevi 2015 | carb-only | LOPO CV | R = 0.38 |
| Zeevi 2015 | energy-only | LOPO CV | R = 0.33 |
| **CGMacros (Sci Data 2025)** | **XGBoost** | **LOSO** | **2h AUC r = 0.89；iAUC r = 0.64** |
| Mendes-Soares 2019 | XGBoost | — | R = 0.62（carb-only 0.40） |

> 报告中的目标表述范式：
> "相比碳水-only 启发式（R ≈ 0.38），训练后的模型在**未见个体**上把校准相关系数提升到 R ≈ 0.6x–0.7x。"

#### 官方基线实证与切入点（第 9 轮：读取 `PSI-TAMU/CGMacros/parse_data.ipynb`）

- **模型**：`XGBRegressor(max_depth=1, n_estimators=80, learning_rate=0.2, reg_alpha=1, reg_lambda=0)`
- **特征（19 个）**：Carbs / Protein / Fat / Fiber（按热量换算）、Baseline_Libre（餐前基线血糖）、Age、Gender、BMI、A1c、HOMA-IR、Insulin、TG、Cholesterol、HDL、Non-HDL、LDL、VLDL、CHO/HDL、Fasting BG
- **评估**：留一受试者交叉验证（LOSO），`StandardScaler` 仅拟合训练折，逐受试者预测后拼接
- **指标**：`scipy.stats.pearsonr`；目标为餐后 2 小时 iAUC 与 AUC
- **关键切入点**：官方基线**只使用了 Breakfast 一餐**。因此一个诚实且有价值的研究贡献链是：
  1. **复现**官方基线，确认 r ≈ 0.89 / 0.64 可被独立复现
  2. **扩展**到全部餐次（含 Lunch / Dinner / Snacks），把"餐型"作为特征，检验跨餐型泛化
  3. **对比**不同目标（iAUC / AUC / Glu_max）与不同模型（浅层 XGB / 更深模型 / 线性基线），报告 Δ
  - 基线模型刻意极浅（`max_depth=1`）→ 存在**真实、非吹嘘**的提升空间
- 注意：GitHub 仓库 README 的数据链接已过期（写 "under review"），仓库不含数据；基线 notebook 期望特定的解压目录结构

### 3.5 建模策略（小数据现实）

- CGMacros 仅 45 人 → **优先树模型**（XGBoost / LightGBM）
- 依据：在 15 人量级数据上，线性回归 ≈ 梯度提升 ≈ 全卷积 ≈ TCN，作者称之为"information ceiling rather than a modelling limitation"
- 结论：**不要为了"看起来像深度学习"而上 Transformer**。先把树模型做到严谨可复现，再视结果决定是否加序列模型（LSTM/TCN）作为对比实验

### 3.6 必须写入 Limitations 的陷阱

1. 小样本（45 人）→ 跨人群泛化有限
2. 个体内反应波动大：重复餐（一周后重复）的组内相关系数仅 0.16–0.31
3. CGM 传感器滞后：平均时间延迟约 9.5 分钟（SD 3.7）
4. 跨设备不一致：同人同时佩戴两台 CGM，餐次排序 Kendall 相关系数均值仅 0.43
5. 自报饮食记录噪声（分量估计误差、需剔除异常记录）
6. 混淆因素：进餐时段、前一餐间隔、体力活动、睡眠、月经周期
7. 跨人群泛化：以色列队列模型用于美国人群时性能下降（联合训练后 R 提升至 0.618）
8. 可复现性现状：一项对 67 篇血糖预测深度学习论文的审计显示，仅 23.9% 公开代码、37.3% 使用私有数据、55.2% 仅用 12 人的 OhioT1DM——**本项目的"真数据 + 开放代码 + 严格评估"本身即是差异化亮点**

---

## 4. 分阶段执行计划

| 阶段 | 内容 | 交付物 | 验收标准 |
|---|---|---|---|
| **P0 · 诚实化止血** ✅ | 修正 README / README.zh-CN / docs 的 AI 措辞；新增 `Project Status` 与 `Limitations` 区块；i18n 六处文案降级；数据集接口标注为演示占位 | 诚实、专业的现状表述 | 文档中不再出现"线上运行深度学习 / SHAP / LIME"的暗示 |
| **P1 · 研究管线**（核心） ✅ | 下载 CGMacros → 清洗（餐-CGM 对齐、iAUC 计算）→ EDA → LOPO 划分 → 三基线 → 树模型 → 评估 | `research/` 可复现管线 + 结果表与图 | 一条命令重训；固定种子；结果可复现 |
| **P2 · 技术报告** ✅ | Problem → Data → Method → Results（对比三基线）→ Limitations → Future Work | 技术报告（Markdown/PDF） | 可直接作为写作样本提交 |
| **P3 · 交互 Demo** ✅ | Streamlit（**Streamlit Community Cloud**）：输入餐食 + 画像 → 输出三个标量预测 + 示意曲线 + **真实 TreeSHAP** 解释；并含只读的**外部验证面板**（BIG IDEAs，冻结模型跨队列结果） | 公开可点链接 | 加载训练好的模型；解释为精确 TreeSHAP（XGBoost `pred_contribs`，与 `shap.TreeExplainer` 同算法），非比例摊派。**已达成**：<https://metanutri-ai-ppgr-predictor.streamlit.app/> |
| **P4 ·（可选）回接平台** ❌ | 评估把轻量模型（ONNX）接回现有后端 | 可选 | **已决定不做**（违反"冻结后端"约束，且 Render 512 MB 承载不了） |

> 说明：P0–P3 是**一条按序推进的链**，非并行任务。

---

## 5. 明确不做的事

- 不重构、不删除现有前后端与数据库的任何逻辑
- 不为"显得高级"而引入 Transformer / GNN / VAE（小数据下它们不占优，且会重演"名不副实"）
- 不在报告中虚构数据、引用或性能数字
- 不把研究数据提交进仓库（CGMacros 解压后 628 MB+，`research/data/` 必须加入忽略规则）

---

## 6. 已确认决策（2026-10-03）

- [x] **数据集**：以 **CGMacros 为主**；BIG IDEAs 作为可选 stretch goal（外部验证），**非 P1 必需**。**已完成**：使用 1.1.2（1.1.3 沙箱 403 不可下载，自行修复食物日志日期错位），16 人 / 656 餐；结论为 AUC 跨队列可迁移（r≈0.57）、iAUC 与峰值血糖显著衰减（r≈0.22），详见技术报告 §4.4
- [x] **许可**：**接受 CC BY-NC-SA 4.0**（非商业、学术与作品集用途合规）；报告与 Demo 中必须注明数据来源与许可
- [x] **技术报告**：**英文为主**，正文约 2000 词 + 4–6 图 + 3–4 表
- [x] **P4（回接线上平台）**：**不做**（违反"冻结后端"约束，且 Render 512 MB 承载不了）
- [x] P0 的 i18n 文案改动已放行并完成（**仅改 6 个纯文本字符串**，未碰任何逻辑）
- [x] **Demo 托管平台：HF Spaces → Streamlit Community Cloud**（2026-10-03 调整）。原因：Hugging Face 免费档的 Space SDK 仅剩 **Static**，**Gradio / Docker 需付费 PRO**，且已不提供 Streamlit SDK，原定 `space_sdk="streamlit"` 方案不可行。Streamlit Community Cloud 免费且原生支持 Streamlit，代码经 GitHub（`ElijahZhao/ppgr-predictor`）托管后一键部署。代价：免费实例空闲会休眠（冷启动 30–60 s）。
- [x] **SHAP 实现：用 XGBoost 原生 `pred_contribs`（精确 TreeSHAP）**，不引入 `shap` 依赖 —— 算法与 `shap.TreeExplainer` 一致，且省去一个重依赖，更适合 Demo 环境。

---

## 7. 计算环境

- **P1 主线（XGBoost + LOPO）**：**CPU 即可**。45 人 / 约 135 餐的表格数据，分钟级完成，无需 GPU。
- **AutoDL（可选）**：仅在需要**深度序列模型对比实验**（LSTM / TCN）或本地算力不足时使用。注意：
  - 实例为临时环境 → 代码走 Git，数据放数据盘，模型/图表等产物及时同步出来；
  - **不作为 Demo 的常驻托管**（无稳定公网地址）→ Demo 部署在 **Streamlit Community Cloud**（原计划 HF Spaces 因免费档限制已弃用，见 §6）；
  - 按量计费，用完及时关机 / 释放。
- 许可为 CC BY-NC-SA：使用付费算力训练**不构成**"商业使用数据"，合规。

---

## 附：本路线图的证据来源

**仓库内**：`backend/app/ml/*`、`backend/app/api/*`、`backend/data/*`、`frontend/src/lib/i18n.tsx`、`docs/AUDIT-FINDINGS.md`、`.github/workflows/ci.yml`

**外部文献与数据集**：
- PhysioNet CGMacros — https://physionet.org/content/cgmacros/1.0.0/
- Das et al., *Sci Data* 12, 1557 (2025) — https://www.nature.com/articles/s41597-025-05851-7
- PhysioNet BIG IDEAs — https://physionet.org/content/big-ideas-glycemic-wearable/1.1.2/ （DOI 1.1.2：`10.13026/zthx-5212`，ODC-By 1.0）
- Zeevi et al., *Cell* 163(5):1079-1094 (2015) — https://pubmed.ncbi.nlm.nih.gov/26590418/
- Shen et al., *JDST* 2025（SOTA 汇总表）— https://pmc.ncbi.nlm.nih.gov/articles/PMC11883769/
- Leakage-Controlled Evaluation (medRxiv 2026) — https://www.medrxiv.org/content/10.64898/2026.08.03.26359550v1.full
- Hengist et al. 2023（重复餐 ICC）— https://pmc.ncbi.nlm.nih.gov/articles/PMC10371100.1/
- Howard et al. 2020（跨设备一致性）— https://pmc.ncbi.nlm.nih.gov/articles/PMC7528568/
- PLOS Digit Health 复现性审计 — https://journals.plos.org/digitalhealth/article?id=10.1371/journal.pdig.0001633
- UNC Charlotte OhioT1DM（DUA）— https://webpages.charlotte.edu/rbunescu/data/ohiot1dm/OhioT1DM-dataset.html
