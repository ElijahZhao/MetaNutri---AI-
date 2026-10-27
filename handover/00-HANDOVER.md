# MetaNutri / PPGR 论文项目 · 交接文档

- 版本：v1.0（2026-10-27）
- 交接范围：MetaNutri 平台仓库（维护态）+ PPGR 论文项目（写作态）
- 交接目标：**接手人不得搞崩项目，不得写错论文**。本文档按此目标组织。
- 阅读顺序：先读 §3 红线（十分钟），再读 §4 论文地基（半小时），其余按需查。

---

## 1. 项目一句话

两个东西共用一个 GitHub 组织：

1. **MetaNutri 平台**（主仓 `ElijahZhao/MetaNutri---AI-`）：营养记录 Web 应用
   （前端 Vercel + 后端 Render），线上接口是**规则化启发式评分**（不是 AI，
   README Limitations 章节有明确声明）。当前处于**维护态**：功能冻结、CI 全绿，
   没有计划中的改动。
2. **PPGR 论文**（同仓 `research/` 目录）：基于 CGMacros（45 人/1,699 餐）与
   BIG IDEAs（16 人/656 餐）两个公开数据集的餐后血糖反应预测研究。
   核心主张（Route A）：**PPGR 模型性能必须对照评估体系的测量信度来读**——
   同队列模型低于内部天花板，跨设备信度塌方导致模型塌方，双向迁移失败
   排除样本量解释，iAUC 指标无 baseline 循环而 AUC 是"基线血糖的影子"。
   当前处于**写作态**：六实验全部完成，骨架已成，待展开正文 → medRxiv 预印本。

另有**子仓** `ElijahZhao/ppgr-predictor`：仅承载 Streamlit 线上 demo 的部署壳，
加载三个冻结 XGBoost 模型做推理演示。

## 2. 地理图（什么在哪里）

| 资产 | 位置 | 状态 |
|---|---|---|
| 主仓远程 | github.com/ElijahZhao/MetaNutri---AI- | 公开，main 与 origin 同步（本文档对应 commit `3a4e291`） |
| 主仓本地 | `/workspace`（git 仓库根） | 工作区 |
| 子仓远程 | github.com/ElijahZhao/ppgr-predictor | 公开，**本地无克隆** |
| 论文骨架 | `/workspace/paper/draft.md` | **私有，gitignore，永不入库** |
| 论文待办/决策 | `/workspace/PPGR-论文待办清单.md` | **私有，gitignore，永不入库** |
| 六实验结果 | `research/experiments/ceiling_results.csv` 等 6 个 CSV | **已入库**（commit 9281d51 起） |
| 技术报告（含信度天花板 §5） | `research/reports/technical_report.md` | 已入库 |
| 原始数据 627 MB ×2 | **不在任何仓库** | 靠脚本 + PhysioNet DOI 重取（见 §5） |
| 规范仓库（审查规则） | github.com/ElijahZhao/List-of-open-source-projects-for-AI-coding-agent-specification | 做审查类任务时先拉取其《项目审查提示词库.md》 |

## 3. 红线 —— 做了会出事的事（每条都有血泪依据）

- **R1 永远不要把 `paper/`、`PPGR-论文待办清单.md` 加入 git。**
  `.gitignore` 已配置（`paper/`、`PPGR-论文待办清单.md`、`research/data/raw|interim|processed/`）。
  这几行**不要动、不要"优化"掉**。理由见 §7 事故史。
- **R2 子仓的三个冻结模型 JSON（`xgb_auc/iauc/peak_rise.json` + `preprocess.json`）不要重新导出或覆盖。**
  论文描述的模型 = demo 加载的模型 = 主仓 `research/app/model/` 里那份，必须保持同一份。
  重新训练/导出会让三方失配，论文复现性声明作废。
- **R3 仓库名不改。** `MetaNutri---AI-` 已决策保留（改名代价 > 收益，链接/部署/材料全要跟着断）。
- **R4 不要 force-push、不要重写历史。** 历史已被 git-filter-repo 清理过一次（§7）；
  再次重写会破坏所有外部引用、CI 缓存，且对残留问题毫无收益。
- **R5 Dependabot 的 9 条告警：用户已决策忽略。** 不要擅自升级依赖大版本
  （`research/requirements.txt` 与 `app/requirements.txt` 的 pin 是有意的）。
