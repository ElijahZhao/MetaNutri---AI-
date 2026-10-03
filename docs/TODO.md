# 待办 / Pending — GitHub 网页端手动项

> 以下事项自动化无法完成：当前 `gh` 令牌为**集成令牌**，没有仓库 administration 权限（改不了描述 / topics / homepage），且 GitHub **未提供社交预览的 API**。
> 均需**仓库管理员在网页端操作**；完成后可勾选，或删除本文件。
>
> 记录时间：2026-10-03

## MetaNutri---AI-（主仓库）

- [ ] **About 描述** — 仓库首页右侧 **About ⚙️ → Description**，粘贴：
  > 🧬 AI-powered precision nutrition & metabolic digital twin. Tri-omics (genomics · microbiome · metabolomics) on a Next.js + FastAPI platform, plus a separate real-data ML research module (PPGR on CGMacros / BIG IDEAs). Two live demos.
- [ ] **社交预览图** — **Settings → General → Social preview → Upload an image**，上传 `docs/assets/social-preview.jpg`（建议 1280×640）。

## ppgr-predictor（Demo 仓库）

- [ ] **Homepage** — 设为 `https://metanutri-ai-ppgr-predictor.streamlit.app`（当前为空）
- [ ] **About 描述** — 可更新为：
  > PPGR (2-h postprandial glucose response) prediction on CGMacros — XGBoost + leave-one-subject-out validation, external transfer to BIG IDEAs, and a live Streamlit demo. Demo half of the MetaNutri---AI- project.
- [ ] **Topics** — 添加：`machine-learning`, `xgboost`, `ppgr`, `glucose`, `cgm`, `digital-health`, `health-tech`, `streamlit`, `python`, `precision-nutrition`（当前为空）
- [ ] **社交预览图** — **Settings → General → Social preview**，上传一张 1280×640 的图。

---

## 已完成（记录备查）

- [x] `MetaNutri---AI-` 创建 Release `v1.0.0`
- [x] `ppgr-predictor` README 补徽章（demo / CI / stack / license / 主仓库）
- [x] `MetaNutri---AI-` README 展示页增强（研究亮点 / 结果图集 / 结构树 / 徽章）

> 若日后换用具备 `admin:repo` 权限的令牌，描述、topics、homepage 可尝试用 `gh` 自动完成；社交预览仍需网页端。
