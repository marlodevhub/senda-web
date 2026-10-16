/** CU-17/CU-20: cómo se identifica el estudiante; solo elige el tema de color (ver lib/palette). */
export const GENDERS = ["MALE", "FEMALE", "OTHER"] as const;

export type Gender = (typeof GENDERS)[number];

export const GENDER_LABEL_KEY = {
  MALE: "gender.male",
  FEMALE: "gender.female",
  OTHER: "gender.other",
} as const satisfies Record<Gender, string>;
