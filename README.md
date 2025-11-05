# GOAT Network Airdrop Frontend

A decentralized application (dApp) for claiming GOATED tokens from the GOAT Network airdrop. Users can connect their wallets, check eligibility, and claim tokens in two vesting rounds.

## Features

- 🔐 **Wallet Authentication**: Connect with MetaMask and other Web3 wallets
- ✅ **Eligibility Check**: Verify if your wallet is eligible for the airdrop
- 🎁 **Two-Phase Claiming**: Claim tokens in two vesting rounds (Round 1 and Round 2)
- ⏱️ **Countdown Timer**: Real-time countdown for Round 2 claim availability
- 📊 **Transaction Tracking**: Monitor transaction status with BscScan integration
- 💰 **Balance Check**: Automatic BNB balance verification for gas fees
- 🎨 **Modern UI**: Beautiful and responsive design with Tailwind CSS

## Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Wagmi** - React Hooks for Ethereum
- **Viem** - TypeScript Ethereum library
- **Tailwind CSS** - Styling
- **React Router** - Routing
- **Axios** - HTTP client
- **React Toastify** - Notifications
- **date-fns** - Date formatting

## Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- MetaMask or compatible Web3 wallet
- BNB (Binance Coin) for gas fees on BSC

## Installation

1. Clone the repository:
```bash
git clone https://github.com/johnnylecrypto/goat-airdrop-fe.git
cd goat-airdrop-fe
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Create a `.env` file in the root directory:
```env
VITE_API_URL=your_api_url_here
VITE_CONTRACT_ADDRESS=your_contract_address_here
VITE_TOKEN_ADDRESS=your_token_address_here
VITE_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id (optional)
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_API_URL` | Backend API URL | Yes |
| `VITE_CONTRACT_ADDRESS` | Smart contract address for airdrop | Yes |
| `VITE_TOKEN_ADDRESS` | Token contract address | Yes |
| `VITE_WALLETCONNECT_PROJECT_ID` | WalletConnect project ID | No |

## Development

Start the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

The app will be available at `http://localhost:5173`

## Build

Build for production:
```bash
npm run build
# or
yarn build
# or
pnpm build
```

Preview production build:
```bash
npm run preview
# or
yarn preview
# or
pnpm preview
```

## Project Structure

```
src/
├── components/          # React components
│   ├── Content.tsx     # Main airdrop claim interface
│   ├── Header.tsx       # Navigation header
│   └── CountdownTimer.tsx # Countdown timer component
├── config/             # Configuration files
│   ├── wagmi.ts        # Wagmi configuration
│   └── wagmiContract.ts # Contract ABI and address
├── pages/              # Page components
│   ├── Home.tsx        # Home page
│   └── Login.tsx       # Login page
├── services/           # API services
│   ├── api.ts          # Axios instance and HTTP methods
│   ├── authService.ts  # Authentication service
│   └── airdropService.ts # Airdrop service
└── main.tsx            # App entry point
```

## Usage

1. **Connect Wallet**: Click "Connect Wallet" and select your preferred wallet
2. **Check Eligibility**: The app automatically checks if your wallet is eligible
3. **View Allocation**: See your total allocation and per-round amounts
4. **Claim Tokens**: 
   - Round 1: Claim immediately when available
   - Round 2: Wait for the countdown or claim when available
5. **Track Transactions**: Monitor your transaction status on BscScan

## Important Notes

- Ensure you have sufficient BNB in your wallet for gas fees (minimum 0.0001 BNB)
- Tokens are released in two rounds. Make sure to claim each round during its designated period
- Unclaimed tokens may be forfeited after the claim deadline
- The app works on BSC (Binance Smart Chain) network

## License

This project is private and proprietary.

## Support

For issues or questions, please contact the development team.
