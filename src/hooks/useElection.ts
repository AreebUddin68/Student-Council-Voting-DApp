"use client";

import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { electionAbi } from "@/contracts/abis/election";
import { Address } from "viem";
import { ElectionStatus, Position, Candidate, ElectionStats } from "@/types/election";

export function useElection(electionAddress: Address) {
  const { address: userAddress } = useAccount();

  // Read: Election Title
  const { data: title, isLoading: isTitleLoading } = useReadContract({
    address: electionAddress,
    abi: electionAbi,
    functionName: "electionTitle",
  });

  // Read: Election Status
  const { data: status, isLoading: isStatusLoading, refetch: refetchStatus } = useReadContract({
    address: electionAddress,
    abi: electionAbi,
    functionName: "electionStatus",
  });

  // Read: Owner (organizer)
  const { data: organizer, isLoading: isOrganizerLoading } = useReadContract({
    address: electionAddress,
    abi: electionAbi,
    functionName: "owner",
  });

  // Read: Positions Count
  const { data: positionsCount, isLoading: isPositionsCountLoading } = useReadContract({
    address: electionAddress,
    abi: electionAbi,
    functionName: "getPositionsCount",
  });

  // Read: Election Stats
  const { data: statsData, isLoading: isStatsLoading, refetch: refetchStats } = useReadContract({
    address: electionAddress,
    abi: electionAbi,
    functionName: "getElectionStats",
  });

  // Read: Has Voted
  const { data: hasVoted, isLoading: isHasVotedLoading, refetch: refetchHasVoted } = useReadContract({
    address: electionAddress,
    abi: electionAbi,
    functionName: "hasVoted",
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!userAddress,
    },
  });

  // Read: Is Whitelisted
  const { data: isWhitelisted, isLoading: isWhitelistedLoading } = useReadContract({
    address: electionAddress,
    abi: electionAbi,
    functionName: "whitelisted",
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!userAddress,
    },
  });

  // Write: Add Candidate
  const { 
    writeContractAsync: writeAddCandidate, 
    data: addCandidateHash, 
    isPending: isAddingCandidate,
    error: addCandidateError 
  } = useWriteContract();
  
  const { isLoading: isAddCandidateConfirming, isSuccess: isAddCandidateSuccess } = 
    useWaitForTransactionReceipt({ hash: addCandidateHash });

  const addCandidate = async (positionIndex: number, name: string, candidateAddress: Address) => {
    console.log("🔧 Hook: addCandidate called with:", {
      positionIndex,
      name,
      candidateAddress,
      electionAddress,
      userAddress,
    });
    
    if (!userAddress) {
      console.error("❌ Hook: No user address - wallet not connected");
      throw new Error("Please connect your wallet");
    }
    
    console.log("🔧 Calling writeAddCandidate (async)...");
    
    const result = await writeAddCandidate({
      address: electionAddress,
      abi: electionAbi,
      functionName: "addCandidate",
      args: [BigInt(positionIndex), name, candidateAddress],
    });
    
    console.log("✅ Hook: writeAddCandidate result (transaction hash):", result);
    return result;
  };

  // Write: Whitelist Voters
  const { 
    writeContractAsync: writeWhitelistVoters, 
    data: whitelistHash, 
    isPending: isWhitelisting,
    error: whitelistError 
  } = useWriteContract();
  
  const { isLoading: isWhitelistConfirming, isSuccess: isWhitelistSuccess } = 
    useWaitForTransactionReceipt({ hash: whitelistHash });

  const whitelistVoters = async (voters: Address[]) => {
    return await writeWhitelistVoters({
      address: electionAddress,
      abi: electionAbi,
      functionName: "whitelistVoters",
      args: [voters],
    });
  };

  // Write: Start Election
  const { 
    writeContractAsync: writeStartElection, 
    data: startHash, 
    isPending: isStarting,
    error: startError 
  } = useWriteContract();
  
  const { isLoading: isStartConfirming, isSuccess: isStartSuccess } = 
    useWaitForTransactionReceipt({ hash: startHash });

  const startElection = async (durationInSeconds: number) => {
    return await writeStartElection({
      address: electionAddress,
      abi: electionAbi,
      functionName: "startElection",
      args: [BigInt(durationInSeconds)],
    });
  };

  // Write: Vote
  const { 
    writeContractAsync: writeVote, 
    data: voteHash, 
    isPending: isVoting,
    error: voteError 
  } = useWriteContract();
  
  const { isLoading: isVoteConfirming, isSuccess: isVoteSuccess } = 
    useWaitForTransactionReceipt({ hash: voteHash });

  const vote = async (candidateIndices: number[]) => {
    return await writeVote({
      address: electionAddress,
      abi: electionAbi,
      functionName: "vote",
      args: [candidateIndices.map(i => BigInt(i))],
    });
  };

  // Write: Finalize Election
  const { 
    writeContractAsync: writeFinalizeElection, 
    data: finalizeHash, 
    isPending: isFinalizing,
    error: finalizeError 
  } = useWriteContract();
  
  const { isLoading: isFinalizeConfirming, isSuccess: isFinalizeSuccess } = 
    useWaitForTransactionReceipt({ hash: finalizeHash });

  const finalizeElection = async () => {
    return await writeFinalizeElection({
      address: electionAddress,
      abi: electionAbi,
      functionName: "finalizeElection",
      gas: 2000000n, // 2 million gas limit for finalization
    });
  };

  // Parse stats
  const stats: ElectionStats | undefined = statsData ? {
    totalVoters: statsData[0],
    votedCount: statsData[1],
    startTime: statsData[2],
    endTime: statsData[3],
  } : undefined;

  // Safe type casting for organizer address
  const organizerAddress = typeof organizer === "string" ? organizer : undefined;
  const isOrganizer = organizerAddress && userAddress && organizerAddress.toLowerCase() === userAddress.toLowerCase();

  return {
    // Read data
    title,
    status: status as ElectionStatus | undefined,
    organizer: organizerAddress as Address | undefined,
    positionsCount,
    stats,
    hasVoted: hasVoted || false,
    isWhitelisted: isWhitelisted || false,
    isOrganizer,
    
    // Loading states
    isLoading: isTitleLoading || isStatusLoading || isOrganizerLoading || 
               isPositionsCountLoading || isStatsLoading,
    
    // Refetch functions
    refetchStatus,
    refetchStats,
    refetchHasVoted,
    
    // Write functions
    addCandidate,
    isAddingCandidate,
    isAddCandidateConfirming,
    isAddCandidateSuccess,
    addCandidateError,
    
    whitelistVoters,
    isWhitelisting,
    isWhitelistConfirming,
    isWhitelistSuccess,
    whitelistError,
    
    startElection,
    isStarting,
    isStartConfirming,
    isStartSuccess,
    startError,
    
    vote,
    isVoting,
    isVoteConfirming,
    isVoteSuccess,
    voteError,
    
    finalizeElection,
    isFinalizing,
    isFinalizeConfirming,
    isFinalizeSuccess,
    finalizeError,
  };
}

// Hook to get a specific position
export function usePosition(electionAddress: Address, positionIndex: number) {
  const { data: position, isLoading, refetch } = useReadContract({
    address: electionAddress,
    abi: electionAbi,
    functionName: "getPosition",
    args: [BigInt(positionIndex)],
    query: {
      // Disable caching to always get fresh data
      gcTime: 0,
      staleTime: 0,
    },
  });

  return {
    position: position as Position | undefined,
    isLoading,
    refetch,
  };
}

// Hook to get a specific candidate
export function useCandidate(
  electionAddress: Address,
  positionIndex: number,
  candidateIndex: number
) {
  const { data: candidate, isLoading, refetch } = useReadContract({
    address: electionAddress,
    abi: electionAbi,
    functionName: "getCandidate",
    args: [BigInt(positionIndex), BigInt(candidateIndex)],
  });

  // Map returned values: [name, wallet, votes]
  const mappedCandidate = candidate
    ? {
        name: candidate[0],
        candidateAddress: candidate[1] as Address, // Type cast to Address
        voteCount: candidate[2],
      }
    : undefined;

  return {
    candidate: mappedCandidate as Candidate | undefined,
    isLoading,
    refetch,
  };
}
