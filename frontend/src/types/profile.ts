/**
 * User profile domain types.
 * Shapes mirror backend/app/schemas/user.py (UserProfileBase / UserProfileResponse).
 */

export type Gender = 'male' | 'female' | 'other';

export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';

export interface UserProfile {
  id: string;
  user_id: string;
  age: number | null;
  gender: string | null;
  height_cm: number | null;
  weight_kg: number | null;
  activity_level: string | null;
  dietary_goals: Record<string, boolean> | null;
  dietary_restrictions: Record<string, boolean> | null;
  created_at: string;
  updated_at: string;
}

/** Payload accepted by `PUT /api/users/profile`. */
export type UserProfileUpdate = Partial<
  Pick<
    UserProfile,
    | 'age'
    | 'gender'
    | 'height_cm'
    | 'weight_kg'
    | 'activity_level'
    | 'dietary_goals'
    | 'dietary_restrictions'
  >
>;
