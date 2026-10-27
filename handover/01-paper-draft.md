# Measurement Reliability, Not Model Capacity, Bounds Postprandial Glycemic Response Prediction

> **修正说明（2026-10-27）**：本文档为交接快照。E2 的 ICC 0.987 是旧实现的
> 错误值，正确的 ICC(1,1) 为 0.798；“all meals” 旧值 0.715（允许跨餐型）已
> 限定同餐型，为 0.746。标题口径亦已调整。最新数值与表述见 `paper/draft.md`
> §2.2 与 `research/reports/technical_report.md` §5.1。

> **Status: skeleton v2 (P4)** — real numbers from committed CSVs; [TODO] marks
> decisions or prose-expansion pending (P5 venue, title, abstract length).
> Resolved in v2: AUC-identity constant verified against src/iauc.py +
> build_dataset.py (120-min window); Mendes-Soares et al. 2019 verified from
> full text (PMC6599737) — ceiling precedent disclosed in §2.2, same-device
> contrast deployed in §4.5. "Rein et al." author error from v1 corrected.
> Sources of every number: `research/experiments/{results,external_results,ceiling_results}.csv`,
> `research/reports/technical_report.md` §4–§5. Single-source rule (论文模式 H-6):
> never restate a number here that is not in those files.

---

## Title candidates (pick one, [TODO])

1. **Measurement Reliability, Not Model Capacity, Bounds Postprandial Glycemic
   Response Prediction: Evidence from Bidirectional Cross-Cohort Transfer**
2. Published Postprandial Glucose Prediction Performance Must Be Read Against
   Its Measurement Ceiling: A Reproduction, Extension and Cross-Cohort Stress
   Test
3. (venue-dependent) The Reliability Ceiling of Personalized Nutrition:
   What Cross-Cohort PPGR Transfer Actually Measures

## Abstract (draft)

Postprandial glucose response (PPGR) prediction is a central promise of
personalized nutrition, yet published models are rarely evaluated against the
reliability of the measurements they try to predict. We reproduce the CGMacros
baseline (breakfast iAUC r = 0.655 vs. published ≈ 0.64, leave-one-subject-out),
extend it to all meal types (r = 0.451), and show that a measurement-reliability
analysis reorders the interpretation of all of these numbers. Within CGMacros,
duplicate standardized breakfasts bound iAUC predictability at r = 0.80 — the
model stays below it, and so does the published baseline. Across cohorts, a
frozen model transfers to an independent cohort (BIG IDEAs) at r = 0.227 for
iAUC, and — critically — a model trained on the external cohort transfers back
at r = 0.085: iAUC transfer fails in *both* directions, ruling out sample-size
explanations. A baseline-glucose ablation shows iAUC skill is invariant to
removing baseline glucose (0.451 → 0.457) while AUC is largely a
baseline-glucose shadow (baseline-only r = 0.807–0.861; person-mean AUC
r = 0.963 from baseline alone). Aggregating predictions to the person level
sharpens within-cohort rankings (iAUC 0.451 → 0.501) but does not rescue
cross-cohort iAUC (r = −0.03, 95% CI [−0.43, 0.43]). We conclude that
cross-regime comparisons of PPGR models primarily measure the drop in
measurement reliability, not model quality, and that person-level PPGR ranking
is nearly fully determined by fasting state. Code, figures and fixed-seed
experiments are fully reproducible. [TODO: trim to venue word limit]

**Keywords:** postprandial glucose; continuous glucose monitoring; measurement
reliability; leave-one-subject-out; cross-cohort transfer; personalized nutrition

---

## 1. Introduction

1.1 The promise: two people, the same meal, different excursions → personalized
nutrition (Zeevi et al. 2015; Das et al. 2025 CGMacros).

1.2 The blind spot: model papers report r/RMSE; reliability papers report ICC
and duplicate-meal repeatability; the two literatures rarely talk to each
other. One precedent exists and we build on it: Mendes-Soares et al. 2019 used
their cohort's duplicate-meal reproducibility (R = 0.66) as an upper bound for
explainable variance — but within a single device family, where the ceiling is
stable. No published work, to our knowledge, connects *cross-regime* changes
in measurement reliability to *cross-cohort* model collapse, or tests the
connection bidirectionally. [TODO: keep citation watch; if a counterexample
surfaces before submission, reframe C6 as confirmation + extension]

1.3 Contributions (bulleted, final wording [TODO]):
- C1: reproduce published CGMacros baseline under strict LOPO; extend to all
  meal types and three targets.