- **R6 不要删 `research/` 下任何 CSV / 脚本 / 报告。** CI 在跑 ruff + pytest；
  报告里的每个数字都能溯源到某个 CSV，删错一个就断一条证据链。
- **R7 公开仓里永远不出现：论文草稿、novelty 结论、投稿策略、审稿博弈笔记。**
  可公开的论文相关内容只有两类：实验结果 CSV、方法代码（都已在库）。
- **R8 CI 红了先看日志再动手。** 已知模式：F841 死变量 lint（修复示例 commit `3a4e291`，
  删未使用变量即可，不影响任何实验结果）。不要绕过 CI。
- **R9 提交信息中性：** 只描述"改了什么"，不描述"为什么改/按什么流程改"。
- **R10 结果落盘立即 commit。** 沙箱会定期清理大文件（627 MB 原始数据就是这样没的；
  六实验 CSV 靠 commit `9281d51` 才保住）。凡是跑出来的结果，先 commit 再说。
- **R11 traeagent 有自动提交钩子**（提交信息可能是 "feat: update workspace"，且会自动 push）。
  私有文件的唯一防线就是 R1 的 gitignore——所以 R1 是生死线，不是建议。

## 4. 论文：地基与写作禁区

### 4.1 骨架现状

`01-paper-draft.md`（即 `/workspace/paper/draft.md`，287 行）已完成：
标题 3 选 1、摘要草稿、§1–§8 完整结构、12 条参考文献种子、投稿清单。
所有数字已逐个对账（每个都能指出 `ceiling_results.csv` 里的对应行）。

剩余 [TODO]：标题选定、摘要压字数、§4.4 CI 措辞、§6.2 语气校准、期刊选择（等导师反馈）、
复现性审计引用源核对、作者/资助信息。

### 4.2 六实验判决表（数字 + 证据行，写作时直接抄）

| 实验 | 判决 | 关键数字 | 证据（ceiling_results.csv 的 experiment 列） |
|---|---|---|---|
| E2 重复餐信度 | 悖论解除 | 早餐 iAUC 信度 **0.799**（n=174 对，ICC 0.99）；晚餐/加餐 ~0.37；**午餐 0 对（协议缺陷）** | E2 within-subject duplicate-meal reliability |
| E5 baseline 消融 | iAUC 无循环 | iAUC 0.451→**0.457**（去 baseline 不降）；AUC 0.838→0.638；AUC baseline-only 0.807–0.861 | E5/P2 pooled LOPO (xgboost)，subset=`all meals (iauc>0)` |
| P3 聚合到人 | 组内有效 | iAUC 0.451→0.501；AUC 0.838→0.921；**baseline-only 人均 AUC r=0.963** | P3 subject-mean LOPO (xgboost) |
| E3 反向迁移 | 双向皆败 | BI→CG iAUC **0.085**（正向 0.227）→ 排除 n=16 样本量解释 | E3 reverse transfer (BI->CG) |
| E4 跨队列聚合 | 救不了 iAUC | 人均 iAUC **−0.03**（CI −0.43 ~ 0.43）；AUC 0.569→0.715 | E4 subject-aggregated transfer |
| 协议缺陷 | 已如实记录 | CGMacros 无重复午餐 → 信度主张只能主打早餐 | E2 输出行 |

论文引用的其余既有数字（LOPO 0.890/0.655/0.838/0.451、外部迁移 0.569/0.227、
conformal 覆盖率、混合效应等）见 `results.csv` / `external_results.csv` /
`uncertainty.csv` / `mixed_effects_*.csv` 与技术报告正文。

### 4.3 写作致命七坑（踩一个就是学术事故）

1. **作者名是 Mendes-Soares et al. 2019（AJCN，PMC6599737），不是 "Rein"。**
   骨架 v1 曾写错，验证工序抓出并已改正。引用前再核对一遍原文。
2. **两个信度体系禁止互比。** 0.80 = CGMacros 标准化重复早餐信度；
   0.45–0.46 = 文献（Hengist 2023/2024）自由生活重复餐信度。
   两者测的是不同协议下的不同东西。骨架 §2.2 有防御段，**顺序不能动**：
   先自曝先例（Mendes-Soares 自己把重复餐信度 R=0.66 当上限用过），再讲我们的四点增量
   （跨设备 / 双向 / AUC 恒等式 / 人级聚合）。让审稿人先看到自曝，而不是先发现问题。
