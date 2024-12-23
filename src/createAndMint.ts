import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  getMint,
} from "@solana/spl-token";
import { CONFIG } from "./config";
import { logger } from "./utils/logger";
import { validateEnvVariables } from "./utils/helpers";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import inquirer from "inquirer";
import axios from "axios";
import FormData from "form-data";

// Load environment variables
dotenv.config();

interface TokenDetails {
  tokenName: string;
  tokenSymbol: string;
  totalSupply: number;
  premintAmount: number;
  decimals: number;
  tokenImagePath?: string;
  tokenImageURL?: string;
}

async function promptUserForTokenDetails(): Promise<TokenDetails> {
  const questions = [
    {
      type: "input",
      name: "tokenName",
      message: "Enter your token name:",
      validate: (input: string) => input.trim() !== "" || "Token name cannot be empty.",
    },
    {
      type: "input",
      name: "tokenSymbol",
      message: "Enter your token symbol:",
      validate: (input: string) => input.trim() !== "" || "Token symbol cannot be empty.",
    },
    {
      type: "number",
      name: "totalSupply",
      message: "Enter the total supply (without decimals):",
      validate: (input: number) =>
        input > 0 || "Total supply must be a positive number.",
    },
    {
      type: "number",
      name: "premintAmount",
      message: "Enter the number of tokens to pre-mint to your wallet:",
      validate: (input: number, answers: any) => {
        if (input > answers.totalSupply) {
          return "Pre-mint amount cannot exceed total supply.";
        }
        return input > 0 || "Pre-mint amount must be a positive number.";
      },
    },
    {
      type: "number",
      name: "decimals",
      message: "Enter the number of decimal places:",
      default: 9,
      validate: (input: number) =>
        input >= 0 || "Decimals must be a non-negative number.",
    },
    {
      type: "input",
      name: "tokenImagePath",
      message: "Enter the path to your token image (optional):",
      validate: (input: string) => {
        if (input.trim() === "") return true;
        return fs.existsSync(input.trim()) || "File does not exist. Please enter a valid path.";
      },
    },
  ];

  return inquirer.prompt(questions) as Promise<TokenDetails>;
}

async function uploadImageToIPFS(imagePath: string): Promise<string> {
  try {
    const formData = new FormData();
    formData.append('file', fs.createReadStream(imagePath));

    const response = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, {
      maxContentLength: Infinity,
      headers: {
        'Content-Type': `multipart/form-data; boundary=${(formData as any)._boundary}`,
        'pinata_api_key': CONFIG.pinataApiKey || '',
        'pinata_secret_api_key': CONFIG.pinataSecretApiKey || '',
      },
    });

    return `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`;
  } catch (error) {
    logger.error("Failed to upload image to IPFS.");
    throw error;
  }
}

async function main() {
  try {
    logger.info("Starting token creation and minting process...");
    validateEnvVariables();

    const tokenDetails: TokenDetails = await promptUserForTokenDetails();

    if (tokenDetails.tokenImagePath) {
      logger.info("Uploading token image to IPFS...");
      tokenDetails.tokenImageURL = await uploadImageToIPFS(tokenDetails.tokenImagePath);
      logger.info(`Token image uploaded to IPFS: ${tokenDetails.tokenImageURL}`);
    }

    const { tokenName, tokenSymbol, totalSupply, premintAmount, decimals, tokenImageURL } = tokenDetails;

    const connection = new Connection(CONFIG.rpcEndpoint, "confirmed");
    logger.info(`Connected to RPC endpoint: ${CONFIG.rpcEndpoint}`);

    const payer = CONFIG.keypair;
    logger.info(`Loaded wallet: ${payer.publicKey.toBase58()}`);
    const balance = await connection.getBalance(payer.publicKey);
    logger.info(`Wallet balance: ${(balance / LAMPORTS_PER_SOL).toFixed(2)} SOL`);

    if (balance < LAMPORTS_PER_SOL * 0.1) {
      throw new Error("Insufficient funds in the wallet. Please ensure your wallet has at least 0.1 SOL.");
    }

    logger.info("Creating new SPL Token Mint...");
    const mint = await createMint(
      connection,
      payer,
      payer.publicKey,
      payer.publicKey,
      decimals
    );
    logger.info(`New Mint created: ${mint.toBase58()}`);

    logger.info("Fetching or creating Associated Token Account (ATA)...");
    const tokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      payer,
      mint,
      payer.publicKey
    );
    logger.info(`ATA for wallet: ${tokenAccount.address.toBase58()}`);

    logger.info(`Minting ${premintAmount} tokens to ATA...`);
    const mintAmount = BigInt(premintAmount) * BigInt(10 ** decimals);
    const mintSignature = await mintTo(
      connection,
      payer,
      mint,
      tokenAccount.address,
      payer,
      mintAmount
    );
    logger.info(`Mint transaction signature: ${mintSignature}`);

    const mintInfo = await getMint(connection, mint);
    logger.info("Mint Information:");
    logger.info(`- Name: ${tokenName}`);
    logger.info(`- Symbol: ${tokenSymbol}`);
    logger.info(`- Total Supply: ${totalSupply}`);
    logger.info(`- Decimals: ${mintInfo.decimals}`);
    logger.info(`- Mint Address: ${mint.toBase58()}`);
    logger.info(`- ATA Address: ${tokenAccount.address.toBase58()}`);
    logger.info(`- Pre-mint Amount: ${premintAmount}`);
    if (tokenImageURL) {
      logger.info(`- Token Image URL: ${tokenImageURL}`);
    }

    const exportData = {
      tokenName,
      tokenSymbol,
      totalSupply,
      decimals: mintInfo.decimals,
      mintAddress: mint.toBase58(),
      ataAddress: tokenAccount.address.toBase58(),
      preMintAmount: premintAmount,
      tokenImageURL: tokenImageURL || "",
    };
    fs.writeFileSync(
      path.resolve("token-details.json"),
      JSON.stringify(exportData, null, 2)
    );
    logger.info("Token details exported to token-details.json");

    logger.success("Token creation and minting process completed successfully!");
  } catch (error) {
    logger.error(`Error during token creation and minting: ${(error as Error).message}`);
    process.exit(1);
  }
}

main();