- C2: a within-cohort duplicate-meal reliability ceiling (breakfast r = 0.80;
  no duplicate lunches exist), extending the single-device upper-bound framing
  of Mendes-Soares et al. 2019 with an explicit regime separation between
  standardized-protocol and free-living duplicates.
- C3: bidirectional frozen-model transfer (CGMacros ⇄ BIG IDEAs): iAUC fails
  both ways (0.227 forward / 0.085 backward) — the cross-cohort collapse is not
  a sample-size artifact.
- C4: baseline ablation: iAUC skill is baseline-free (0.451 → 0.457); AUC is
  baseline-dominated (baseline-only 0.807–0.861; person-mean 0.963).
- C5: person-level aggregation helps within cohort (0.451 → 0.501; AUC
  0.838 → 0.921) but not across cohorts (iAUC r ≈ 0 at n = 16).
- C6: an interpretive claim with consequences for the field: *cross-regime*
  performance comparisons primarily measure reliability drop, not model quality
  — instantiated as a same-device vs cross-device contrast (Mendes-Soares
  0.596 under a stable iPro2 ceiling vs our 0.227 under a collapsed one).

## 2. A reliability framework for PPGR prediction (§2 信度框架)

2.1 Data points for the reliability ladder (all iAUC-family targets):
- standardized duplicates, Israeli cohort (iPro2): R = 0.71–0.77
  (Zeevi et al. 2015, four standardized meals)
- standardized duplicate (bagel & cream cheese, Midwestern, iPro2):
  R = 0.66 (n = 111; Mendes-Soares et al. 2019)
- standardized duplicate breakfasts (CGMacros, Libre Pro): **r = 0.799**
  (n = 174 pairs, ICC 0.987; our E2)
- free-living duplicates: Hengist et al. 2023 (Abbott r = 0.46 [0.38, 0.54];
  Dexcom r = 0.45 [0.39, 0.50]); Hengist et al. 2024 (inpatient metabolic
  ward: two measurements remain insufficient; aggregated measurements required).

2.2 Precedent, stated up front (novelty honesty): Mendes-Soares et al. 2019
already used duplicate-meal reproducibility as "an upper bound for explainable
variance" **within a single device family** (iPro2 on both sides), concluding
their transfer R = 0.596/0.618 sits near their cohort's own ceiling R = 0.66.
What we add: (i) a cross-*device* transfer case where the target cohort's
ceiling itself collapses; (ii) bidirectional transfer showing iAUC failure is
symmetric; (iii) the baseline-glucose identity showing AUC numbers are
fasting-state shadows; (iv) person-level aggregation analysis. The ceiling
concept is theirs; the cross-regime explanation is ours.

2.3 The AUC identity trap (verified against src/iauc.py + build_dataset.py):
AUC = 120 × baseline_glucose + iAUC, where 120 is the 2-h window length in
minutes (WINDOW_MIN = 120, 15-min trapezoidal grid; iAUC integrates only the
above-baseline portion). The identity is exact when glucose never dips below
baseline, approximate otherwise — hence "≈". Any AUC evaluation therefore
conflates fasting state with meal response.

2.4 Consequences: a model can only be credited with skill up to its
evaluation regime's ceiling; apparent paradoxes ("model r > published
reliability") indicate regime confusion, not super-measurement models.

## 3. Within-cohort analysis (CGMacros, 45 subjects / 1,699 meals)

3.1 Data & protocol: meal-level table (macronutrients + blood panel +
anthropometrics), LOPO CV, XGBoost (depth-1 stumps), three targets
(iAUC / AUC / peak rise); 1,557 of 1,699 meals with positive iAUC; breakfast
subset 423 meals. Seeds fixed; pipeline one-command reproducible.

3.2 Reproduction & extension (Table: results.csv):
- breakfast: AUC 0.890, iAUC 0.655, peak 0.632 (published ≈ 0.89 / ≈ 0.64)
- all meals: AUC 0.838, iAUC 0.451, peak 0.542
- best linear baseline breakfast iAUC: 0.255 → non-linearity earns its place.

3.3 The ceiling check (E2): model 0.655 < duplicate ceiling 0.799 — no
paradox; published baseline consistent for the same reason. Meal-type
dependence: dinner 0.374 / snack 0.376 → the ceiling tracks protocol control,
not biology. **Lunch: zero duplicate pairs — a protocol gap we flag rather
than paper over.**

