# MetaNutri — Application Summary

> One-page project description + statement-of-purpose talking points for
> AI / AI+X master's applications.
>
> Every number below is traceable to `research/reports/technical_report.md`, the
> reproducible pipeline under `research/src/`, or the deployed demo. Nothing is
> estimated, rounded up, or inferred — this file is deliberately written so that
> it can survive a technical interview.
>
> 用于 AI / AI+交叉学科 硕士申请的一页项目描述与文书要点。文中每个数字都可追溯到
> 技术报告、可复现管线或线上 Demo，无估算、无夸大；按此口径写作，可直接应对面试追问。

---

## 1. Project in one paragraph (EN)

**MetaNutri** is a personalised-nutrition web platform — FastAPI backend, React
frontend with ECharts visualisation, PostgreSQL/Redis, Dockerised and deployed
through CI — paired with an **independent machine-learning research module** with
its own dependencies, data pipeline and public demo. The research module asks a
narrow, falsifiable question: *given a meal's macronutrients and a person's
clinical profile, how well can we predict the 2-hour postprandial glucose
response (PPGR) on people the model has never seen?* Using the open **CGMacros**
cohort (45 subjects, 1,557 meals) under strict **leave-one-subject-out (LOPO)**
cross-validation, I first **reproduced** the published baseline — 2-h AUC
r = 0.890 and iAUC r = 0.655 on breakfast, against the paper's ≈0.89 / ≈0.64 —
then extended it to all meal types, and finally **froze the model and transferred
it to an independent cohort** (BIG IDEAs, 16 subjects, 656 meals, a different CGM
device and free-living food logs). AUC transferred partially (r = 0.569) while
iAUC and peak rise collapsed (r ≈ 0.22) — and a one-variable carbohydrate
regression transferred *better* on those two targets than the tree ensemble. That
negative result is reported, not hidden: it is the finding a within-cohort
evaluation could never expose. The full pipeline is fixed-seed reproducible and
is deployed as a public Streamlit demo with exact TreeSHAP explanations.

## 2. 项目一段话（中文）

**MetaNutri** 是一个个性化营养 Web 平台（FastAPI 后端 + React/ECharts 前端 +
PostgreSQL/Redis，容器化并经 CI 部署），并配有一个**完全独立的机器学习研究模块**
（独立依赖、独立数据管线、独立公开 Demo）。研究模块只问一个可被证伪的窄问题：
*给定一餐的宏量营养素与个人的临床指标，在模型从未见过的人身上，能多准确地预测餐后
2 小时血糖响应（PPGR）？* 我使用公开的 **CGMacros** 队列（45 人、1,557 餐），在严格的
**留一受试者（LOPO）** 交叉验证下**先复现**官方基线（早餐 2h-AUC r = 0.890、iAUC
r = 0.655，对应论文的 ≈0.89 / ≈0.64），再扩展到全部餐型，最后**冻结模型迁移到独立队列**
（BIG IDEAs，16 人、656 餐，不同 CGM 设备、自由生活自报饮食）。结果显示 AUC 部分可迁移
（r = 0.569），而 iAUC 与峰值血糖崩塌（r ≈ 0.22）——且**单变量碳水回归在这两个目标上迁移得
比树模型更好**。这个负面结论被如实写进报告：它恰恰是任何"同队列内评估"永远暴露不出来的
发现。整条管线固定种子可复现，并以公开 Streamlit Demo + 精确 TreeSHAP 解释的形式部署。

## 3. Verified numbers

| Quantity | Value | Source |
|---|---|---|
| Cohort (primary) | CGMacros, 45 subjects, 1,557 meals (iAUC > 0) | report Table 1 |
| Meal types | breakfast 423 / lunch 380 / dinner 451 / snack 303 | report Table 1 |
| Glycemic spread | healthy 573 / prediabetes 576 / T2D 408 meals | report Table 1 |
| Breakfast, XGBoost (LOPO) | AUC r = 0.890, iAUC r = 0.655, peak r = 0.632 | report Table 2 |
| Published baseline (replication target) | AUC ≈ 0.89, iAUC ≈ 0.64 | CGMacros, *Sci Data* 2025 |
| All meals, XGBoost (LOPO) | AUC r = 0.838, iAUC r = 0.451, peak r = 0.542 | report Table 3 |
| Best linear baseline (breakfast iAUC) | energy-only Ridge r = 0.255; carb-only r = 0.107 | report Table 2 |
| External cohort | BIG IDEAs, 16 subjects, 656 meals, 5 shared features | report §2.3 |
| **External transfer** (frozen CGMacros model) | AUC r = 0.569, iAUC r = 0.227, peak r = 0.223 | report Table 4 |
| Control: BIG IDEAs internal LOPO | iAUC r = 0.463 (so the drop is domain shift, not noise) | report Table 4 |
| **Baseline beats the model externally** | carb-only Ridge iAUC r = 0.362, peak r = 0.357 | report Table 4 |

