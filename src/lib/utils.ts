import { ElectionStatus } from "@/types/election";
import { formatDistanceToNow, isPast } from "date-fns";

export function shortenAddress(address: string, chars = 4): string {
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

export function getStatusBadgeColor(status: ElectionStatus): string {
  switch (status) {
    case ElectionStatus.Draft:
      return "bg-gray-100 text-gray-800";
    case ElectionStatus.Active:
      return "bg-green-100 text-green-800";
    case ElectionStatus.Ended:
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export function getStatusText(status: ElectionStatus): string {
  switch (status) {
    case ElectionStatus.Draft:
      return "Draft";
    case ElectionStatus.Active:
      return "Active";
    case ElectionStatus.Ended:
      return "Ended";
    default:
      return "Unknown";
  }
}

export function formatTimeRemaining(endTime: bigint): string {
  const endDate = new Date(Number(endTime) * 1000);
  
  if (isPast(endDate)) {
    return "Election ended";
  }
  
  return `Ends ${formatDistanceToNow(endDate, { addSuffix: true })}`;
}

export function hasElectionEnded(endTime: bigint): boolean {
  if (endTime === 0n) return false;
  const endDate = new Date(Number(endTime) * 1000);
  return isPast(endDate);
}

export function formatTimestamp(timestamp: bigint): string {
  const date = new Date(Number(timestamp) * 1000);
  return date.toLocaleString();
}

export function isValidEthereumAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

export function parseCSVAddresses(csv: string): string[] {
  return csv
    .split(/[\n,]/)
    .map(addr => addr.trim())
    .filter(addr => isValidEthereumAddress(addr));
}

export function formatEther(wei: bigint, decimals = 4): string {
  const ether = Number(wei) / 1e18;
  return ether.toFixed(decimals);
}
