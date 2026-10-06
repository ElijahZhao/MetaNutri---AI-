# AI 痕迹诊断书 — MetaNutri---AI-

- 对象：仓库内全部**散文型**文本（ASCII 表格/代码/配置不算「散文」，但注释计入）
- 覆盖：20 / 20 个文件（100%）—— `README.md`、`README.zh-CN.md`、`docs/{PROJECT-NOTES,API,ARCHITECTURE,DEPLOYMENT,DATASETS,ROADMAP,AUDITS}.md`、`research/README.md`、`research/reports/technical_report.md`、`research/data/README.md`、`research/app/README.md`、`CONTRIBUTING.md`、`SECURITY.md`、`CHANGELOG.md`，以及 `start.sh`、`run_all.sh`、`docker-compose.yml`、`ci.yml` 的注释
- 定位：**只诊断，不改写，不删减任何真实的决策/失败记录**

---

## 第 0 步 · 基准锚定（人写文本）

**基准 A（英文）**：`docs/PROJECT-NOTES.md` L34-L39
> "I found all of this auditing my own repository, not by being told. Deleting the awkward parts would have been easy. Instead I froze the platform, fixed its documentation and its public wording, and left the evidence in place. … I would rather a careful reader find an honest placeholder than a claim I can't stand behind."

**基准 B（中文）**：`docs/PROJECT-NOTES.md` L136-L138
> "这是负面结果，它写在报告正文里，没有塞进脚注。让它可解读的是一个对照：BIG IDEAs 在自身 LOPO 下 iAUC 为 0.463——正是这个数，让我能说外部的下降是域偏移，而不是噪声。"

**基准 C（注释）**：`research/src/run_all.sh` L9-L10
> "Downloads are idempotent, so re-running is safe. The step-by-step description of what each script does is in ``reports/technical_report.md`` §8."

**风格特征**（后续判断的参照系）：
- 第一人称、承认不确定与负面结果、给具体数字与文件名；
- 句长不均，长短句混排；敢于用短句收尾（"…for a demonstration that already answers the question."）；
- 不做三段式排比，不堆四字词，不用「赋能/致力于」。

---

## 第 1 轮 · 词级

- **覆盖率**：20 / 20（100%）。未覆盖对象：`research/reports/technical_report.md` 的 §5–§7 仅抽查（正文过长），可能仍有个别套话未列入。
- **新发现**：

| 位置 | 原文 | 类型 | 依据 | 修改方向 |
|---|---|---|---|---|
| CONTRIBUTING.md L3 | 「欢迎您为 MetaNutri 项目做出贡献！我们非常感谢您的帮助和支持。」 | 套话/空洞 | 零信息量开场，与基准 A 的直给风格相反 | 去掉寒暄，直接从「怎么贡献」起 |
| CONTRIBUTING.md L198 | 「感谢您的贡献！🎉」 | 套话 | 结尾祝贺语，模板味 | 可删 |
| README.md L105 | 「nothing is estimated, rounded up or inferred」 | 过度对仗 | 三连排比，略带表演性 | 保留前句事实，删掉这三连 |
| README.md L156-L173 / zh L156-L172 | 「Secure by Default / Polished & Responsive / Transparent Scoring」 | 空洞形容词 | 功能表用了营销式定语 | 不影响事实，可保留；若要降味改成中性描述 |

---

## 第 2 轮 · 句级

- **覆盖率**：20 / 20。未覆盖：`docs/DEPLOYMENT.md`、`docs/DATASETS.md` 未逐句朗读（表格为主）。
- **新发现**：

| 位置 | 原文 | 类型 | 依据 | 修改方向 |
|---|---|---|---|---|
| CONTRIBUTING.md L7-L13 | 「您可以通过以下方式为项目做出贡献：1. **报告Bug**… 5. **帮助用户**…」 | 模板句式 | 五条均等排列，信息密度低 | 合并为 2–3 句人话 |
| CONTRIBUTING.md L62-L108 | 「### Python 代码规范… ### JavaScript/React 代码规范… #### Commit 类型…」 | 机械分节 | 通用规范清单，与本项目关系弱 | 只保留本项目**特有**约定（如 ruff/compileall 冒烟），删掉放之四海皆可的条目 |
| README.md L68-L75 | 「> - **What runs live:** … > - **Research scaffolding (not live):** …」 | 结构化堆叠 | 三连同类 bullet | 内容有价值，属可接受的结构化，**不改** |

---

## 第 3 轮 · 结构级

- **覆盖率**：20 / 20。未覆盖：无。
- **新发现**：
  - **CONTRIBUTING.md 整体**：全篇「emoji 标题 + 等长编号列表 + 等长小节」高度匀齐，是本次最明显的「结构可疑」文件。判定依据：对比基准 A/B 的不匀齐段落结构。
  - **README**：大量表格/徽章属 README 惯例，不记为 AI 痕迹。判定依据：基准 C 所在的脚本注释同样使用结构化排版，说明作者本就有意结构化，非 AI 独有。
  - 结论：除 CONTRIBUTING.md 外，其余文件**未发现**「每段必总结、过渡过度平滑」的典型结构痕迹。

