"use client";

import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function Header() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">V</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Student Council Voting</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/dashboard"
              className="text-gray-600 hover:text-gray-900 transition-colors duration-200"
            >
              Dashboard
            </Link>
            <Link
              href="/create"
              className="text-gray-600 hover:text-gray-900 transition-colors duration-200"
            >
              Create Election
            </Link>
            <Link
              href="/elections"
              className="text-gray-600 hover:text-gray-900 transition-colors duration-200"
            >
              View Elections
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            {/* Sepolia Network Indicator */}
            <div className="hidden sm:flex items-center px-3 py-1.5 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2 animate-pulse"></div>
              <span className="text-xs font-medium text-yellow-700">Sepolia Testnet</span>
            </div>
            <ConnectButton />
          </div>
        </div>
      </div>
    </header>
  );
}
