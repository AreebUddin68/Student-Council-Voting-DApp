"use client";

import { useState, useEffect } from "react";
import { Address } from "viem";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import Papa from "papaparse";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useElection } from "@/hooks/useElection";
import { votersFormSchema, startElectionFormSchema, StartElectionFormInput } from "@/lib/validations";
import { parseCSVAddresses } from "@/lib/utils";
import { ElectionStatus } from "@/types/election";

interface VotersTabProps {
  electionAddress: Address;
}

export default function VotersTab({ electionAddress }: VotersTabProps) {
  const { 
    status, 
    stats,
    whitelistVoters, 
    isWhitelisting, 
    isWhitelistConfirming, 
    isWhitelistSuccess,
    startElection,
    isStarting,
    isStartConfirming,
    isStartSuccess,
    refetchStats,
  } = useElection(electionAddress);

  const [voterAddresses, setVoterAddresses] = useState<string>("");
  const [parsedAddresses, setParsedAddresses] = useState<string[]>([]);

  console.log("VotersTab Debug:", {
    electionAddress,
    status,
    isDraft: status === ElectionStatus.Draft,
    parsedAddresses: parsedAddresses.length,
    stats,
  });

  const {
    register: registerStart,
    handleSubmit: handleSubmitStart,
    formState: { errors: startErrors },
  } = useForm<StartElectionFormInput>({
    resolver: zodResolver(startElectionFormSchema),
    defaultValues: {
      duration: 86400, // 24 hours in seconds
    },
  });

  useEffect(() => {
    if (voterAddresses) {
      const addresses = parseCSVAddresses(voterAddresses);
      setParsedAddresses(addresses);
    } else {
      setParsedAddresses([]);
    }
  }, [voterAddresses]);

  const handleWhitelistVoters = async () => {
    if (parsedAddresses.length === 0) {
      toast.error("Please enter at least one valid address");
      return;
    }

    console.log("Whitelisting addresses:", parsedAddresses);

    try {
      await whitelistVoters(parsedAddresses as Address[]);
      toast.success("Transaction submitted! Whitelisting voters...");
    } catch (err: any) {
      console.error("Whitelist error:", err);
      const errorMessage = err?.message || err?.shortMessage || "Failed to whitelist voters";
      toast.error(errorMessage);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      complete: (results) => {
        const addresses = results.data
          .flat()
          .filter((item) => typeof item === "string" && item.trim())
          .join("\n");
        setVoterAddresses(addresses);
      },
      error: (error) => {
        toast.error("Failed to parse CSV file");
        console.error(error);
      },
    });
  };

  const onStartElection = async (data: StartElectionFormInput) => {
    try {
      await startElection(data.duration);
      toast.success("Transaction submitted! Starting election...");
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Failed to start election");
    }
  };

  useEffect(() => {
    if (isWhitelistSuccess) {
      console.log("✅ Whitelist transaction successful! Refreshing data...");
      setVoterAddresses("");
      setParsedAddresses([]);
      toast.success("Voters whitelisted successfully!");
      
      // Refetch multiple times with increasing delays to ensure data updates
      refetchStats();
      setTimeout(() => {
        console.log("🔄 Refetch attempt 1...");
        refetchStats();
      }, 500);
      setTimeout(() => {
        console.log("🔄 Refetch attempt 2...");
        refetchStats();
      }, 1500);
      setTimeout(() => {
        console.log("🔄 Refetch attempt 3...");
        refetchStats();
      }, 2500);
    }
  }, [isWhitelistSuccess, refetchStats]);

  useEffect(() => {
    if (isStartSuccess) {
      console.log("✅ Election started successfully! Refreshing data...");
      toast.success("Election started successfully!");
      
      // Refetch multiple times with increasing delays to ensure status updates
      refetchStats();
      setTimeout(() => {
        console.log("🔄 Refetch attempt 1...");
        refetchStats();
      }, 500);
      setTimeout(() => {
        console.log("🔄 Refetch attempt 2...");
        refetchStats();
      }, 1500);
      setTimeout(() => {
        console.log("🔄 Refetch attempt 3...");
        refetchStats();
      }, 2500);
    }
  }, [isStartSuccess, refetchStats]);

  const isDraft = status === ElectionStatus.Draft;
  const isActive = status === ElectionStatus.Active;

  return (
    <div className="space-y-6">
      {/* Whitelist Voters */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900">Whitelist Voters</h3>
          <p className="text-sm text-gray-600 mt-1">
            Add wallet addresses of eligible voters. One address per line or comma-separated.
          </p>
        </CardHeader>
        <CardBody className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload CSV File (Optional)
            </label>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
              disabled={!isDraft}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Or Paste Addresses
            </label>
            <textarea
              value={voterAddresses}
              onChange={(e) => setVoterAddresses(e.target.value)}
              placeholder="0x1234...&#10;0x5678...&#10;or comma-separated"
              rows={8}
              className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-mono"
              disabled={!isDraft}
            />
            {parsedAddresses.length > 0 && (
              <p className="text-sm text-green-600 mt-2">
                ✓ {parsedAddresses.length} valid address(es) detected
              </p>
            )}
          </div>

          <Button
            onClick={handleWhitelistVoters}
            className="w-full"
            isLoading={isWhitelisting || isWhitelistConfirming}
            disabled={!isDraft || parsedAddresses.length === 0}
          >
            {!isDraft 
              ? "Cannot whitelist - Election already started" 
              : `Whitelist ${parsedAddresses.length} Voter(s)`
            }
          </Button>

          {!isDraft && (
            <p className="text-sm text-amber-600 mt-2">
              ⚠️ Voters can only be whitelisted when election is in Draft status
            </p>
          )}
        </CardBody>
      </Card>

      {/* Voter Stats */}
      {stats && stats.totalVoters > 0n && (
        <Card>
          <CardBody>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Voter Statistics</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Whitelisted Voters</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalVoters.toString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Votes Cast</p>
                <p className="text-2xl font-bold text-primary-600">{stats.votedCount.toString()}</p>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Start Election */}
      {isDraft && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">Start Election</h3>
            <p className="text-sm text-gray-600 mt-1">
              Set the election duration and start voting
            </p>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleSubmitStart(onStartElection)} className="space-y-4">
              <Input
                label="Duration (seconds)"
                type="number"
                placeholder="86400"
                helperText="Example: 3600 sec = 1 hour, 86400 sec = 24 hours"
                error={startErrors.duration?.message}
                {...registerStart("duration", { valueAsNumber: true })}
              />

              <Button
                type="submit"
                className="w-full"
                isLoading={isStarting || isStartConfirming}
                disabled={!stats || stats.totalVoters === 0n}
              >
                Start Election
              </Button>

              {stats && stats.totalVoters > 0n ? (
                <p className="text-sm text-green-600">
                  ✓ {stats.totalVoters.toString()} voter(s) whitelisted. Ready to start!
                </p>
              ) : stats && stats.totalVoters === 0n ? (
                <p className="text-sm text-amber-600">
                  ⚠️ Please whitelist voters before starting the election
                </p>
              ) : null}
            </form>
          </CardBody>
        </Card>
      )}

      {isActive && (
        <Card>
          <CardBody className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Election is Active</h3>
            <p className="text-gray-600">Voters can now cast their votes</p>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
