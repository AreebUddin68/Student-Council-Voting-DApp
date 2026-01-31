"use client";

import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { sepolia, hardhat } from "wagmi/chains";
import { http } from "wagmi";

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "";

if (!projectId) {
  console.warn(
    "WalletConnect Project ID is not set. Please add it to .env.local"
  );
}

// Configure custom transports for better reliability
// Using 1RPC free endpoint (no rate limits, no API key needed)
const transports = {
  [sepolia.id]: http("https://1rpc.io/sepolia"),
  [hardhat.id]: http("http://127.0.0.1:8545"),
};

// Define chains - Sepolia is primary for production deployment
const chains = [sepolia, hardhat] as const;

export const config = getDefaultConfig({
  appName: "Student Council Voting DApp",
  projectId,
  chains,
  transports,
  ssr: true,
});

// Export Sepolia as default chain for RainbowKit
export const defaultChain = sepolia;
