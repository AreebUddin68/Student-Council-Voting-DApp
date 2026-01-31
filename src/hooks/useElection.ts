import { useCallback, useEffect, useState } from "react";
import {
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  useAccount,
} from "wagmi";
import { Address, parseAbi, formatEther } from "viem";
import toast from "react-hot-toast";
import {
  ElectionStatus,
  ElectionData,
  ElectionStats,
  Position,
  Candidate,
  CandidateWithPosition,
  PositionWithCandidates,
} from "@/types/election";

// Election Contract ABI - Fixed to match deployed contract
const ELECTION_ABI = parseAbi([
  "function electionTitle() public view returns (string)",
  "function owner() public view returns (address)",
  "function electionStatus() public view returns (uint8)",
  "function getPositionsCount() external view returns (uint256)",
  "function getPosition(uint256 index) external view returns (string memory title, uint256 candidateCount)",
  "function getCandidate(uint256 posIndex, uint256 candIndex) external view returns (string memory name, address wallet, uint256 votes)",
  "function whitelisted(address) public view returns (bool)",
  "function hasVoted(address) public view returns (bool)",
  "function getElectionStats() external view returns (uint256, uint256, uint256, uint256)",
  "function addCandidate(uint256 positionIndex, string calldata name, address wallet) external",
  "function whitelistVoters(address[] calldata voters) external",
  "function startElection(uint256 durationSeconds) external",
  "function vote(uint256[] calldata candidateIndexes) external",
  "function finalizeElection() external",
  "function paused() public view returns (bool)",
]);

