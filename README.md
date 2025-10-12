# 🏃‍♂️ Health Buddy

> **Your Daily Wellness Buddy** - Turn wellness into a game! Check in daily, complete healthy actions, and see your progress grow. Stay motivated, stay healthy, stay happy!

[![Next.js](https://img.shields.io/badge/Next.js-15.2.4-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![Farcaster](https://img.shields.io/badge/Farcaster-MiniApp-purple?style=flat-square)](https://farcaster.xyz/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=flat-square&logo=vercel)](https://vercel.com/)

## ✨ Features

### 🎯 **Gamified Wellness Tracking**
- **Daily Check-ins** - Build consistent healthy habits
- **Action Categories** - Physical, Nutrition, Mental Health, Hygiene, Sleep
- **Point System** - Earn points for completing healthy actions
- **Level Progression** - From Beginner to Legend with 8 unique levels
- **Streak Tracking** - Maintain daily streaks for bonus points

### 🏆 **Social & Competitive**
- **Leaderboard** - Compete with other users
- **Progress Sharing** - Share achievements on Farcaster
- **NFT Rewards** - Mint achievement NFTs for milestones
- **Daily Reminders** - Automated notifications via Neynar API

### 🔗 **Farcaster Integration**
- **MiniApp** - Native Farcaster MiniApp experience
- **Wallet Connection** - Seamless crypto wallet integration
- **Social Features** - Built for the Farcaster ecosystem
- **Push Notifications** - Daily wellness reminders

### 📊 **Analytics & Insights**
- **Progress Charts** - Visualize your wellness journey
- **Statistics Dashboard** - Track your improvements over time
- **Achievement System** - Unlock badges and milestones
- **Personalized Insights** - Get recommendations based on your data

## 🚀 Tech Stack

### **Frontend**
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Radix UI** - Accessible component primitives
- **Lucide React** - Beautiful icons

### **Backend & Database**
- **PostgreSQL** - Primary database (Neon)
- **Drizzle ORM** - Type-safe database queries
- **Next.js API Routes** - Serverless API endpoints
- **Vercel Cron Jobs** - Scheduled tasks

### **Blockchain & Web3**
- **Wagmi** - React hooks for Ethereum
- **Viem** - TypeScript interface for Ethereum
- **Base & Celo** - Supported networks
- **OnchainKit** - Coinbase's Web3 UI components

### **Farcaster Integration**
- **Farcaster MiniApp SDK** - Native MiniApp functionality
- **Neynar API** - Farcaster data and notifications
- **Farcaster Auth** - Seamless user authentication

### **Referral & Analytics**
- **Divvi SDK** - On-chain referral tracking
- **Referral Attribution** - Track transaction referrals automatically
- **Consumer Address**: ``

## 🛠️ Getting Started

### Prerequisites
- Node.js 18+ 
- pnpm (recommended) or npm
- PostgreSQL database (Neon recommended)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/izosimov-mike/Health-Buddy.git
   cd Health-Buddy
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your environment variables:
   ```env
   # Database
   DATABASE_URL="postgresql://username:password@host:port/database"
   
   # Farcaster & Neynar
   NEYNAR_API_KEY="your_neynar_api_key"
   CRON_SECRET="your_cron_secret"
   
   # Optional: For production
   NEXT_PUBLIC_APP_URL="https://your-domain.com"
   ```

4. **Set up the database**
   ```bash
   # Generate migrations
   pnpm db:generate
   
   # Run migrations
   pnpm db:migrate
   
   # Seed the database
   pnpm db:seed
   ```

5. **Start the development server**
   ```bash
   pnpm dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📱 Farcaster MiniApp Setup

### 1. **Create Farcaster Manifest**
The app includes a `farcaster.json` manifest in `public/.well-known/` directory.

### 2. **Configure Neynar Webhook**
Set up your Neynar webhook URL in the manifest:
```json
{
  "miniapp": {
    "webhookUrl": "https://api.neynar.com/f/app/YOUR_APP_ID/event"
  }
}
```

### 3. **Deploy to Vercel**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### 4. **Set up Cron Jobs**
The app includes automated daily reminders via Vercel Cron:
```json
{
  "crons": [
    {
      "path": "/api/notifications/daily-reminder",
      "schedule": "0 9 * * *"
    }
  ]
}
```

## 🗄️ Database Schema

### **Core Tables**
- **users** - User profiles and stats
- **categories** - Action categories (Physical, Nutrition, etc.)
- **actions** - Individual healthy actions
- **action_completions** - User action completions
- **daily_progress** - Daily check-in data
- **levels** - User level definitions
- **nft_mints** - Achievement NFT records

### **Key Relationships**
- Users have many action completions
- Actions belong to categories
- Daily progress tracks user streaks
- NFT mints record achievement milestones

## 🔧 Available Scripts

```bash
# Development
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint

# Database
pnpm db:generate  # Generate migrations
pnpm db:migrate   # Run migrations
pnpm db:push      # Push schema changes
pnpm db:seed      # Seed database
pnpm db:init      # Initialize database
```

## 📊 API Endpoints

### **Core APIs**
- `GET /api/stats` - User statistics
- `POST /api/checkin` - Daily check-in
- `GET /api/actions` - Available actions
- `POST /api/actions/complete` - Complete an action
- `GET /api/leaderboard` - User rankings

### **Farcaster Integration**
- `GET /api/farcaster-manifest` - MiniApp manifest
- `POST /api/share-image` - Generate share images
- `POST /api/nft-mint` - Mint achievement NFTs

### **Admin & Maintenance**
- `GET /api/health` - Health check
- `POST /api/seed` - Seed database
- `GET /api/notifications/daily-reminder` - Daily reminders

## 🎮 Game Mechanics

### **Point System**
- **Physical Health**: 1 point per action
- **Nutrition**: 1 point per action  
- **Mental Health**: 1 point per action
- **Hygiene**: 1 point per action
- **Sleep**: 1 point per action

### **Level Progression**
1. **Beginner** (0-99 points)
2. **Apprentice** (100-299 points)
3. **Explorer** (300-599 points)
4. **Achiever** (600-999 points)
5. **Champion** (1000-1499 points)
6. **Master** (1500-2499 points)
7. **Legend** (2500-4999 points)
8. **Mythic** (5000+ points)

### **Streak Bonuses**
- **7-day streak**: +10% bonus points
- **30-day streak**: +25% bonus points
- **100-day streak**: +50% bonus points

## 🔐 Security & Privacy

- **Environment Variables** - All secrets stored securely
- **Database Security** - Parameterized queries prevent SQL injection
- **Authentication** - Farcaster-based user authentication
- **Rate Limiting** - API endpoints protected against abuse
- **CORS** - Proper cross-origin resource sharing

## 🚀 Deployment

### **Vercel (Recommended)**
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### **Environment Variables for Production**
```env
DATABASE_URL="your_production_database_url"
NEYNAR_API_KEY="your_neynar_api_key"
CRON_SECRET="your_secure_cron_secret"
NEXT_PUBLIC_APP_URL="https://your-domain.com"
```

## 🔗 Divvi Referral Integration

Health Buddy integrates **Divvi SDK** for on-chain referral tracking. Every state-changing transaction automatically includes referral attribution data.

### **How It Works**

1. **Referral Tag Generation**: Each transaction gets a unique referral tag based on the user's address
2. **Tag Appended to Calldata**: The tag is automatically appended to transaction data
3. **Transaction Submission**: After confirmation, transaction is registered with Divvi
4. **On-Chain Attribution**: Divvi decodes referral metadata and records it on-chain

### **Integrated Transactions**

- ✅ **NFT Minting** - Achievement NFTs include referral tracking
- ✅ **Base Check-ins** - Daily check-in transactions tracked
- ✅ **Celo Check-ins** - Cross-chain check-ins tracked
- ✅ **Token Transfers** - All CELO transfers include tracking

### **Consumer Address**

```

```

This consumer address is used across all transactions for consistent referral attribution. View our referral analytics on the Divvi dashboard.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Farcaster** - For the amazing social protocol
- **Neynar** - For Farcaster API services
- **Vercel** - For hosting and deployment
- **Neon** - For PostgreSQL hosting
- **Radix UI** - For accessible components
- **Tailwind CSS** - For utility-first styling

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/izosimov-mike/Health-Buddy/issues)
- **Discussions**: [GitHub Discussions](https://github.com/izosimov-mike/Health-Buddy/discussions)
- **Farcaster**: [@kinglizard](https://farcaster.xyz/kinglizard)

---

**Made with ❤️ for the Farcaster community**

*Grow Strong, Stay Happy! 💪*
