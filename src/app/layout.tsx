"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { config, defaultChain } from "@/config/wagmi";
import "@rainbow-me/rainbowkit/styles.css";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useState, useEffect } from "react"; // FIXED: Added useEffect import
import { useAccount, useChainId, useSwitchChain } from "wagmi";
import { sepolia } from "wagmi/chains";
import toast from "react-hot-toast";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-gray-50">
        <WagmiProvider config={config}>
          <QueryClientProvider client={queryClient}>
            <RainbowKitProvider initialChain={defaultChain}>
              <ChainValidator>
                <Header />
                <main className="flex-1">{children}</main>
                <Footer />
                <Toaster position="top-right" />
              </ChainValidator>
            </RainbowKitProvider>
          </QueryClientProvider>
        </WagmiProvider>
      </body>
    </html>
  );
}

function ChainValidator({ children }: { children: React.ReactNode }) {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  useEffect(() => {
    if (isConnected && chainId !== sepolia.id) {
      toast.error(`Wrong Network! Please switch to Sepolia Testnet`, {
        duration: 5000,
        icon: "⚠️",
      });
    }
  }, [isConnected, chainId]);

  if (isConnected && chainId !== sepolia.id) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Wrong Network</h2>
          <p className="text-gray-600 mb-6">
            This app only works on Sepolia Testnet. You're currently connected to network ID: {chainId}
          </p>
          <button
            onClick={() => switchChain?.({ chainId: sepolia.id })}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Switch to Sepolia
          </button>
          <p className="text-sm text-gray-500 mt-4">
            Chain ID: {sepolia.id} (Sepolia Testnet)
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
