'use client'

import { useEffect, useState, useCallback } from 'react'
import { useWallet } from '@/components/WalletProvider'
import { useContract } from '@/components/ContractProvider'
import Link from 'next/link'
import { 
  BanknotesIcon, 
  ArrowTrendingUpIcon, 
  CreditCardIcon, 
  UserCircleIcon,
  PlusIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon
} from '@heroicons/react/24/outline'

export default function HomePage() {
  const { account, connectWallet } = useWallet()
  const { getUserStats, getSystemStats, registerUser, isLoading: contractLoading } = useContract()
  const [userStats, setUserStats] = useState<any>(null)
  const [systemStats, setSystemStats] = useState<any>(null)
  const [isRegistering, setIsRegistering] = useState(false)

  const loadData = useCallback(async () => {
    try {
      const [user, system] = await Promise.all([
        getUserStats(),
        getSystemStats()
      ])
      setUserStats(user)
      setSystemStats(system)
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      setUserStats(null)
      setSystemStats(null)
    }
  }, [getUserStats, getSystemStats])

  useEffect(() => {
    if (account) {
      loadData()
    }
  }, [account, loadData])

  const handleRegister = async () => {
    setIsRegistering(true)
    await registerUser()
    
    // Refresh data after registration
    await loadData()
    
    setIsRegistering(false)
  }

  if (!account) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <button
            onClick={() => connectWallet()}
            className="bg-gray-900 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-800 transition-all transform hover:scale-105 shadow-xl"
          >
            Connect Wallet
          </button>
        </div>
      </div>
    )
  }

  if (userStats && !userStats.isRegistered && userStats.creditScore === "0") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-emerald-100">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <UserCircleIcon className="w-12 h-12 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Welcome to Ethiopian Microfinance</h1>
          <p className="text-gray-600 mb-8">
            You are connected but not yet registered in our decentralized system. 
            Register now to start lending, borrowing, and building your credit score.
          </p>
          <button
            onClick={handleRegister}
            disabled={isRegistering || contractLoading}
            className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-emerald-700 disabled:bg-gray-400 transition-all shadow-lg hover:shadow-emerald-200"
          >
            {isRegistering ? 'Registering...' : 'Register Now'}
          </button>
          <p className="mt-4 text-xs text-gray-400">
            Registration requires a small gas fee on the Sepolia network.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-2 sm:py-4">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 mb-3 sm:mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-base sm:text-lg font-semibold text-gray-900">Dashboard</h1>
            <p className="text-xs text-gray-500">
              {account?.slice(0, 6)}...{account?.slice(-4)}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6">
        {/* User Stats */}
        {userStats && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className="bg-white rounded-lg shadow p-2 sm:p-3">
              <div className="flex items-center">
                <div className="p-1.5 bg-green-100 rounded-lg">
                  <CreditCardIcon className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                </div>
                <div className="ml-2">
                  <p className="text-xs text-gray-500">Credit Score</p>
                  <p className="text-sm sm:text-base font-semibold text-gray-900">{userStats.creditScore}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-2 sm:p-3">
              <div className="flex items-center">
                <div className="p-1.5 bg-blue-100 rounded-lg">
                  <BanknotesIcon className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
                </div>
                <div className="ml-2">
                  <p className="text-xs text-gray-500">Deposit</p>
                  <p className="text-sm sm:text-base font-semibold text-gray-900">{userStats.depositBalance} ETH</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-2 sm:p-3">
              <div className="flex items-center">
                <div className="p-1.5 bg-yellow-100 rounded-lg">
                  <ArrowTrendingUpIcon className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-600" />
                </div>
                <div className="ml-2">
                  <p className="text-xs text-gray-500">Max Loan</p>
                  <p className="text-sm sm:text-base font-semibold text-gray-900">{userStats.maxLoanAmount} ETH</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-2 sm:p-3">
              <div className="flex items-center">
                <div className="p-1.5 bg-purple-100 rounded-lg">
                  <UserCircleIcon className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600" />
                </div>
                <div className="ml-2">
                  <p className="text-xs text-gray-500">Active Loans</p>
                  <p className="text-sm sm:text-base font-semibold text-gray-900">{userStats.activeLoans}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 mb-3 sm:mb-4">
          <Link
            href="/lend"
            className="bg-white rounded-lg shadow p-2 sm:p-3 hover:shadow-md transition-shadow group"
          >
            <div className="flex flex-col items-center text-center gap-1">
              <ArrowDownTrayIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-green-600" />
              <h3 className="text-xs sm:text-sm font-medium text-gray-900 group-hover:text-green-600">
                Lend
              </h3>
              <p className="text-xs text-gray-500">Deposit ETH</p>
            </div>
          </Link>

          <Link
            href="/borrow"
            className="bg-white rounded-lg shadow p-2 sm:p-3 hover:shadow-md transition-shadow group"
          >
            <div className="flex flex-col items-center text-center gap-1">
              <PlusIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-blue-600" />
              <h3 className="text-xs sm:text-sm font-medium text-gray-900 group-hover:text-blue-600">
                Borrow
              </h3>
              <p className="text-xs text-gray-500">Get loan</p>
            </div>
          </Link>

          <Link
            href="/loans"
            className="bg-white rounded-lg shadow p-2 sm:p-3 hover:shadow-md transition-shadow group"
          >
            <div className="flex flex-col items-center text-center gap-1">
              <ArrowUpTrayIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-yellow-600" />
              <h3 className="text-xs sm:text-sm font-medium text-gray-900 group-hover:text-yellow-600">
                Pay Loan
              </h3>
              <p className="text-xs text-gray-500">Repay</p>
            </div>
          </Link>

          <Link
            href="/credit"
            className="bg-white rounded-lg shadow p-2 sm:p-3 hover:shadow-md transition-shadow group"
          >
            <div className="flex flex-col items-center text-center gap-1">
              <ArrowTrendingUpIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-purple-600" />
              <h3 className="text-xs sm:text-sm font-medium text-gray-900 group-hover:text-purple-600">
                Credit
              </h3>
              <p className="text-xs text-gray-500">Details</p>
            </div>
          </Link>
        </div>

        {/* System Overview */}
        {systemStats && (
          <div className="bg-white rounded-lg shadow p-2 sm:p-3">
            <h2 className="text-sm font-medium text-gray-900 mb-2">System Overview</h2>
            <div className="grid grid-cols-3 gap-2">
              <div className="text-center">
                <div className="text-sm font-semibold text-green-600">{systemStats.totalBalance} ETH</div>
                <div className="text-xs text-gray-500">Pool Balance</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-semibold text-yellow-600">{systemStats.activeLoans}</div>
                <div className="text-xs text-gray-500">Active Loans</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-semibold text-blue-600">{systemStats.totalRepaid} ETH</div>
                <div className="text-xs text-gray-500">Total Repaid</div>
              </div>
            </div>
          </div>
        )}

        {/* Your Activity */}
        {userStats && (
          <div className="bg-white rounded-lg shadow p-2 sm:p-3">
            <h2 className="text-sm font-medium text-gray-900 mb-2">Your Activity</h2>
            <div className="grid grid-cols-2 gap-2">
              <div className="text-center">
                <div className="text-sm font-semibold text-blue-600">{userStats.totalBorrowed} ETH</div>
                <div className="text-xs text-gray-500">Borrowed</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-semibold text-green-600">{userStats.totalRepaid} ETH</div>
                <div className="text-xs text-gray-500">Repaid</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-semibold text-green-600">{userStats.completedLoans}</div>
                <div className="text-xs text-gray-500">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-semibold text-red-600">{userStats.defaultedLoans}</div>
                <div className="text-xs text-gray-500">Defaulted</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
