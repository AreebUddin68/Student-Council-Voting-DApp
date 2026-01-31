"use client";

import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useBalance } from "wagmi";
import { votingFactoryAbi } from "@/contracts/abis/votingFactory";
import { VOTING_FACTORY_ADDRESS } from "@/contracts/addresses";
import { Address, parseEther } from "viem";
import { useState } from "react";

export function useVotingFactory() {
  const { address } = useAccount();

  // Read user balance
  const { data: balanceData } = useBalance({
    address: address,
  });

  // Read creation fee
  const { data: creationFee, isLoading: isFeeLoading } = useReadContract({
    address: VOTING_FACTORY_ADDRESS,
    abi: votingFactoryAbi,
    functionName: "creationFee",
  });

  // Read all elections
  const { data: allElections, isLoading: isAllElectionsLoading, refetch: refetchAllElections } = useReadContract({
    address: VOTING_FACTORY_ADDRESS,
    abi: votingFactoryAbi,
    functionName: "getAllElections",
  });

  // Read elections by organizer
  const { 
    data: organizerElections, 
    isLoading: isOrganizerElectionsLoading,
    refetch: refetchOrganizerElections 
  } = useReadContract({
    address: VOTING_FACTORY_ADDRESS,
    abi: votingFactoryAbi,
    functionName: "getElectionsByOrganizer",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  // Format the election records
  const formattedAllElections = allElections?.map((record: any) => record.electionAddress as Address) || [];
  const formattedOrganizerElections = organizerElections || [];

  // Write: Create Election
  const { writeContractAsync, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const [newElectionAddress, setNewElectionAddress] = useState<Address | null>(null);

  const createElection = async (title: string, positions: string[]) => {
    setNewElectionAddress(null);
    const value = creationFee || parseEther("0.01");
    
    const txHash = await writeContractAsync({
      address: VOTING_FACTORY_ADDRESS,
      abi: votingFactoryAbi,
      functionName: "createElection",
      args: [title, positions],
      value,
      // Removed fixed gas limit - let wallet estimate
    });

    return txHash;
  };

  return {
    // Read data
    creationFee,
    isFeeLoading,
    allElections: formattedAllElections,
    isAllElectionsLoading,
    organizerElections: formattedOrganizerElections,
    isOrganizerElectionsLoading,
    refetchAllElections,
    refetchOrganizerElections,
    userBalance: balanceData?.value,
    
    // Write functions
    createElection,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
    newElectionAddress,
  };
}
