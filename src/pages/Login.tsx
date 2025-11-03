import { useEffect, useState } from "react";
import { useAccount, useSignMessage, useSwitchChain } from "wagmi";
import { useNavigate } from "react-router-dom";
import { bscTestnet } from "wagmi/chains";
import { authService } from "../services/authService";
import Cookies from "js-cookie";
import Logo from "../assets/logo.svg?react";
import Header from "../components/Header";
import { WalletOptions } from "../components/WalletOption";

function Login() {
  const { address, isConnected, chainId } = useAccount();
  const { switchChain, isPending: isSwitchingChain } = useSwitchChain();
  const { signMessageAsync, isPending: isSigning } = useSignMessage();
  const navigate = useNavigate();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Tự động switch về BSC Testnet sau khi connect nếu chain khác
  useEffect(() => {
    if (isConnected && chainId && chainId !== bscTestnet.id) {
      try {
        switchChain({ chainId: bscTestnet.id });
      } catch (error) {
        console.error("Failed to switch chain:", error);
        setError(
          "Please switch to BSC Testnet in your wallet. Chain ID: " +
            bscTestnet.id
        );
      }
    }
  }, [isConnected, chainId, switchChain]);

  // Kiểm tra nếu đã đăng nhập, redirect về home
  useEffect(() => {
    const token = Cookies.get("token");
    if (token && address) {
      authService.verify().then((result) => {
        if (
          result.success &&
          result.data?.address?.toLowerCase() === address.toLowerCase()
        ) {
          navigate("/", { replace: true });
        }
      });
    }
  }, [address, navigate]);

  // Tự động login sau khi wallet connected
  useEffect(() => {
    if (isConnected && address && !isLoggingIn) {
      handleLogin();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, address]);

  const handleLogin = async () => {
    if (!address || isLoggingIn) return;

    try {
      setIsLoggingIn(true);
      setError(null);

      // Bước 1: Lấy message để sign
      const messageResult = await authService.getMessage(address);
      if (!messageResult.success || !messageResult.data?.message) {
        setError(messageResult.error || "Failed to get message");
        return;
      }

      const message = messageResult.data.message;

      // Bước 2: Sign message bằng wallet
      const signature = await signMessageAsync({
        message,
      });

      // Bước 3: Login với signature
      const loginResult = await authService.login(address, signature, message);

      if (!loginResult.success || !loginResult.data?.token) {
        setError(loginResult.error || "Login failed");
        return;
      }

      navigate("/", { replace: true });
    } catch (error: any) {
      console.error("Login error:", error);
      if (error?.code === 4001) {
        setError("User rejected the request");
      } else {
        setError(error?.message || "An error occurred during login");
        Cookies.remove("token");
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen  bg-black flex flex-col">
      <Header />
      <div className="container flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center justify-center border border-primary rounded-xl px-4 py-6 md:p-8 shadow-primary max-w-md mx-auto">
          <div className="flex items-center justify-center gap-2 mb-10">
            <Logo className="w-12 h-12 md:w-20 md:h-20" />
            <h1 className="text-white text-xl md:text-3xl font-bold uppercase">
              Goat Network
            </h1>
          </div>
          <h3 className="text-white text-lg md:text-2xl font-semibold mb-8 text-center">
            Claim Your GOATED Airdrop
          </h3>
          <p className="text-gray-300 text-sm md:text-base mb-8 text-center">
            Connect your wallet to check if you&apos;re eligible for the GOATED
            airdrop.
          </p>

          {!isConnected ? (
            <div className="w-full space-y-3">
              <WalletOptions />
            </div>
          ) : (
            <div className="w-full space-y-4">
              <div className="text-center">
                <p className="text-primary font-medium mb-2">
                  Wallet Connected
                </p>
                <p className="text-white text-sm">
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </p>
              </div>

              {(isLoggingIn || isSigning || isSwitchingChain) && (
                <div className="text-center">
                  <p className="text-primary font-medium">
                    {isSwitchingChain
                      ? "Switching to BSC Testnet..."
                      : isSigning
                      ? "Signing message..."
                      : "Logging in..."}
                  </p>
                </div>
              )}

              {error && (
                <div className="bg-red-500/20 border border-red-500 rounded-md p-3">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              {chainId !== bscTestnet.id && (
                <div className="bg-yellow-500/20 border border-yellow-500 rounded-md p-3">
                  <p className="text-yellow-400 text-sm">
                    Please switch to BSC Testnet (Chain ID: {bscTestnet.id}) to
                    continue.
                  </p>
                </div>
              )}

              {!isLoggingIn &&
                !isSigning &&
                !isSwitchingChain &&
                isConnected &&
                chainId === bscTestnet.id && (
                  <button
                    onClick={handleLogin}
                    className="w-full text-primary font-medium px-6 py-3 rounded-md border border-primary hover:bg-primary hover:text-black transition-all duration-300"
                  >
                    Sign In
                  </button>
                )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Login;
