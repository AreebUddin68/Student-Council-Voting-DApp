"use client";

import { useCallback, useEffect, useState } from "react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { Address, formatEther } from "viem";
import toast from "react-hot-toast";
import { votingFactoryAbi } from "@/contracts/abis/votingFactory";
import { VOTING_FACTORY_ADDRESS } from "@/contracts/addresses";

const VOTING_FACTORY_ABI = votingFactoryAbi;
const FACTORY_ADDRESS = VOTING_FACTORY_ADDRESS;

export function useVotingFactory() {
  const { address: userAddress, isConnected } = useAccount();
  const [organizerElections, setOrganizerElections] = useState<Address[]>([]);
  const [allElections, setAllElections] = useState<Address[]>([]);

  // Read creation fee
  const { data: creationFee } = useReadContract({
    address: FACTORY_ADDRESS,
    abi: VOTING_FACTORY_ABI,
    functionName: "creationFee",
  });

  // Read all elections - with retry logic
  const { data: allElectionsData, refetch: refetchAllElectionsData, error: allElectionsError } =
    useReadContract({
      address: FACTORY_ADDRESS,
      abi: VOTING_FACTORY_ABI,
      functionName: "getAllElections",
      query: { 
        enabled: isConnected,
        retry: 3,
        retryDelay: 1000,
      },
    });

  // Read organizer elections - with retry logic
  const { data: organizerElectionsData, refetch: refetchOrganizerElectionsData, error: organizerElectionsError } =
    useReadContract({
      address: FACTORY_ADDRESS,
      abi: VOTING_FACTORY_ABI,
      functionName: "getElectionsByOrganizer",
      args: userAddress ? [userAddress] : undefined,
      query: { 
        enabled: !!userAddress,
        retry: 3,
        retryDelay: 1000,
      },
    });

  // Show error toast if RPC fails
  useEffect(() => {
    if (allElectionsError) {
      console.error("Failed to fetch elections:", allElectionsError);
      toast.error("Failed to connect to Sepolia network. Please check your connection.");
    }
  }, [allElectionsError]);

  useEffect(() => {
    if (organizerElectionsError) {
      console.error("Failed to fetch organizer elections:", organizerElectionsError);
    }
  }, [organizerElectionsError]);

  // Write contract for creating election
  const {
    data: txHash,
    isPending,
    writeContractAsync,
  } = useWriteContract();

  // Wait for transaction
  const { isLoading: isConfirming, isSuccess } =
    useWaitForTransactionReceipt({ hash: txHash });

  // Update state when data changes - FIXED: Extract addresses from ElectionRecord[]
  useEffect(() => {
    if (allElectionsData) {
      // getAllElections returns ElectionRecord[], extract addresses
      const records = allElectionsData as Array<{
        electionAddress: Address;
        organizer: Address;
        title: string;
        createdAt: bigint;
      }>;
      const addresses = records.map(record => record.electionAddress);
      setAllElections(addresses);
    }
  }, [allElectionsData]);

  useEffect(() => {
    if (organizerElectionsData) {
      setOrganizerElections(organizerElectionsData as Address[]);
    }
  }, [organizerElectionsData]);

  const [error, setError] = useState<string | null>(null);

  const createElection = useCallback(
    async (title: string, positions: string[]) => {
      try {
        setError(null);
        const fee = (creationFee as bigint) || 0n; // FIXED: Cast to bigint
        const hash = await writeContractAsync({
          address: FACTORY_ADDRESS,
          abi: VOTING_FACTORY_ABI,
          functionName: "createElection",
          args: [title, positions],
          value: fee,
        });
        return hash;
      } catch (err: any) {
        const errorMsg = err?.message || err?.reason || "Failed to create election";
        setError(errorMsg);
        toast.error(errorMsg);
        throw err;
      }
    },
    [creationFee, writeContractAsync]
  );

  const refetchOrganizerElections = useCallback(() => {
    refetchOrganizerElectionsData();
  }, [refetchOrganizerElectionsData]);

  const refetchAllElectionsCallback = useCallback(() => {
    refetchAllElectionsData();
  }, [refetchAllElectionsData]);

  return {
    creationFee: creationFee ? Number(formatEther(creationFee as bigint)) : 0, // FIXED: Cast to bigint
    createElection,
    isPending,
    isConfirming,
    isSuccess,
    error,
    organizerElections,
    isOrganizerElectionsLoading: !organizerElectionsData,
    allElections,
    isAllElectionsLoading: !allElectionsData,
    refetchOrganizerElections,
    refetchAllElections: refetchAllElectionsCallback,
  };
}
