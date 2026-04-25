import dotenv from "dotenv";
import { devEnvDefaults } from "./env/dev.env";
import { stageEnvDefaults } from "./env/stage.env";

dotenv.config();

export type EnvironmentName = "dev" | "stage";

export interface FrameworkEnv {
  testEnv: EnvironmentName;
  baseUrl: string;
  apiBaseUrl: string;
  testDataPrefix: string;
  userUsername: string;
  userPassword: string;
  adminUsername: string;
  adminPassword: string;
}

const TEST_ENV = (process.env.TEST_ENV ?? "dev") as EnvironmentName;
const envDefaults = TEST_ENV === "stage" ? stageEnvDefaults : devEnvDefaults;

export const ENV: FrameworkEnv = {
  testEnv: TEST_ENV,
  baseUrl: process.env.BASE_URL ?? envDefaults.baseUrl,
  apiBaseUrl: process.env.API_BASE_URL ?? process.env.BASE_URL ?? envDefaults.apiBaseUrl,
  testDataPrefix: process.env.TEST_DATA_PREFIX ?? "qaauto",
  userUsername: process.env.USER_USERNAME ?? "",
  userPassword: process.env.USER_PASSWORD ?? "",
  adminUsername: process.env.ADMIN_USERNAME ?? "",
  adminPassword: process.env.ADMIN_PASSWORD ?? ""
};

export function assertRequiredEnv(): void {
  const required = [
    { key: "USER_USERNAME", value: ENV.userUsername },
    { key: "USER_PASSWORD", value: ENV.userPassword },
    { key: "ADMIN_USERNAME", value: ENV.adminUsername },
    { key: "ADMIN_PASSWORD", value: ENV.adminPassword }
  ];

  const missing = required.filter((item) => !item.value).map((item) => item.key);
  if (missing.length > 0) {
    throw new Error(`Missing required env vars: ${missing.join(", ")}`);
  }
}
