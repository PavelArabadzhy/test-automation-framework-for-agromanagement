import { FrameworkEnv } from "../env";

export const stageEnvDefaults: Pick<FrameworkEnv, "baseUrl" | "apiBaseUrl"> = {
  baseUrl: "http://localhost:8080",
  apiBaseUrl: "http://localhost:8080"
};
