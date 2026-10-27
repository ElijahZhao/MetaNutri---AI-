# PPGR 论文待办清单

> 注：本文件曾存于 /root/，被沙箱定期清理抹掉。v2 版重建于 2026-10-27，
> 内容为"已定决策 + 已完成实验"的忠实重建（决策与数字均有据可查），
> 但原文件的逐字内容未保留。防复发：本文件已列入 .gitignore（L88），
> 存放于 /workspace 内。

> **修正说明（2026-10-27，接手后）**：下文 §1 的 E2 “ICC .99” 是旧实现的错误值；
> 正确 ICC(1,1) 为 0.798，且早餐 r = 0.799 不变。其余实验数值本轮复跑一致。

---

## §0 核心结论（v2，六实验后定稿）

**Route A 成立，论文有发表价值。**
主张：PPGR 模型性能必须对照其评估体系的测量信度来读——同队列模型低于
内部天花板（0.655 < 0.80），跨设备信度塌方导致模型塌方，双向迁移失败
排除样本量解释，iAUC 无 baseline 循环。目标形态：方法严谨的负结果/边界
论文，主目标 iAUC，AUC 降级为"基线血糖的影子"的反例。

## §1 六实验判决（已完成，证据 = research/experiments/ceiling_results.csv，commit 9281d51）

| 实验 | 判决 | 关键数字 |
|---|---|---|
| E2 重复餐信度 | 悖论解除 | 早餐 0.799 (n=174, ICC .99)；晚餐/加餐 ~0.37；**午餐 0 对** |
| E5 baseline 消融 | iAUC 无循环 | iAUC 0.451→0.457(去baseline)；AUC 0.838→0.638，baseline-only 0.807 |
| P3 聚合到人 | 组内有效 | iAUC 0.451→0.501；AUC 0.838→0.921；**baseline-only 人均 AUC r=0.963** |
| E3 反向迁移 | 双向皆败 | BI→CG iAUC r=0.085（正向 0.227）→ 排除 n=16 样本量解释 |
| E4 跨队列聚合 | 救不了 iAUC | 人均 iAUC r=−0.03 (CI −0.43~0.43)；AUC 0.569→0.715 |
| E2 协议缺陷 | 已如实记录 | CGMacros 无重复午餐 → 信度主张只能主打早餐 |

已落地：技术报告新增 §5「Measurement-reliability ceiling analysis」
（§5.1–5.6 六小节），原 §5–§9 顺延为 §6–§10，交叉引用与管线清单同步。

## §2 已定决策（等价重建，勿再议）

1. **许可证 = 方案 b（分层）**：代码 MIT；CGMacros 派生数据产物 CC BY-NC-SA；
   报告 CC BY-NC-SA（§10 现状即此）。落地物：research/ NOTICE 文件（**未做，待办 P1**）。
2. **Route A 定为主线，带止损条款**——止损已不需要：E2/E5 通过，无退回分支。
3. **公开 README 措辞**：改 "every meal"（1,699→1,557 过滤）+ M1 "AI translates"
   两处事实级；标题级 6 条不动（**未做，待办 P2**）。
4. **仓库名不改**（MetaNutri---AI-，改名代价 > 收益）。
5. **敏感文件防线**：.gitignore 已含 PPGR-论文待办清单.md + paper/。
6. **工单**：用户决策 = 不交 GitHub Support ticket，接受残留风险（5 个 SHA 直连，
   概率极低）。§9 工单条目关闭。

## §3 待办（按优先级）

- **P1 NOTICE 文件 ✅ 已完成**：research/NOTICE.md（三层许可：代码 MIT /
  CGMacros 派生产物 CC BY-NC-SA / BIG IDEAs ODC-By，混合产物从严）；
  技术报告 §10 与 research/README License 节已回链。
