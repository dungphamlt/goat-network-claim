import { createConfig, http } from "wagmi";
import { bsc } from "wagmi/chains";
import { injected, metaMask, walletConnect } from "wagmi/connectors";

// WalletConnect Project ID - bạn cần tạo project ID từ https://cloud.walletconnect.com
// Tạm thời để empty, có thể thêm sau
const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || "";

export const config = createConfig({
  chains: [bsc],
  connectors: [
    injected(),
    metaMask(),
    ...(projectId ? [walletConnect({ projectId })] : []),
  ],
  transports: {
    [bsc.id]: http(),
  },
});

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}
