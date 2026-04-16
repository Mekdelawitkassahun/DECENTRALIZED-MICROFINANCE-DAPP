'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { ethers } from 'ethers'
import { useWallet } from './WalletProvider'
import toast from 'react-hot-toast'

// Contract ABI (simplified version)
const CONTRACT_ABI = [
  "function register() external",
  "function deposit() external payable",
  "function withdraw(uint256 amount) external",
  "function requestLoan(uint256 amount, uint256 duration, string purpose) external returns (uint256)",
  "function approveLoan(uint256 loanId) external",
  "function repayLoan(uint256 loanId) external payable",
  "function checkDefault(uint256 loanId) external",
  "function getUserStats(address user) external view returns (uint256 creditScore, uint256 totalBorrowed, uint256 totalRepaid, uint256 activeLoans, uint256 completedLoans, uint256 defaultedLoans, uint256 depositBalance, uint256 maxLoanAmount)",
  "function getLoanDetails(uint256 loanId) external view returns (address borrower, uint256 amount, uint256 interestRate, uint256 duration, uint256 startTime, uint256 endTime, uint256 amountRepaid, uint256 totalOwed, uint8 status, string purpose, uint256 created)",
  "function getSystemStats() external view returns (uint256 totalBalance, uint256 activeLoans, uint256 totalRepaid, uint256 totalUsers)",
  "function getUserLoans(address user) external view returns (uint256[])",
  "function getAvailableLiquidity() external view returns (uint256)",
  "function getMaxLoanAmount(address user) external view returns (uint256)"
]

interface ContractContextType {
  contract: ethers.Contract | null
  isLoading: boolean
  registerUser: () => Promise<void>
  depositFunds: (amount: string) => Promise<void>
  withdrawFunds: (amount: string) => Promise<void>
  requestLoan: (amount: string, duration: string, purpose: string) => Promise<string>
  approveLoan: (loanId: string) => Promise<void>
  repayLoan: (loanId: string, amount: string) => Promise<void>
  getUserStats: () => Promise<any>
  getSystemStats: () => Promise<any>
  getUserLoans: () => Promise<string[]>
  getLoanDetails: (loanId: string) => Promise<any>
}

const ContractContext = createContext<ContractContextType | undefined>(undefined)

// Contract address will be set after deployment
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || ""

