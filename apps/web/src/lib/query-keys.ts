export const queryKeys = {
  session: (token: string | null) => ['session', token] as const,
};
