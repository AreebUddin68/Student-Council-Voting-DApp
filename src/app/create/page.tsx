"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useVotingFactory } from "@/hooks/useVotingFactory";
import { electionFormSchema, ElectionFormInput } from "@/lib/validations";
import { formatEther } from "@/lib/utils";

export default function CreateElectionPage() {
  const router = useRouter();
  const { isConnected, address: userAddress } = useAccount();
  const { 
    creationFee, 
    createElection, 
    isPending, 
    isConfirming, 
    isSuccess, 
    error,
    refetchOrganizerElections,
    userBalance
  } = useVotingFactory();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ElectionFormInput>({
    resolver: zodResolver(electionFormSchema),
    defaultValues: {
      title: "",
      positions: [{ name: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "positions",
  });

  const [createdElectionAddress, setCreatedElectionAddress] = useState<string | null>(null);
  const [displayError, setDisplayError] = useState<string | null>(null);

  const onSubmit = async (data: ElectionFormInput) => {
    if (!isConnected) {
      toast.error("Please connect your wallet");
      return;
    }

    // Check if user has enough balance
    if (userBalance !== undefined && creationFee) {
      const requiredAmount = creationFee + BigInt("5000000000000000"); // 0.01 ETH fee + ~0.005 ETH for gas
      if (userBalance < requiredAmount) {
        const balanceETH = Number(userBalance) / 1e18;
        const requiredETH = Number(requiredAmount) / 1e18;
        toast.error(`Insufficient balance! You have ${balanceETH.toFixed(4)} ETH but need ~${requiredETH.toFixed(4)} ETH (0.01 creation fee + gas)`);
        setDisplayError(`Need ${requiredETH.toFixed(4)} ETH. Get Sepolia ETH from https://sepoliafaucet.com/`);
        return;
      }
    }

    setDisplayError(null); // Clear previous errors

    try {
      // Validate positions are not empty
      const positions = data.positions.map((p) => p.name.trim()).filter(name => name.length > 0);
      
      if (positions.length === 0) {
        toast.error("Please add at least one position");
        return;
      }

      console.log("Creating election with:", {
        title: data.title,
        positions,
        fee: creationFee?.toString()
      });

      const hash = await createElection(data.title, positions);
      toast.success("Transaction submitted! Waiting for confirmation...");
    } catch (err: any) {
      console.error("Create election error:", err);
      
      // Better error message parsing
      let errorMessage = "Failed to create election";
      
      if (err?.message) {
        if (err.message.includes("user rejected")) {
          errorMessage = "Transaction was rejected";
        } else if (err.message.includes("insufficient funds")) {
          errorMessage = "Insufficient funds for transaction";
        } else if (err.message.includes("InsufficientFee")) {
          errorMessage = "Insufficient fee sent. Please try again.";
        } else {
          errorMessage = err.message;
        }
      }
      
      setDisplayError(errorMessage);
      toast.error(errorMessage);
    }
  };

  // Handle successful transaction
  useEffect(() => {
    if (!isSuccess) return;

    toast.success("Election created successfully!");
    
    // Refetch multiple times with delays to ensure data updates
    console.log("🔄 Refetching organizer elections...");
    refetchOrganizerElections();
    
    setTimeout(() => {
      console.log("🔄 Refetch attempt 1 (500ms)...");
      refetchOrganizerElections();
    }, 500);
    
    setTimeout(() => {
      console.log("🔄 Refetch attempt 2 (1000ms)...");
      refetchOrganizerElections();
    }, 1000);
    
    setTimeout(() => {
      console.log("🔄 Refetch attempt 3 (1500ms)...");
      refetchOrganizerElections();
    }, 1500);

    const timeout = setTimeout(() => {
      router.push("/dashboard");
    }, 2000);

    return () => clearTimeout(timeout);
  }, [isSuccess, router, refetchOrganizerElections]);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Election</h1>
          <p className="text-gray-600">
            Set up a new student council election for your organization
          </p>
        </div>

        {/* Balance Warning */}
        {isConnected && userBalance !== undefined && (
          <div className={`mb-6 p-4 rounded-lg border ${
            userBalance < BigInt("15000000000000000") // Less than 0.015 ETH
              ? "bg-yellow-50 border-yellow-200"
              : "bg-green-50 border-green-200"
          }`}>
            <div className="flex items-start gap-3">
              <svg className={`w-5 h-5 mt-0.5 ${
                userBalance < BigInt("15000000000000000") ? "text-yellow-600" : "text-green-600"
              }`} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div className="flex-1">
                <p className={`text-sm font-medium ${
                  userBalance < BigInt("15000000000000000") ? "text-yellow-800" : "text-green-800"
                }`}>
                  Your Balance: {(Number(userBalance) / 1e18).toFixed(4)} SepoliaETH
                </p>
                {userBalance < BigInt("15000000000000000") && (
                  <p className="text-sm text-yellow-700 mt-1">
                    ⚠️ Low balance! You need ~0.015 ETH (0.01 creation fee + gas). 
                    <a 
                      href="https://sepoliafaucet.com/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="font-semibold underline ml-1 hover:text-yellow-900"
                    >
                      Get Sepolia ETH here →
                    </a>
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-900">Election Details</h2>
            {creationFee && (
              <p className="text-sm text-gray-600 mt-2">
                Creation fee: <span className="font-medium">{formatEther(creationFee)} ETH</span>
              </p>
            )}
          </CardHeader>

          {/* Error Alert */}
          {displayError && (
            <div className="p-4 mx-4 mt-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-red-800">Transaction Failed</h3>
                  <p className="text-sm text-red-700 mt-1">{displayError}</p>
                </div>
              </div>
            </div>
          )}

          <CardBody>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Election Title */}
              <Input
                label="Election Title"
                placeholder="e.g., Spring 2025 Student Council Election"
                error={errors.title?.message}
                {...register("title")}
              />

              {/* Positions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Positions
                </label>
                <div className="space-y-3">
                  {fields.map((field, index) => (
                    <div key={field.id} className="flex gap-2">
                      <Input
                        placeholder={`Position ${index + 1} (e.g., President, Vice President)`}
                        error={errors.positions?.[index]?.name?.message}
                        {...register(`positions.${index}.name`)}
                      />
                      {fields.length > 1 && (
                        <Button
                          type="button"
                          variant="danger"
                          onClick={() => remove(index)}
                          className="whitespace-nowrap"
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => append({ name: "" })}
                  className="mt-3"
                >
                  + Add Position
                </Button>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <Button
                  type="submit"
                  className="w-full"
                  isLoading={isPending || isConfirming}
                  disabled={!isConnected || isPending || isConfirming}
                >
                  {!isConnected
                    ? "Connect Wallet to Continue"
                    : isPending
                    ? "Waiting for Approval..."
                    : isConfirming
                    ? "Creating Election..."
                    : "Create Election"}
                </Button>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800">
                    <span className="font-semibold">Error:</span> {error.message || "Transaction failed"}
                  </p>
                </div>
              )}

              {isSuccess && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800">
                    Election created successfully! Redirecting to dashboard...
                  </p>
                </div>
              )}
            </form>
          </CardBody>
        </Card>

        {/* Info Card */}
        <Card className="mt-6">
          <CardBody>
            <h3 className="font-semibold text-gray-900 mb-2">Next Steps</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
              <li>Add candidates for each position</li>
              <li>Whitelist voter addresses</li>
              <li>Set election duration and start the election</li>
              <li>Students cast their votes</li>
              <li>View and publish results</li>
            </ol>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
