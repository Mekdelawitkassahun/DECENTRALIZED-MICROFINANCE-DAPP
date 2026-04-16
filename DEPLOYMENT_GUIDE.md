# Ethiopian Microfinance DApp - Sepolia Deployment Guide

## Overview

This guide explains how to deploy the Ethiopian Microfinance DApp to Sepolia testnet from the specified wallet address: `0x2646C40E21f8ef7637e3cD7AB6e33730Fba3C1A5`

## Prerequisites

1. **Node.js 18+** installed
2. **MetaMask** browser extension
3. **Sepolia ETH** in the specified wallet address
4. **Private key** for the wallet (for deployment)

## Step 1: Setup Environment

1. Clone or navigate to the project directory
2. Install dependencies:
```bash
npm install
```

3. Create `.env` file with your private key:
```bash
PRIVATE_KEY=your_private_key_here
SEPOLIA_URL=https://sepolia.drpc.org
ETHERSCAN_API_KEY=your_etherscan_api_key_here
```

## Step 2: Compile Smart Contracts

```bash
npx hardhat compile
```

## Step 3: Deploy to Sepolia Testnet

### Method 1: Using Hardhat Script

Run the deployment script:
```bash
npx hardhat run scripts/deploy-sepolia-simple.js --network sepolia
```

### Method 2: Manual Deployment

If the script fails, you can deploy manually:

1. Start Node.js console:
```bash
npx hardhat console --network sepolia
```

2. In the console, run:
```javascript
const EthiopianMicrofinanceSimple = await ethers.getContractFactory("EthiopianMicrofinanceSimple");
const contract = await EthiopianMicrofinanceSimple.deploy();
await contract.waitForDeployment();
console.log("Contract deployed to:", await contract.getAddress());
```

## Step 4: Verify Deployment

After deployment, verify the contract is working:

1. Check contract address on Etherscan
2. Verify initial functions are callable
3. Test user registration

## Step 5: Update Frontend Configuration

Update the `.env` file with the new contract address:

```bash
NEXT_PUBLIC_CONTRACT_ADDRESS=your_deployed_contract_address
NEXT_PUBLIC_NETWORK_ID=11155111
NEXT_PUBLIC_RPC_URL=https://sepolia.drpc.org
NEXT_PUBLIC_CHAIN_NAME="Sepolia Testnet"
NEXT_PUBLIC_CURRENCY_SYMBOL="ETH"
NEXT_PUBLIC_BLOCK_EXPLORER="https://sepolia.etherscan.io"
```

## Step 6: Start Frontend

```bash
npm run dev
```

## Step 7: Test Functionality

Test all features on Sepolia:

1. **Wallet Connection**: Connect MetaMask to Sepolia
2. **User Registration**: Register new users
3. **Deposit Funds**: Deposit ETH to lending pool
4. **Request Loans**: Request micro-loans
5. **Loan Repayment**: Repay loans with interest
6. **Credit Score**: Check credit score updates
7. **Transaction History**: View all on-chain transactions

## Contract Features

### Core Functions

- `register()` - Register new user
- `deposit()` - Deposit ETH to lending pool
- `withdraw(amount)` - Withdraw funds from pool
- `requestLoan(amount, duration, purpose)` - Request micro-loan
- `approveLoan(loanId)` - Approve loan (owner only)
- `repayLoan(loanId)` - Repay loan amount
- `checkDefault(loanId)` - Mark defaulted loans

### View Functions

- `getUserStats(user)` - Get user statistics
- `getSystemStats()` - Get system statistics
- `getUserLoans(user)` - Get user's loan IDs
- `getLoanDetails(loanId)` - Get detailed loan information
- `getMaxLoanAmount(user)` - Get maximum loan amount for user
- `getAvailableLiquidity()` - Get available pool liquidity

## Security Features

- **Re-entrancy Protection**: Prevents re-entrancy attacks
- **Access Control**: Owner-only functions for critical operations
- **Input Validation**: Validates all loan parameters
- **Pause Function**: Emergency pause capability
- **Safe Math**: Prevents integer overflow/underflow

## Ethiopian Context Integration

### Loan Parameters