- **P2 公开 README 两处事实修正 ✅ 已完成**：英文版此前已修（"across meal
  types — 1,557 of 1,699 (142 excluded)"、"Deterministic, guideline-based
  scoring"）；本次补齐中文版两处镜像行（L85 AI→确定性评分、L99 补 1,699→1,557
  过滤说明）。
- **P3 文献核查（原 P4）✅ 已完成（2026-10-27，6 轮检索）**：**无撞车，框架空白确认。**
  - 信度侧：Hengist 2023/2024（free-living 重复餐 r≈0.45-0.46、住院 ward 也不够）
    只喊"要聚合重复测量"，**未连接模型性能**——我们 §5 正是缺环。
  - 迁移侧：Rein et al. AJCN 2019（以色列→美国中西部，R=0.596"迁移成功"），
    不做信度归因；其 pooled r 很可能是 who-signal 主导（见 P3.5）。
  - CGMacros 使用者：MICCAI 2026 workshop 多模态餐图（arXiv 2609.24453）、
    PMLR 2026 GlucoGrapher（PPGR→碳水比逆问题）、Google GlucoFM（CGM 基础模型）
    ——全是任务创新，无人做跨队列信度分析。
  - BIG IDEAs 使用者：arXiv 2608.13581（LLM agent）用 subject-specific 微调，
    非 frozen 迁移。
  - 综述：仅定性提"CGM 不精确令人担忧"，无定量对齐。
  - **结论：首发地位成立**——"信度天花板 vs 模型性能对齐 + 双向迁移归因"无人做过。
- **P3.5（新）**：论文中必须正面解释 AJCN 2019 的 R=0.596 与我们 0.227 为何
  不矛盾。候选解释（写作时验证）：(a) 其评估为 pooled r，含 between-person
  方差，基线多样性高的队列里 who-signal 可迁移（呼应我们 E5/E3/E4 机制）；
  (b) 两队列同设备家族；(c) 菌群/个人特征携带"人"的身份信息。
- **P4 论文骨架**：按技术报告 §5 的链条写：§1 问题 → §2 信度框架 →
  §3 CGMacros 内部（模型 < 天花板）→ §4 跨队列（双向皆败 + E4 null）→
  §5 消融（iAUC 干净 / AUC 影子）→ §6 含义。
- **P5 期刊定位**：负结果短文候选（PLOS Digital Health / CHIL / JMIR / Sci Rep），
  等 P3 检索后定。
- **P6 重下数据才需要做的事**：若需重跑/改实验，重下 627 MB（脚本+校验就绪）。
  已知教训：沙箱会清大文件，结果 CSV 必须及时 commit（本次靠 9281d51 保住）。
- **P7 规范仓库重取**：/root/spec/ 下 4 个规则文件被清，可从
  github.com/ElijahZhao/List-of-open-source-projects-for-AI-coding-agent-specification
  重新拉取（若后续审查任务需要）。

## §4 技术事实备忘（写作时直接引用）

- 环境：scikit-learn 1.9.0 / statsmodels 0.14.6 实跑（报告 pin 1.9.1/0.15.0）；
  §4.2 复制检验三位小数吻合 → 差异无实质影响。已在 §5 开头披露。
- E2 方法：同受试者 ±2g 宏量营养重复对；±5g 稳健性检验。
- E4 人均 n=16，CI 宽 → "统计上无法与零区分"是准确说法，勿写"证明为零"。
- breakfast baseline-only iAUC 0.542 → 餐特征边际贡献 ≈0.11（论文金句）。
- 人均 AUC baseline-only 0.963 → "谁反应大"几乎完全由空腹血糖排定（金句 2）。
- 撞车风险备选：Hengist 2023/2024（重复餐信度）、Howard 2020（设备间 τ=0.43）
  是我们引用的支撑文献，非竞品——它们没做"信度天花板 vs 模型性能"的对齐分析。

## §5 待用户拍板

- P3 文献核查的检索词是否需要补充（我按 §3 给的四个方向搜）。
- 论文语言：英文（技术报告已是英文，直接演化）——默认英文，有异议说话。
