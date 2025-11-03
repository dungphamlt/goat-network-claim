/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />

// Type definition for window.ethereum
interface Window {
  ethereum?: {
    isMetaMask?: boolean;
    isTrust?: boolean;
    isTrustWallet?: boolean;
    isRabby?: boolean;
    isFantom?: boolean;
    isPhantom?: boolean;
    providers?: any[];
    request?: (args: { method: string; params?: any[] }) => Promise<any>;
  };
  phantom?: {
    ethereum?: any;
  };
}
