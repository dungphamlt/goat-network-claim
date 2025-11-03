import { useState, useEffect, useCallback, useMemo } from "react";
import { useAccount, useDisconnect, useConnect } from "wagmi";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/authService";
import Cookies from "js-cookie";
import { Menu, X } from "lucide-react";
import Logo from "../assets/logo.svg?react";
import MetaMaskIcon from "../assets/metamask-icon.svg?react";
import TrustIcon from "../assets/trust-wallet-logo.svg?react";
import FantomIcon from "../assets/phantom-wallet.png";
import RabbyIcon from "../assets/rabby-waller.png";

interface WalletInfo {
  id: string;
  name: string;
  icon?: React.ReactNode;
  connectorId: string;
  isInstalled: boolean;
}

function Header() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { connect, connectors, isPending } = useConnect();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showWalletList, setShowWalletList] = useState(false);

  // Detect installed wallets (giống WalletOption.tsx)
  const allSupportedWallets = useMemo(() => {
    const wallets: WalletInfo[] = [];
    const hasEthereum = typeof window !== "undefined" && window.ethereum;
    const provider = hasEthereum ? window.ethereum : null;

    // MetaMask
    const metaMaskConnector = connectors.find((c) => c.id === "metaMask");
    const phantomConnector = connectors.find((c) => c.id === "app.phantom");
    const isMetaMaskInstalled = provider?.isMetaMask === true;
    wallets.push({
      id: "metaMask",
      name: "MetaMask",
      connectorId: "metaMaskSDK",
      isInstalled: isMetaMaskInstalled || !!metaMaskConnector,
      icon: <MetaMaskIcon className="w-5 h-5" />,
    });

    // Trust Wallet
    const isTrustInstalled =
      hasEthereum &&
      (provider?.isTrust === true || provider?.isTrustWallet === true);
    wallets.push({
      id: "trust",
      name: "Trust Wallet",
      icon: <TrustIcon className="w-5 h-5" />,
      connectorId: "injected",
      isInstalled: !!isTrustInstalled,
    });

    // Fantom Wallet
    const isFantomInstalled = hasEthereum && !!phantomConnector;
    wallets.push({
      id: "fantom",
      name: "Fantom Wallet",
      icon: <img src={FantomIcon} alt="Fantom Wallet" className="w-5 h-5" />,
      connectorId: "app.phantom",
      isInstalled: !!isFantomInstalled,
    });

    // Rabby Wallet
    const isRabbyInstalled = hasEthereum && provider?.isRabby === true;
    wallets.push({
      id: "rabby",
      name: "Rabby Wallet",
      icon: (
        <img
          src={RabbyIcon}
          alt="Rabby Wallet"
          className="w-5 h-5 rounded-full"
        />
      ),
      connectorId: "injected",
      isInstalled: !!isRabbyInstalled,
    });

    return wallets;
  }, [connectors]);

  const handleConnectWallet = useCallback(
    (wallet: WalletInfo) => {
      const connector = connectors.find((c) => c.id === wallet.connectorId);
      if (connector) {
        connect({ connector });
        setShowWalletList(false);
      }
    },
    [connectors, connect]
  );

  // Kiểm tra và verify token khi có address
  const checkAuth = useCallback(async () => {
    const token = Cookies.get("token");
    if (token && address) {
      try {
        const result = await authService.verify();
        const isValid =
          result.success &&
          result.data?.address?.toLowerCase() === address.toLowerCase();
        // Nếu token không hợp lệ, xóa cookie
        if (!isValid) {
          Cookies.remove("token");
        }
      } catch (error) {
        console.error("Verify token error:", error);
        Cookies.remove("token");
      }
    }
  }, [address]);

  // Kiểm tra token khi component mount hoặc address thay đổi
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Đóng wallet list khi click bên ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showWalletList && !target.closest(".wallet-dropdown")) {
        setShowWalletList(false);
      }
    };

    if (showWalletList) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [showWalletList]);

  const handleLogout = useCallback(() => {
    Cookies.remove("token");
    disconnect();
    navigate("/login", { replace: true });
  }, [disconnect, navigate]);

  const formatAddress = (addr: string | undefined) => {
    if (!addr) return "";
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <header className="bg-black border-b border-primary">
      <div className="container">
        <div className="flex items-center justify-between py-3 md:py-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Logo className="w-8 h-8 md:w-10 md:h-10" />
            <h1 className="text-white text-xs md:text-xl font-bold uppercase whitespace-nowrap">
              Goat Network
            </h1>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-10">
            <div className="flex items-center gap-6">
              <a href="#" className="text-white hover:text-primary font-medium">
                Home
              </a>
              <a href="#" className="text-white hover:text-primary font-medium">
                Ecosystem
              </a>
              <a href="#" className="text-white hover:text-primary font-medium">
                Settings
              </a>
            </div>
            <div className="flex gap-4">
              {isConnected ? (
                <>
                  <div className="border rounded-md px-3 py-1 border-primary">
                    <div className="text-white font-medium text-sm">
                      Connected
                    </div>
                    <div className="text-primary font-medium text-sm">
                      {formatAddress(address)}
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="text-primary font-medium px-4 py-2 rounded-md border border-primary hover:bg-primary hover:text-black transition-all duration-300"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <div className="relative wallet-dropdown">
                  <button
                    onClick={() => setShowWalletList(!showWalletList)}
                    disabled={isPending}
                    className="text-primary font-medium px-4 py-2 rounded-md border border-primary hover:bg-primary hover:text-black transition-all duration-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isPending ? "Connecting..." : "Connect Wallet"}
                  </button>
                  {showWalletList && (
                    <div className="absolute right-0 top-full mt-2 w-64 bg-black border border-primary rounded-md shadow-lg z-50 p-2">
                      {allSupportedWallets.map((wallet) => (
                        <button
                          key={wallet.id}
                          onClick={() => handleConnectWallet(wallet)}
                          disabled={isPending || !wallet.isInstalled}
                          className={`w-full text-left text-white font-medium px-3 py-2 rounded-md border transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-between mb-2 last:mb-0 ${
                            wallet.isInstalled
                              ? "border-primary/50 hover:border-primary hover:bg-primary/10"
                              : "border-gray-600 bg-gray-800/50"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {wallet.icon && <span>{wallet.icon}</span>}
                            <span className="text-sm">{wallet.name}</span>
                          </div>
                          {isPending && wallet.isInstalled && (
                            <span className="text-primary text-xs">
                              Connecting...
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            {isConnected && (
              <div className="border rounded px-2 py-1 border-primary">
                <div className="text-primary font-medium text-xs">
                  {formatAddress(address)}
                </div>
              </div>
            )}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-primary p-2"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-primary py-4 animate-fade-in">
            <div className="flex flex-col gap-4 items-start">
              <a
                href="#"
                className="text-white hover:text-primary font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </a>
              <a
                href="#"
                className="text-white hover:text-primary font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Ecosystem
              </a>
              <a
                href="#"
                className="text-white hover:text-primary font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Settings
              </a>
              {isConnected ? (
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="text-primary font-medium px-4 py-2 rounded-md border border-primary hover:bg-primary hover:text-black transition-all duration-300 text-left"
                >
                  Logout
                </button>
              ) : (
                <div className="w-full">
                  <button
                    onClick={() => setShowWalletList(!showWalletList)}
                    disabled={isPending}
                    className="text-primary font-medium px-4 py-2 rounded-md border border-primary hover:bg-primary hover:text-black transition-all duration-300 text-left disabled:opacity-50 disabled:cursor-not-allowed w-full"
                  >
                    {isPending ? "Connecting..." : "Connect Wallet"}
                  </button>
                  {showWalletList && (
                    <div className="mt-2 w-full bg-black border border-primary rounded-md p-2">
                      {allSupportedWallets.map((wallet) => (
                        <button
                          key={wallet.id}
                          onClick={() => {
                            handleConnectWallet(wallet);
                            setIsMobileMenuOpen(false);
                          }}
                          disabled={isPending || !wallet.isInstalled}
                          className={`w-full text-left text-white font-medium px-3 py-2 rounded-md border transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-between mb-2 last:mb-0 ${
                            wallet.isInstalled
                              ? "border-primary/50 hover:border-primary hover:bg-primary/10"
                              : "border-gray-600 bg-gray-800/50"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {wallet.icon && <span>{wallet.icon}</span>}
                            <span className="text-sm">{wallet.name}</span>
                          </div>
                          {isPending && wallet.isInstalled && (
                            <span className="text-primary text-xs">
                              Connecting...
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;
