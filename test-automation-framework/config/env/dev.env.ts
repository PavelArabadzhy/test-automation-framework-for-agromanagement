import { FrameworkEnv } from "../env";

export const devEnvDefaults: Pick<FrameworkEnv, "baseUrl" | "apiBaseUrl"> = {
  baseUrl: "http://localhost:8080",
  apiBaseUrl: "http://localhost:8080"
};