---

## 第 4 轮 · 信息级

- **覆盖率**：20 / 20。未覆盖：无。
- **新发现**：
  - CONTRIBUTING.md L3、L198、L189-L190：均为「正确但零信息量」的表述（问候/感谢/沟通渠道套话）。
  - 对比：README、ARCHITECTURE.md、technical_report.md 信息密度高，**普遍带具体数字与文件名**（如 README L95-L98 的 AUC/iAUC 数值、L386-L396 的模块路径），**符合基准**，不记痕迹。
  - 判定：全库「回避具体数字/文件名」的 AI 通病**基本不存在**——这是本仓库最不像 AI 的地方。

---

## 第 5 轮 · 一致性级（偏离基准的段落）

- **覆盖率**：20 / 20。未覆盖：无。
- **新发现**：
  - **偏离最明显**：`CONTRIBUTING.md`（全篇模板腔），与基准 A/B 判若两人。
  - **次级偏离**：README 的功能/技术栈表格使用了较多营销式定语（见第 1 轮），但仍以事实为主，偏离度低。
  - **强基准候选**（应作为风格标杆保留并外溢）：`docs/PROJECT-NOTES.md`（中英）、`research/reports/technical_report.md` §9 归属说明、`run_all.sh`/`start.sh` 注释。

---

## 第 6 轮 · 朗读测试

- **覆盖率**：20 / 20。未覆盖：英文技术报告长句（母语朗读感知有限，`未确认`）。
- **新发现**（需回读才顺 / 读起来发飘）：
  - CONTRIBUTING.md L3：「欢迎您为……做出贡献！我们非常感谢您的帮助和支持。」——读着发飘。
  - README.md L105 尾三连——发飘（见第 1 轮）。
  - README.md L594 开发说明——偏解释性长句，但信息真实，**建议保留**。
  - 其余：`PROJECT-NOTES.md`、`run_all.sh`、`SECURITY.md` 朗读顺畅，**无痕迹**。

---

## 停止条件判定
第 5、6 轮新增条目 = 2 条（< 3），满足「连续两轮新增少于 3 条即止」。**诊断结束，共 6 轮。**

---

## 诊断小结
【判断】本仓库的散文**整体已经很「去味」**：真正的人写基准（PROJECT-NOTES、脚本注释、技术报告）占比高，且普遍带具体数字与文件名。**唯一明显偏 AI 的文件是 `CONTRIBUTING.md`**（模板腔 + 空洞寒暄 + 与项目弱相关的通用规范），次要项是 README 的少数营销式定语与一处三连排比。

---

## 处理方案（待确认后执行）

| 编号 | 位置 | 改法 | 目标效果 | 是否涉及事实变更 |
|---|---|---|---|---|
| A1 | CONTRIBUTING.md L3 | 删除寒暄，直接从「三种贡献方式」起笔 | 开场直给 | 否 |
| A2 | CONTRIBUTING.md L7-L13 | 五条合并为 2–3 句 | 降模板感 | 否 |
| A3 | CONTRIBUTING.md L62-L108 | 删除与本项目无关的通用规范（PEP8 复述、通用 Commit 类型表），保留项目特有约定 | 只留有用信息 | 否（**会删除内容，需你确认**） |
| A4 | CONTRIBUTING.md L198 | 删除结尾祝贺语 | 收束干净 | 否 |
| A5 | README.md L105 / zh L105 | 删除「nothing is estimated, rounded up or inferred」三连（前句保留） | 去表演感 | 否（不删事实） |
| A6 | README 功能表定语（L156-L173 / zh L156-L172） | 视你意愿，改为中性描述 | 降营销味 | 否 |

**边界承诺**：不改任何技术事实；不删 `PROJECT-NOTES.md` / `AUDITS.md` / `CHANGELOG.md` 中体现决策迭代与失败（如「负面结果」「域偏移」）的记录。

> 依提示词库规定，**A1–A6 待你确认后再动手**；在你确认前我不改上述任何文件。

---

## 我最不确定的 5 处
1. CONTRIBUTING.md 是否**故意**保留了这份模板（方便外部贡献者），若如此则 A1–A4 不该做。
2. 英文技术报告长句的朗读感（非母语判断）。
3. README 的营销式定语在作品集语境下是否反而是加分项。
4. 是否存在我未打开的更深处散文（如 `docs/DATASETS.md` 的说明文字）。
5. `CHANGELOG.md` 的"### Added / ### Changed"是否算痕迹——我判断为 Keep a Changelog 规范，**不算**，但可讨论。
