import { Address } from "viem";

export enum ElectionStatus {
  Draft = 0,
  Active = 1,
  Ended = 2,
}

export type Position = {
  title: string;
  candidateCount: bigint;
};

export type Candidate = {
  name: string;
  candidateAddress: Address;
  voteCount: bigint;
};

export type ElectionStats = {
  totalVoters: bigint;
  votedCount: bigint;
  startTime: bigint;
  endTime: bigint;
};

export type ElectionData = {
  address: Address;
  title: string;
  status: ElectionStatus;
  organizer: Address;
  positionsCount: bigint;
  stats: ElectionStats;
};

export type CandidateWithPosition = Candidate & {
  positionIndex: number;
  candidateIndex: number;
};

export type PositionWithCandidates = Position & {
  positionIndex: number;
  candidates: CandidateWithPosition[];
};

export type VoteSelection = {
  [positionIndex: number]: number; // positionIndex -> candidateIndex
};

export type ElectionFormData = {
  title: string;
  positions: string[];
};

export type CandidateFormData = {
  name: string;
  address: string;
};
