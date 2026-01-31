"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Address } from "viem";
import { useReadContract } from "wagmi";
import { electionAbi } from "@/contracts/abis/election";
import { PositionWithCandidates } from "@/types/election";

interface PositionSelectProps {
  electionAddress: Address;
  positions: PositionWithCandidates[];
  selectedPosition: number | null;
  onSelect: (posIndex: number, title: string, candidates: Array<{name: string, address: string}>) => void;
}

export function PositionSelect({
  electionAddress,
  positions,
  selectedPosition,
  onSelect,
}: PositionSelectProps) {
  const [positionTitles, setPositionTitles] = useState<{[key: number]: string}>({});

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const posIndex = Number(e.target.value);
    const title = positionTitles[posIndex] || `Position ${posIndex + 1}`;
    onSelect(posIndex, title, []);
  };

  return (
    <select
      value={selectedPosition ?? ""}
      onChange={handleChange}
      className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
    >
      <option value="">-- Select Position --</option>
      {positions.map((position) => (
        <PositionOption
          key={position.positionIndex}
          electionAddress={electionAddress}
          positionIndex={position.positionIndex}
          onTitleLoad={(title) => {
            setPositionTitles(prev => {
              if (prev[position.positionIndex] === title) return prev;
              return { ...prev, [position.positionIndex]: title };
            });
          }}
        />
      ))}
    </select>
  );
}

function PositionOption({
  electionAddress,
  positionIndex,
  onTitleLoad,
}: {
  electionAddress: Address;
  positionIndex: number;
  onTitleLoad: (title: string) => void;
}) {
  const loadedRef = useRef(false);
  
  const { data: positionData } = useReadContract({
    address: electionAddress,
    abi: electionAbi,
    functionName: "getPosition",
    args: [BigInt(positionIndex)],
  });

  const title = positionData?.[0] as string || `Position ${positionIndex + 1}`;

  useEffect(() => {
    if (positionData?.[0] && !loadedRef.current) {
      loadedRef.current = true;
      onTitleLoad(positionData[0] as string);
    }
  }, [positionData, onTitleLoad]);

  return (
    <option value={positionIndex}>
      {title}
    </option>
  );
}
