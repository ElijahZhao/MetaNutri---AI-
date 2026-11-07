<div align="center">

<p align="right">
  <a href="README.md">English</a> | <strong>简体中文</strong>
</p>

# 🩸 PPGR Predictor

**餐后血糖反应预测 —— XGBoost + 留一受试者交叉验证**

[![在线演示](https://img.shields.io/badge/Streamlit-%E5%9C%A8%E7%BA%BF%E6%BC%94%E7%A4%BA-FF4B4B?style=for-the-badge&logo=streamlit&logoColor=white)](https://metanutri-ai-ppgr-predictor.streamlit.app/)
[![CI](https://github.com/ElijahZhao/MetaNutri-Ai-ppgr-predictor/actions/workflows/ci.yml/badge.svg)](https://github.com/ElijahZhao/MetaNutri-Ai-ppgr-predictor/actions/workflows/ci.yml)
[![Python](https://img.shields.io/badge/Python-3.12-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![XGBoost](https://img.shields.io/badge/XGBoost-3.4.1-EB6E4B?style=for-the-badge)](https://xgboost.readthedocs.io/)
[![License: MIT（代码）](https://img.shields.io/badge/License-MIT_%28%E4%BB%A3%E7%A0%81%29-yellow?style=for-the-badge)](LICENSE)
[![License: CC BY-NC-SA 4.0（衍生数据）](https://img.shields.io/badge/License-CC_BY--NC--SA_4.0_%28%E8%A1%8D%E7%94%9F%E6%95%B0%E6%8D%AE%29-lightgrey?style=for-the-badge)](https://creativecommons.org/licenses/by-nc-sa/4.0/)
[![父仓库](https://img.shields.io/badge/%E7%88%B6%E4%BB%93%E5%BA%93-MetaNutri--AI--10b981?style=for-the-badge&logo=github&logoColor=white)](https://github.com/ElijahZhao/MetaNutri---AI-)
[![父仓预印本](https://img.shields.io/badge/DOI-10.21203%2Frs.3.rs--11558064%2Fv1-0ea5e9?style=for-the-badge)](https://doi.org/10.21203/rs.3.rs-11558064/v1)

**冻结的 XGBoost 模型包 · TreeSHAP 解释 · 45 名受试者 · 1,557 餐 · 留一受试者验证**

</div>

根据一餐的**宏量营养素构成**加上少量**受试者级临床特征**，预测餐后 **2 小时血糖反应（PPGR）**。

模型基于 [CGMacros](https://physionet.org/content/cgmacros/1.0.0/)（45 名受试者，1,557 餐）训练，采用**留一受试者交叉验证（LOPO）**——每一次预测的对象都是模型从未见过的人。

> **一句话看点：** LOPO 早餐——**AUC r = 0.890**、**iAUC r = 0.655**，复现了已发表的 CGMacros 基线。同一冻结模型迁移到另一队列后 **iAUC r = 0.23**；为什么掉这么多，正是[测量信度预印本](https://doi.org/10.21203/rs.3.rs-11558064/v1)讨论的问题。

**在线演示：** <https://metanutri-ai-ppgr-predictor.streamlit.app/> · **父平台：** <https://meta-nutri-ai.vercel.app/>

## ✨ 核心亮点

- **真实的预测性能。** 早餐 LOPO AUC *r* = 0.890、iAUC *r* = 0.655；全部餐次 AUC *r* = 0.838、iAUC *r* = 0.451。
- **无受试者泄漏。** 严格留一受试者；缺失值填补与标准化只使用训练折统计量。
- **跨队列结果如实披露。** AUC 可部分迁移到 BIG IDEAs（*r* = 0.569），而 iAUC 与峰值升高跌至约 0.22——如实报告，不做隐藏。
- **精确解释。** 通过 XGBoost `pred_contribs` 给出每餐的 TreeSHAP 贡献。
- **单向溯源。** 32 个策展文件从父仓 `research/` 模块复制，并由 CI 逐字节校验。

## 📸 效果预览

| 模型对比 | 组内与组间技能 |
|---|---|
| ![模型对比](reports/figures/fig2_model_comparison.png) | ![组内与组间技能](reports/figures/fig6_within_between.png) |

| 外部验证（BIG IDEAs） | 保形预测区间 |
|---|---|
| ![外部验证](reports/figures/fig5_external_validation.png) | ![保形区间](reports/figures/fig7_conformal.png) |

在线演示：<https://metanutri-ai-ppgr-predictor.streamlit.app/>

## 🚀 快速开始

```bash
git clone https://github.com/ElijahZhao/MetaNutri-Ai-ppgr-predictor.git
cd MetaNutri-Ai-ppgr-predictor
pip install -r requirements.txt
streamlit run app.py
```

应用会预测三个标量指标、绘制一条**示意性**的 2 小时曲线，并展示逐特征 TreeSHAP 贡献。

> 模型预测的是**标量，不是时间序列**。图中曲线是按预测峰值升高与 iAUC 缩放的群体平均 gamma 形状，界面明确标注为重建曲线而非模型输出。

运行无头冒烟测试：

```bash
python test_app.py
```

它用 Streamlit `AppTest` 启动 `app.py`，点击 **Predict**，断言三个预测与 TreeSHAP 面板正常渲染——无需服务器与网络。

## 📁 目录结构

```
app.py                Streamlit 演示
test_app.py           无头 AppTest 冒烟测试
inference.py          模型加载、预测、TreeSHAP、曲线重建
model/                冻结的提升器与预处理元数据
assets/               外部验证面板所需的结果
requirements.txt      锁定的演示依赖
src/                  父仓 research/src/ 的溯源副本
reports/              父仓 research/reports/ 的溯源副本
experiments/          父仓 research/experiments/ 的溯源副本
data/README.md        数据来源与下载说明
```

## 🛠️ 技术栈

| 组件 | 选型 |
|---|---|
| 语言 | Python 3.12 |
| 演示界面 | Streamlit 1.65.0 |
| 模型 | XGBoost 3.4.1，每个目标一个提升器 |
| 数据 | NumPy 2.5.3 · pandas 3.0.6 · SciPy 1.18.1 |
| 解释 | TreeSHAP（`pred_contribs`） |
| 测试 | Streamlit `AppTest` |

## ❓ 常见问题

<details>
<summary><strong>这是医疗器械吗？</strong></summary>

不是。仅用于研究与作品集展示，不构成医疗建议。
</details>

<details>
<summary><strong>为什么 iAUC 比 AUC 难预测？</strong></summary>

AUC 主要由一个人的整体血糖水平决定；iAUC 分离的是餐食驱动的、高于基线的波动，信号更小也更嘈杂。
</details>

<details>
<summary><strong>外部验证为什么掉这么多？</strong></summary>

BIG IDEAs 使用不同的 CGM 设备（Dexcom G6）、自由生活的饮食记录，且只共享五个特征。[预印本](https://doi.org/10.21203/rs.3.rs-11558064/v1)认为测量信度混淆了跨队列比较。
</details>

<details>
<summary><strong>模型在哪里训练？</strong></summary>

在父仓库的 `research/` 模块。本仓库只携带冻结的 JSON 提升器，演示无需训练环境；两者不一致时以父仓库为准。
</details>

<details>
<summary><strong>演示需要联网吗？</strong></summary>

不需要。模型在本地加载；只有 Streamlit 页面本身通过网络提供。
</details>

## 📝 更新日志

本仓库是再生成的部署副本，**不单独维护更新日志**。内容随父仓 `research/` 模块同步，并固定在标签 [`v1.0.0`](https://github.com/ElijahZhao/MetaNutri-Ai-ppgr-predictor/tree/v1.0.0)；父仓发布记录见 [`MetaNutri---AI-/CHANGELOG.md`](https://github.com/ElijahZhao/MetaNutri---AI-/blob/main/CHANGELOG.md)。

## 🔗 MetaNutri 生态

| 仓库 | 角色 | 在线 |
|---|---|---|
| [`MetaNutri---AI-`](https://github.com/ElijahZhao/MetaNutri---AI-) | 父仓库——全栈平台 + 训练与评估这些模型的 `research/` 模块；托管预印本① | <https://meta-nutri-ai.vercel.app> |
| **本仓库** | 部署壳——Streamlit 演示，由父仓库单向再生成 | <https://metanutri-ai-ppgr-predictor.streamlit.app> |
| [`MetaNutri-Ai-RAG`](https://github.com/ElijahZhao/MetaNutri-Ai-RAG) | 独立研究仓——基于官方中文营养数据的 NutriQA 基准；托管预印本②（[DOI `10.21203/rs.3.rs-11565315/v1`](https://doi.org/10.21203/rs.3.rs-11565315/v1)） | <https://metanutri-ai-rag-question-answering.streamlit.app> |

**数据流单向：** 父仓库 → 本仓库，没有回流。运行时两者互不调用：无 API 调用、无共享包、无数据交换。

**为什么不用 submodule：** Streamlit Community Cloud 构建仓库根目录并期望根目录有 `app.py`；submodule 会增加一次 checkout 步骤和一个失败模式，却仍无法替代这个精选子集。

**漂移检查。** CI 运行 [`scripts/check_sync.py`](scripts/check_sync.py)，通过 GitHub API 解析父仓库文件树，比对 32 个策展文件的 git blob SHA。

## 📊 结果（LOPO，Pearson r）

| 目标 | 仅早餐（n=423） | 全部餐次（n=1,557） |
|---|---|---|
| XGBoost —— 2-h AUC | **0.890** | **0.838** |
| XGBoost —— 2-h iAUC | **0.655** | **0.451** |
| XGBoost —— 血糖峰值升高 | **0.632** | **0.542** |
| 仅能量线性 —— iAUC | 0.255 | 0.143 |
| 仅碳水线性 —— iAUC | 0.107 | 0.147 |

仅早餐列复现了 CGMacros 论文自身的基线（AUC *r* ≈ 0.89，iAUC *r* ≈ 0.64）；全部餐次列是本项目对午餐、晚餐与加餐的扩展。参考基线被模型大幅甩开正是要点：仅碳水计数几乎解释不了受试者特异反应。

把合并相关系数拆开可以看出，AUC 的高 *r* 主要来自组间成分，而 iAUC 的组内与组间成分几乎相等——因此 iAUC 更接近真实的餐食级信号。各目标的中位数分割 ROC-AUC 在 0.74–0.96 之间。详见[技术报告](reports/technical_report.pdf) §4.5。

保形区间的边际覆盖率接近名义值（0.800 / 0.898），但区间偏宽，且对少数个体覆盖不足（§4.6）。受试者随机截距混合效应模型给出 ICC：AUC 0.69、iAUC 0.33（§4.7）。

## 🌍 外部验证（BIG IDEAs）

冻结的 CGMacros 模型在**不重新训练**的情况下应用于 [BIG IDEAs](https://physionet.org/content/big-ideas-glycemic-wearable/1.1.2/)——16 名受试者、656 餐，不同的 CGM 设备（Dexcom G6）、自由生活饮食记录，仅使用两个数据集共享的五个特征。

| 协议（5 个共享特征） | 2-h iAUC r | 2-h AUC r | 峰值 r |
|---|---|---|---|
| CGMacros（LOPO，内部） | 0.49 | 0.82 | 0.51 |
| BIG IDEAs（LOPO，内部） | 0.46 | 0.63 | 0.48 |
| **BIG IDEAs（外部迁移）** | **0.23** | **0.57** | **0.22** |
| BIG IDEAs（外部，仅碳水 Ridge） | 0.36 | 0.29 | 0.36 |

AUC 可部分迁移；iAUC 与峰值升高崩塌，而仅碳水的 Ridge 在这两个目标上迁移得*更好*。内部 LOPO 行说明这是队列之间的偏移，而不是外部数据的噪声。演示中该面板位于 "Does it generalise to another cohort?"。

## ⚙️ 工作原理

- **特征** —— 餐食：碳水 / 蛋白质 / 脂肪 / 纤维（g）、进餐时血糖。受试者：年龄、性别、BMI、HbA1c、空腹血糖、空腹胰岛素、HOMA-IR（推导）、甘油三酯、总胆固醇、HDL、非 HDL、LDL、VLDL、Chol/HDL。
- **目标** —— 高于基线的 2 小时增量 AUC、2 小时总 AUC、血糖峰值升高。
- **模型** —— XGBoost，每个目标一个提升器，`max_depth=1`、`n_estimators=80`、`learning_rate=0.2`。
- **协议** —— 留一受试者。缺失特征用训练折中位数填补、用训练折统计量标准化，确保不从留出受试者泄漏信息。
- **解释** —— 精确 TreeSHAP 值。

## 🔁 重训与复现

`src/`、`reports/` 与 `experiments/` 是父仓 [`research/`](https://github.com/ElijahZhao/MetaNutri---AI-/tree/main/research) 模块的溯源副本。重训始终在**父仓库**的 `research/` 目录内进行：

```bash
bash src/run_all.sh --skip-download   # 数据 → 结果 → 图表 → PDF
```

或分步执行：

```bash
python src/download_data.py      # 下载 CGMacros（约 627 MB）
python src/build_dataset.py      # 构建餐级数据集
python src/experiment.py         # 运行 LOPO 套件
python src/train_final.py        # 导出可部署模型
```

## 📌 引用方式

预印本（Research Square，v1，2026 年 11 月 2 日，**CC BY 4.0**）：
[`10.21203/rs.3.rs-11558064/v1`](https://doi.org/10.21203/rs.3.rs-11558064/v1) · [父仓库内 PDF](https://github.com/ElijahZhao/MetaNutri---AI-/blob/main/preprint/2026-11-02_measurement-reliability-ppgr_preprint_v1.pdf)

本仓库附有 [`CITATION.cff`](CITATION.cff)，GitHub 的 *Cite this repository* 按钮可直接给出该预印本。

```bibtex
@misc{zhao2026ppgr,
  author       = {Yulin Zhao},
  title        = {Measurement Reliability Confounds Cross-Regime Comparisons of Postprandial Glucose Prediction: Evidence from Bidirectional Cross-Cohort Transfer},
  year         = {2026},
  publisher    = {Research Square},
  doi          = {10.21203/rs.3.rs-11558064/v1},
  url          = {https://doi.org/10.21203/rs.3.rs-11558064/v1},
  note         = {Preprint, CC BY 4.0}
}
```

## 📄 数据与许可

**许可是分层的——见 [NOTICE.md](NOTICE.md)。** 代码（`app.py`、`inference.py`、`src/`、`test_app.py`）为 **MIT**。由数据集计算得到的一切（`model/*.json`、`experiments/*.csv`、`assets/*`、`reports/*`）为 **CC BY-NC-SA 4.0**。仓库根目录的 [LICENSE](LICENSE) 为 MIT 文本，仅覆盖代码层。

[CGMacros](https://physionet.org/content/cgmacros/1.0.0/) —— PhysioNet，DOI [10.13026/3z8q-x658](https://doi.org/10.13026/3z8q-x658)，**CC BY-NC-SA 4.0**。原始数据不在本仓库分发；由 `src/download_data.py` 下载。由其衍生的模型以相同许可分发，并注明原作者。

外部验证使用 [BIG IDEAs](https://physionet.org/content/big-ideas-glycemic-wearable/1.1.2/) —— PhysioNet，DOI [10.13026/zthx-5212](https://doi.org/10.13026/zthx-5212)，**ODC-By 1.0**。

## ⚠️ 局限

- 队列较小（45 名受试者），人口学范围窄；对未见受试者的留出性能远低于组内性能。
- iAUC 明显比 AUC 难预测。
- **外部验证有限：** AUC 可迁移（*r* ≈ 0.57），但 iAUC 与峰值升高不能（*r* ≈ 0.22），且仅碳水基线在这两个目标上迁移更好。
- 示意曲线只是视觉辅助，不是经过验证的反应形状预测。
- **不是医疗器械。** 仅用于研究与作品集展示。

**开发说明。** AI 编程工具在脚手架、重构与文档方面提供了辅助。研究设计、实验、评估与最终审查均由作者完成；生成内容经复核与改写后才合并。
