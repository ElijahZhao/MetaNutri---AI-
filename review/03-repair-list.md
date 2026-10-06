# 修缮清单 — MetaNutri---AI-

- 对象：`0a7dafc`
- 范围：代码、配置、依赖、脚本、文档、注释、测试、构建与部署
- 说明：**本轮只出清单，不改文件**。每条含 位置 / 问题 / 风险 / 可直接采用的改法。
- 分级：严重（会导致错误行为或不安全）/ 中等（事实错误或影响可维护性）/ 建议（优化项）

---

## 中等

### M1 · README 依赖版本与 requirements 不符
- **位置**：[README.md L256](file:///workspace/README.md#L256)、[README.zh-CN.md L256](file:///workspace/README.zh-CN.md#L256)
- **问题**：AI/ML 技术栈表写 `requests | 2.32`，而 [backend/requirements.txt L38](file:///workspace/backend/requirements.txt#L38) 为 `requests==2.33.0`（该包已 Dependabot 升级，[commit 0a7dafc](file:///workspace/CHANGELOG.md)）。
- **风险**：读者/审计者据 README 复现时版本对不上；与「事实先行」的仓库自我要求相悖。
- **改法**：两份 README 表中 `2.32` → `2.33`。

### M2 · 研究数据 DOI 自相矛盾
- **位置**：[research/src/download_bigideas.py L5](file:///workspace/research/src/download_bigideas.py#L5) vs [research/reports/technical_report.md L8](file:///workspace/research/reports/technical_report.md#L8)、[research/data/README.md L49](file:///workspace/research/data/README.md#L49)
- **问题**：同一数据集 BIG IDEAs **v1.1.2** 出现两个 DOI——脚本写 `10.13026/w591-tp72`，报告与数据说明写 `10.13026/zthx-5212`。二者必有一错。
- **风险**：学术写作中 DOI 错误影响可复现性与引用可信度；且这是研究会反复引用的核心出处。
- **改法**：以 PhysioNet 上 v1.1.2 页面标注的 DOI 为准，统一三处（用户需提供/确认正确值，我不臆断）。

### M3 · README 结构树漏列 `docs/PROJECT-NOTES.md`
- **位置**：[README.md L562-L569](file:///workspace/README.md#L562-L569)、[README.zh-CN.md L562-L569](file:///workspace/README.zh-CN.md#L562-L569)
- **问题**：`docs/` 段列了 6 个 md，实际有 7 个（缺 `PROJECT-NOTES.md`）。该文件是作者最看重的项目自述。
- **风险**：读者按结构树找不到它；也让该文档近乎孤立。
- **改法**：`docs/` 段补一行 `PROJECT-NOTES.md   # 项目自述（为何拆成两半）`（中英各一份）。

### M4 · 历史日志条目与现状冲突
- **位置**：[docs/AUDITS.md L14](file:///workspace/docs/AUDITS.md#L14)
- **问题**：记「requirements 补 `scikit-learn==1.5.1`」，但该包**后来被移除**（[CHANGELOG L41-L42](file:///workspace/CHANGELOG.md#L41-L42)、当前 [requirements.txt](file:///workspace/backend/requirements.txt#L33-L34) 不含）。
- **风险**：单读 AUDITS.md 会以为后端仍依赖 sklearn。
- **改法**：在该条「处置」列尾注 `（后被移除，见 CHANGELOG）`；或在文件头加一句「本文件为历史台账，最新状态以 CHANGELOG 为准」。

---

## 建议

### S1 · 后端缺自动化测试
- **位置**：`backend/`（无 `tests/`）；[.github/workflows/ci.yml L79-L103](file:///workspace/.github/workflows/ci.yml#L79-L103)
- **问题**：仅 `compileall` + 导入冒烟，未覆盖任何行为。
- **风险**：`security.py`、`auth.py` 的认证/轮换/限流逻辑改坏不会被 CI 拦住。
- **改法**：加 `backend/tests/`，用 `pytest`+`httpx.AsyncClient`；先覆盖 `security.py` 与 `auth.py` 的关键路径，CI 后端任务追加一步 `pytest`。
- 说明：属「补齐」而非「修缮」，是否采纳由你定；此处只登记。

### S2 · e2e 仅一条冒烟
- **位置**：[frontend/tests/e2e/smoke.spec.ts](file:///workspace/frontend/tests/e2e/smoke.spec.ts)
- **风险**：主链路（登录→仪表盘→导出）无回归保护。
- **改法**：按现有 mock 方式补 1–2 条主链路用例。

### S3 · 文档可达性
- **位置**：`docs/{ARCHITECTURE,DATASETS,AUDITS,PROJECT-NOTES}.md`
- **问题**：README 正文只链了 `API.md`、`ROADMAP.md`，其余仅靠结构树。
- **改法**：在 README「Project Status」或文末「Documentation」段补 2–3 条链接。

### S4 · 重复资源缺少说明
- **位置**：`research/app/assets/{fig5_external_validation.png,external_results.csv}` 与 `research/reports/figures/`、`research/experiments/` 内容相同（md5 一致）
- **说明**：为 demo 自包含**有意复制**，不建议删除。
- **改法**：在 `research/app/assets/` 放一个 `README` 或注释，写明「由 `experiments/`/`reports/` 同步而来，勿单独修改」。可选。

### S5 · `未确认`：CI Actions tag
- **位置**：[ci.yml L21, L23, L51, L53, L73, L86, L88, L112, L114](file:///workspace/.github/workflows/ci.yml#L21-L23)（`actions/checkout@v7`、`setup-node@v7`、`setup-python@v7`、`upload-artifact@v7`）
- **问题**：无法离线确认这些 major tag 是否有效。
- **改法**：确认有效则忽略；无效则改为对应有效 major 版本，否则 CI 直接失败。

### S6 · `未确认`：本地无 git tag
- **位置**：`git tag -l` 为空；CHANGELOG 记 `[1.0.0] - 2026-10-03`，README 有「Latest tag」徽章。
- **说明**：本副本是 shallow/grafted，不能据此判定远端无 tag。
- **改法**：在完整克隆上 `git ls-remote --tags origin` 复核。

---

## 未发现问题的方面（明确记录，避免「没写=没查」）
- 【已核实】无硬编码密钥、无 TODO/FIXME/HACK、无被跟踪的构建/临时产物。
- 【已核实】前端 typecheck/lint、后端 ruff F、依赖版本表（除 M1 外）与代码完全对齐。
- 【已核实】安全基线项（cookie/CSP/限流/最小权限/非 root/密码重置加固）均在位。
