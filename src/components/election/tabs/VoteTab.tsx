"use client";

import { useState, useEffect } from "react";
import { Address, formatEther, parseEther } from "viem";
import { useAccount, useReadContract, useBalance } from "wagmi";
import toast from "react-hot-toast";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useElection, usePosition } from "@/hooks/useElection";
import { electionAbi } from "@/contracts/abis/election";
import { ElectionStatus, PositionWithCandidates } from "@/types/election";

interface VoteTabProps {
  electionAddress: Address;
}

export default function VoteTab({ electionAddress }: VoteTabProps) {
  const { address: userAddress } = useAccount();
  
  // Get user balance
  const { data: balanceData } = useBalance({
    address: userAddress,
  });
  
  const userBalance = balanceData?.value || BigInt(0);
  const minGasNeeded = parseEther("0.05"); // Minimum 0.05 ETH for gas
  const hasEnoughBalance = userBalance >= minGasNeeded;
  const { 
    status, 
    positionsCount, 
    hasVoted, 
    isWhitelisted,
    vote,
    isVoting,
    isVoteConfirming,
    isVoteSuccess,
    refetchHasVoted,
  } = useElection(electionAddress);

  // Debug logs
  console.log("VoteTab Debug:", {
    userAddress,
    status,
    positionsCount,
    hasVoted,
    isWhitelisted,
  });

  const [positions, setPositions] = useState<PositionWithCandidates[]>([]);
  const [isLoadingPositions, setIsLoadingPositions] = useState(true);
  const [selectedCandidates, setSelectedCandidates] = useState<{ [key: number]: number }>({});

  // Load all positions and candidates
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

  const handleVote = async () => {
    // Check balance first
    if (!hasEnoughBalance) {
      const balanceEth = formatEther(userBalance);
      toast.error(
        `Insufficient balance. You have ${balanceEth} ETH, but need at least 0.05 ETH for gas fees.`
      );
      
      // Show faucet options
      const linkAlchemy = 'https://www.alchemy.com/faucets/ethereum-sepolia';
      const linkFaucet = 'https://sepoliafaucet.com/';
      toast.error(
        <>Get Sepolia ETH from <a href={linkAlchemy} target="_blank" rel="noopener noreferrer" className="underline text-blue-500">Alchemy</a> or <a href={linkFaucet} target="_blank" rel="noopener noreferrer" className="underline text-blue-500">Faucet</a></>
      );
      return;
    }
    
    // Validate that all positions have a selection
    const allPositionsSelected = positions.every(
      (pos) => selectedCandidates[pos.positionIndex] !== undefined
    );

    if (!allPositionsSelected) {
      toast.error("Please select a candidate for each position");
      return;
    }

    try {
      const candidateIndices = positions.map((pos) => selectedCandidates[pos.positionIndex]);
      console.log("🗳️ Submitting vote with indices:", candidateIndices);
      console.log("💰 Current balance:", formatEther(userBalance), "ETH");
      await vote(candidateIndices);
      toast.success("Transaction submitted! Casting your vote...");
    } catch (err: any) {
      console.error("❌ Vote error:", err);
      
      // Check for specific error messages
      const errorMsg = err?.shortMessage || err?.message || "Failed to cast vote";
      
      if (errorMsg.includes("insufficient") || errorMsg.includes("balance")) {
        toast.error(
          <>Insufficient balance for gas. Get more Sepolia ETH from <a href="https://www.alchemy.com/faucets/ethereum-sepolia" target="_blank" rel="noopener noreferrer" className="underline text-blue-500">faucet</a></>
        );
      } else {
        toast.error(errorMsg);
      }
    }
  };

  useEffect(() => {
    if (isVoteSuccess) {
      toast.success("Vote cast successfully!");
      refetchHasVoted();
    }
  }, [isVoteSuccess, refetchHasVoted]);

  if (!userAddress) {
    return (
      <Card>
        <CardBody className="text-center py-12">
          <p className="text-gray-600">Please connect your wallet to vote</p>
        </CardBody>
      </Card>
    );
  }

  if (!isWhitelisted) {
    return (
      <Card>
        <CardBody className="text-center py-12">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Not Eligible to Vote</h3>
          <p className="text-gray-600">Your address is not whitelisted for this election</p>
        </CardBody>
      </Card>
    );
  }

  if (hasVoted) {
    return (
      <Card>
        <CardBody className="text-center py-12">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Vote Already Cast</h3>
          <p className="text-gray-600">You have already voted in this election</p>
        </CardBody>
      </Card>
    );
  }

  if (status !== ElectionStatus.Active) {
    return (
      <Card>
        <CardBody className="text-center py-12">
          <p className="text-gray-600">
            {status === ElectionStatus.Draft
              ? "Election has not started yet"
              : "Election has ended"}
          </p>
        </CardBody>
      </Card>
    );
  }

  if (isLoadingPositions) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Balance Warning Banner */}
      {!hasEnoughBalance && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">
                ⚠️ Insufficient Balance for Gas
              </p>
              <p className="mt-2 text-sm text-red-700">
                You have <strong>{formatEther(userBalance)} ETH</strong> but need at least <strong>0.05 ETH</strong> for gas fees.
              </p>
              <div className="mt-3">
                <a
                  href="https://www.alchemy.com/faucets/ethereum-sepolia"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-sm font-medium text-red-600 hover:text-red-500 underline"
                >
                  Get Sepolia ETH from Faucet →
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900">Cast Your Vote</h3>
          <p className="text-sm text-gray-600 mt-1">
            Select one candidate for each position
          </p>
        </CardHeader>
        <CardBody className="space-y-6">
          {positions.map((position) => (
            <PositionVoteCard
              key={position.positionIndex}
              electionAddress={electionAddress}
              position={position}
              selectedCandidate={selectedCandidates[position.positionIndex]}
              onSelect={(candidateIndex) =>
                setSelectedCandidates((prev) => ({
                  ...prev,
                  [position.positionIndex]: candidateIndex,
                }))
              }
            />
          ))}

          <div className="pt-4">
            <Button
              onClick={handleVote}
              className="w-full"
              size="lg"
              isLoading={isVoting || isVoteConfirming}
              disabled={
                Object.keys(selectedCandidates).length !== positions.length
              }
            >
              Submit Vote
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

// Component for each position voting card
function PositionVoteCard({
  electionAddress,
  position,
  selectedCandidate,
  onSelect,
}: {
  electionAddress: Address;
  position: PositionWithCandidates;
  selectedCandidate?: number;
  onSelect: (candidateIndex: number) => void;
}) {
  const { position: positionData, isLoading: isPositionLoading } = usePosition(electionAddress, position.positionIndex);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [isLoadingCandidates, setIsLoadingCandidates] = useState(true);

  useEffect(() => {
    const loadCandidates = async () => {
      if (!positionData) {
        setIsLoadingCandidates(false);
        setCandidates([]);
        return;
      }

      // positionData is an array: [title, candidateCount]
      const candidateCount = Number(positionData[1]);
      
      console.log(`Loading ${candidateCount} candidates for position ${position.positionIndex}`);
      
      // If no candidates, set empty array
      if (candidateCount === 0) {
        setCandidates([]);
        setIsLoadingCandidates(false);
        return;
      }

      setIsLoadingCandidates(true);
      
      // Create candidate indices for rendering with actual data fetching
      const candidatesData = Array.from({ length: candidateCount }, (_, i) => ({
        positionIndex: position.positionIndex,
        candidateIndex: i,
      }));
      
      setCandidates(candidatesData);
      setIsLoadingCandidates(false);
    };

    loadCandidates();
  }, [positionData, position.positionIndex]);

  const isLoading = isPositionLoading || isLoadingCandidates;
  const candidateCount = positionData?.[1] ? Number(positionData[1]) : 0;

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <h4 className="font-semibold text-gray-900 mb-4">
        {positionData?.[0] || position.title}
      </h4>
      
      {isLoading && (
        <p className="text-sm text-gray-500 text-center py-4">Loading candidates...</p>
      )}
      
      {!isLoading && candidateCount === 0 && (
        <p className="text-sm text-gray-600 text-center py-4">
          ⚠️ No candidates added yet for this position
        </p>
      )}
      
      {!isLoading && candidates.length > 0 && (
        <div className="space-y-2">
          {candidates.map((candidate) => (
            <CandidateVoteOption
              key={`${candidate.positionIndex}-${candidate.candidateIndex}`}
              electionAddress={electionAddress}
              positionIndex={candidate.positionIndex}
              candidateIndex={candidate.candidateIndex}
              isSelected={selectedCandidate === candidate.candidateIndex}
              onSelect={() => onSelect(candidate.candidateIndex)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Component to fetch and display a single candidate for voting
function CandidateVoteOption({
  electionAddress,
  positionIndex,
  candidateIndex,
  isSelected,
  onSelect,
}: {
  electionAddress: Address;
  positionIndex: number;
  candidateIndex: number;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const { data: candidateData } = useReadContract({
    address: electionAddress,
    abi: electionAbi,
    functionName: "getCandidate",
    args: [BigInt(positionIndex), BigInt(candidateIndex)],
    query: {
      gcTime: 0,
      staleTime: 0,
    },
  });

  const name = candidateData?.[0] || "Unknown Candidate";

  return (
    <label
      className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-colors ${
        isSelected
          ? "border-primary-600 bg-primary-50"
          : "border-gray-200 hover:border-gray-300"
      }`}
    >
      <input
        type="radio"
        name={`position-${positionIndex}`}
        value={candidateIndex}
        checked={isSelected}
        onChange={onSelect}
        className="w-4 h-4 text-primary-600"
      />
      <span className="ml-3 font-medium text-gray-900">{name}</span>
    </label>
  );
}