3. **AUC 恒等式常数 = 120 分钟**（`src/iauc.py` 积分窗口 + `src/build_dataset.py`
   `WINDOW_MIN=120`，15 分钟梯形网格；基线不跌破时严格成立）。
4. **数字只准从 CSV 抄，禁凭记忆。** 且两个子集不得混用：
   `all meals (iauc>0)` = 1,557 餐（正文默认）；`all meals (unfiltered)` = 1,699 餐
   （引用必须显式标注 unfiltered）。
5. **E4 的 −0.03 只能写"统计上无法与零区分（CI −0.43 ~ 0.43，n=16）"**，
   禁写"证明为零"。
6. **措辞沿用已修正版本**："1,557 of 1,699 meals (142 excluded for non-positive iAUC)"，
   不要退回 "every meal"。
7. **两枚金句保真**：(a) 早餐 baseline-only iAUC 0.542 → 餐量特征边际贡献 ≈0.11；
   (b) baseline-only 人均 AUC 0.963 → "谁反应大"几乎完全由空腹血糖排定。

### 4.4 文献格局（谁是支撑、谁不是竞品）

- **支撑文献**：Hengist 2023/2024（重复餐信度 r≈0.45–0.46，只喊"要聚合"，
  没连模型——我们补的正是这个缺环）；Howard 2020（设备间 τ=0.43）；Barber 2021（conformal）。
- **必须正面处理的表面矛盾（P3.5）**：Mendes-Soares 2019 跨队列"成功"（R=0.596）。
  解释已写进骨架 §4.5：他们两队**同设备**（iPro2），天花板稳定，模型站其下；
  我们跨设备，天花板塌方。同一现象两个 regime——**他们是我们缺的对照组实验**。
- **无人撞车**：MICCAI/GlucoGrapher/GlucoFM/LLM-agent 全是任务创新；
  "信度天花板 vs 模型性能对齐 + 双向迁移归因"确认首发。

## 5. 命令手册（从零复现六实验）

```bash
# 0) 环境建议：python ≥3.11，装 research/requirements.txt（pin 版本，见 R5）

# 1) 下载原始数据（共 ~630 MB，沙箱网络慢约 1–2 小时；注意 R10）
cd research
python src/download_data.py          # CGMacros 657,187,340 字节
                                     # SHA256 期望值 05c8b0e6…621d4d（全文见 data/README.md）
python src/download_bigideas.py      # 仅 ~2.4 MB

# 2) 建表
python src/build_dataset.py          # CGMacros → 1,699 餐级表
python src/build_external.py         # BIG IDEAs → 656 餐级表

# 3) 六实验（信度天花板分析）
python src/ceiling_experiments.py    # → experiments/ceiling_results.csv

# 4)（可选）完整原始管线（11 步）
bash src/run_all.sh

# 5) 报告 PDF
python src/export_report_pdf.py

# 6) 测试与 lint（CI 等价物）
ruff check src app
pytest app
```

**重要**：重跑实验前先 commit 现有结果（R10）；实验代码固定随机种子，重跑结果应与
已入库 CSV 一致——若不一致，先停下来查环境，不要静默覆盖。

## 6. 决策台账（已定勿再议，均有据可查）

| # | 决策 | 内容 |
|---|---|---|
| 1 | 许可方案 b（分层） | 代码 MIT；CGMacros 派生产物（processed 表/冻结模型/图/报告）CC BY-NC-SA 4.0；BIG IDEAs 派生产物 ODC-By；混合从严。落地物 `research/NOTICE.md` |
| 2 | Route A 定稿 | 止损条款已不需要（E2/E5 通过，无退回分支） |
| 3 | 发表路线 | **medRxiv 预印本（免费、几天出 DOI）→ 免费订阅制期刊**。用户用途：境外硕士申请。避免全 OA APC（上万） |
| 4 | medRxiv 前提 | 需通讯作者**机构邮箱验证**；若拿不到 edu 邮箱需提前换策略。上传即永久（只能标 withdrawal）→ 正文打磨到位再传 |
| 5 | 泄露残留 | 用户决策：不交 GitHub Support 工单，接受 5 个旧 SHA 直连的极低残留风险 |
| 6 | Dependabot 9 条 | 忽略（R5） |
| 7 | 仓库名 | 不改（R3） |
| 8 | 子仓 | 不动（R2），它是部署壳 |
| 9 | 论文语言 | 英文（技术报告已是英文，直接演化） |
| 10 | 平台"AI"表述 | 平台接口是规则化的（README Limitations 已声明）；Streamlit demo 跑真模型（"real AI"表述准确）。两者别搞混 |

