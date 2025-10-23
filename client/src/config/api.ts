// Configuration for API endpoints
export const config = {
  API_BASE_URL:
    import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api",
  API_ENDPOINTS: {
    AUTH: {
      GOOGLE: "/auth/google",
      LOGOUT: "/auth/logout",
    },
    USER: {
      PROFILE: "/user/profile",
    },
    PROBLEMS: {
      BASE: "/problems",
      USER_PROBLEMS: "/user-problems",
    },
  },
} as const;

export default config;
