# Project notes

A short account of what this repository is and why it is split the way it is.
English first, then 中文; the two are written separately rather than translated
line by line.

## Two halves that don't touch

MetaNutri is one repository holding two things that don't depend on each other.

The first is a web platform: Next.js on the front end, FastAPI on the back,
PostgreSQL and Redis, containerised and run through CI. It does authentication,
food-database search, data import and export, and a set of pages with ECharts
charts. I built it as full-stack practice and it works as one; you can sign in,
browse the food data, and export what you have.

The second is a machine-learning research module under `research/`. It has its
own dependencies, its own data pipeline, and its own public demo. It imports
nothing from the platform, and the platform imports nothing from it.

Keeping them apart was a decision, not an accident. When I started I assumed the
platform's "AI" endpoints were the point of the project. They were not, and
working that out is most of what these notes are about.

## The platform's "AI" is a placeholder, and the docs say so

The platform exposes endpoints like `/api/predict/glucose`. They return numbers,
and the numbers are deterministic, but there is no neural network behind them.
The data under `backend/data/` is hand-written. The `.pt` weights that used to
sit in the backend were trained on random tensors. No endpoint ever called those
models, and three endpoints mixed in random values. The landing page claimed
deep learning.

I found all of this auditing my own repository, not by being told. Deleting the
awkward parts would have been easy. Instead I froze the platform, fixed its
documentation and its public wording, and left the evidence in place. The README
now states plainly that the platform's AI endpoints are illustrative and that
the real models live elsewhere. I would rather a careful reader find an honest
placeholder than a claim I can't stand behind.

## What the research module actually does

The real work asks one narrow question: given a meal's macronutrients and a
person's clinical profile, how well can we predict the two-hour postprandial
glucose response (PPGR) on people the model has never seen?

The cohort is CGMacros: 45 subjects and 1,557 meals with iAUC > 0, spread across
healthy, prediabetic, and type-2 diabetic participants. Evaluation is
leave-one-subject-out throughout, and preprocessing is fit on the training fold
only, so nobody's own meals leak into their prediction. I began by reproducing
the published breakfast baseline, AUC r = 0.890 and iAUC r = 0.655 against the
paper's ≈0.89 and ≈0.64, and only then extended the pipeline to lunch, dinner,
and snacks.

| Target (r) | Breakfast, LOPO | All meals, LOPO | External: BIG IDEAs |
|---|---|---|---|
| 2-h AUC | 0.890 | 0.838 | 0.569 |
| iAUC | 0.655 | 0.451 | 0.227 |
| Peak rise | 0.632 | 0.542 | 0.223 |

Then I froze the model and moved it, unchanged, onto a different cohort: BIG
IDEAs, 16 subjects and 656 meals, a different CGM device, free-living
self-reported food logs. The AUC held up reasonably at 0.569. The iAUC and peak
rise did not, and on those two targets a one-variable carbohydrate regression
actually beat the tree ensemble (iAUC 0.362 against 0.227). That is a negative
result, and it sits in the report rather than in a footnote. The control that
makes it readable is BIG IDEAs scored internally under LOPO (iAUC r = 0.463),
which is what lets me call the external drop domain shift instead of noise.

I chose not to wire the research model back into the platform. It stays frozen
and is served from its own Streamlit demo; connecting the two would add cost and
coupling for a demonstration that already answers the question.

## Limits worth stating

This is not a medical device, and none of it should inform a clinical decision.
The cohort is small, which is also why the models are gradient-boosted stumps
rather than something with sequence memory: the data does not justify more.
Every number above is produced by the pipeline under `research/`, and the frozen
model, the figures, and the report can all be regenerated from the raw data with
the scripts in that folder.

The full argument is in the technical report,
`research/reports/technical_report.md`, with a PDF next to it. The demo runs at
<https://metanutri-ai-ppgr-predictor.streamlit.app/>, and the demo repository is
<https://github.com/ElijahZhao/ppgr-predictor>.

