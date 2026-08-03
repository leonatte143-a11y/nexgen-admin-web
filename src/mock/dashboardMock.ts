/** Recruitment message templates only — dashboard data comes from backend APIs. */

export const RECRUIT_MESSAGE_TEMPLATES = [
  (keyword: string, city: string) =>
    `We are receiving many ${keyword} requests in ${city}. Join KAIRO as a verified service partner.`,
  (keyword: string, city: string) =>
    `High demand for ${keyword} in ${city}! KAIRO is onboarding verified partners — earn more with flexible hours.`,
  (keyword: string, city: string) =>
    `KAIRO customers in ${city} need trusted ${keyword} professionals. Register today and start receiving bookings.`,
];
