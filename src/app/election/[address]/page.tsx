"use client";

import { useParams } from "next/navigation";
import { Address } from "viem";
import { useAccount } from "wagmi";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Tabs } from "@/components/ui/Tabs";
import { useElection } from "@/hooks/useElection";
import { getStatusText, getStatusBadgeColor } from "@/lib/utils";
import OverviewTab from "@/components/election/tabs/OverviewTab";
import CandidatesTab from "@/components/election/tabs/CandidatesTab";
import VotersTab from "@/components/election/tabs/VotersTab";
import VoteTab from "@/components/election/tabs/VoteTab";
import ResultsTab from "@/components/election/tabs/ResultsTab";
import { ElectionStatus } from "@/types/election";

export default function ElectionDetailPage() {
  const params = useParams();
  const electionAddress = params.address as Address;
  const { isConnected } = useAccount();

  const { title, status, isOrganizer, isWhitelisted, isLoading } = useElection(electionAddress);

  // Debug logs
  console.log("Election Debug:", {
    status,
    statusValue: status === ElectionStatus.Active,
    isWhitelisted,
    isConnected,
    isLoading,
    ElectionStatus: { Draft: ElectionStatus.Draft, Active: ElectionStatus.Active, Ended: ElectionStatus.Ended },
  });

  if (!electionAddress || !electionAddress.startsWith("0x")) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card>
          <CardBody className="text-center py-12">
            <p className="text-red-600">Invalid election address</p>
          </CardBody>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (!title || !isConnected) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card>
          <CardBody className="text-center py-12">
            <svg className="w-16 h-16 text-yellow-400 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Election Not Found</h2>
            <p className="text-gray-600 mb-6">
              This election doesn't exist or was created on a previous deployment. 
              {!isConnected && " Please connect your wallet to see your elections."}
            </p>
            <div className="flex gap-3 justify-center">
              <a href="/dashboard" className="inline-block">
                <button className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                  View My Elections
                </button>
              </a>
              <a href="/elections" className="inline-block">
                <button className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                  View All Elections
                </button>
              </a>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  // Determine which tabs to show based on role
  const tabs = [
    {
      id: "overview",
      label: "Overview",
      content: <OverviewTab electionAddress={electionAddress} />,
    },
  ];

  if (isOrganizer) {
    tabs.push(
      {
        id: "candidates",
        label: "Candidates",
        content: <CandidatesTab electionAddress={electionAddress} />,
      },
      {
        id: "voters",
        label: "Voters",
        content: <VotersTab electionAddress={electionAddress} />,
      }
    );
  }

  if (isWhitelisted && status === ElectionStatus.Active) {
    tabs.push({
      id: "vote",
      label: "Vote",
      content: <VoteTab electionAddress={electionAddress} />,
    });
  } else if (status === ElectionStatus.Active && !isConnected) {
    // Show message if election is active but wallet not connected
    tabs.push({
      id: "vote",
      label: "Vote",
      content: <VoteTab electionAddress={electionAddress} />,
    });
  } else if (status === ElectionStatus.Active && !isWhitelisted && isConnected) {
    // Show vote tab but will display "not whitelisted" message
    tabs.push({
      id: "vote",
      label: "Vote",
      content: <VoteTab electionAddress={electionAddress} />,
    });
  }

  tabs.push({
    id: "results",
    label: "Results",
    content: <ResultsTab electionAddress={electionAddress} />,
  });

  // Show helpful message if election is active but user can't vote
  let voteTabMessage: string | null = null;
  if (status === ElectionStatus.Active && isConnected && !isWhitelisted) {
    voteTabMessage = "Your address is not whitelisted. Ask the organizer to whitelist you to vote.";
  } else if (status === ElectionStatus.Active && !isConnected) {
    voteTabMessage = "Connect your wallet to vote in this election.";
  }

  const statusBadgeVariant =
    status === ElectionStatus.Draft
      ? "default"
      : status === ElectionStatus.Active
      ? "success"
      : "danger";

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{title || "Untitled Election"}</h1>
            <p className="text-gray-600 font-mono text-sm">{electionAddress}</p>
          </div>
          <Badge variant={statusBadgeVariant}>
            {status !== undefined ? getStatusText(status) : "Unknown"}
          </Badge>
        </div>

        {/* Role Badge */}
        {isConnected && (
          <div className="flex gap-2">
            {isOrganizer && (
              <Badge variant="default">Organizer</Badge>
            )}
            {isWhitelisted && (
              <Badge variant="default">Voter</Badge>
            )}
          </div>
        )}

        {/* Vote Status Message */}
        {voteTabMessage && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-800">ℹ️ {voteTabMessage}</p>
          </div>
        )}
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} defaultTab="overview" />
    </div>
  );
}
