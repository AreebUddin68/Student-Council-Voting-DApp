export const votingFactoryAbi = [
  {
    inputs: [
      { internalType: "string", name: "title", type: "string" },
      { internalType: "string[]", name: "positions", type: "string[]" },
    ],
    name: "createElection",
    outputs: [{ internalType: "address", name: "electionAddress", type: "address" }],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [],
    name: "getAllElections",
    outputs: [
      {
        components: [
          { internalType: "address", name: "electionAddress", type: "address" },
          { internalType: "address", name: "organizer", type: "address" },
          { internalType: "string", name: "title", type: "string" },
          { internalType: "uint256", name: "createdAt", type: "uint256" },
        ],
        internalType: "struct VotingFactory.ElectionRecord[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "organizer", type: "address" }],
    name: "getElectionsByOrganizer",
    outputs: [{ internalType: "address[]", name: "", type: "address[]" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getTotalElections",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "offset", type: "uint256" },
      { internalType: "uint256", name: "limit", type: "uint256" },
    ],
    name: "getElectionsPaginated",
    outputs: [
      {
        components: [
          { internalType: "address", name: "electionAddress", type: "address" },
          { internalType: "address", name: "organizer", type: "address" },
          { internalType: "string", name: "title", type: "string" },
          { internalType: "uint256", name: "createdAt", type: "uint256" },
        ],
        internalType: "struct VotingFactory.ElectionRecord[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "creationFee",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "treasury",
    outputs: [{ internalType: "address payable", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "newFee", type: "uint256" }],
    name: "setCreationFee",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address payable", name: "newTreasury", type: "address" }],
    name: "setTreasury",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "electionAddress", type: "address" },
      { indexed: true, internalType: "address", name: "organizer", type: "address" },
      { indexed: false, internalType: "string", name: "title", type: "string" },
    ],
    name: "ElectionCreated",
    type: "event",
  },
] as const;
