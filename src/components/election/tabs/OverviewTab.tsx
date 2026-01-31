"use client";

import { Address } from "viem";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useElection } from "@/hooks/useElection";
import { ElectionStatus } from "@/types/election";
import { getStatusText, formatTimestamp, formatTimeRemaining, shortenAddress } from "@/lib/utils";

interface OverviewTabProps {
  electionAddress: Address;
}

export default function OverviewTab({ electionAddress }: OverviewTabProps) {
  const { title, status, organizer, positionsCount, stats, isLoading } = useElection(electionAddress);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const statusBadgeVariant =
    status === ElectionStatus.Draft
      ? "default"
      : status === ElectionStatus.Active
      ? "success"
      : "danger";

  return (
    <div className="space-y-6">
      <Card>
        <CardBody>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Election Information</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Title</p>
                  <p className="font-medium text-gray-900">{title || "Untitled Election"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Status</p>
                  <Badge variant={statusBadgeVariant}>
                    {status !== undefined ? getStatusText(status) : "Unknown"}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Contract Address</p>
                  <p className="font-mono text-sm text-gray-900">{shortenAddress(electionAddress)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Organizer</p>
                  <p className="font-mono text-sm text-gray-900">{organizer ? shortenAddress(organizer) : "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Positions</p>
                  <p className="font-medium text-gray-900">{positionsCount?.toString() || "0"}</p>
                </div>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {stats && (
        <Card>
          <CardBody>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Voting Statistics</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Voters</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalVoters.toString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Votes Cast</p>
                <p className="text-3xl font-bold text-primary-600">{stats.votedCount.toString()}</p>
              </div>
              {stats.startTime > 0n && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Start Time</p>
                  <p className="font-medium text-gray-900">{formatTimestamp(stats.startTime)}</p>
                </div>
              )}
              {stats.endTime > 0n && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">
                    {status === ElectionStatus.Active ? "Time Remaining" : "End Time"}
                  </p>
                  <p className="font-medium text-gray-900">
                    {status === ElectionStatus.Active
                      ? formatTimeRemaining(stats.endTime)
                      : formatTimestamp(stats.endTime)}
                  </p>
                </div>
              )}
            </div>

            {stats.totalVoters > 0n && (
              <div className="mt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Voter Turnout</span>
                  <span className="text-sm font-medium text-gray-900">
                    {((Number(stats.votedCount) / Number(stats.totalVoters)) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${(Number(stats.votedCount) / Number(stats.totalVoters)) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>
            )}
          </CardBody>
        </Card>
      )}
    </div>
  );
}