export function useElection(electionAddress: Address) {
  const { address: userAddress } = useAccount();
  const [title, setTitle] = useState<string>("");
  const [status, setStatus] = useState<ElectionStatus>(ElectionStatus.Draft);
  const [organizer, setOrganizer] = useState<Address | null>(null);
  const [positionsCount, setPositionsCount] = useState<bigint>(0n);
  const [stats, setStats] = useState<ElectionStats>({
    totalVoters: 0n,
    votedCount: 0n,
    startTime: 0n,
    endTime: 0n,
  });

  // Read title
  const { data: titleData, isLoading: titleLoading } = useReadContract({
    address: electionAddress,
    abi: ELECTION_ABI,
    functionName: "electionTitle",
    query: { enabled: !!electionAddress },
  });

  // Read organizer (owner)
  const { data: organizerData, isLoading: organizerLoading } =
    useReadContract({
      address: electionAddress,
      abi: ELECTION_ABI,
      functionName: "owner",
      query: { enabled: !!electionAddress },
    });

  // Read status
  const { data: statusData, isLoading: statusLoading } = useReadContract({
    address: electionAddress,
    abi: ELECTION_ABI,
    functionName: "electionStatus",
    query: { enabled: !!electionAddress },
  });

  // Read position count
  const { data: positionCountData, isLoading: positionCountLoading } =
    useReadContract({
      address: electionAddress,
      abi: ELECTION_ABI,
      functionName: "getPositionsCount",
      query: { enabled: !!electionAddress },
    });

  // Read election stats
  const { data: statsData, isLoading: statsLoading } = useReadContract({
    address: electionAddress,
    abi: ELECTION_ABI,
    functionName: "getElectionStats",
    query: { enabled: !!electionAddress },
  });

  // Read if user is whitelisted voter
  const { data: isWhitelistedData } = useReadContract({
    address: electionAddress,
    abi: ELECTION_ABI,
    functionName: "whitelisted",
    args: userAddress ? [userAddress] : undefined,
    query: { enabled: !!userAddress && !!electionAddress },
  });

  // Read if user has already voted
  const { data: hasVotedData } = useReadContract({
    address: electionAddress,
    abi: ELECTION_ABI,
    functionName: "hasVoted",
    args: userAddress ? [userAddress] : undefined,
    query: { enabled: !!userAddress && !!electionAddress },
  });

  // Write contract for voting
  const { data: voteHash, isPending: voteIsPending, writeContractAsync } =
    useWriteContract();

  // Wait for vote transaction
  const { isLoading: voteIsConfirming, isSuccess: voteIsSuccess } =
    useWaitForTransactionReceipt({ hash: voteHash });

  // Write contract for adding candidates
  const {
    data: addCandidateHash,
    isPending: addCandidateIsPending,
    writeContractAsync: writeAddCandidate,
  } = useWriteContract();

  // Wait for add candidate transaction
  const { isLoading: addCandidateIsConfirming, isSuccess: addCandidateIsSuccess } =
    useWaitForTransactionReceipt({ hash: addCandidateHash });

  // Write contract for adding voters
  const {
    data: addVotersHash,
    isPending: addVotersIsPending,
    writeContractAsync: writeAddVoters,
  } = useWriteContract();

  // Wait for add voters transaction
  const { isLoading: addVotersIsConfirming, isSuccess: addVotersIsSuccess } =
    useWaitForTransactionReceipt({ hash: addVotersHash });

  // Write contract for starting election
  const {
    data: startElectionHash,
    isPending: startElectionIsPending,
    writeContractAsync: writeStartElection,
  } = useWriteContract();

  // Wait for start election transaction
  const {
    isLoading: startElectionIsConfirming,
    isSuccess: startElectionIsSuccess,
  } = useWaitForTransactionReceipt({ hash: startElectionHash });

  // Write contract for finalizing election
  const {
    data: finalizeHash,
    isPending: finalizeIsPending,
    writeContractAsync: writeFinalizeElection,
  } = useWriteContract();

  // Wait for finalize transaction
  const { isLoading: finalizeIsConfirming, isSuccess: finalizeIsSuccess } =
    useWaitForTransactionReceipt({ hash: finalizeHash });

  // Update state when data changes
  useEffect(() => {
    if (titleData) setTitle(titleData as string);
  }, [titleData]);

  useEffect(() => {
    if (organizerData) setOrganizer(organizerData as Address);
  }, [organizerData]);

  useEffect(() => {
    if (statusData !== undefined) {
      setStatus(Number(statusData) as ElectionStatus);
    }
  }, [statusData]);

  useEffect(() => {
    if (positionCountData !== undefined) {
      setPositionsCount(positionCountData as bigint);
    }
  }, [positionCountData]);

  useEffect(() => {
    if (statsData) {
      const [totalVoters, votedCount, startTime, endTime] = statsData as [
        bigint,
        bigint,
        bigint,
        bigint,
      ];
      setStats({ totalVoters, votedCount, startTime, endTime });
    }
  }, [statsData]);

  const isLoading =
    titleLoading ||
    organizerLoading ||
    statusLoading ||
    positionCountLoading ||
    statsLoading;

  const isOrganizer = organizer && userAddress && organizer.toLowerCase() === userAddress.toLowerCase();
  const isWhitelisted = isWhitelistedData || false;
  const hasVoted = hasVotedData || false;

  // Vote function
  const vote = useCallback(
    async (choices: number[]) => {
      try {
        const hash = await writeContractAsync({
          address: electionAddress,
          abi: ELECTION_ABI,
          functionName: "vote",
          args: [choices.map(c => BigInt(c))],
        });
        toast.success("Vote submitted successfully!");
        return hash;
      } catch (err: any) {
        const errorMsg = err?.message || err?.reason || "Failed to vote";
        toast.error(errorMsg);
        throw err;
      }
    },
    [writeContractAsync, electionAddress]
  );

  // Add candidate function
  const addCandidate = useCallback(
    async (positionIndex: number, name: string, candidateAddress: Address) => {
      try {
        const hash = await writeAddCandidate({
          address: electionAddress,
          abi: ELECTION_ABI,
          functionName: "addCandidate",
          args: [BigInt(positionIndex), name, candidateAddress],
        });
        toast.success("Candidate added successfully!");
        return hash;
      } catch (err: any) {
        const errorMsg = err?.message || err?.reason || "Failed to add candidate";
        toast.error(errorMsg);
        throw err;
      }
    },
    [writeAddCandidate, electionAddress]
  );

  // Add voters function
  const addVoters = useCallback(
    async (voterAddresses: Address[]) => {
      try {
        const hash = await writeAddVoters({
          address: electionAddress,
          abi: ELECTION_ABI,
          functionName: "whitelistVoters",
          args: [voterAddresses],
        });
        toast.success("Voters added successfully!");
        return hash;
      } catch (err: any) {
        const errorMsg = err?.message || err?.reason || "Failed to add voters";
        toast.error(errorMsg);
        throw err;
      }
    },
    [writeAddVoters, electionAddress]
  );

  // Start election function
  const startElection = useCallback(
    async (durationInMinutes: number) => {
      try {
        // Convert minutes to seconds for the contract
        const durationInSeconds = durationInMinutes * 60;
        const hash = await writeStartElection({
          address: electionAddress,
          abi: ELECTION_ABI,
          functionName: "startElection",
          args: [BigInt(durationInSeconds)],
        });
        toast.success("Election started successfully!");
        return hash;
      } catch (err: any) {
        const errorMsg = err?.message || err?.reason || "Failed to start election";
        toast.error(errorMsg);
        throw err;
      }
    },
    [writeStartElection, electionAddress]
  );

  // Finalize election function
  const finalizeElection = useCallback(async () => {
    try {
      const hash = await writeFinalizeElection({
        address: electionAddress,
        abi: ELECTION_ABI,
        functionName: "finalizeElection",
        args: [],
      });
      toast.success("Election finalized successfully!");
      return hash;
    } catch (err: any) {
      const errorMsg = err?.message || err?.reason || "Failed to finalize election";
      toast.error(errorMsg);
      throw err;
    }
  }, [writeFinalizeElection, electionAddress]);

  // Refetch status
  const [refetchKey, setRefetchKey] = useState(0);

  const refetchStatus = useCallback(() => {
    setRefetchKey((prev) => prev + 1);
  }, []);

  return {
    title,
    status,
    organizer,
    positionsCount,
    stats,
    isLoading,
    isOrganizer: !!isOrganizer,
    isWhitelisted,
    hasVoted,
    vote,
    isVoting: voteIsPending,
    voteIsPending,
    isVoteConfirming: voteIsConfirming,
    voteIsConfirming,
    isVoteSuccess: voteIsSuccess,
    voteIsSuccess,
    addCandidate,
    isAddingCandidate: addCandidateIsPending,
    addCandidateIsPending,
    isAddCandidateConfirming: addCandidateIsConfirming,
    addCandidateIsConfirming,
    isAddCandidateSuccess: addCandidateIsSuccess,
    addCandidateIsSuccess,
    addVoters,
    whitelistVoters: addVoters,
    isAddingVoters: addVotersIsPending,
    isWhitelisting: addVotersIsPending,
    addVotersIsPending,
    isAddVotersConfirming: addVotersIsConfirming,
    isWhitelistConfirming: addVotersIsConfirming,
    addVotersIsConfirming,
    isAddVotersSuccess: addVotersIsSuccess,
    isWhitelistSuccess: addVotersIsSuccess,
    addVotersIsSuccess,
    startElection,
    isStarting: startElectionIsPending,
    isStartingElection: startElectionIsPending,
    startElectionIsPending,
    isStartConfirming: startElectionIsConfirming,
    isStartElectionConfirming: startElectionIsConfirming,
    startElectionIsConfirming,
    isStartSuccess: startElectionIsSuccess,
    isStartElectionSuccess: startElectionIsSuccess,
    startElectionIsSuccess,
    finalizeElection,
    isFinalizing: finalizeIsPending,
    isFinalizingElection: finalizeIsPending,
    finalizeIsPending: finalizeIsPending,
    isFinalizeConfirming: finalizeIsConfirming,
    isFinalizeSuccess: finalizeIsSuccess,
    refetchStatus,
    refetchStats: refetchStatus,
    refetchHasVoted: refetchStatus,
  };
}

// Hook to read position details
export function usePosition(
  electionAddress: Address,
  positionIndex: number
) {
  const { data: positionData, refetch, isLoading } = useReadContract({
    address: electionAddress,
    abi: ELECTION_ABI,
    functionName: "getPosition",
    args: [BigInt(positionIndex)],
    query: { enabled: !!electionAddress },
  });

  // Return raw data from contract [title, candidateCount] and refetch function
  return { position: positionData as readonly [string, bigint] | undefined, refetch, isLoading };
}

// Hook to read candidate details
export function useCandidate(
  electionAddress: Address,
  positionIndex: number,
  candidateIndex: number
) {
  const { data: candidateData } = useReadContract({
    address: electionAddress,
    abi: ELECTION_ABI,
    functionName: "getCandidate",
    args: [BigInt(positionIndex), BigInt(candidateIndex)],
    query: { enabled: !!electionAddress },
  });

  const [candidate, setCandidate] = useState<Candidate | null>(null);

  useEffect(() => {
    if (candidateData) {
      const [name, wallet, voteCount] = candidateData as [string, Address, bigint];
      setCandidate({
        name,
        candidateAddress: wallet,
        voteCount,
      });
    }
  }, [candidateData]);

  return candidate;
}
