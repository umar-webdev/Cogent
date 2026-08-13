export type AppEnvironment = "development" | "preview" | "production";

export function getAppEnvironment(): AppEnvironment {
  const value = import.meta.env.VITE_APP_ENV;
  if (value === "preview" || value === "production" || value === "development") {
    return value;
  }
  return import.meta.env.DEV ? "development" : "production";
}

export const appEnvironment = getAppEnvironment();

export function environmentLabel(env: AppEnvironment = appEnvironment): string {
  switch (env) {
    case "development":
      return "Local";
    case "preview":
      return "Preview";
    case "production":
      return "Production";
  }
}
