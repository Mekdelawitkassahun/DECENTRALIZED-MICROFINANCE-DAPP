# Ensirat – Blockchain Equb & Iddir for Ethiopians

A complete microfinance DApp that enables Ethiopians to run traditional Equb (rotating savings) and Iddir (funeral support) groups on the Ethereum blockchain.

## 🌟 Features

- **Equb Groups**: Create rotating savings groups where members contribute ETH and take turns receiving the total pot
- **Iddir Groups**: Traditional funeral insurance groups with voting-based payout approval
- **Reputation System**: Track payment history with scores from 0-100
- **Bilingual Support**: English and Amharic (አማርኛ) language options
- **Mobile-Friendly**: Responsive design using Tailwind CSS
- **Sepolia Testnet**: Safe testing environment with free test ETH

## 🛠 Tech Stack

### Smart Contracts
- **Solidity**: Smart contract development
- **Hardhat**: Development framework
- **Ethereum Sepolia**: Testnet deployment

### Frontend
- **React**: User interface framework
- **Tailwind CSS**: Styling
- **Ethers.js**: Blockchain interaction
- **WalletConnect**: Wallet integration

## 📁 Project Structure

```
ensirat-sepolia/
├── contracts/
│   ├── SimpleEqub.sol          # Equb rotating savings contract
│   ├── SimpleIddir.sol          # Iddir funeral support contract
│   └── Reputation.sol           # User reputation system
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.jsx         # Dashboard page
│   │   │   ├── CreateGroup.jsx  # Group creation page
│   │   │   ├── MyGroups.jsx     # Group management page
│   │   │   └── Profile.jsx      # User profile page
│   │   ├── locales/
│   │   │   ├── en.json          # English translations
│   │   │   └── am.json          # Amharic translations
│   │   └── App.jsx              # Main application component
│   └── package.json
├── scripts/
│   └── deploy.js                # Deployment script for Sepolia
├── test/
│   └── Ensirat.test.js          # Contract tests
├── hardhat.config.js            # Hardhat configuration
├── .env.example                 # Environment variables template
└── README.md                    # This file
```

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MetaMask browser extension
- Git

### 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone <repository-url>
cd ensirat-sepolia

# Install contract dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### 2. Set Up Environment Variables

```bash
# Copy environment template
cp .env.example .env

# Edit .env file with your configuration
# You'll need:
# - PRIVATE_KEY: Your wallet private key (for deployment)
# - SEPOLIA_RPC_URL: Infura/Alchemy RPC URL
# - ETHERSCAN_API_KEY: For contract verification
```

### 3. Get Sepolia Test ETH

1. **Add Sepolia to MetaMask**:
   - Network Name: Sepolia Testnet
   - New RPC URL: `https://sepolia.infura.io/v3/YOUR_INFURA_KEY`
   - Chain ID: `11155111`
   - Currency Symbol: `ETH`

