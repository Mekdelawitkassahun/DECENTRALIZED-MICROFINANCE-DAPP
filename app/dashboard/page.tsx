'use client'

import { useEffect, useState } from 'react'
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

export default function Dashboard() {
  const { account } = useWallet()
  const { getUserStats, getSystemStats, isLoading } = useContract()
  const [userStats, setUserStats] = useState<any>(null)
  const [systemStats, setSystemStats] = useState<any>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const [user, system] = await Promise.all([
      getUserStats(),
      getSystemStats()
    ])
    setUserStats(user)
    setSystemStats(system)
  }

  if (!account) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please connect your wallet</h1>
          <Link href="/" className="text-blue-600 hover:text-blue-800">
            Go back to homepage
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="flex justify-between items-start gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-500">
              {account?.slice(0, 6)}...{account?.slice(-4)}
            </p>
          </div>
          <button
            onClick={loadData}
            disabled={isLoading}
            className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* User Stats */}
        {userStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CreditCardIcon className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500">Credit Score</p>
                  <p className="text-2xl font-bold text-gray-900">{userStats.creditScore}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BanknotesIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500">Deposit Balance</p>
                  <p className="text-2xl font-bold text-gray-900">{userStats.depositBalance} ETH</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <ArrowTrendingUpIcon className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500">Max Loan Amount</p>
                  <p className="text-2xl font-bold text-gray-900">{userStats.maxLoanAmount} ETH</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <UserCircleIcon className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500">Active Loans</p>
                  <p className="text-2xl font-bold text-gray-900">{userStats.activeLoans}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Link
            href="/lend"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow group"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-green-600">
                  Lend Funds
                </h3>
                <p className="text-sm text-gray-500 mt-1">Deposit ETH to earn interest</p>
              </div>
              <ArrowDownTrayIcon className="w-8 h-8 text-gray-400 group-hover:text-green-600" />
            </div>
          </Link>

          <Link
            href="/borrow"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow group"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600">
                  Request Loan
                </h3>
                <p className="text-sm text-gray-500 mt-1">Get a micro-loan</p>
              </div>
              <PlusIcon className="w-8 h-8 text-gray-400 group-hover:text-blue-600" />
            </div>
          </Link>

          <Link
            href="/loans"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow group"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-yellow-600">
                  My Loans
                </h3>
                <p className="text-sm text-gray-500 mt-1">View loan history</p>
              </div>
              <CreditCardIcon className="w-8 h-8 text-gray-400 group-hover:text-yellow-600" />
            </div>
          </Link>

          <Link
            href="/credit"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow group"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-purple-600">
                  Credit Score
                </h3>
                <p className="text-sm text-gray-500 mt-1">View credit details</p>
              </div>
              <ArrowTrendingUpIcon className="w-8 h-8 text-gray-400 group-hover:text-purple-600" />
            </div>
          </Link>
        </div>

        {/* System Overview */}
        {systemStats && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">System Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{systemStats.totalBalance} ETH</div>
                <div className="text-sm text-gray-500 mt-1">Total Pool Balance</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-600">{systemStats.activeLoans}</div>
                <div className="text-sm text-gray-500 mt-1">Active Loans</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{systemStats.totalRepaid} ETH</div>
                <div className="text-sm text-gray-500 mt-1">Total Repaid</div>
              </div>
            </div>
          </div>
        )}

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow p-6 mt-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Your Activity</h2>
          {userStats && (
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b">
                <div>
                  <p className="font-medium text-gray-900">Total Borrowed</p>
                  <p className="text-sm text-gray-500">All time</p>
                </div>
                <div className="text-lg font-bold text-blue-600">
                  {userStats.totalBorrowed} ETH
                </div>
              </div>
              <div className="flex justify-between items-center py-3 border-b">
                <div>
                  <p className="font-medium text-gray-900">Total Repaid</p>
                  <p className="text-sm text-gray-500">All time</p>
                </div>
                <div className="text-lg font-bold text-green-600">
                  {userStats.totalRepaid} ETH
                </div>
              </div>
              <div className="flex justify-between items-center py-3 border-b">
                <div>
                  <p className="font-medium text-gray-900">Completed Loans</p>
                  <p className="text-sm text-gray-500">Successfully paid back</p>
                </div>
                <div className="text-lg font-bold text-green-600">
                  {userStats.completedLoans}
                </div>
              </div>
              <div className="flex justify-between items-center py-3">
                <div>
                  <p className="font-medium text-gray-900">Defaulted Loans</p>
                  <p className="text-sm text-gray-500">Failed to repay</p>
                </div>
                <div className="text-lg font-bold text-red-600">
                  {userStats.defaultedLoans}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
