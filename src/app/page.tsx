"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-16">
      {/* Hero Section */}
      <div className="text-center mb-16">
        {/* Sepolia Deployment Badge */}
        <div className="inline-flex items-center px-4 py-2 bg-green-50 border border-green-200 rounded-full mb-6">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
          <span className="text-sm font-medium text-green-700">🚀 Live on Sepolia Testnet</span>
        </div>
        
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Decentralized Student Council Voting
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Create transparent, tamper-proof elections for your school or organization on the Ethereum blockchain.
          No voting fees. Completely secure. Verifiable results.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/create">
            <Button size="lg" className="min-w-[200px]">
              Create Election
            </Button>
          </Link>
          <Link href="/elections">
            <Button size="lg" variant="outline" className="min-w-[200px]">
              View Elections
            </Button>
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <div className="grid md:grid-cols-3 gap-8 mb-16">
        <Card>
          <CardBody>
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Secure & Transparent</h3>
            <p className="text-gray-600">
              All votes are recorded on the blockchain, making them immutable and verifiable by anyone.
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Voting Fees</h3>
            <p className="text-gray-600">
              Students vote for free. Only organizers pay a small fee to create elections.
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Easy to Use</h3>
            <p className="text-gray-600">
              Create elections with custom positions, add candidates, and manage voters with a simple interface.
            </p>
          </CardBody>
        </Card>
      </div>

      {/* How It Works Section */}
      <div className="bg-white rounded-2xl border border-gray-200 p-8 md:p-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">How It Works</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
              1
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Create Election</h4>
            <p className="text-sm text-gray-600">
              Set up your election with a title and define positions
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
              2
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Add Candidates</h4>
            <p className="text-sm text-gray-600">
              Add candidates for each position with their wallet addresses
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
              3
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Whitelist Voters</h4>
            <p className="text-sm text-gray-600">
              Upload voter addresses and set election duration
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
              4
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Vote & Results</h4>
            <p className="text-sm text-gray-600">
              Students vote and results are published on-chain
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="text-center mt-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to get started?</h2>
        <p className="text-lg text-gray-600 mb-8">
          Connect your wallet and create your first election in minutes
        </p>
        <Link href="/create">
          <Button size="lg">Create Your First Election</Button>
        </Link>
      </div>
    </div>
  );
}
