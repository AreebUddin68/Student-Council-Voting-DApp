import { sepolia, hardhat } from "wagmi/chains";

const chainId = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || "11155111");

// Validate factory address format
const factoryAddress = process.env.NEXT_PUBLIC_VOTING_FACTORY_ADDRESS;

if (!factoryAddress || factoryAddress === "YOUR_DEPLOYED_FACTORY_ADDRESS_HERE") {
  console.error("⚠️  VOTING_FACTORY_ADDRESS is not configured!");
  console.error("Please set NEXT_PUBLIC_VOTING_FACTORY_ADDRESS in .env.local");
} else {
  console.log("✅ Connected to Sepolia Testnet");
  console.log("📍 Factory Address:", factoryAddress);
}

export const VOTING_FACTORY_ADDRESS =
  (factoryAddress as `0x${string}`) ||
  "0x0000000000000000000000000000000000000000";

export const SUPPORTED_CHAIN = chainId === 31337 ? hardhat : sepolia;

export const CHAIN_CONFIG = {
  [hardhat.id]: {
    votingFactory: VOTING_FACTORY_ADDRESS,
    name: "Hardhat Local",
    rpc: "http://127.0.0.1:8545",
    explorer: "N/A",
  },
  [sepolia.id]: {
    votingFactory: VOTING_FACTORY_ADDRESS,
    name: "Sepolia Testnet",
    rpc: "https://1rpc.io/sepolia",
    explorer: "https://sepolia.etherscan.io",
  },
};

// Validate current chain configuration
export const CURRENT_CHAIN_CONFIG = CHAIN_CONFIG[chainId];

if (!CURRENT_CHAIN_CONFIG) {
  console.error(`⚠️  Unsupported chain ID: ${chainId}`);
  console.error("Supported chains: Sepolia (11155111) or Hardhat (31337)");
}