## 4. What the project demonstrates

**Engineering** — a working multi-service platform: JWT authentication with
Redis-backed token consistency, food-database search, data import/export, 11
frontend pages with ECharts visualisation, Docker Compose, CI, and cloud
deployment. (This layer is deliberately frozen and documented as a
demonstration; see §6.)

**Applied ML research** — correct evaluation design (subject-wise splits, no
leakage into preprocessing), a published-baseline replication serving as a
pipeline check, a non-linear model justified by comparison against three
baselines rather than by choice, and an external validation that produces an
honest, uncomfortable result.

**Data engineering and debugging** — building a meal-level table from
minute-resolution CGM plus inconsistent per-subject CSVs (variable headers,
missing columns, inconsistent meal-type labels), and repairing a **date
misalignment defect** in an external dataset: per subject, an integer day-offset
search maximising median post-meal glucose rise subject to retaining ≥90% of
achievable event coverage. The defect is independently corroborated by the
dataset's own 1.1.3 release note (*"Updated misaligned food log dates"*), and the
repair is cross-checked against the study's standardised-breakfast days
(median Δ ≈ +14 mg/dL).

**Research integrity** — I audited my own platform, found that its advertised AI
was not real (hand-written sample data, weights trained on noise, models never
called, random numbers in three endpoints), and rather than deleting the evidence
I froze the platform, corrected its documentation and public wording, and built
the real AI on a separate, verifiable track.

## 5. Statement-of-purpose talking points

1. **I choose the evaluation before the model.** Every number comes from LOPO
   cross-validation; random meal-level splits would let the same person appear in
   train and test, which substantially overstates performance on a
   subject-specific target. Preprocessing is fit on the training fold only.
2. **I replicate before I extend.** The breakfast baseline reproduces at
   r = 0.890 / 0.655 against a published ≈0.89 / ≈0.64. Only after that did I
   extend to all meal types — so the later numbers rest on a validated pipeline,
   not an idiosyncratic one.
3. **I report the result that hurts.** External validation shows the tree
   ensemble losing to a one-variable carbohydrate baseline on iAUC (0.227 vs
   0.362). The lesson — a model whose edge comes from cohort-specific
   interactions carries hidden generalisation risk — is in the report's
   discussion and in the demo itself.
4. **I can separate "it works" from "it looks like it works."** The internal
   BIG IDEAs LOPO control (iAUC r = 0.463) is what makes the external drop
   interpretable as domain shift rather than noise.
5. **I build the infrastructure a result needs to be trusted.** Fixed seeds,
   pinned versions, a 16-page technical report with limitations, a public demo,
   and scripts that regenerate every figure and table from raw data.
6. **I am willing to fix my own narrative.** The platform's AI claims were not
   supported by its code. I documented that, changed the wording, and redirected
   the real work — which is more informative about how I work than a clean story
   would be.

## 6. How to describe this without overclaiming

Say **"the platform is an engineering demonstration; the machine-learning
research is an independent module with a public demo."** Do not say "the platform
predicts blood glucose with AI" — that is not true, and the repository documents
it as a placeholder.

| 可以说 | 不能说 |
|---|---|
| 平台是工程与产品能力的演示（认证、检索、导入导出、可视化、部署） | 平台内置 AI/深度学习血糖预测能力 |
| `research/` 是独立、可复现的真实 ML 研究线，有公开 Demo | 研究模型已接入平台业务 |
| CGMacros 上的 LOPO 指标，且早餐基线复现了论文 | "我们的模型准确率 0.89"（离开 LOPO 与早餐限定即为误导） |
| 外部验证中 AUC 部分可迁移、iAUC 未能迁移 | 模型具备跨人群泛化能力 |
| 决策：P4 不把模型接回后端（成本/约束不划算） | 因为技术做不到 |

Two further boundaries worth stating proactively in an interview:

- **Not a medical device.** No diagnostic or clinical claim is made anywhere.
- **Small-cohort reality.** 45 subjects cannot justify deep sequence models;
  gradient-boosted stumps were chosen because they are appropriate, not because
  they are fashionable. Deep-model comparison remains future work.

## 7. Links

- Technical report (Markdown): `research/reports/technical_report.md`
- Technical report (PDF): `research/reports/technical_report.pdf`
- Live demo: <https://metanutri-ai-ppgr-predictor.streamlit.app/>
- Demo repository: <https://github.com/ElijahZhao/ppgr-predictor>
- Roadmap and audit trail: `docs/ROADMAP.md`
