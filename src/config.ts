import { Keypair } from "@solana/web3.js";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { logger } from "./utils/logger";

interface TokenDetails {
  tokenName: string;
  tokenSymbol: string;
  totalSupply: number;
  premintAmount: number;
  decimals: number;
}
interface Config {
  keypair: Keypair;
  rpcEndpoint: string;
  tokenDetails: TokenDetails;
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
      `Failed to load keypair from path ${secretKeyPath}: ${error.message}`
    );
    throw error;
  }
}

function loadConfig(): Config {
  const {
    SECRET_KEYPAIR_PATH,
    RPC_ENDPOINT,
    TOKEN_NAME,
    TOKEN_SYMBOL,
    TOTAL_SUPPLY,
    PREMINT_AMOUNT,
    DECIMALS,
  } = process.env;

  if (
    !SECRET_KEYPAIR_PATH ||
    !RPC_ENDPOINT ||
    !TOKEN_NAME ||
    !TOKEN_SYMBOL ||
    !TOTAL_SUPPLY ||
    !PREMINT_AMOUNT ||
    !DECIMALS
  ) {
    logger.error(
      "One or more required environment variables are missing. Please check your .env file."
    );
    throw new Error("Missing environment variables");
  }

  const totalSupply = parseInt(TOTAL_SUPPLY, 10);
  const premintAmount = parseInt(PREMINT_AMOUNT, 10);
  const decimals = parseInt(DECIMALS, 10);

  if (isNaN(totalSupply) || isNaN(premintAmount) || isNaN(decimals)) {
    logger.error(
      "TOTAL_SUPPLY, PREMINT_AMOUNT, and DECIMALS must be valid numbers."
    );
    throw new Error("Invalid numerical values in environment variables");
  }

  if (premintAmount > totalSupply) {
    logger.error(
      "PREMINT_AMOUNT cannot exceed TOTAL_SUPPLY. Please adjust your values."
    );
    throw new Error("PREMINT_AMOUNT exceeds TOTAL_SUPPLY");
  }

  const keypair = loadKeypair(SECRET_KEYPAIR_PATH);

  return {
    keypair,
    rpcEndpoint: RPC_ENDPOINT,
    tokenDetails: {
      tokenName,
      tokenSymbol,
      totalSupply,
      premintAmount,
      decimals,
    },
  };
}
export const CONFIG: Config = loadConfig();
