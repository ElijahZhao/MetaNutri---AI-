# 文件体检报告 — MetaNutri---AI-

- 对象：`ElijahZhao/MetaNutri---AI-`（本地工作副本 `/workspace`，shallow clone）
- 版本：`0a7dafc`（main），工作区干净
- 方式：检查矩阵（1 建档 + 6 维度专项 + 1 交叉复核），**全程只查不改**
- 覆盖率分母：`git ls-files` = **245 个受跟踪文件**

> 全文结论分两类：**【事实】**=已核实（附路径/行号）；**【判断】**=我的推断。不确定项标 `未确认`。

---

## 第 0 轮 · 建档

受跟踪文件 245 个，分布：

| 目录 | 文件数 | 用途 |
|---|---|---|
| `frontend/` | 107 | Next.js 16 前端（页面、组件、lib、types、测试、配置） |
| `research/` | 55 | 独立 ML 研究模块（流水线、Streamlit demo、报告、原型） |
| `backend/` | 53 | FastAPI 后端（api/core/db/ml/models/schemas/services + data） |
| `docs/` | 13 | 文档 + 截图/横幅资源 |
| `.github/` | 3 | CI、保活、Dependabot |
| 根目录 | 14 | README×2、LICENSE、CHANGELOG、CONTRIBUTING、SECURITY、CITATION、compose、start.sh、package.json 等 |

【事实】无 `node_modules/`、`__pycache__/`、`*.log`、`*.pyc`、`.env` 等被跟踪的垃圾文件。

---

## 第 1 轮 · 死文件（无任何引用）

