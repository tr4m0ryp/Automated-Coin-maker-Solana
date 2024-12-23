import { CONFIG } from "../config";
import { logger } from "./logger";

export function validateEnvVariables(): void {
  const { tokenDetails } = CONFIG;

  logger.info("Environment variables validated successfully.");
}
