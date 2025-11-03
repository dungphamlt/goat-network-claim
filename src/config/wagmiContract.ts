export const wagmiContractConfig = {
  address: "0x98a3b17ebea809a035dc15678fef6ae96f302637",
  abi: [
    {
      type: "function",
      name: "startTime",
      stateMutability: "view",
      inputs: [],
      outputs: [{ name: "", type: "uint256" }],
    },
    {
      type: "function",
      name: "claim",
      stateMutability: "nonpayable",
      inputs: [
        { name: "amount", type: "uint256" },
        { name: "merkleProof", type: "bytes32[]" },
      ],
      outputs: [{ name: "", type: "bool" }],
    },
  ],
} as const;