---

# 项目笔记

这篇笔记想说明这个仓库是什么、为什么被拆成现在这样。英文在前，中文在后；
两边各写各的，不是逐句互相翻译。

## 互不依赖的两半

MetaNutri 是一个仓库，装着两件互不依赖的东西。

一件是 Web 平台：前端 Next.js，后端 FastAPI，加 PostgreSQL 和 Redis，
容器化、走 CI。它有登录认证、食物库检索、数据导入导出，以及一组用 ECharts
画图的页面。我把它当成全栈练习来做，它也确实能跑：能登录、能查食物库、
能导出数据。

另一件是 `research/` 下的机器学习研究模块。它自带依赖、自带数据管线，也有
自己的公开 Demo，不引用平台，平台也不引用它。

分开是有意的。刚动手时，我以为平台里那些"AI"接口才是项目重点；后来发现不是，
而这篇笔记大半就是在讲这件事。

## 平台的"AI"是占位，文档里写清楚了

平台对外提供 `/api/predict/glucose` 这类接口，会返回数字，数字也是确定性的，
但背后没有神经网络。`backend/data/` 里的数据是手写的；原先躺在后端的 `.pt`
权重是在随机张量上训出来的；没有任何接口调用过那些模型，还有三个接口掺了
随机数。首页当初写的是"深度学习"。

以上都是我自己审仓库时找出来的，不是被人指出来的。把这些难堪的部分删掉很容易，
但我选择冻结平台、修正文档与对外措辞，并把证据原样留在那里。现在 README 明确
写着：平台的 AI 接口只是示意，真正的模型在别处。比起一句自己撑不住的漂亮话，
我更愿意让读者看到一个诚实的占位。

## 研究模块到底做了什么

真正的工作只问一个很窄的问题：给定一餐的宏量营养素和一个人的临床指标，
在模型从未见过的人身上，能把餐后两小时血糖响应（PPGR）预测到多准？

队列是 CGMacros：45 人、1,557 餐（iAUC > 0），覆盖健康、糖尿病前期与
2 型糖尿病。全程留一受试者（LOPO）交叉验证，预处理只在训练折上拟合，
谁的餐都不会混进自己的预测里。我先复现论文的早餐基线——AUC r = 0.890、
iAUC r = 0.655，对应论文的 ≈0.89 与 ≈0.64——之后才把管线扩展到午餐、晚餐
和加餐（三项指标数字见上表）。

随后我把模型冻结，原封不动搬到另一个队列 BIG IDEAs（16 人、656 餐，不同 CGM
设备、自由生活自报饮食）。AUC 大体稳住了，r = 0.569；iAUC 与峰值血糖没稳住，
而且这两个目标上，一个只吃碳水的单变量回归反而赢了树模型（iAUC 0.362 对
0.227）。这是负面结果，它写在报告正文里，没有塞进脚注。让它可解读的是一个
对照：BIG IDEAs 在自身 LOPO 下 iAUC 为 0.463——正是这个数，让我能说外部的
下降是域偏移，而不是噪声。

我没有把研究模型接回平台。它保持冻结，由自己的 Streamlit Demo 提供服务；
接回去只会平添成本与耦合，而演示本身已经把问题回答完了。

## 几点边界

这不是医疗器械，任何部分都不该用于临床决策。队列规模很小，这也是模型用梯度
提升树桩、而不是带序列记忆的网络的原因：数据撑不起后者。上表每个数字都出自
`research/` 下可复现的管线，冻结模型、图与报告都能由该目录的脚本从原始数据
重新生成。

完整论证在技术报告里：`research/reports/technical_report.md`，同目录有 PDF。
线上 Demo 在 <https://metanutri-ai-ppgr-predictor.streamlit.app/>，Demo 仓库是
<https://github.com/ElijahZhao/ppgr-predictor>。