3.4 Baseline ablation (E5, Table):
| target | full | no-baseline | baseline-only |
| iAUC all | 0.451 | 0.457 | 0.204 |
| iAUC breakfast | 0.655 | 0.657 | 0.542 |
| AUC all | 0.838 | 0.638 | 0.807 |
| AUC breakfast | 0.890 | 0.738 | 0.861 |
Reading: iAUC is baseline-free; AUC is a fasting-state shadow. Marginal
contribution of all 18 non-baseline features at breakfast: ≈ 0.11
(0.655 − 0.542) — most of "meal response prediction" at breakfast is fasting
information.

3.5 Who vs how much (P3): person-mean aggregation — iAUC 0.451 → 0.501;
AUC 0.838 → 0.921; peak 0.542 → 0.697. Baseline-only person-mean AUC r = 0.963
("who responds more" is almost fully determined by fasting state).
[TODO: baseline-only person iAUC (0.71–0.76) exceeds full-feature (0.50);
with n = 45 read as noise around a strong baseline signal — keep this framing,
do not over-interpret]

## 4. Cross-cohort stress test (BIG IDEAs, 16 subjects / 656 meals)

4.1 Setup: frozen CGMacros model, 5 shared features, no re-calibration;
domain gap = device (Libre Pro vs Dexcom G6), annotation (expert vs
self-report), population.

4.2 Forward transfer (external_results.csv): AUC 0.569, iAUC 0.227,
peak 0.223. A carbohydrate-only Ridge transfers *better* than the ensemble on
iAUC (0.362 vs 0.227) — cohort-specific interactions are a generalization
liability.

4.3 Reverse transfer (E3, ceiling_results.csv): BI → CG at n = 1,699 meals:
iAUC 0.085, AUC 0.748, peak 0.174. **iAUC fails in both directions; AUC
"transfers" both ways — consistent with §3.4: what transfers is baseline
compatibility, not meal-response skill.** Sample-size explanation ruled out.

4.4 Person-level aggregation does not rescue cross-cohort iAUC (E4):
person-mean iAUC r = −0.029 [−0.43, 0.43]; AUC 0.715 [0.35, 0.90] (baseline
again); peak 0.054. [TODO: state explicitly that CI width is driven by n = 16;
"indistinguishable from zero" ≠ "proven zero"]

4.5 The same-device contrast (P3.5, VERIFIED against full text — Mendes-Soares
et al. 2019, AJCN 110(1):63–75, PMC6599737):
- **Facts (all from the paper itself):** Israeli-trained model predicts
  Midwestern PPGR (2-h iAUC, same as ours) at R = 0.596; subject-grouped
  10-fold CV, pooled correlation over held-out meals; carb-only 0.395;
  calorie-only 0.336; joint training 0.618. **Both cohorts measured with the
  same CGM (Medtronic iPro2)**; model includes person features (age, BMI,
  microbiome); their own duplicate-meal ceiling R = 0.66 (bagel & cream cheese,
  n = 111), which they explicitly treat as "an upper bound for explainable
  variance".
- **Under our framework this is the control experiment we lack**: when the
  device and annotation regime are *stable* across cohorts, transfer
  performance (0.596) stays close to the (stable) ceiling (0.66), just below
  their within-Israeli R = 0.671–0.68. In our cross-device pair the target
  regime's ceiling collapses and transfer collapses with it (0.227 ≪ 0.46
  free-living floor of the target device family). Same phenomenon, two regimes:
  transfer performance tracks the ceiling, not the model.
- **Also note**: their outcome is iAUC (2-h, Zeevi-style), their meal filter
  (excluding >40 g-carb meals with PPGR < 5 mg/dL·h) parallels our iAUC > 0
  filter — the comparisons are apples-to-apples on target definition.
- [This subsection is the paper's most important rhetorical move — allocate
  space accordingly. Credit Mendes-Soares for the within-cohort ceiling idea
  in §2.2 BEFORE using their result here; never let a reviewer discover the
  precedent before we disclose it.]

## 5. Uncertainty, decomposition and mixed model (condensed)

5.1 Conformal intervals: marginal coverage on target (0.800 / 0.898) but
per-subject minimum 0.30 (breakfast iAUC) — population-level guarantees only.
5.2 Within/between decomposition (fig 6): AUC pooled r is between-subject
dominated; iAUC components nearly equal — the predictive face of §3.4.
5.3 Mixed model (subject random intercept): ICC 0.69 (AUC) vs 0.32 (iAUC);
within-person: carbohydrate raises, protein lowers (all three targets),
consistent across specifications.

## 6. Discussion: what follows for the field (§6 含义)

