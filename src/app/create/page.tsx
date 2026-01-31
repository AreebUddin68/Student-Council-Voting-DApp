"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { Address, parseEther } from "viem";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useVotingFactory } from "@/hooks/useVotingFactory";
import toast from "react-hot-toast";

export default function CreateElectionPage() {
  const router = useRouter();
  const { isConnected } = useAccount();
  const {
    creationFee,
    createElection,
    isPending,
    isConfirming,
    isSuccess,
  } = useVotingFactory();

  const [title, setTitle] = useState("");
  const [positions, setPositions] = useState<string[]>([""]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addPosition = () => {
    setPositions([...positions, ""]);
  };

  const removePosition = (index: number) => {
    if (positions.length > 1) {
      setPositions(positions.filter((_, i) => i !== index));
    }
  };

  const updatePosition = (index: number, value: string) => {
    const newPositions = [...positions];
    newPositions[index] = value;
    setPositions(newPositions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Please enter an election title");
      return;
    }

    const validPositions = positions.filter((p) => p.trim() !== "");
    if (validPositions.length === 0) {
      toast.error("Please add at least one position");
      return;
    }

    setIsSubmitting(true);
    try {
      await createElection(title.trim(), validPositions);
      toast.success("Election created successfully!");
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Failed to create election:", error);
      toast.error(error.message || "Failed to create election");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card>
          <CardBody className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Connect Your Wallet
            </h2>
            <p className="text-gray-600">
              Please connect your wallet to create an election
            </p>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <h1 className="text-3xl font-bold text-gray-900">
            Create New Election
          </h1>
          <p className="text-gray-600 mt-2">
            Creation Fee: {creationFee} ETH
          </p>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Election Title *
              </label>
              <Input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Student Council 2024"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Positions *
              </label>
              <div className="space-y-3">
                {positions.map((position, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      type="text"
                      value={position}
                      onChange={(e) => updatePosition(index, e.target.value)}
                      placeholder={`Position ${index + 1} (e.g., President)`}
                      className="flex-1"
                    />
                    {positions.length > 1 && (
                      <Button
                        type="button"
                        onClick={() => removePosition(index)}
                        variant="danger"
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              <Button
                type="button"
                onClick={addPosition}
                variant="secondary"
                className="mt-3"
              >
                + Add Position
              </Button>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">Summary</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Title: {title || "(not set)"}</li>
                <li>
                  • Positions:{" "}
                  {positions.filter((p) => p.trim()).length || 0}
                </li>
                <li>• Creation Fee: {creationFee} ETH</li>
              </ul>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting || isPending || isConfirming}
              className="w-full"
            >
              {isSubmitting || isPending || isConfirming ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span className="ml-2">
                    {isPending && "Waiting for approval..."}
                    {isConfirming && "Creating election..."}
                  </span>
                </>
              ) : (
                "Create Election"
              )}
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
