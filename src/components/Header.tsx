import { useState, useEffect, useCallback } from "react";
import { useAccount, useDisconnect, useConnect } from "wagmi";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/authService";
import Cookies from "js-cookie";
import { Menu, X } from "lucide-react";
import Logo from "../assets/logo.svg?react";

function Header() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { connect, connectors, isPending } = useConnect();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleConnect = useCallback(() => {
    const metaMaskConnector = connectors.find(
      (connector) => connector.id === "metaMask"
    );
    const injectedConnector = connectors.find(
      (connector) => connector.id === "injected"
    );

    if (metaMaskConnector) {
      connect({ connector: metaMaskConnector });
    } else if (injectedConnector) {
      connect({ connector: injectedConnector });
    } else if (connectors[0]) {
      connect({ connector: connectors[0] });
    }
  }, [connectors, connect]);

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
                <button
                  onClick={handleConnect}
                  disabled={isPending}
                  className="text-primary font-medium px-4 py-2 rounded-md border border-primary hover:bg-primary hover:text-black transition-all duration-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPending ? "Connecting..." : "Connect Wallet"}
                </button>
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
                <button
                  onClick={() => {
                    handleConnect();
                    setIsMobileMenuOpen(false);
                  }}
                  disabled={isPending}
                  className="text-primary font-medium px-4 py-2 rounded-md border border-primary hover:bg-primary hover:text-black transition-all duration-300 text-left disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPending ? "Connecting..." : "Connect Wallet"}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;
