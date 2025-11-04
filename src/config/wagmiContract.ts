export const wagmiContractConfig = {
  address: import.meta.env.VITE_CONTRACT_ADDRESS as `0x${string}`,
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
