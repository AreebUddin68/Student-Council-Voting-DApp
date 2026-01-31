"use client";

import Link from "next/link";
import { Address } from "viem";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useElection } from "@/hooks/useElection";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { getStatusBadgeColor, getStatusText, shortenAddress, formatTimeRemaining, hasElectionEnded } from "@/lib/utils";
import { ElectionStatus } from "@/types/election";

interface ElectionCardProps {
  address: Address;
}

export default function ElectionCard({ address }: ElectionCardProps) {
  const { title, status, stats, isLoading } = useElection(address);

  console.log("ElectionCard:", { address, title, status, stats });

  if (isLoading) {
    return (
      <Card>
        <CardBody className="flex items-center justify-center py-12">
          <LoadingSpinner />
        </CardBody>
      </Card>
    );
  }

  // Check if election time has passed and override status to Ended
  const actualStatus = (status === ElectionStatus.Active && stats?.endTime && hasElectionEnded(stats.endTime))
    ? ElectionStatus.Ended
    : status;

  const statusBadgeVariant =
    actualStatus === ElectionStatus.Draft
      ? "default"
      : actualStatus === ElectionStatus.Active
      ? "success"
      : "danger";

  return (
    <Card hover>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{title || "Untitled Election"}</h3>
            <p className="text-sm text-gray-500">{shortenAddress(address)}</p>
          </div>
          <Badge variant={statusBadgeVariant}>{actualStatus !== undefined ? getStatusText(actualStatus) : "Unknown"}</Badge>
        </div>
      </CardHeader>

      <CardBody>
        <div className="space-y-3">
          {stats && (
            <>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Voters</span>
                <span className="font-medium text-gray-900">
                  {stats.votedCount.toString()} / {stats.totalVoters.toString()}
                </span>
              </div>

              {actualStatus === ElectionStatus.Active && stats.endTime > 0n && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Status</span>
                  <span className="font-medium text-gray-900">
                    {formatTimeRemaining(stats.endTime)}
                  </span>
                </div>
              )}
            </>
          )}

          <Link href={`/election/${address}`} className="block">
            <Button className="w-full" variant="outline">
              View Election
            </Button>
          </Link>
        </div>
      </CardBody>
    </Card>
  );
}
