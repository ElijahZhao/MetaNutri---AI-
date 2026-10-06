# 竣工度评审报告 — MetaNutri---AI-

- 评审对象：`ElijahZhao/MetaNutri---AI-` @ `0a7dafc`
- 立场：审计员，不复述作者判断、不默认「已竣工」
- 结论标注：**【已核实】**=有路径/行号证据；**【推断】**=个人判断；`未确认`=无法取证

---

## 一、先立标准（竣工判定维度）

采用两套公开标准交叉，覆盖「能交付」与「能开源维护」两面：

1. **OpenSSF OSPS Baseline**（开源项目安全基线，含 Governance / Design / Build / Release 等控制项，如 `OSPS-SA-01.01` 设计文档、`OSPS-BR-*` 构建、`OSPS-RL-*` 发布）。本仓库 [ARCHITECTURE.md L4-L7](file:///workspace/docs/ARCHITECTURE.md#L4-L7) 已自述按该基线裁剪对齐。
2. **上线/发布就绪清单**（部署就绪演练 Go-Live Checklist、Release Readiness Go/No-Go）通用维度：功能完整性、测试覆盖、文档、构建与部署、代码质量、异常处理、安全、可维护性、许可与合规。

> 说明：具体条款编号/来源为上述公开标准的通用归纳；本报告不逐条引用其正文，只用其**维度**作评审骨架。

---

## 二、逐项核验

| # | 维度 | 判定 | 依据 |
|---|---|---|---|
| 1 | 功能完整性 | **部分达成** | 【已核实】43 个 REST 路由（`grep @router.* backend/app/api` = 43），前端 10 个受保护页 + 2 个认证页（`frontend/src/app/`）。平台「AI」接口为**自述的**确定性启发式（[PROJECT-NOTES.md L25-L39](file:///workspace/docs/PROJECT-NOTES.md#L25-L39)、[API.md L9](file:///workspace/docs/API.md#L9)），接口真实、模型非真实——**作为演示项目算达成，作为「精准营养 AI」则未达成**。 |
| 2 | 测试覆盖 | **部分达成** | 【已核实】前端 6 个单测 + 1 个 e2e（`smoke.spec.ts`）；研究模块 `ruff` + `pytest`（90% 覆盖率门槛，[ci.yml L126-L133](file:///workspace/.github/workflows/ci.yml#L126-L133)）；**后端 0 测试**——`backend/` 无 `tests/`，CI 后端任务只做 `compileall` + import 冒烟（[ci.yml L96-L103](file:///workspace/.github/workflows/ci.yml#L96-L103)），作者本人也如实写明（[CONTRIBUTING.md L140](file:///workspace/CONTRIBUTING.md#L140)）。 |
| 3 | 文档 | **部分达成** | 【已核实】README×2、`docs/` 7 篇、CHANGELOG、CONTRIBUTING、SECURITY、CITATION、ARCHITECTURE 齐备。**扣分项**：requests 版本不一致、结构树漏列 PROJECT-NOTES、BIG IDEAs DOI 冲突（详见 §三）。 |
| 4 | 构建与部署 | **已达成** | 【已核实】`backend/Dockerfile`（非 root）、`frontend/Dockerfile(.dev)`、`docker-compose.yml`、`start.sh`、`vercel.json`、`render` 说明、CI 四任务（frontend/e2e/backend/research）。**【未确认】**CI 中 `actions/checkout@v7` 等 tag 的有效性（无网络核实）。 |
| 5 | 代码质量 | **已达成** | 【已核实】前端 `typecheck`+`lint`；后端 `ruff` F 规则已清零（[CHANGELOG L33-L34](file:///workspace/CHANGELOG.md#L33-L34)）；无 TODO/FIXME/HACK（全库检索仅 AUDITS.md 一处描述性提及）。 |
| 6 | 异常处理 | **部分达成** | 【已核实】`main.py` 有全局异常处理、`get_db` 有 commit/rollback/close（[session.py#L46-L55](file:///workspace/backend/app/db/session.py#L46-L55)）；导入接口逐条容错。**【推断】**因后端无测试，异常分支的**行为**未被任何自动化验证。 |
| 7 | 安全 | **已达成** | 【已核实】httpOnly cookie、bcrypt、限流、CSP 与安全头（[next.config.ts L15-L48](file:///workspace/frontend/next.config.ts#L15-L48)）、非 root 容器、CI 最小权限、`forgot-password` 不再回传 token、默认 `SECRET_KEY` 生产硬失败。见 [SECURITY.md](file:///workspace/SECURITY.md)。 |
| 8 | 可维护性 | **已达成** | 【已核实】模块分层清晰、命名一致、死代码已清；`docs/ARCHITECTURE.md` 说明取舍。 |
| 9 | 许可与合规 | **已达成** | 【已核实】[LICENSE](file:///workspace/LICENSE)=MIT；[CITATION.cff](file:///workspace/CITATION.cff)；数据许可在 [research/README.md L64-L67](file:///workspace/research/README.md#L64-L67)、[research/data/README.md L45-L58](file:///workspace/research/data/README.md#L45-L58)、报告 §9 明确（CGMacros = CC BY-NC-SA 4.0 非商用，BIG IDEAs = ODC-By 1.0），并如实说明上游 `LICENSE.txt` 为空文件。 |

---

## 三、未达标项清单（带证据）

| 级别 | 项 | 证据 |
|---|---|---|
| **高** | 后端零测试 | `backend/` 无 `tests/`；[ci.yml L79-L103](file:///workspace/.github/workflows/ci.yml#L79-L103) 仅语法+导入 |
| **中** | README 版本声明与依赖不符 | [README.md L256](file:///workspace/README.md#L256) `requests 2.32` vs [requirements.txt L38](file:///workspace/backend/requirements.txt#L38) `2.33.0`（中英两份同错） |
| **中** | 研究数据 DOI 自相矛盾 | [download_bigideas.py L5](file:///workspace/research/src/download_bigideas.py#L5) `10.13026/w591-tp72` vs [technical_report.md L8](file:///workspace/research/reports/technical_report.md#L8) 与 [data/README.md L49](file:///workspace/research/data/README.md#L49) `10.13026/zthx-5212`（同一 v1.1.2） |
| **中** | 结构树漏列新文档 | 两份 README 的 `docs/` 段缺 `PROJECT-NOTES.md` |
| **低** | 历史日志与发布日志冲突 | [AUDITS.md L14](file:///workspace/docs/AUDITS.md#L14)（加 scikit-learn）vs [CHANGELOG L41-L42](file:///workspace/CHANGELOG.md#L41-L42)（移除） |
| **低** | e2e 仅 1 条冒烟 | `frontend/tests/e2e/smoke.spec.ts` 单文件 |
| `未确认` | CI Actions tag 有效性 | [ci.yml L21-L23, L51-L53, L86-L88](file:///workspace/.github/workflows/ci.yml#L21-L23)（@v7）无网络核实 |

---

## 四、竣工度评分

按 9 维度等权，各维度按「已达成=满分 / 部分达成=半分 / 未达成=0」：

| 维度 | 权重 | 得分 |
|---|---|---|
| 功能完整性 | 1 | 0.5（演示定位达成，AI 声明达成） |
| 测试覆盖 | 1 | 0.5 |
| 文档 | 1 | 0.7 |
| 构建与部署 | 1 | 0.9（`未确认` CI tag 扣分） |
| 代码质量 | 1 | 1.0 |
| 异常处理 | 1 | 0.5 |
| 安全 | 1 | 1.0 |
| 可维护性 | 1 | 1.0 |
| 许可与合规 | 1 | 1.0 |
| **合计** | 9 | **7.1 / 9 ≈ 79 / 100** |

**评分：79 / 100** — 【判断】这是一个**高质量、诚实、可运行的个人作品集/研究项目**，主要短板集中在**后端自动化测试缺失**，其余为可一次性修掉的文档瑕疵。

---

## 五、按优先级的补齐建议

1. **【高】给后端补最小测试**：至少覆盖 `app/core/security.py`（JWT 签发/校验、密码哈希）、`app/api/auth.py`（登录/刷新轮换/找回密码默认不回传 token）、`app/api/import_export.py`（大小/扩展名/data_type 边界）。用 `pytest` + `httpx.AsyncClient`，接入 CI `backend` 任务的可选步骤。— 这是把评分从 79 拉到 90+ 的**唯一高杠杆项**。
2. **【中】修 3 处文档事实**：requests 版本、BIG IDEAs DOI、结构树补项（见《修缮清单》）。
3. **【中】核对 CI Actions tag**：确认 `@v7` 是否为有效版本，否则 CI 静默失败（用 `actions/checkout@<有效major>`）。
4. **【低】扩展 e2e**：至少覆盖登录→仪表盘→导出主链路。
5. **【低】给 `docs/AUDITS.md` 加时间线说明**，避免与 CHANGELOG 冲突。

---

## 六、我最不确定的 5 处

1. CI Actions `@v7` 是否有效（决定「构建与部署」是否为真·已达成）。
2. `requests` 是否有更高补丁版（未做 CVE 扫描）。
3. 「16 页技术报告」的**页数**是否准确（PDF 存在，但未逐页核对）。
4. README 中三个线上地址是否仍可访问。
5. 后端「异常处理已达成」的判断——代码结构看起来完整，但**无测试证明其行为**，故我只能给「部分达成」。
