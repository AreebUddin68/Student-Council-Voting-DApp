"use client";

import { useState, useEffect } from "react";
import { Address, getAddress } from "viem";
import { useForm } from "react-hook-form";
import { useReadContract, useAccount, useChainId } from "wagmi";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useElection, usePosition } from "@/hooks/useElection";
import { electionAbi } from "@/contracts/abis/election";
import { candidateFormSchema, CandidateFormInput } from "@/lib/validations";
import { shortenAddress } from "@/lib/utils";
import { PositionWithCandidates } from "@/types/election";
import { PositionSelect } from "@/components/election/PositionSelect";

interface CandidatesTabProps {
  electionAddress: Address;
}

export default function CandidatesTab({ electionAddress }: CandidatesTabProps) {
  const { address: userAddress, isConnected } = useAccount();
  const chainId = useChainId();
  const { positionsCount, addCandidate, isAddingCandidate, isAddCandidateConfirming, isAddCandidateSuccess, organizer } = 
    useElection(electionAddress);
  
  const [positions, setPositions] = useState<PositionWithCandidates[]>([]);
  const [isLoadingPositions, setIsLoadingPositions] = useState(true);
  const [selectedPosition, setSelectedPosition] = useState<number | null>(null);
  const [selectedPositionTitle, setSelectedPositionTitle] = useState<string>("");
  const [existingCandidates, setExistingCandidates] = useState<Array<{name: string, address: string}>>([]);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CandidateFormInput>({
    resolver: zodResolver(candidateFormSchema),
  });

  // Load all positions and their candidates
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

  const onSubmit = async (data: CandidateFormInput) => {
    console.log("📋 Form submitted. Checking prerequisites...");
    console.log("Wallet Status:", {
      isConnected,
      userAddress,
      chainId,
      expectedChainId: 11155111, // Sepolia
    });

    if (!isConnected || !userAddress) {
      console.error("❌ Wallet not connected or no address");
      toast.error("Please connect your wallet first");
      return;
    }

    if (chainId !== 11155111) {
      console.error("❌ Wrong network. Current:", chainId, "Expected: 11155111 (Sepolia)");
      toast.error("Please switch to Sepolia Testnet in your wallet");
      return;
    }

    if (organizer && userAddress.toLowerCase() !== organizer.toLowerCase()) {
      console.error("❌ Not the organizer", { userAddress, organizer });
      toast.error("Only the election organizer can add candidates");
      return;
    }
    if (selectedPosition === null) {
      toast.error("Please select a position");
      return;
    }

    // Check for duplicate name or address
    const isDuplicateName = existingCandidates.some(
      c => c.name.toLowerCase() === data.name.toLowerCase()
    );
    const isDuplicateAddress = existingCandidates.some(
      c => c.address.toLowerCase() === data.address.toLowerCase()
    );

    if (isDuplicateName) {
      toast.error("A candidate with this name already exists in this position");
      return;
    }

    if (isDuplicateAddress) {
      toast.error("A candidate with this address already exists in this position");
      return;
    }

    console.log("Adding candidate:", {
      position: selectedPosition,
      name: data.name,
      address: data.address,
      userAddress,
      organizer,
      isConnected,
      chainId,
      electionAddress,
    });

    try {
      console.log("🔄 Calling addCandidate function...");
      console.log("⏳ If MetaMask doesn't open, check:");
      console.log("   1. Is MetaMask unlocked?");
      console.log("   2. Is MetaMask on Sepolia network?");
      console.log("   3. Do you have enough Sepolia ETH?");
      
      // Checksum the address to ensure it's valid
      const checksummedAddress = getAddress(data.address);
      console.log("✅ Checksummed address:", checksummedAddress);
      
      const result = await addCandidate(selectedPosition, data.name, checksummedAddress);
      console.log("✅ Transaction result:", result);
      
      if (!result) {
        console.error("❌ Transaction returned undefined - wallet might have rejected or not connected");
        toast.error("Transaction failed. Please check your wallet connection.");
        return;
      }
      
      toast.success("Transaction submitted! Adding candidate...");
    } catch (err: any) {
      console.error("❌ Add candidate error:", err);
      console.error("Error details:", {
        message: err?.message,
        shortMessage: err?.shortMessage,
        cause: err?.cause,
        details: err?.details,
      });
      
      const errorMessage = err?.shortMessage || err?.message || "Failed to add candidate";
      toast.error(errorMessage);
    }
  };

  // Reset form on success and trigger refetch
  useEffect(() => {
    if (isAddCandidateSuccess) {
      console.log("✅ Candidate added successfully! Refreshing data...");
      reset();
      toast.success("Candidate added successfully!");
      
      // Trigger refetch immediately
      console.log("🔄 Immediate refetch attempt...");
      setRefetchTrigger(prev => prev + 1);
      
      setTimeout(() => {
        console.log("🔄 First refetch attempt (500ms)...");
        setRefetchTrigger(prev => prev + 1);
      }, 500);
      
      setTimeout(() => {
        console.log("🔄 Second refetch attempt (1500ms)...");
        setRefetchTrigger(prev => prev + 1);
      }, 1500);

      setTimeout(() => {
        console.log("🔄 Third refetch attempt (2500ms)...");
        setRefetchTrigger(prev => prev + 1);
      }, 2500);
    }
  }, [isAddCandidateSuccess, reset]);

  if (isLoadingPositions) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Add Candidate Form */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900">Add Candidate</h3>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Position
              </label>
              <PositionSelect
                electionAddress={electionAddress}
                positions={positions}
                selectedPosition={selectedPosition}
                onSelect={(posIndex, title, candidates) => {
                  setSelectedPosition(posIndex);
                  setSelectedPositionTitle(title);
                  setExistingCandidates(candidates);
                }}
              />
              {selectedPositionTitle && (
                <p className="mt-2 text-sm text-primary-600 font-medium">
                  Adding candidate for: {selectedPositionTitle}
                </p>
              )}
            </div>

            <Input
              label="Candidate Name"
              placeholder="John Doe"
              error={errors.name?.message}
              {...register("name")}
            />

            <Input
              label="Candidate Wallet Address"
              placeholder="0x..."
              error={errors.address?.message}
              {...register("address")}
            />

            <Button
              type="submit"
              className="w-full"
              isLoading={isAddingCandidate || isAddCandidateConfirming}
              disabled={selectedPosition === null}
            >
              Add Candidate
            </Button>
          </form>
        </CardBody>
      </Card>

      {/* Positions and Candidates List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Candidates by Position</h3>
        {positions.map((position) => (
          <PositionCard
            key={position.positionIndex}
            electionAddress={electionAddress}
            position={position}
            refetchTrigger={refetchTrigger}
          />
        ))}
      </div>
    </div>
  );
}

// Component to display each position with its candidates
function PositionCard({
  electionAddress,
  position,
  refetchTrigger,
}: {
  electionAddress: Address;
  position: PositionWithCandidates;
  refetchTrigger: number;
}) {
  const { position: positionData, refetch } = usePosition(electionAddress, position.positionIndex);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [isLoadingCandidates, setIsLoadingCandidates] = useState(false);

  console.log(`PositionCard ${position.positionIndex}:`, {
    positionData,
    candidateCount: positionData?.candidateCount?.toString(),
    refetchTrigger,
  });

  // Refetch when trigger changes
  useEffect(() => {
    if (refetchTrigger > 0) {
      console.log(`🔄 Refetching position ${position.positionIndex} data (trigger: ${refetchTrigger})`);
      refetch().then((result) => {
        console.log(`✅ Refetch complete for position ${position.positionIndex}:`, result.data);
      });
    }
  }, [refetchTrigger, refetch, position.positionIndex]);

  useEffect(() => {
    const loadCandidates = async () => {
      if (!positionData) {
        console.log(`Position ${position.positionIndex}: No position data yet`);
        setCandidates([]);
        return;
      }
      
      // positionData is an array: [title, candidateCount]
      const title = positionData[0];
      const candidateCount = Number(positionData[1]);
      console.log(`Position ${position.positionIndex}: Title="${title}", Loading ${candidateCount} candidates`);
      
      if (candidateCount === 0) {
        setCandidates([]);
        return;
      }
      
      setIsLoadingCandidates(true);
      try {
        // Create candidate indices for rendering
        const candidatesData = Array.from({ length: candidateCount }, (_, i) => ({
          positionIndex: position.positionIndex,
          candidateIndex: i,
        }));
        console.log(`Position ${position.positionIndex}: Set ${candidatesData.length} candidate indices`);
        setCandidates(candidatesData);
      } catch (err) {
        console.error(`Error loading candidates for position ${position.positionIndex}:`, err);
        setCandidates([]);
      } finally {
        setIsLoadingCandidates(false);
      }
    };

    loadCandidates();
  }, [positionData, position.positionIndex, refetchTrigger]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-gray-900">{positionData?.[0] || position.title}</h4>
          <span className="text-sm text-gray-600">
            {positionData?.[1] !== undefined
              ? Number(positionData[1]).toString()
              : "0"} candidates
          </span>
        </div>
      </CardHeader>
      <CardBody>
        {candidates.length === 0 ? (
          <p className="text-sm text-gray-600 text-center py-4">No candidates added yet</p>
        ) : (
          <div className="space-y-2">
            {candidates.map((candidate) => (
              <CandidateRow
                key={`${candidate.positionIndex}-${candidate.candidateIndex}`}
                electionAddress={electionAddress}
                positionIndex={candidate.positionIndex}
                candidateIndex={candidate.candidateIndex}
                refetchTrigger={refetchTrigger}
              />
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  );
}
// Component to fetch and display a single candidate
function CandidateRow({
  electionAddress,
  positionIndex,
  candidateIndex,
  refetchTrigger,
}: {
  electionAddress: Address;
  positionIndex: number;
  candidateIndex: number;
  refetchTrigger: number;
}) {
  const { data: candidateData, refetch } = useReadContract({
    address: electionAddress,
    abi: electionAbi,
    functionName: "getCandidate",
    args: [BigInt(positionIndex), BigInt(candidateIndex)],
    query: {
      gcTime: 0,
      staleTime: 0,
    },
  });

  // Refetch when trigger changes
  useEffect(() => {
    if (refetchTrigger > 0) {
      console.log(`🔄 Refetching candidate ${positionIndex}-${candidateIndex} (trigger: ${refetchTrigger})`);
      refetch();
    }
  }, [refetchTrigger, refetch, positionIndex, candidateIndex]);

  const name = candidateData?.[0] || "Unknown";
  const wallet = candidateData?.[1] || "0x0000000000000000000000000000000000000000";
  const votes = candidateData?.[2] || 0n;

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div>
        <p className="font-medium text-gray-900">{name}</p>
        <p className="text-sm text-gray-600 font-mono">{shortenAddress(wallet as Address)}</p>
      </div>
      <span className="text-sm text-gray-600">{votes.toString()} votes</span>
    </div>
  );
}