## 7. 事故史（接手人必须知道的过去）

1. **泄露事件**：论文策略文件曾被自动化工具误提交并推上公开仓，暴露窗口 <30 分钟，
   随即用 git-filter-repo 彻底清除 + force-push。**残留**：5 个旧 commit 的 SHA 直连
   仍可访问（GitHub 服务端未 GC），决策接受（§6-5）。接手人义务：
   **不要试图引用或找回那些内容；不要再重写历史（R4）；若被问起，如实说明文件已删除。**
2. **沙箱清理事件**：`/root` 下的规范文件与 627 MB 原始数据被定期清理抹掉；
   六实验 CSV 靠 commit `9281d51` 幸存。教训 = R1、R10。
3. **auto-commit 行为**：见 R11。看到莫名其妙的 "feat: update workspace" 提交，
   那是钩子干的，不是人为。

## 8. 待办（按优先级）

1. **导师反馈**（等用户）：期刊定位。沟通用项目介绍已备好（`03-advisor-intro.md`）。
2. **展开正文**：骨架 → 全文（纯写作活，地基已全验证）。
3. **补一张新图**："信度阶梯"（0.80 / 0.66 / 0.71–0.77 / 0.45 四级天花板 + 模型数字叠加）——全文最锋利的一张图。
4. **定标题 + 压摘要**到 medRxiv/目标期刊字数。
5. **medRxiv 上传**：完整研究才可传；机构邮箱验证；DOI 出来立即填进申请材料。
6. 私有文件的内部小瑕疵：`02-paper-todo.md` 的 §2 是 P1/P2 完成前写的（写着"未做"），
   **以 §3 为准（已标 ✅）**。§5 的两条待拍板（检索词、语言默认英文）若用户无异议即按默认走。

## 9. 本包内容与恢复指南

| 文件 | 是什么 | 恢复到 |
|---|---|---|
| `00-HANDOVER.md` | 本文档 | 任意位置，先读 |
| `01-paper-draft.md` | 论文骨架 v2（287 行，含 12 条文献种子与 [TODO]） | `/workspace/paper/draft.md` |
| `02-paper-todo.md` | 论文待办清单 v2（决策台账 + 六实验判决 + P3 文献核查结论） | `/workspace/PPGR-论文待办清单.md` |
| `03-advisor-intro.md` | 给导师的项目介绍段（可直接粘贴发送） | 无需恢复，发送用 |
| `04-result-CSVs/` | 六个结果 CSV 备份副本 | `research/experiments/`（以公开仓为准，此处仅防灾） |

- 本包**不含任何密钥/凭据**（项目没有 secrets）。
- 但 01/02 含**未发表策略**：仅自存，不要传任何公开平台/网盘分享。
- 建议存本地 + 一处私人云备份（沙箱会被清理，这是 R10 的镜像教训）。

## 10. 接手第一天自检清单

1. clone 主仓，`git log --oneline -5` 确认在 `3a4e291` 或其后代
2. 确认 `.gitignore` 仍含 `paper/`、`PPGR-论文待办清单.md`、`research/data/raw/`（R1）
3. `cd research && ruff check src app && pytest app`——全绿才说明环境 OK
4. 打开 `research/experiments/ceiling_results.csv`，抽 E3=0.0852、
   E4=−0.0292、iAUC no-baseline=0.4568 三行与本文档 §4.2 对账
5. 确认子仓 `ppgr-predictor` 未被改动（对照主仓 `research/app/model/` 的模型文件）
6. 把 01、02 恢复到 §9 指定的路径（**不要 git add 它们**）
7. 读 `01-paper-draft.md` 的 §2.2 与 §4.5 两段（防御工程，顺序神圣）
8. 向用户确认导师反馈是否已回来（§8-1）
9. 建论文写作分支或目录结构时，检查 gitignore 生效：`git status` 必须看不到 01/02
10. 一切就绪后，向用户汇报"接手完成"，等指令再动笔
