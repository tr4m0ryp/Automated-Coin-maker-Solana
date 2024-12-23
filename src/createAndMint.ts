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

dotenv.config();

async function main() {
  try {
    logger.info("Starting token creation and minting process...");
    validateEnvVariables();

    const {
      tokenName,
      tokenSymbol,
      totalSupply,
      premintAmount,
      decimals,
    } = CONFIG.tokenDetails;

  
    const connection = new Connection(CONFIG.rpcEndpoint, "confirmed");
    logger.info(`Connected to RPC endpoint: ${CONFIG.rpcEndpoint}`);

    // load wallet Keypair
    const payer = CONFIG.keypair;
    logger.info(`Loaded wallet: ${payer.publicKey.toBase58()}`);
    const balance = await connection.getBalance(payer.publicKey);
    logger.info(`Wallet balance: ${(balance / LAMPORTS_PER_SOL).toFixed(2)} SOL`);

    // Ensure sufficient funds (minimum 0.1 SOL)
    if (balance < LAMPORTS_PER_SOL * 0.1) {
      throw new Error(
        "Insufficient funds in the wallet. Please ensure your wallet has at least 0.1 SOL."
      );
    }

    // new sp;l token mint
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

    // mint tokens to the ATA
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

    // fetch and display mintinformation
    const mintInfo = await getMint(connection, mint);
    logger.info("Mint Information:");
    logger.info(`- Name: ${tokenName}`);
    logger.info(`- Symbol: ${tokenSymbol}`);
    logger.info(`- Total Supply: ${totalSupply}`);
    logger.info(`- Decimals: ${mintInfo.decimals}`);
    logger.info(`- Mint Address: ${mint.toBase58()}`);
    logger.info(`- ATA Address: ${tokenAccount.address.toBase58()}`);
    logger.info(`- Pre-mint Amount: ${premintAmount}`);

    // export token-details to JSON
    const exportData = {
      tokenName,
      tokenSymbol,
      totalSupply,
      decimals: mintInfo.decimals,
      mintAddress: mint.toBase58(),
      ataAddress: tokenAccount.address.toBase58(),
      preMintAmount: premintAmount,
    };
    fs.writeFileSync(
      path.resolve("token-details.json"),
      JSON.stringify(exportData, null, 2)
    );
    logger.info("Token details exported to token-details.json");

    logger.success("Token creation and minting process completed successfully!");
  } catch (error) {
    logger.error(`Error during token creation and minting: ${error.message}`);
    process.exit(1); 
  }
}

main();
