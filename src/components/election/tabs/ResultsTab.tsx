"use client";

import { useState, useEffect } from "react";
import { Address } from "viem";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useElection, usePosition, useCandidate } from "@/hooks/useElection";
import { ElectionStatus, PositionWithCandidates, CandidateWithPosition } from "@/types/election";
import { shortenAddress } from "@/lib/utils";
import toast from "react-hot-toast";

interface ResultsTabProps {
  electionAddress: Address;
}

export default function ResultsTab({ electionAddress }: ResultsTabProps) {
  const { 
    status, 
    positionsCount, 
    stats,
    isOrganizer,
    finalizeElection,
    isFinalizing,
    isFinalizeConfirming,
    isFinalizeSuccess,
    refetchStatus,
  } = useElection(electionAddress);

  const [positions, setPositions] = useState<PositionWithCandidates[]>([]);
  const [isLoadingPositions, setIsLoadingPositions] = useState(true);

  // Load all positions and candidates with votes
  useEffect(() => {
    const loadPositions = async () => {
      if (!positionsCount) return;

      setIsLoadingPositions(true);
      try {
        const positionsData: PositionWithCandidates[] = [];
        
        for (let i = 0; i < Number(positionsCount); i++) {
          positionsData.push({
            title: `Position ${i + 1}`,
            candidateCount: 0n,
            positionIndex: i,
            candidates: [],
          });
        }
        
        setPositions(positionsData);
      } catch (err) {
        console.error("Error loading positions:", err);
      } finally {
        setIsLoadingPositions(false);
      }
    };

    loadPositions();
  }, [positionsCount]);

  const handleFinalize = async () => {
    // Check if election has ended
    if (stats && stats.endTime) {
      const now = Math.floor(Date.now() / 1000);
      const endTime = Number(stats.endTime);
      
      if (now < endTime) {
        const remainingTime = endTime - now;
        const hours = Math.floor(remainingTime / 3600);
        const minutes = Math.floor((remainingTime % 3600) / 60);
        toast.error(`Election hasn't ended yet. ${hours}h ${minutes}m remaining.`);
        return;
      }
    }

    try {
      await finalizeElection();
      toast.success("Transaction submitted! Finalizing election...");
    } catch (err: any) {
      console.error("Finalize error:", err);
      
      let errorMessage = "Failed to finalize election";
      if (err?.message) {
        if (err.message.includes("TooEarly")) {
          errorMessage = "Election hasn't ended yet. Please wait until the end time.";
        } else if (err.message.includes("NotActive")) {
          errorMessage = "Election is not active or already finalized.";
        } else if (err.message.includes("user rejected")) {
          errorMessage = "Transaction was rejected";
        } else {
          errorMessage = err.message;
        }
      }
      
      toast.error(errorMessage);
    }
  };

  useEffect(() => {
    if (isFinalizeSuccess) {
      toast.success("Election finalized successfully!");
      refetchStatus();
    }
  }, [isFinalizeSuccess, refetchStatus]);

  if (isLoadingPositions) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const canViewResults = status === ElectionStatus.Ended;
  const canFinalize = status === ElectionStatus.Active && isOrganizer;

  return (
    <div className="space-y-6">
      {/* Election Summary */}
      {stats && (
        <Card>
          <CardBody>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Election Summary</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Voters</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalVoters.toString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Votes Cast</p>
                <p className="text-2xl font-bold text-primary-600">{stats.votedCount.toString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Turnout</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalVoters > 0n
                    ? `${((Number(stats.votedCount) / Number(stats.totalVoters)) * 100).toFixed(1)}%`
                    : "0%"}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Finalize Button */}
      {canFinalize && (
        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Finalize Election</h3>
                <p className="text-sm text-gray-600">
                  Mark the election as ended to publish final results
                </p>
              </div>
              <Button
                onClick={handleFinalize}
                variant="primary"
                isLoading={isFinalizing || isFinalizeConfirming}
              >
                Finalize Election
              </Button>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Results */}
      {!canViewResults ? (
        <Card>
          <CardBody className="text-center py-12">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Results Not Available Yet</h3>
            <p className="text-gray-600">
              Results will be visible once the election is finalized
            </p>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Final Results</h3>
          {positions.map((position) => (
            <PositionResultsCard
              key={position.positionIndex}
              electionAddress={electionAddress}
              position={position}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Component to display results for each position
function PositionResultsCard({
  electionAddress,
  position,
}: {
  electionAddress: Address;
  position: PositionWithCandidates;
}) {
  const { position: positionData } = usePosition(electionAddress, position.positionIndex);
  const [candidates, setCandidates] = useState<CandidateWithPosition[]>([]);
  const [winner, setWinner] = useState<CandidateWithPosition | null>(null);

  useEffect(() => {
    const loadCandidates = async () => {
      if (!positionData) return;

      const candidatesData: CandidateWithPosition[] = [];
      for (let i = 0; i < Number(positionData[1]); i++) {
        // In production, fetch actual candidate data
        const mockVotes = BigInt(Math.floor(Math.random() * 100));
        candidatesData.push({
          name: `Candidate ${i + 1}`,
          candidateAddress: "0x0000000000000000000000000000000000000000" as Address,
          voteCount: mockVotes,
          positionIndex: position.positionIndex,
          candidateIndex: i,
        });
      }

      // Sort by vote count
      candidatesData.sort((a, b) => Number(b.voteCount - a.voteCount));
      
      // Set winner
      if (candidatesData.length > 0) {
        setWinner(candidatesData[0]);
      }

      setCandidates(candidatesData);
    };

    loadCandidates();
  }, [positionData, position.positionIndex]);

  const totalVotes = candidates.reduce((sum, c) => sum + Number(c.voteCount), 0);

  return (
    <Card>
      <CardHeader>
        <h4 className="font-semibold text-gray-900">{positionData?.[0] || position.title}</h4>
      </CardHeader>
      <CardBody>
        {candidates.length === 0 ? (
          <p className="text-sm text-gray-600 text-center py-4">No candidates</p>
        ) : (
          <div className="space-y-3">
            {candidates.map((candidate, idx) => (
              <div key={candidate.candidateIndex} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-gray-900">{candidate.name}</span>
                    {idx === 0 && winner && (
                      <Badge variant="success">Winner</Badge>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{candidate.voteCount.toString()} votes</p>
                    <p className="text-sm text-gray-600">
                      {totalVotes > 0
                        ? `${((Number(candidate.voteCount) / totalVotes) * 100).toFixed(1)}%`
                        : "0%"}
                    </p>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      idx === 0 ? "bg-green-600" : "bg-primary-600"
                    }`}
                    style={{
                      width: totalVotes > 0 ? `${(Number(candidate.voteCount) / totalVotes) * 100}%` : "0%",
                    }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 font-mono">{shortenAddress(candidate.candidateAddress)}</p>
              </div>
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  );
}
