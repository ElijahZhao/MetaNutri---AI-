# GitHub 展示配置记录

> 记录时间：2026-10-03 → 2026-10-04
> 两个仓库展示页的配置留档。其中「About 描述 / Topics / Homepage」因 `gh` 集成令牌无 administration 权限、「社交预览图」因 GitHub 未提供 API，均由仓库管理员在网页端手动完成。
> 保留本文件作为**决策与操作留档**；全部条目已完成 ✅。

## MetaNutri---AI-（主仓库）

- [x] **About 描述**
  > 🧬 AI-powered precision nutrition & metabolic digital twin. Tri-omics (genomics · microbiome · metabolomics) on a Next.js + FastAPI platform, plus a separate real-data ML research module (PPGR on CGMacros / BIG IDEAs). Two live demos.
- [x] **社交预览图** — Settings → General → Social preview → 上传 `docs/assets/social-preview.jpg`（1280×640）

## ppgr-predictor（Demo 仓库）

- [x] **Homepage** — 设为 `https://metanutri-ai-ppgr-predictor.streamlit.app`
- [x] **About 描述**
  > PPGR (2-h postprandial glucose response) prediction on CGMacros — XGBoost + leave-one-subject-out validation, external transfer to BIG IDEAs, and a live Streamlit demo. Demo half of the MetaNutri---AI- project.
- [x] **Topics** — `machine-learning`, `xgboost`, `ppgr`, `glucose`, `cgm`, `digital-health`, `health-tech`, `streamlit`, `python`, `precision-nutrition`
- [x] **社交预览图** — Settings → General → Social preview → 上传 `ppgr-social-preview.jpg`（1280×640）

## 自动化完成的展示增强（留档）

- [x] `MetaNutri---AI-` 创建 Release `v1.0.0`
- [x] `ppgr-predictor` README 补徽章（demo / CI / stack / license / 主仓库）
- [x] `MetaNutri---AI-` README 展示页增强（研究亮点 / 结果图集 / 结构树 / 徽章）
- [x] 新增 `ppgr-predictor` 专属社交预览图（v1 临床监测仪风 + v2 编辑科学风）

> 备注：若日后换用具备 `admin:repo` 权限的令牌，描述 / topics / homepage 可用 `gh` 自动完成；社交预览仍只能网页端上传。
