# 🗳️ Student Council Voting DApp - Frontend

[![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3.3-blue?logo=typescript)](https://typescriptlang.org/)
[![Wagmi](https://img.shields.io/badge/Wagmi-2.5.7-purple)](https://wagmi.sh/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.1-38bdf8?logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**Modern, responsive Web3 frontend for blockchain-based student council elections.**

---

## 📦 Project Structure

```
client/
├── src/
│   ├── app/
│   │   ├── page.tsx               # Homepage
│   │   ├── create/                # Create election
│   │   ├── dashboard/             # Admin dashboard
│   │   ├── elections/             # Browse elections
│   │   └── election/[address]/    # Individual election
│   ├── components/
│   │   ├── election/              # Election-specific components
│   │   │   ├── ElectionCard.tsx
│   │   │   ├── PositionSelect.tsx
│   │   │   └── tabs/              # Tab components
│   │   ├── layout/                # Header, Footer
│   │   └── ui/                    # Reusable UI components
│   ├── hooks/
│   │   ├── useElection.ts         # Election data hooks
│   │   └── useVotingFactory.ts    # Factory contract hooks
│   ├── contracts/
│   │   ├── abis/                  # Contract ABIs
│   │   └── addresses.ts           # Contract addresses
│   ├── config/
│   │   └── wagmi.ts               # Web3 configuration
│   ├── lib/
│   │   ├── utils.ts               # Utility functions
│   │   └── validations.ts         # Form validations
│   └── types/
│       └── election.ts            # TypeScript types
└── public/                        # Static assets
```

---

## ✨ Features

### User Features
- 🔐 **Wallet Connection** (MetaMask, WalletConnect, Coinbase)
- 📊 **Election Discovery** (browse all active elections)
- 🗳️ **Secure Voting** (whitelist-based access)
- 📈 **Real-time Results** (live vote counting)
- 📱 **Responsive Design** (mobile-first approach)

### Organizer Features
- 🎯 **Create Elections** (multi-position support)
- 👥 **Manage Candidates** (add/remove per position)
- ✅ **Whitelist Voters** (CSV upload support)
- ⏰ **Schedule Elections** (flexible timing)
- 🛑 **Emergency Controls** (pause/resume)
- 📊 **Dashboard** (track your elections)

---

## 🛠️ Technology Stack

### Core
- **Next.js 16:** React framework with App Router
- **TypeScript:** Type-safe development
- **Tailwind CSS:** Utility-first styling

### Web3
- **Wagmi:** React hooks for Ethereum
- **RainbowKit:** Beautiful wallet connection UI
- **Viem:** TypeScript Ethereum library

### State & Forms
- **React Hook Form:** Efficient form handling
- **Zod:** Schema validation
- **TanStack Query:** Data fetching & caching

### UI/UX
- **React Hot Toast:** Elegant notifications
- **Date-fns:** Date manipulation
- **Custom Components:** Tailwind-based design system

---

## 🚀 Quick Start

### Prerequisites
```bash
node >= 18.0.0
npm >= 9.0.0
```

### Installation
```bash
npm install
```

### Environment Setup
Create `.env.local`:
```bash
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
NEXT_PUBLIC_VOTING_FACTORY_ADDRESS=0x...
```

### Development
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

### Build for Production
```bash
npm run build
npm start
```

### Type Check
```bash
npm run type-check
```

---

## 🔗 Smart Contract Integration

Contracts are located in the `web3` repository:
- [Election.sol](https://github.com/AreebUddin68/Student-Council-Voting-Web3)
- [VotingFactory.sol](https://github.com/AreebUddin68/Student-Council-Voting-Web3)

ABIs and addresses are configured in:
- `src/contracts/abis/`
- `src/contracts/addresses.ts`

---

## 🎨 Design System

### Components
- **Button:** Primary, secondary, outline variants
- **Card:** Flexible container with header/body
- **Badge:** Status indicators
- **Input:** Accessible form inputs
- **LoadingSpinner:** Async state feedback
- **Tabs:** Tab navigation system

### Color Palette
- **Primary:** Blue (elections, actions)
- **Success:** Green (active, voted)
- **Warning:** Yellow (ending soon)
- **Danger:** Red (ended, errors)
- **Neutral:** Gray (text, borders)

---

## 📱 Responsive Breakpoints

```typescript
sm: 640px   // Small devices
md: 768px   // Medium devices
lg: 1024px  // Large devices
xl: 1280px  // Extra large
```

---

## 🔐 Security

- ✅ **Wallet-based authentication**
- ✅ **Transaction signing required**
- ✅ **Whitelist enforcement**
- ✅ **Input sanitization**
- ✅ **Type-safe contracts**

---

## 📄 License

MIT License - See [LICENSE](LICENSE) for details.

---

## 🤝 Contributing

This is a student project. For issues or improvements, please open an issue.

---

## 📞 Support

- **GitHub:** [AreebUddin68/Student-Council-Voting-DApp](https://github.com/AreebUddin68/Student-Council-Voting-DApp)
- **Issues:** [Report a bug](https://github.com/AreebUddin68/Student-Council-Voting-DApp/issues)
- **Smart Contracts:** [Web3 Repo](https://github.com/AreebUddin68/Student-Council-Voting-Web3)

---

**Built with ❤️ for transparent student governance**
