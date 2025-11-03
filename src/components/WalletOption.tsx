import { useState, useMemo } from "react";
import { useConnect } from "wagmi";
import MetaMaskIcon from "../assets/metamask-icon.svg";
import PhantomIcon from "../assets/phantom-wallet.png";
import TrustIcon from "../assets/trust-wallet-logo.svg";
import RabbyIcon from "../assets/rabby-waller.png";

interface WalletInfo {
  id: string;
  name: string;
  icon: string;
  connectorId: string;
  isInstalled: boolean;
}

export function WalletOptions() {
  const { connectors, connect, isPending } = useConnect();
  const [showWalletList, setShowWalletList] = useState(false);

  // Detect installed wallets (giống Header.tsx)
  const allSupportedWallets = useMemo(() => {
    const wallets: WalletInfo[] = [];
    const hasEthereum = typeof window !== "undefined" && window.ethereum;
    const provider = hasEthereum ? window.ethereum : null;

    // MetaMask
    const metaMaskConnector = connectors.find((c) => c.id === "metaMask");
    const isMetaMaskInstalled = provider?.isMetaMask === true;
    wallets.push({
      id: "metaMask",
      name: "MetaMask",
      connectorId: "metaMaskSDK",
      isInstalled: isMetaMaskInstalled || !!metaMaskConnector,
      icon: MetaMaskIcon,
    });

    // Phantom
    const phantomConnector = connectors.find((c) => c.id === "app.phantom");
    const isPhantomInstalled =
      hasEthereum &&
      (provider?.isPhantom === true ||
        (typeof window !== "undefined" && (window as any).phantom?.ethereum));
    wallets.push({
      id: "phantom",
      name: "Phantom",
      icon: PhantomIcon,
      connectorId: "app.phantom",
      isInstalled: !!isPhantomInstalled || !!phantomConnector,
    });

    // Trust Wallet
    const isTrustInstalled =
      hasEthereum &&
      (provider?.isTrust === true || provider?.isTrustWallet === true);
    wallets.push({
      id: "trust",
      name: "Trust Wallet",
      icon: TrustIcon,
      connectorId: "injected",
      isInstalled: !!isTrustInstalled,
    });

    // Rabby Wallet
    const isRabbyInstalled = hasEthereum && provider?.isRabby === true;
    wallets.push({
      id: "rabby",
      name: "Rabby",
      icon: RabbyIcon,
      connectorId: "injected",
      isInstalled: !!isRabbyInstalled,
    });

    return wallets;
  }, [connectors]);

  const handleConnectWallet = (wallet: WalletInfo) => {
    const connector = connectors.find((c) => c.id === wallet.connectorId);
    if (connector) {
      connect({ connector });
      setShowWalletList(false);
    }
  };

  // Luôn hiển thị danh sách 4 ví
  return (
    <div className="w-full">
      {!showWalletList ? (
        <button
          onClick={() => setShowWalletList(true)}
          disabled={isPending}
          className="w-full text-primary font-medium px-6 py-3 rounded-md border border-primary hover:bg-primary hover:text-black transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Connect Wallet
        </button>
      ) : (
        <div className="space-y-2">
          {allSupportedWallets.map((wallet) => (
            <button
              key={wallet.id}
              onClick={() => handleConnectWallet(wallet)}
              disabled={isPending || !wallet.isInstalled}
              className={`w-full flex items-center justify-between gap-3 text-left font-medium px-6 py-3 rounded-md border transition-all duration-300 ${
                wallet.isInstalled
                  ? "text-primary border-primary hover:bg-primary hover:text-black disabled:opacity-50 disabled:cursor-not-allowed"
                  : "text-gray-500 border-gray-600 cursor-not-allowed opacity-50"
              }`}
            >
              <div className="flex items-center gap-3">
                {wallet.icon && (
                  <img
                    src={wallet.icon}
                    alt={wallet.name}
                    className="w-8 h-8 object-contain"
                  />
                )}
                <span>{wallet.name}</span>
              </div>
              {!wallet.isInstalled && (
                <span className="text-xs text-gray-400">Not Installed</span>
              )}
            </button>
          ))}
          <button
            onClick={() => setShowWalletList(false)}
            className="w-full text-gray-400 font-medium px-6 py-3 rounded-md border border-gray-600 hover:border-gray-500 transition-all duration-300"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
