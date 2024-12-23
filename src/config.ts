import { Keypair } from "@solana/web3.js";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { logger } from "./utils/logger";

interface Config {
  keypair: Keypair;
  rpcEndpoint: string;
  pinataApiKey?: string;
  pinataSecretApiKey?: string;
}
dotenv.config();

function loadKeypair(secretKeyPath: string): Keypair {
  try {
    const absolutePath = path.resolve(secretKeyPath);
    const secretKeyString = fs.readFileSync(absolutePath, "utf-8");
    const secretKey = Uint8Array.from(JSON.parse(secretKeyString));
    return Keypair.fromSecretKey(secretKey);
  } catch (error) {
    logger.error(
      `Failed to load keypair from path ${secretKeyPath}: ${(error as Error).message}`
    );
    throw error;
  }
}


function loadConfig(): Config {
  const { SECRET_KEYPAIR_PATH, RPC_ENDPOINT } = process.env;

  if (!SECRET_KEYPAIR_PATH || !RPC_ENDPOINT) {
    logger.error(
      "SECRET_KEYPAIR_PATH and RPC_ENDPOINT must be set in the .env file."
    );
    throw new Error("Missing environment variables");
  }

  const keypair = loadKeypair(SECRET_KEYPAIR_PATH);
  const { PINATA_API_KEY, PINATA_SECRET_API_KEY } = process.env;

  return {
    keypair,
    rpcEndpoint: RPC_ENDPOINT,
    pinataAPIKey: PINATA_API_KEY,
    pinataSecretApiKey; PINATA_SECRET_API_KEY,
  };
}

export const CONFIG: Config = loadConfig();
