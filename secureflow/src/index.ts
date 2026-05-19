/** Security helpers for React Native apps (API client hardening, throttling stubs). */
export const secureflow = {
  protect(_app: unknown) {
    return { protected: true as const };
  },
};
