import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { sepolia } from "wagmi/chains";

export const config = getDefaultConfig({
  appName: "Student Council Voting DApp",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "c3f7fd8dc50f1dd9bcf5882aff93f842",
  chains: [sepolia], // FIXED: Removed mainnet
  ssr: true,
});

export const defaultChain = sepolia;