- 【事实】抽查全部 10 个可疑前端组件（`ParticleBackground`、`BioBackground`、`BioCanvas`、`SpotlightTitle`、`TypeWriter`、`ScrollReveal`、`MetabolicPathway`、`RouteLoading`、`Skeleton`、`NutritionAlerts`），**均有实际引用**：例如 [ClientProvider.tsx](file:///workspace/frontend/src/components/ClientProvider.tsx#L4-L5) 引 `ParticleBackground`/`BioBackground`，[content.tsx](file:///workspace/frontend/src/app/content.tsx#L9) 动态引 `BioCanvas`，[dashboard/content.tsx](file:///workspace/frontend/src/app/(app)/dashboard/content.tsx#L4-L5) 引 `MetabolicPathway`/`NutritionAlerts`。
- 【事实】`CHANGELOG.md` L36-L42 与 `docs/AUDITS.md` L27-L30 记录了此前的死代码清理（`SHAPExplainer`/`LIMEExplainer`、`rbac_service`、`models/rbac.py`、`ml/microbiome_analysis.py` 等）。
- **本轮新发现**：无死文件。第 1 轮未覆盖对象：未逐行复核 `research/src/*.py` 的内部函数级死代码（只按文件级引用判断）。

---

## 第 2 轮 · 重复与冲突

- 【事实】重复内容（`md5sum` 一致）：
  - `research/app/assets/fig5_external_validation.png` == `research/reports/figures/fig5_external_validation.png`（md5 `5a029eb7…`）
  - `research/app/assets/external_results.csv` == `research/experiments/external_results.csv`（md5 `7d8ffa0d…`）
- 【判断】这是**有意复制**：`research/app/` 是自包含的 Streamlit demo（[ARCHITECTURE.md](file:///workspace/docs/ARCHITECTURE.md#L39) 写明 demo「loads `model/*.json`, no network」），运行时不依赖 `reports/`/`experiments/`。**建议保留**，如需消除可改为构建时复制，但会牺牲自包含性——不划算。
- 【事实】多个空 `__init__.py` 内容相同（全是空文件），属 Python 包标记，正常。
- 【事实】**文档口径冲突**：[AUDITS.md](file:///workspace/docs/AUDITS.md#L14) 第 1 条记「requirements 补 `scikit-learn==1.5.1`」，而 [CHANGELOG.md](file:///workspace/CHANGELOG.md#L41-L42) 记「已移除 `shap`/`scikit-learn`/`scipy`」；当前 [backend/requirements.txt](file:///workspace/backend/requirements.txt#L33-L34) 确认**不含**这三个包。两份文件按时间线各说各话，**单看任一都会误判**。
- **本轮新发现**：AUDITS.md#1 与现状（及 CHANGELOG）冲突（中危，见修缮清单）。

---

## 第 3 轮 · 引用链（删除/改名后的失效面）

- 【事实】`docs/PROJECT-NOTES.md`（2026-10 新增）**未被任一 README 的结构树列出**：[README.md](file:///workspace/README.md#L562-L569) 与 [README.zh-CN.md](file:///workspace/README.zh-CN.md#L562-L569) 的 `docs/` 段落只列了 API/ARCHITECTURE/AUDITS/DATASETS/DEPLOYMENT/ROADMAP。
- 【事实】README 正文的 markdown 链接只指向 `docs/API.md` 与 `docs/ROADMAP.md`；`docs/ARCHITECTURE.md`、`DATASETS.md`、`AUDITS.md`、`PROJECT-NOTES.md` **只能靠结构树被发现**（且 PROJECT-NOTES 连结构树都没有）→ 接近孤儿文档。
- 【事实】`README.md` L28 引用的两个外部地址（Vercel 前端、Streamlit demo）与 L31 Render 后端地址属外部资源，未在本地校验可达性。
- **本轮未覆盖对象**：未验证 `frontend/src` 中所有 `@/...` 别名导入是否 100% 可解析（仅靠构建/CI 兜底）。

---

## 第 4 轮 · 文档一致性（README/注释/文档 ↔ 代码）

| 声明处 | 内容 | 代码事实 | 结论 |
|---|---|---|---|
| README.md L34 / zh L34 | 43 REST 接口 | `grep @router.* backend/app/api` = **43** | ✅ 一致 |
| README.md L34 / zh L34 | 8 个精选数据集 | `backend/data/*.json` = **8** | ✅ 一致 |
| README.md L256 / zh L256 | `requests` **2.32** | [requirements.txt](file:///workspace/backend/requirements.txt#L38) = **2.33.0** | ❌ **不一致** |
| README 技术栈（Next 16 / React 19 / TS 5 / Tailwind 3 / ECharts 6 / Query 5 / Zustand 5 / RHF 7 / Zod 4） | — | [package.json](file:///workspace/frontend/package.json#L26-L39) 全部吻合 | ✅ 一致 |
| README 后端（FastAPI 0.115 / SQLAlchemy 2.0 / Redis 5 / Pydantic 2 / jose 3.5 / passlib 1.7） | — | [requirements.txt](file:///workspace/backend/requirements.txt#L1-L28) 全部吻合 | ✅ 一致 |
| README 研究（XGBoost 3.4 / sklearn 1.9 / scipy 1.18 / statsmodels 0.15 / numpy 2.5 / pandas 3.0 / matplotlib 3.11 / WeasyPrint 70） | — | [research/requirements.txt](file:///workspace/research/requirements.txt#L3-L16) 全部吻合 | ✅ 一致 |
| README 结构树 `docs/` 段 | 7 项 | 实际 `docs/*.md` = 7（含 PROJECT-NOTES） | ❌ 漏列 PROJECT-NOTES |
| README 结构树前端组件段 | — | 实缺 `ClientProvider.tsx`、各 `*.test.tsx` | 轻微、可接受 |

- **本轮新发现**：requests 版本不一致（中危）；PROJECT-NOTES 漏列（中危）。
- **本轮未覆盖对象**：`docs/DEPLOYMENT.md`、`docs/DATASETS.md` 未逐行与代码对账（仅抽读）。

---

## 第 5 轮 · 安全与配置

- 【事实】**无硬编码真实密钥**。全库检索命中项均为：变量名、`os.getenv` 读取、占位/哨兵值、docstring。
- 【事实】[config.py L75-L88](file:///workspace/backend/app/core/config.py#L75-L88)：`SECRET_KEY` 仍为默认占位值时告警，并在生产（`RENDER=true`）**硬失败**，除非 `ALLOW_DEFAULT_SECRET_KEY=1`。
- 【事实】[.env.example](file:///workspace/backend/.env.example) 已注明占位值即哨兵值、`PASSWORD_RESET_RETURN_TOKEN` 默认 false、`COOKIE_SAMESITE=none` 会致启动失败。
- 【事实】[.gitignore](file:///workspace/.gitignore) 覆盖 `.env`、`.env.*.local`、`.deploy/`、`.screenshots/`、`*.pid`、`SECRETS*.md`、`research/data/{raw,interim,processed}/`。
- 【判断】`.gitignore` 未忽略 `backend/.env`（仅有通用 `.env` 规则，规则 `L7 .env` 已覆盖任意层级同名文件，实际有效）。✅
- **本轮新发现**：无高危项。
- **本轮未覆盖对象**：未做依赖 CVE 扫描（无网络/离线工具），`requests 2.33.0`、`torch 2.12.0` 等版本是否存在已知漏洞 `未确认`。

---

## 第 6 轮 · 残留物

- 【事实】无被跟踪的临时文件/调试产物/构建产物（`git status --ignored` 仅显示 `.screenshots/` 等已忽略目录）。
- **本轮新发现**：无。
- **本轮未覆盖对象**：未检查 `research/prototypes/weights/*.pt`（9.4 MB）是否为「必须入库」的产物——但 [.gitignore L22-L23](file:///workspace/.gitignore#L22-L23) 明确说明是**有意跟踪**。

---

## 第 7 轮 · 交叉复核（新人视角 + 10% 抽样）

**新人视角易踩坑处：**
1. 仓库同时存在根 `package-lock.json` 与 `frontend/package-lock.json`，易误判为误提交；已由 [next.config.ts L9-L14](file:///workspace/frontend/next.config.ts#L9-L14) 注释解释（根锁文件服务 husky）。
2. `research/` 需 Python ≥3.12、`backend/` 需 ≥3.11，两处要求不同，README 两处均写明，但初读易混。
3. `docs/AUDITS.md` 是历史日志，条目与 `CHANGELOG.md` 可能阶段性冲突（见第 2 轮）。

**10% 抽样深度复核**（25 个文件，覆盖各目录）：结论与前六轮**一致**，无新增中危以上条目。

---

## 分类清单与处置建议

### 保留（无需改动）
- 全部 245 个受跟踪文件中的绝大多数：前端组件/页面/lib/types、后端 api/core/db/ml/models/schemas/services、`research/src` 流水线、`research/app` demo、`docs/assets`、`.github/workflows`。
- `research/app/assets/*` 的两处重复文件（为 demo 自包含）。
- `research/prototypes/weights/*.pt`（有意入库，见 `.gitignore` 注释）。

### 待更新
| 项 | 位置 | 建议 |
|---|---|---|
| requests 版本 | [README.md L256](file:///workspace/README.md#L256)、[README.zh-CN.md L256](file:///workspace/README.zh-CN.md#L256) | `2.32` → `2.33` |
| 结构树漏列 | 两份 README 的 `docs/` 段 | 补 `PROJECT-NOTES.md # 项目自述` |
| 孤儿文档 | `docs/{ARCHITECTURE,DATASETS,AUDITS,PROJECT-NOTES}.md` | 在 README 正文（如 Project Status / 文档段）加 1–2 条链接 |
| 历史口径 | [docs/AUDITS.md L14](file:///workspace/docs/AUDITS.md#L14) | 加一行注记：该项后被 CHANGELOG 覆盖（已移除 scikit-learn） |

### 待删除
- 无。**未发现应删除的文件。**

### 存疑（需人工确认）
1. `docs/AUDITS.md` 与 `CHANGELOG.md` 是否应合并或交叉引用（历史日志 vs 发布日志的边界）。
2. `docs/ARCHITECTURE.md`/`DATASETS.md`/`AUDITS.md`/`PROJECT-NOTES.md` 是否要纳入 README 顶部导航（TOC）。

---

## 我最不确定的 5 处（供人工复核）

1. **CI 里 GitHub Actions 的版本号**：`actions/checkout@v7`、`setup-node@v7`、`setup-python@v7`、`upload-artifact@v7`（[ci.yml](file:///workspace/.github/workflows/ci.yml#L21-L23)）——在当前时间线是否为有效 tag，我**无网络核实**，`未确认`。若无效则 CI 会直接失败。
2. **是否存在 v1.0.0 tag**：README 有「Latest tag」徽章、CHANGELOG 记 `[1.0.0] - 2026-10-03`，但本地 `git tag -l` 为空；因是 shallow/grafted clone，**不能据此判定线上无 tag**，`未确认`。
3. **依赖 CVE**：无离线数据库，`requests/torch/next` 等是否有已知漏洞 `未确认`。
4. **外部链接可达性**：README 中 Vercel/Render/Streamlit 三个线上地址未验证可访问。
5. **`research/src` 的函数级死代码**：只做了文件级引用判断，未逐函数核查。