2. **Get Free Test ETH** from any of these faucets:
   - [Sepolia Faucet](https://sepoliafaucet.com/)
   - [Alchemy Sepolia Faucet](https://sepoliafaucet.com/)
   - [Chainlink Faucet](https://faucets.chain.link/)

### 4. Deploy Smart Contracts

```bash
# Compile contracts
npx hardhat compile

# Run tests
npx hardhat test

# Deploy to Sepolia
npx hardhat run scripts/deploy.js --network sepolia
```

### 5. Update Frontend Configuration

After deployment, update the contract addresses in your frontend files:

```javascript
// In frontend/src/pages/*.jsx
const SIMPLE_EQUB_ADDRESS = 'YOUR_DEPLOYED_EQUB_ADDRESS';
const SIMPLE_IDDIR_ADDRESS = 'YOUR_DEPLOYED_IDDIR_ADDRESS';
const REPUTATION_ADDRESS = 'YOUR_DEPLOYED_REPUTATION_ADDRESS';
```

### 6. Start the Frontend

```bash
cd frontend
npm start
```

The application will open at `http://localhost:3000`

## 📖 Smart Contract Details

### SimpleEqub.sol

**Purpose**: Manages rotating savings groups (Equb)

**Key Functions**:
- `createGroup(address[] members, uint256 fee, uint256 cycleDuration)`: Create new Equb group
- `payFee(uint256 groupId)`: Pay cycle fee
- `getGroupInfo(uint256 groupId)`: Get group details

**Features**:
- Automatic payout rotation
- Member validation
- Payment tracking

### SimpleIddir.sol

**Purpose**: Manages funeral support groups (Iddir)

**Key Functions**:
- `createGroup(address[] members, uint256 monthlyFee, uint256 maxPayout)`: Create new Iddir group
- `payMonthlyFee(uint256 groupId)`: Pay monthly contribution
- `requestPayout(uint256 groupId, string familyMemberName, uint256 amount)`: Request funeral payout
- `voteOnPayout(uint256 requestId, bool approve)`: Vote on payout requests

**Features**:
- Democratic voting (>50% approval)
- Payout limits
- Monthly payment tracking

### Reputation.sol

**Purpose**: Tracks user payment history and reputation

**Key Functions**:
- `recordOnTimePayment(address user, uint256 amount, string paymentType)`: Record successful payment
- `recordMissedPayment(address user, string paymentType)`: Record missed payment
- `getReputationScore(address user)`: Get user's reputation score

**Scoring System**:
- +5 points for on-time payments
- -20 points for missed payments
- Score range: 0-100

## 🎨 Frontend Pages

### 1. Home (Dashboard)
- User balance and reputation score
- Quick actions for creating groups
- Overview of active Equb and Iddir groups

### 2. Create Group
- Group type selection (Equb/Iddir)
- Member management
- Fee and duration configuration

### 3. My Groups
- List of user's groups
- Payment functionality
- Voting on Iddir payout requests
- Group status tracking

### 4. Profile
- Reputation score visualization
- Payment history
- Statistics and achievements

## 🌍 Language Support

The application supports two languages:

- **English**: Default language
- **Amharic (አማርኛ)**: Ethiopian language support

To switch languages, use the language toggle in the header.

## 🧪 Testing

### Running Contract Tests

```bash
# Run all tests
npx hardhat test

# Run specific test file
npx hardhat test test/Ensirat.test.js

# Run tests with gas reporting
npx hardhat test --reporter gas
```

### Test Coverage

The test suite covers:
- Contract deployment
- Group creation (Equb & Iddir)
- Payment processing
- Voting mechanisms
- Reputation system
- Error conditions
- Integration scenarios

## 🔧 Development

### Local Development

1. **Start Hardhat Node**:
   ```bash
   npx hardhat node
   ```

2. **Deploy Locally**:
   ```bash
   npx hardhat run scripts/deploy.js --network localhost
   ```

3. **Update Frontend**: Use localhost contract addresses

### Contract Verification

After deploying to Sepolia, verify your contracts:

```bash
npx hardhat verify --network sepolia <CONTRACT_ADDRESS>
```

## 📱 Mobile Usage

The application is fully responsive and works on mobile devices. For the best experience:

1. Install MetaMask mobile app
2. Add Sepolia network to mobile MetaMask
3. Access the web app via mobile browser

## 🔒 Security Considerations

- **Private Keys**: Never expose private keys in frontend code
- **Testnet Only**: This version is designed for Sepolia testnet only
- **Audit**: Conduct security audits before mainnet deployment
- **Upgradability**: Consider proxy patterns for future upgrades

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📞 Support

For issues and questions:

1. Check the [FAQ](#faq) section below
2. Review existing GitHub issues
3. Create a new issue with detailed information

## ❓ FAQ

**Q: How do I get Sepolia test ETH?**
A: Use the faucets listed in the setup section. You can get 0.5-1 ETH per day.

**Q: Why can't I connect my wallet?**
A: Ensure MetaMask is installed and you're on the Sepolia network.

**Q: What are the gas fees?**
A: On Sepolia testnet, gas fees are paid with test ETH and are very low.

**Q: Can I use this on mainnet?**
A: This version is testnet-only. Mainnet deployment requires additional security measures.

**Q: How do I add Amharic translations?**
A: Edit the `frontend/src/locales/am.json` file with new translations.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Ethiopian community for traditional financial systems inspiration
- Ethereum developers for the blockchain infrastructure
- Hardhat team for the development framework
- Tailwind CSS for the styling system

---

**Built with ❤️ for the Ethiopian community**
