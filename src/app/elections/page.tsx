"use client";

import { useAccount } from "wagmi";
import { Address } from "viem";
import { Card, CardBody } from "@/components/ui/Card";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import ElectionCard from "@/components/election/ElectionCard";
import { useVotingFactory } from "@/hooks/useVotingFactory";

export default function ElectionsPage() {
  const { isConnected } = useAccount();
  const { allElections, isAllElectionsLoading } = useVotingFactory();

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card>
          <CardBody className="text-center py-12">
            <svg
              className="w-16 h-16 text-gray-400 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Wallet Not Connected</h2>
            <p className="text-gray-600 mb-6">
              Please connect your wallet to view elections
            </p>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">All Elections</h1>
        <p className="text-gray-600">Browse and participate in available elections</p>
      </div>

      {isAllElectionsLoading ? (
        <div className="flex items-center justify-center py-16">
          <LoadingSpinner size="lg" />
        </div>
      ) : allElections.length === 0 ? (
        <Card>
          <CardBody className="text-center py-12">
            <svg
              className="w-16 h-16 text-gray-400 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Elections Available</h2>
            <p className="text-gray-600">
              There are no elections available at the moment
            </p>
          </CardBody>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allElections.map((electionAddress: Address) => (
            <ElectionCard key={electionAddress} address={electionAddress} />
          ))}
        </div>
      )}
    </div>
  );
}