- **Minimum Loan**: 0.005 ETH (suitable for microfinance)
- **Maximum Loan**: 10 ETH (reasonable for testnet)
- **Interest Rate**: 5% annually (community-friendly)
- **Loan Duration**: 30-180 days (flexible for different needs)

### Credit System

- **Initial Score**: 500 points for all users
- **Score Range**: 100-1000 points
- **Repayment Bonus**: +50 points per successful loan
- **Default Penalty**: -100 points per defaulted loan
- **Multiple Loan Bonus**: Additional points for multiple successful loans

## Troubleshooting

### Common Issues

1. **RPC Connection Issues**:
   - Try different RPC endpoints
   - Check network connectivity
   - Verify RPC URL is accessible

2. **Gas Issues**:
   - Increase gas price in hardhat config
   - Check wallet has sufficient ETH for gas
   - Use gas estimator for accurate gas limits

3. **Private Key Issues**:
   - Ensure private key is correct (without 0x prefix)
   - Check wallet has sufficient balance
   - Verify wallet address matches requirement

4. **Contract Deployment Fails**:
   - Check contract compilation
   - Verify gas limits are sufficient
   - Try deploying with higher gas price

### Alternative RPC Endpoints

If the default RPC fails, try these alternatives:

```javascript
// In hardhat.config.js
sepolia: {
  url: "https://ethereum-sepolia.blockpi.network/v1/rpc/public",
  // or
  url: "https://sepolia.drpc.org",
  // or
  url: "https://rpc.ankr.com/eth_sepolia",
  // or
  url: "https://sepolia.infura.io/v3/YOUR_PROJECT_ID",
}
```

## Contract Verification (Optional)

To verify the contract on Etherscan:

1. Go to the contract address on Etherscan
2. Click "Contract" tab
3. Click "Verify and Publish"
4. Select "Solidity (Single File)"
5. Choose compiler version: 0.8.19
6. Enable "Optimization" with 200 runs
7. Paste the contract source code
8. Submit verification

## Frontend Testing Guide

### Test Scenarios

1. **New User Flow**:
   - Connect wallet
   - Register user
   - Check initial credit score (500)
   - Verify user stats

2. **Lender Flow**:
   - Deposit ETH to pool
   - Check updated balance
   - Withdraw funds
   - Verify transaction history

3. **Borrower Flow**:
   - Request small loan (0.01 ETH)
   - Wait for approval (or self-approve if owner)
   - Receive loan funds
   - Repay loan with interest
   - Check credit score increase

4. **Credit System**:
   - Build credit history with multiple loans
   - Test credit score improvements
   - Verify loan limit increases
   - Test default scenarios

## Production Considerations

For mainnet deployment:

1. **Security Audit**: Conduct professional security audit
2. **Testing**: Comprehensive testing on testnets
3. **Gas Optimization**: Optimize for lower gas costs
4. **UI/UX**: Polish user interface
5. **Documentation**: Complete user documentation
6. **Support**: Set up user support channels

## Community Features

### Ethiopian Financial Integration

- **Iqub-style rotating savings**: Future enhancement
- **Idir community insurance**: Future enhancement
- **Group lending circles**: Future enhancement
- **Community validation**: Credit score bonuses

### Mobile Optimization

- **Responsive Design**: Works on all screen sizes
- **Simple Interface**: Easy for non-technical users
- **Low Data Usage**: Optimized for Ethiopian internet conditions
- **Multi-language Support**: Amharic integration planned

## Support

For deployment issues:

1. Check this guide first
2. Review error messages carefully
3. Test on localhost before Sepolia
4. Verify wallet configuration
5. Check contract compilation

## Next Steps

After successful Sepolia deployment:

1. Test all functionality thoroughly
2. Gather user feedback
3. Fix any bugs or issues
4. Consider Polygon mainnet deployment
5. Add additional Ethiopian context features
6. Scale for wider community adoption

---

**Contract Address**: Will be displayed after deployment
**Network**: Sepolia Testnet (Chain ID: 11155111)
**Explorer**: https://sepolia.etherscan.io
**Required Wallet**: 0x2646C40E21f8ef7637e3cD7AB6e33730Fba3C1A5