export function ContractProvider({ children }: { children: ReactNode }) {
  const [contract, setContract] = useState<ethers.Contract | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { signer, isConnected } = useWallet()

  useEffect(() => {
    if (isConnected && signer && CONTRACT_ADDRESS) {
      const contractInstance = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer)
      setContract(contractInstance)
    } else {
      setContract(null)
    }
  }, [isConnected, signer, CONTRACT_ADDRESS])

  const registerUser = async () => {
    if (!contract) {
      toast.error('Please connect your wallet first')
      return
    }

    setIsLoading(true)
    try {
      const tx = await contract.register()
      await tx.wait()
      toast.success('User registered successfully!')
    } catch (error: any) {
      console.error('Error registering user:', error)
      toast.error(error.message || 'Failed to register user')
    } finally {
      setIsLoading(false)
    }
  }

  const depositFunds = async (amount: string) => {
    if (!contract) {
      toast.error('Please connect your wallet first')
      return
    }

    setIsLoading(true)
    try {
      const ethAmount = ethers.parseEther(amount)
      const tx = await contract.deposit({ value: ethAmount })
      await tx.wait()
      toast.success(`Successfully deposited ${amount} ETH!`)
    } catch (error: any) {
      console.error('Error depositing funds:', error)
      toast.error(error.message || 'Failed to deposit funds')
    } finally {
      setIsLoading(false)
    }
  }

  const withdrawFunds = async (amount: string) => {
    if (!contract) {
      toast.error('Please connect your wallet first')
      return
    }

    setIsLoading(true)
    try {
      const ethAmount = ethers.parseEther(amount)
      const tx = await contract.withdraw(ethAmount)
      await tx.wait()
      toast.success(`Successfully withdrew ${amount} ETH!`)
    } catch (error: any) {
      console.error('Error withdrawing funds:', error)
      toast.error(error.message || 'Failed to withdraw funds')
    } finally {
      setIsLoading(false)
    }
  }

  const requestLoan = async (amount: string, duration: string, purpose: string) => {
    if (!contract) {
      toast.error('Please connect your wallet first')
      return ''
    }

    setIsLoading(true)
    try {
      const ethAmount = ethers.parseEther(amount)
      const durationSeconds = parseInt(duration) * 24 * 60 * 60 // Convert days to seconds
      const tx = await contract.requestLoan(ethAmount, durationSeconds, purpose)
      const receipt = await tx.wait()
      
      // Get loan ID from events (simplified)
      const loanId = receipt.logs[0].topics[1] // This would need proper event parsing
      toast.success('Loan request submitted successfully!')
      return loanId
    } catch (error: any) {
      console.error('Error requesting loan:', error)
      toast.error(error.message || 'Failed to request loan')
      return ''
    } finally {
      setIsLoading(false)
    }
  }

  const approveLoan = async (loanId: string) => {
    if (!contract) {
      toast.error('Please connect your wallet first')
      return
    }

    setIsLoading(true)
    try {
      const tx = await contract.approveLoan(loanId)
      await tx.wait()
      toast.success('Loan approved successfully!')
    } catch (error: any) {
      console.error('Error approving loan:', error)
      toast.error(error.message || 'Failed to approve loan')
    } finally {
      setIsLoading(false)
    }
  }

  const repayLoan = async (loanId: string, amount: string) => {
    if (!contract) {
      toast.error('Please connect your wallet first')
      return
    }

    setIsLoading(true)
    try {
      const ethAmount = ethers.parseEther(amount)
      const tx = await contract.repayLoan(loanId, { value: ethAmount })
      await tx.wait()
      toast.success(`Successfully repaid ${amount} ETH!`)
    } catch (error: any) {
      console.error('Error repaying loan:', error)
      toast.error(error.message || 'Failed to repay loan')
    } finally {
      setIsLoading(false)
    }
  }

  const getUserStats = async () => {
    if (!contract) {
      return null
    }

    try {
      const stats = await contract.getUserStats(await signer?.getAddress())
      return {
        creditScore: stats[0].toString(),
        totalBorrowed: ethers.formatEther(stats[1]),
        totalRepaid: ethers.formatEther(stats[2]),
        activeLoans: stats[3].toString(),
        completedLoans: stats[4].toString(),
        defaultedLoans: stats[5].toString(),
        depositBalance: ethers.formatEther(stats[6]),
        maxLoanAmount: ethers.formatEther(stats[7])
      }
    } catch (error: any) {
      console.error('Error getting user stats:', error)
      return null
    }
  }

  const getSystemStats = async () => {
    if (!contract) {
      return null
    }

    try {
      const stats = await contract.getSystemStats()
      return {
        totalBalance: ethers.formatEther(stats[0]),
        activeLoans: stats[1].toString(),
        totalRepaid: ethers.formatEther(stats[2]),
        totalUsers: stats[3].toString()
      }
    } catch (error: any) {
      console.error('Error getting system stats:', error)
      return null
    }
  }

  const getUserLoans = async () => {
    if (!contract) {
      return []
    }

    try {
      const loans = await contract.getUserLoans(await signer?.getAddress())
      return loans.map((loanId: any) => loanId.toString())
    } catch (error: any) {
      console.error('Error getting user loans:', error)
      return []
    }
  }

  const getLoanDetails = async (loanId: string) => {
    if (!contract) {
      return null
    }

    try {
      const details = await contract.getLoanDetails(loanId)
      return {
        borrower: details[0],
        amount: ethers.formatEther(details[1]),
        interestRate: details[2].toString(),
        duration: details[3].toString(),
        startTime: details[4].toString(),
        endTime: details[5].toString(),
        amountRepaid: ethers.formatEther(details[6]),
        totalOwed: ethers.formatEther(details[7]),
        status: details[8],
        purpose: details[9],
        created: details[10].toString()
      }
    } catch (error: any) {
      console.error('Error getting loan details:', error)
      return null
    }
  }

  return (
    <ContractContext.Provider
      value={{
        contract,
        isLoading,
        registerUser,
        depositFunds,
        withdrawFunds,
        requestLoan,
        approveLoan,
        repayLoan,
        getUserStats,
        getSystemStats,
        getUserLoans,
        getLoanDetails,
      }}
    >
      {children}
    </ContractContext.Provider>
  )
}

export function useContract() {
  const context = useContext(ContractContext)
  if (context === undefined) {
    throw new Error('useContract must be used within a ContractProvider')
  }
  return context
}