6.1 For readers of PPGR papers: ask three questions before believing an r —
(i) what is the duplicate-meal reliability under *this* protocol? (ii) does
the metric pool between-person variance? (iii) does the target contain
baseline glucose?
6.2 For builders of personalized-nutrition products: person-level ranking is
cheap (fasting glucose gets you r ≈ 0.92–0.96 on person-mean AUC); meal-level
ranking is bounded by measurement; "AI meal scoring" claims should be read
against §2's ceilings. [TODO: keep tone scholarly, not product-competitive]
6.3 For study design: reliability measurement (duplicate meals) should be a
mandatory companion to any PPGR prediction benchmark; cross-cohort claims need
bidirectional transfer to be interpretable.
6.4 Negative-result framing: our external-validation "failure" is the finding;
we report it because single-cohort numbers flatter methods (see reproducibility
audit: 23.9% code release, OhioT1DM monoculture).

## 7. Limitations

- 45 + 16 subjects; no third cohort; single try of the transfer direction pair.
- CGMacros has no duplicate lunches → within-cohort ceiling is
  breakfast-centric by protocol, not by choice.
- BIG IDEAs food-log dates required our own repair procedure (validated, not
  ground truth).
- Observational: no causal claims; meal timing / activity / sleep unmeasured.
- The ceiling argument bounds *feature-based* models; models that consume
  richer per-person history (e.g. personal CGM history) sit under different
  ceilings and are outside our scope. [TODO: sharpen this boundary — reviewer
  will ask whether the ceiling applies to personal-history models; it does
  not, and the paper must say so plainly]

## 8. Conclusion (short)

Performance claims in PPGR prediction are claims about a measurement regime.
Once the regime is made explicit, the published numbers stop conflicting —
and the field's real bottleneck becomes visible: not model capacity, but
measurement reliability and protocol heterogeneity.

## References (seed list; format per venue [TODO])

- Das et al. 2025, CGMacros, Scientific Data 12:1557. DOI 10.13026/3z8q-x658
- Cho, Kim, Bent, Dunn — BIG IDEAs Lab Glycemic Variability and Wearable
  Device Data, PhysioNet. DOI 10.13026/zthx-5212 (version 1.1.2)
- Hengist et al. 2023, *Imprecision nutrition? Duplicate meals …*, (PMC10371100)
- Hengist et al. 2024, *Imprecision nutrition? Intraindividual variability …*
  (PMC11747189; NCT03407053 / NCT03878108)
- Howard et al. 2020 — CGM device concordance, meal ranking τ ≈ 0.43 (PMC7528568)
- Mendes-Soares H, Raveh-Sadka T, Azulay S, et al. 2019, AJCN 110(1):63–75
  (PMC6599737) — Israeli → Midwestern transfer R = 0.596; duplicate-meal
  upper-bound framing R = 0.66 (n = 111); both cohorts iPro2. DOI 10.1093/ajcn/nqz028
- Zeevi et al. 2015, Cell 163:1079 — personalized nutrition; Israeli cohort
  four standardized meals reproducibility R = 0.71–0.77 (iPro2)
- Barber et al. 2021, Annals of Statistics 49(1):486–507 — jackknife+ conformal
- [TODO: reproducibility-audit citation for the 23.9%/37.3%/55.2% figures —
  already cited in technical_report.md §7; carry the same source over]
- [TODO: GlucoFM / MICCAI-2026-workshop CGMacros users as concurrent-work
  citations, one sentence each, neutral tone]

## Submission checklist (P5)

- [ ] venue decision: PLOS Digital Health vs CHIL vs JMIR vs Sci Rep
      (negative-result friendly, word limits, LaTeX/Word)
- [ ] figures to carry over from research/reports/figures (fig6 decomposition,
      fig7 intervals, fig8 mixed effects + 1 new: the ceiling-vs-model bar chart)
- [ ] new figure: "regime ladder" — standardized ceiling Zeevi 0.71–0.77 /
      Mendes-Soares 0.66 / CGMacros breakfast 0.80 / free-living Hengist
      0.45–0.46, with model markers overlaid: within-cohort 0.655, same-device
      transfer 0.596, cross-device transfer 0.227 (each under its regime's
      ceiling). One figure carries the whole thesis.
- [ ] data availability statement (PhysioNet DOIs; code repo URL; no raw data)
- [ ] license layering statement (research/NOTICE.md) — code MIT, artifacts
      CC BY-NC-SA
- [ ] authorship / affiliation / funding = none [TODO confirm]
- [ ] AI-assistance disclosure per venue policy (论文模式 H-7: record in 错题本)
