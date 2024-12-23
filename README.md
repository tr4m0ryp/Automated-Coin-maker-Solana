# Automated-Coin-maker-Solana
This is a user-friendly tool designed to help you create and mint your own memecoin on the Solana blockchain. 

## Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Setup](#setup)
- [Usage](#usage)
  - [Creating and Minting Your Memecoin](#creating-and-minting-your-memecoin)
  - [Verifying Token Creation](#verifying-token-creation)
- [Project Structure](#project-structure)
- [Security](#security)

---

## Features

- **Interactive Setup:** Easily input your token details through guided prompts.
- **Automated Token Creation:** Creates a new SPL token on the Solana blockchain with your specified parameters.
- **Pre-minting:** Automatically mints a specified number of tokens to your wallet.
- **IPFS Integration:** Optionally upload a token image to IPFS for enhanced metadata.
- **Secure Configuration:** Manage sensitive information securely using environment variables.
- **Comprehensive Logging:** Receive detailed logs throughout the token creation and minting process.

---

## Prerequisites

Before you begin, ensure you have met the following requirements:

1. **Node.js and npm:**
   - Install [Node.js](https://nodejs.org/) (v14 or later) and npm.
   
   ```bash
   # Check Node.js version
   node -v
   
   # Check npm version
   npm -v
   ```

2. **TypeScript:**
   - Install TypeScript globally.
   
   ```bash
   npm install -g typescript
   ```

3. **Solana CLI:**
   - Install the Solana Command Line Interface.
   
   **For macOS and Linux:**
   
   ```bash
   sh -c "$(curl -sSfL https://release.solana.com/v1.14.13/install)"
   ```
   
   **For Windows:**
   - Download and install from the [official Solana GitHub repository](https://github.com/solana-labs/solana/releases).
   
   - Verify installation:
   
   ```bash
   solana --version
   ```

4. **Git:**
   - Ensure Git is installed for version control.
   
   ```bash
   git --version
   ```

---

## Installation

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/tr4m0ryp/Automated-Coin-maker-Solana.git
   cd Automated-Coin-maker-Solana
   ```

2. **Install Dependencies:**

   The project uses NPM scripts to streamline setup.

   ```bash
   npm run init
   ```

   This command executes the `init.sh` script, which installs all necessary NPM packages and ensures TypeScript is available.

---

## Setup

1. **Generate a Solana Wallet:**

   If you don't have a Solana wallet, generate one using the Solana CLI.

   ```bash
   solana-keygen new --outfile ./wallet.json
   ```

   - **Backup:** Securely store the generated seed phrase. **Do not share it with anyone.**
   - **Wallet File:** `wallet.json` contains your wallet's private key. Ensure it's kept safe and **never** commit it to version control.

2. **Configure Environment Variables:**

   Create a `.env` file in the root directory based on the provided `.env.example`.

   ```bash
   cp .env.example .env
   ```

   Open `.env` in your preferred text editor and update the following variables:

   ```dotenv
   # .env

   # Path to your wallet's Keypair JSON file
   SECRET_KEYPAIR_PATH=./wallet.json

   # RPC Endpoint (use Mainnet for live deployment or Devnet for testing)
   RPC_ENDPOINT=https://api.mainnet-beta.solana.com

   # Optional: Pinata API keys for uploading images to IPFS
   PINATA_API_KEY=your_pinata_api_key
   PINATA_SECRET_API_KEY=your_pinata_secret_api_key
   ```

   - **RPC Endpoint:** Use `https://api.devnet.solana.com` for testing or `https://api.mainnet-beta.solana.com` for live deployment.
   - **Pinata API Keys:** Required only if you plan to upload token images to IPFS for metadata.

3. **Fund Your Wallet (For Devnet or Testnet):**

   If you're using Devnet or Testnet, request an airdrop to fund your wallet.

   ```bash
   # Set CLI to Devnet
   solana config set --url https://api.devnet.solana.com

   # Request an airdrop of 2 SOL
   solana airdrop 2
   ```

   - **Verify Balance:**

     ```bash
     solana balance -k ./wallet.json
     ```

     You should see a balance of approximately `2 SOL`.

---

## Usage

### Creating and Minting Your Memecoin

1. **Run the Deployment Script:**

   Execute the main script to create and mint your memecoin.

   ```bash
   npm run deploy
   ```

   This command runs the `deploy.sh` script, which in turn executes the `createAndMint.ts` script using `ts-node`.

2. **Interactive Prompts:**

   You'll be guided through a series of prompts to input your token details:

   - **Token Name:** The name of your memecoin.
   - **Token Symbol:** The symbol representing your memecoin.
   - **Total Supply:** The total number of tokens to be created (without considering decimals).
   - **Pre-mint Amount:** The number of tokens to mint to your wallet initially.
   - **Decimals:** The number of decimal places your token supports (commonly `9`, similar to SOL).
   - **Token Image Path (Optional):** Provide the local path to your token's image to upload to IPFS for metadata.

   **Example:**

   ```
   ? Enter your token name: Niggatron
   ? Enter your token symbol: NGTR
   ? Enter the total supply (without decimals): 1000000000
   ? Enter the number of tokens to pre-mint to your wallet: 300000000
   ? Enter the number of decimal places: 9
   ? Enter the path to your token image (optional): ./images/niggatron.png
   ```

3. **Process Execution:**

   The script will perform the following actions:

   - **Connect to Solana Cluster:** Establishes a connection using the specified RPC endpoint.
   - **Load Wallet Keypair:** Loads your wallet's keypair from `wallet.json`.
   - **Check Wallet Balance:** Ensures you have sufficient SOL to cover transaction fees.
   - **Create SPL Token Mint:** Creates a new SPL token with your specified parameters.
   - **Create/Fetch Associated Token Account (ATA):** Retrieves or creates the ATA for your wallet to hold the minted tokens.
   - **Mint Tokens:** Mints the specified amount of tokens to your ATA.
   - **Upload Token Image to IPFS (Optional):** If an image path is provided, uploads the image to IPFS and includes the URL in the token details.
   - **Export Token Details:** Saves all relevant token information to `token-details.json` for future reference.

4. **Completion:**

   Upon successful execution, you'll receive a success message, and `token-details.json` will contain details about your newly created memecoin.

### Verifying Token Creation

1. **Using Solana Explorer:**

   - Visit [Solana Explorer](https://explorer.solana.com/).
   - Switch to the appropriate network (Devnet/Mainnet Beta).
   - Enter your wallet's public key to view the newly created token and its balance.

2. **Using Wallet Applications:**

   - Open your Solana wallet (e.g., Phantom, Solflare).
   - Add the new token using the `mintAddress` from `token-details.json`.
   
   **Example:**
   
   ```json
   {
     "tokenName": "Niggatron",
     "tokenSymbol": "NGGTR",
     "totalSupply": 1000000000,
     "decimals": 9,
     "mintAddress": "YourMintAddressHere",
     "ataAddress": "YourATAAddressHere",
     "preMintAmount": 300000000,
     "tokenImageURL": "https://gateway.pinata.cloud/ipfs/YourIpfsHashHere"
   }
   ```

---

## Project Structure

```
memeMint-project/
├── .env                     # Environment variables (wallet path, RPC URL, Pinata API keys)
├── .gitignore               # Files and folders to ignore in version control
├── package.json             # NPM configuration (dependencies, scripts)
├── tsconfig.json            # TypeScript configuration
├── README.md                # Project overview and instructions
├── src/
│   ├── config.ts            # Configuration loader (environment variables, RPC, keypair)
│   ├── createAndMint.ts     # Main script: creates token and mints tokens
│   └── utils/
│       ├── logger.ts        # Logger utility for consistent logging
│       └── helpers.ts       # Helper functions (e.g., validation)
└── scripts/
    ├── init.sh              # Shell script to install dependencies
    └── deploy.sh            # Shell script to run the main script
```

---

## Security

### Protecting Sensitive Files

1. **`.env` File:**

   - **Purpose:** Stores environment variables, including sensitive information like wallet paths and API keys.
   - **Security:** Ensure `.env` is **never** committed to version control by listing it in `.gitignore`.
   
   ```gitignore
   # .gitignore

   # Environment variables
   .env
   ```

2. **`wallet.json` File:**

   - **Purpose:** Contains your Solana wallet's private key.
   - **Security:** 
     - **Never** share `wallet.json` with anyone.
     - **Never** commit `wallet.json` to public repositories.
     - Add `wallet.json` to `.gitignore`.
   
   ```gitignore
   # .gitignore

   # Wallet Keypair
   wallet.json
   ```

3. **Backup:**

   - **Wallet Backup:** Always keep a secure backup of your wallet's seed phrase and `wallet.json`. Losing these means losing access to your tokens.
   - **Environment Variables Backup:** Securely store a backup of your `.env` file, especially if it contains API keys.

### Best Practices

- **Use Hardware Wallets:** For enhanced security, consider using hardware wallets to manage your Solana keypairs.
- **Regular Audits:** Periodically review your project's dependencies and configurations for potential vulnerabilities.
- **Access Control:** Limit access to sensitive files and configurations to only those who absolutely need it.

---
