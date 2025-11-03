import { useEffect, useState, useMemo } from "react";
import {
  airdropService,
  type ClaimStatus,
  type PhaseClaimStatus,
} from "../services/airdropService";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  useBalance,
} from "wagmi";
import { wagmiContractConfig } from "../config/wagmiContract";
import { CircleAlert } from "lucide-react";
import { toast } from "react-toastify";
import { format } from "date-fns";

const DEFAULT_CLAIM_STATUS: ClaimStatus = {
  phase1: { claimed: false, status: "", claimableAmount: "", canClaim: false },
  phase2: { claimed: false, status: "", claimableAmount: "", canClaim: false },
};

interface AirdropData {
  eligible: boolean;
  amount: number;
  claimStatus: ClaimStatus;
}

function Content() {
  const { address } = useAccount();
  const [data, setData] = useState<AirdropData>({
    eligible: false,
    amount: 0,
    claimStatus: DEFAULT_CLAIM_STATUS,
  });
  const [loadingAirdropData, setLoadingAirdropData] = useState(false);

  // Lấy startTime từ contract
  const { data: startTime, isLoading: isLoadingStartTime } = useReadContract({
    ...wagmiContractConfig,
    functionName: "startTime",
  });

  const {
    writeContract,
    data: txHash,
    isPending: isPendingWrite,
    error: writeError,
  } = useWriteContract();

  // Theo dõi transaction sau khi submit
  const { isLoading: isWaitingTx, isSuccess: isTxSuccess } =
    useWaitForTransactionReceipt({
      hash: txHash,
    });

  // Kiểm tra số dư BNB Testnet (native token) để trả phí gas
  // BSC Testnet sử dụng BNB Testnet làm native token để trả phí gas
  const { data: balance, isLoading: isLoadingBalance } = useBalance({
    address: address,
  });

  // Kiểm tra nếu có đủ BNB Testnet
  // Tối thiểu 0.0001 BNB để đảm bảo có đủ cho gas fees
  // MetaMask sẽ tự estimate gas khi user approve transaction
  const MIN_BALANCE = BigInt(100000000000000); // 0.0001 BNB = 100000000000000 wei

  const hasEnoughBalance = useMemo(() => {
    if (!balance?.value) return false;
    return balance.value >= MIN_BALANCE;
  }, [balance]);

  const formatAmount = (amount: string) =>
    Number(BigInt(amount) / BigInt(10 ** 18));

  // Tính claim date cho phase 1 và phase 2
  // Giả sử phase 1 = startTime, phase 2 = startTime + 30 days
  const claimDates = useMemo(() => {
    if (!startTime) return { phase1: undefined, phase2: undefined };
    const start = Number(startTime);
    const phase1Date = BigInt(start); // Phase 1 ngay khi start
    const phase2Date = BigInt(start + 30 * 24 * 60 * 60); // Phase 2 sau 30 ngày
    return { phase1: phase1Date, phase2: phase2Date };
  }, [startTime]);

  const getStatusColor = (
    status: string,
    claimed: boolean,
    canClaim: boolean,
    type: "text" | "bg"
  ) => {
    if (status === "claimed" && claimed) {
      return type === "bg" ? "bg-green-500" : "text-green-500";
    }
    if (status === "not_claimed" && canClaim) {
      return type === "bg" ? "bg-[#FFBA57]" : "text-[#FFBA57]";
    }
    if (status === "not_claimed" && !canClaim) {
      return type === "bg" ? "bg-purple-300" : "text-purple-300";
    }
    return type === "bg" ? "bg-gray-400" : "text-gray-400";
  };

  useEffect(() => {
    if (!address) return;
    setLoadingAirdropData(true);
    const fetchData = async () => {
      try {
        const [eligibleRes, statusRes] = await Promise.all([
          airdropService.getAirdropEligible(),
          airdropService.getAirdropClaimStatus(),
        ]);

        setData({
          eligible: eligibleRes.data?.eligible ?? false,
          amount: eligibleRes.data?.amount
            ? formatAmount(eligibleRes.data.amount.toString())
            : 0,
          claimStatus: statusRes.data?.claimStatus ?? DEFAULT_CLAIM_STATUS,
        });
      } catch (error) {
        console.error("Failed to fetch airdrop data:", error);
      } finally {
        setLoadingAirdropData(false);
      }
    };

    fetchData();
  }, [address]);

  const loading = loadingAirdropData || isLoadingStartTime || isLoadingBalance;

  // Skeleton component với shimmer effect
  const Skeleton = ({ className }: { className?: string }) => (
    <div
      className={`animate-shimmer rounded ${className}`}
      style={{
        background:
          "linear-gradient(to right, rgba(253, 232, 0, 0.2), rgba(253, 232, 0, 0.5), rgba(253, 232, 0, 0.2))",
        backgroundSize: "200% 100%",
      }}
    />
  );

  const checkStatus = (status: string, claimed: boolean, canClaim: boolean) => {
    if (status === "claimed" && claimed) {
      return "Claimed Successfully";
    }
    if (status === "not_claimed" && canClaim) {
      return "Ready to claim";
    }
    if (status === "not_claimed" && !canClaim) {
      //   "chưa tới thời gian claim";
      return "Not available to claim";
    }
    return "Not available to claim";
  };

  // Theo dõi khi transaction thành công
  useEffect(() => {
    if (isTxSuccess) {
      toast.success("Claimed successfully!");
      // Refresh data sau khi claim thành công
      if (address) {
        setLoadingAirdropData(true);
        Promise.all([
          airdropService.getAirdropEligible(),
          airdropService.getAirdropClaimStatus(),
        ]).then(([eligibleRes, statusRes]) => {
          setData({
            eligible: eligibleRes.data?.eligible ?? false,
            amount: eligibleRes.data?.amount
              ? formatAmount(eligibleRes.data.amount.toString())
              : 0,
            claimStatus: statusRes.data?.claimStatus ?? DEFAULT_CLAIM_STATUS,
          });
          setLoadingAirdropData(false);
        });
      }
    }
  }, [isTxSuccess, address]);

  // Hiển thị lỗi nếu có
  useEffect(() => {
    if (writeError) {
      toast.error(writeError.message || "Failed to claim airdrop");
    }
  }, [writeError]);

  const handleClaim = async (phase: ClaimStatus) => {
    if (!phase.phase1.canClaim && !phase.phase2.canClaim) {
      return;
    }

    if (!address) {
      toast.error("Please connect your wallet");
      return;
    }

    try {
      // Bước 1: Lấy proof từ API
      const result = await airdropService.getAirdropProof();
      if (!result.success || !result.data?.proof || !result.data?.amount) {
        toast.error("Failed to get airdrop proof");
        return;
      }

      const proof = result.data.proof as readonly `0x${string}`[];
      const amount = BigInt(result.data.amount);

      // Kiểm tra balance trước khi claim
      if (!hasEnoughBalance) {
        const balanceBNB = balance?.value
          ? Number(balance.value) / 10 ** 18
          : 0;
        toast.error(
          `Insufficient BNB Testnet. You have ${balanceBNB.toFixed(6)} BNB. ` +
            `Please get more from the faucet.`
        );
        return;
      }

      // Bước 2: Gọi smart contract với đúng tham số
      // MetaMask sẽ tự động estimate gas khi user approve
      // amount: string -> BigInt cho uint256
      // proof: string[] -> bytes32[] (truyền trực tiếp)
      writeContract({
        ...wagmiContractConfig,
        functionName: "claim",
        args: [amount, proof],
      });
    } catch (error: any) {
      console.error("Failed to claim airdrop:", error);

      // Xử lý các loại lỗi cụ thể
      if (error?.code === 4001) {
        toast.error("Transaction rejected by user");
      } else if (error?.message?.includes("insufficient funds")) {
        toast.error("Insufficient BNB Testnet for gas fees");
      } else if (error?.message) {
        toast.error(error.message);
      } else {
        toast.error("Failed to claim airdrop. Please try again.");
      }
    }
  };

  const PhaseCard = ({
    title,
    phase,
    claimDate,
  }: {
    title: string;
    phase: PhaseClaimStatus;
    claimDate?: string;
  }) => (
    <div className="border border-primary rounded-xl">
      <div className="flex items-center justify-between p-4 border-b border-primary">
        <p className="text-lg font-semibold text-primary">{title}</p>
        <p
          className={`px-3 py-1 rounded-full font-medium text-black ${getStatusColor(
            phase.status,
            phase.claimed,
            phase.canClaim,
            "bg"
          )}`}
        >
          {checkStatus(phase.status, phase.claimed, phase.canClaim)}
        </p>
      </div>
      <div className="p-4 text-white flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <p className="text-lg">Amount</p>
          <p className="text-lg">
            {formatAmount(phase.claimableAmount)} $GOATED
          </p>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-lg">Claim Date</p>
          <p className="text-lg">
            {claimDate
              ? title === "Vesting Round 1"
                ? format(new Date(Number(claimDate) * 1000), "yyyy-MM-dd")
                : format(
                    new Date(Number(claimDate) * 1000),
                    "yyyy-MM-dd HH:mm:ss"
                  )
              : "N/A"}
          </p>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-lg">Status</p>
          <p
            className={`text-lg ${getStatusColor(
              phase.status,
              phase.claimed,
              phase.canClaim,
              "text"
            )}`}
          >
            {checkStatus(phase.status, phase.claimed, phase.canClaim)}
          </p>
        </div>
      </div>
    </div>
  );

  // Loading skeleton giống layout thật với hiệu ứng đẹp
  const LoadingSkeleton = () => (
    <div className="flex-1 bg-black flex items-center justify-center">
      <div className="flex flex-col items-center justify-center border border-primary rounded-xl p-4 shadow-primary md:w-3/5">
        {/* Total Allocation Skeleton */}
        <div className="flex w-full flex-col items-center justify-center bg-primary/10 rounded-xl p-4 gap-6 border border-primary/20">
          <p className="text-2xl font-bold text-primary">Total Allocation</p>
          <Skeleton className="h-12 w-64 rounded-lg" />
        </div>

        {/* Phase Cards Skeleton */}
        <div className="grid grid-cols-2 gap-6 w-full mt-6">
          {[1, 2].map((phase, index) => (
            <div
              key={phase}
              className="border border-primary/20 rounded-xl overflow-hidden bg-black/50"
              style={{
                animationDelay: `${index * 0.1}s`,
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-primary/20">
                <Skeleton className="h-6 w-32 rounded-md" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
              {/* Content */}
              <div className="p-4 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-16 rounded" />
                  <Skeleton className="h-5 w-24 rounded" />
                </div>
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-20 rounded" />
                  <Skeleton className="h-5 w-28 rounded" />
                </div>
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-14 rounded" />
                  <Skeleton className="h-5 w-32 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="flex-1 bg-black flex items-center justify-center py-6">
      <div className="flex flex-col items-center justify-center border border-primary rounded-xl p-4 shadow-primary xl:w-3/5 sm:w-4/5">
        <div className="flex w-full flex-col items-center justify-center bg-primary rounded-xl p-6 gap-8">
          <p className="text-2xl font-bold text-black">Total Allocation</p>
          <p className="text-4xl font-bold text-black">
            {data.eligible ? `${data.amount} $GOATED` : "Not eligible"}
          </p>
        </div>
        {data.eligible && data.amount > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mt-6">
              <PhaseCard
                title="Vesting Round 1"
                phase={data.claimStatus.phase1}
                claimDate={claimDates.phase1?.toString()}
              />
              <PhaseCard
                title="Vesting Round 2"
                phase={data.claimStatus.phase2}
                claimDate={claimDates.phase2?.toString()}
              />
            </div>
            {/* Cảnh báo nếu không có đủ BNB */}
            {!hasEnoughBalance && address && (
              <div className="w-full mt-6 bg-yellow-500/20 border border-yellow-500 rounded-md p-4">
                <div className="flex items-start gap-3">
                  <CircleAlert className="w-5 h-5 text-yellow-400 mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <p className="text-yellow-400 font-semibold mb-1">
                      Insufficient BNB Testnet for Gas Fees
                    </p>
                    <p className="text-yellow-300 text-sm mb-2">
                      Current balance:{" "}
                      {balance?.value
                        ? `${(Number(balance.value) / 10 ** 18).toFixed(6)} BNB`
                        : "Loading..."}{" "}
                      (Minimum required: 0.0001 BNB)
                    </p>
                    <p className="text-yellow-300 text-sm">
                      BNB Testnet is the native token on BSC Testnet used to pay
                      gas fees. Get free BNB Testnet from{" "}
                      <a
                        href="https://testnet.bnbchain.org/faucet-smart"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline hover:text-primary/80"
                      >
                        BSC Testnet Faucet
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={() => handleClaim(data.claimStatus)}
              disabled={
                (!data.claimStatus.phase1.canClaim &&
                  !data.claimStatus.phase2.canClaim) ||
                isPendingWrite ||
                isWaitingTx ||
                !hasEnoughBalance
              }
              className="bg-primary w-full mt-8 text-2xl font-semibold text-black px-4 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPendingWrite || isWaitingTx
                ? "Processing..."
                : !hasEnoughBalance
                ? "Insufficient BNB Testnet for Gas"
                : data.claimStatus.phase1.canClaim
                ? "Claim Round 1 Tokens"
                : "Claim Round 2 Tokens"}
            </button>
            <div className="mt-8">
              <div className="text-xl font-semibold text-blue-400 flex items-center gap-4">
                <CircleAlert className="w-6 h-6" />
                Important Information
              </div>
              <div className="text-lg text-gray-300 mt-4">
                <p>
                  Tokens are released in two rounds. Make sure to claim each
                  round during its designated period. Unclaimed tokens may be
                  forfeited after the claim deadline.
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Content;
