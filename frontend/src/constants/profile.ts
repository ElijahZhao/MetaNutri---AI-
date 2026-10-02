import type { Translations } from '@/lib/i18n';

/** 可选项：`value` 是提交给后端的稳定标识，`label` 是已本地化的展示文案。 */
export interface SelectOption<T extends string = string> {
  value: T;
  label: string;
}

export const GENDER_VALUES = ['male', 'female', 'other'] as const;
export type GenderValue = (typeof GENDER_VALUES)[number];

export const ACTIVITY_VALUES = ['sedentary', 'light', 'moderate', 'active', 'very_active'] as const;
export type ActivityValue = (typeof ACTIVITY_VALUES)[number];

/** 膳食目标 —— value 必须与后端 / 种子数据保持一致，否则已保存的数据回填会错位。 */
export const GOAL_VALUES = [
  'Weight Loss',
  'Muscle Gain',
  'Maintenance',
  'Improve Energy',
  'Better Sleep',
] as const;
export type GoalValue = (typeof GOAL_VALUES)[number];

export const RESTRICTION_VALUES = [
  'Gluten Free',
  'Dairy Free',
  'Vegetarian',
  'Vegan',
  'Nut Free',
  'Low Carb',
  'Low Sugar',
] as const;
export type RestrictionValue = (typeof RESTRICTION_VALUES)[number];

/** BMI 分层阈值（WHO 标准）。 */
export const BMI_THRESHOLDS = { underweight: 18.5, normal: 25, overweight: 30 } as const;

/**
 * 把稳定 value 与当前语言的文案配对。
 * 选项定义集中在这一层维护，页面只负责渲染，避免文案/取值散落在组件里。
 */
export function buildProfileOptions(t: Translations) {
  const gender: SelectOption<GenderValue>[] = [
    { value: 'male', label: t.gender.male },
    { value: 'female', label: t.gender.female },
    { value: 'other', label: t.gender.other },
  ];

  const activity: SelectOption<ActivityValue>[] = [
    { value: 'sedentary', label: t.activity.sedentary },
    { value: 'light', label: t.activity.light },
    { value: 'moderate', label: t.activity.moderate },
    { value: 'active', label: t.activity.active },
    { value: 'very_active', label: t.activity.veryActive },
  ];

  const goals: SelectOption<GoalValue>[] = [
    { value: 'Weight Loss', label: t.goals.weightLoss },
    { value: 'Muscle Gain', label: t.goals.muscleGain },
    { value: 'Maintenance', label: t.goals.maintenance },
    { value: 'Improve Energy', label: t.goals.improveEnergy },
    { value: 'Better Sleep', label: t.goals.betterSleep },
  ];

  const restrictions: SelectOption<RestrictionValue>[] = [
    { value: 'Gluten Free', label: t.restrictions.glutenFree },
    { value: 'Dairy Free', label: t.restrictions.dairyFree },
    { value: 'Vegetarian', label: t.restrictions.vegetarian },
    { value: 'Vegan', label: t.restrictions.vegan },
    { value: 'Nut Free', label: t.restrictions.nutFree },
    { value: 'Low Carb', label: t.restrictions.lowCarb },
    { value: 'Low Sugar', label: t.restrictions.lowSugar },
  ];

  return { gender, activity, goals, restrictions };
}
