import { get } from "./api";

export interface PhaseClaimStatus {
  claimed: boolean;
  status: string;
  claimableAmount: string;
  canClaim: boolean;
}

export interface ClaimStatus {
  phase1: PhaseClaimStatus;
  phase2: PhaseClaimStatus;
}

export interface AirdropEligibleResponse {
  success: boolean;
  eligible: boolean;
  address: string;
  message: string;
  amount: number;
}

export interface AirdropClaimStatusResponse {
  success: boolean;
  eligible: boolean;
  address: string;
  amount: string;
  claimStatus: ClaimStatus;
  message: string;
}

export interface AirdropProofResponse {
  success: boolean;
  address: string;
  amount: string;
  proof: string[];
  merkleRoot: string;
  message: string;
}

export interface AirdropRootResponse {
  success: boolean;
  merkleRoot: string;
  message: string;
}

export const airdropService = {
  /**
   * Get airdrop eligible status
   * GET /api/airdrop/eligible
   */
  getAirdropEligible: async () => {
    return get<AirdropEligibleResponse>("/api/airdrop/eligible");
  },

  /**
   * Get airdrop claim status with phases
   * GET /api/airdrop/claim-status
   */
  getAirdropClaimStatus: async () => {
    return get<AirdropClaimStatusResponse>("/api/airdrop/claim-status");
  },

  /**
   * Get airdrop proof
   * GET /api/airdrop/proof
   */
  getAirdropProof: async () => {
    return get<AirdropProofResponse>("/api/airdrop/proof");
  },

  /**
   * Get airdrop root
   * GET /api/airdrop/root
   */
  getAirdropRoot: async () => {
    return get<AirdropRootResponse>("/api/airdrop/root");
  },
};
