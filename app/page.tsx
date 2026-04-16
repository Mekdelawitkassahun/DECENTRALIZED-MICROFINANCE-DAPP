'use client'

import { useEffect, useState } from 'react'
import { useWallet } from '@/components/WalletProvider'
import { useContract } from '@/components/ContractProvider'
import Link from 'next/link'
import { ArrowRightIcon, BanknotesIcon, ShieldCheckIcon, UsersIcon } from '@heroicons/react/24/outline'

export default function HomePage() {
  const { isConnected, connectWallet, account } = useWallet()
  const { getSystemStats } = useContract()
  const [systemStats, setSystemStats] = useState<any>(null)

  useEffect(() => {
    if (isConnected) {
      loadSystemStats()
    }
  }, [isConnected])

  const loadSystemStats = async () => {
    try {
      const stats = await getSystemStats()
      if (stats) {
        setSystemStats(stats)
      }
    } catch (error) {
      console.error("Error loading system stats:", error)
    }
  }

  return (
    <div>
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-green-600 via-yellow-500 to-red-600">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-32">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Ethiopian Microfinance
              <span className="block text-3xl md:text-4xl mt-2 text-yellow-300">
                Decentralized lending for all
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto">
              Inspired by traditional Ethiopian iqub and idir systems, built on blockchain for transparency and trust.
              Access micro-loans, build credit history, and participate in community finance.
            </p>
            
            {!isConnected ? (
              <button
                onClick={() => connectWallet()}
                className="bg-white text-green-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-yellow-100 transition-all transform hover:scale-105 shadow-xl"
              >
                Connect Wallet to Get Started
                <ArrowRightIcon className="inline-block w-5 h-5 ml-2" />
              </button>
            ) : (
              <div className="flex flex-col items-center space-y-4">
                <p className="text-white text-lg">
                  Connected as: <span className="text-yellow-300 font-mono">{account?.slice(0, 6)}...{account?.slice(-4)}</span>
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    href="/dashboard"
                    className="bg-yellow-400 text-green-800 px-12 py-4 rounded-lg font-bold text-xl hover:bg-yellow-300 transition-all transform hover:scale-105 shadow-xl"
                  >
                    Go to Dashboard
                  </Link>
                  <button
                    onClick={() => connectWallet(true)}
                    className="bg-white/20 backdrop-blur-sm text-white border border-white/40 px-8 py-4 rounded-lg font-bold text-lg hover:bg-white/30 transition-all transform hover:scale-105 shadow-xl"
                  >
                    Change Wallet
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* System Stats */}
      {systemStats && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-green-500">
              <div className="text-green-600 text-3xl font-bold">{systemStats.totalBalance} ETH</div>
              <div className="text-gray-600 mt-2">Total Pool Balance</div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-yellow-500">
              <div className="text-yellow-600 text-3xl font-bold">{systemStats.activeLoans}</div>
              <div className="text-gray-600 mt-2">Active Loans</div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-red-500">
              <div className="text-red-600 text-3xl font-bold">{systemStats.totalRepaid} ETH</div>
              <div className="text-gray-600 mt-2">Total Repaid</div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-blue-500">
              <div className="text-blue-600 text-3xl font-bold">{systemStats.totalUsers}</div>
              <div className="text-gray-600 mt-2">Total Users</div>
            </div>
          </div>
        </div>
      )}

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-xl text-gray-600">
            Simple, transparent, and community-focused financial services
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow">
            <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-6">
              <BanknotesIcon className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
              Deposit & Lend
            </h3>
            <p className="text-gray-600 text-center">
              Deposit ETH into the community lending pool and earn interest as borrowers repay their loans.
              Your funds help others grow their businesses and improve their lives.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow">
            <div className="bg-yellow-100 rounded-full p-4 w-16 h-16 mx-auto mb-6">
              <UsersIcon className="w-8 h-8 text-yellow-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
              Borrow & Build Credit
            </h3>
            <p className="text-gray-600 text-center">
              Request micro-loans for your business or personal needs. Build your credit score through
              timely repayments and unlock larger loan amounts.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow">
            <div className="bg-red-100 rounded-full p-4 w-16 h-16 mx-auto mb-6">
              <ShieldCheckIcon className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
              Transparent & Secure
            </h3>
            <p className="text-gray-600 text-center">
              All transactions are recorded on the blockchain. No hidden fees, no intermediaries.
              Smart contracts ensure fairness and automatic execution.
            </p>
          </div>
        </div>
      </div>

      {/* Ethiopian Context Section */}
      <div className="bg-gradient-to-r from-green-50 to-yellow-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Inspired by Ethiopian Traditions
              </h2>
              <div className="space-y-4 text-lg text-gray-700">
                <p>
                  <strong>Iqub:</strong> Traditional rotating savings associations where community members
                  pool money and take turns receiving loans.
                </p>
                <p>
                  <strong>Idir:</strong> Community-based insurance systems that provide support during
                  difficult times.
                </p>
                <p>
                  Our DApp modernizes these trusted systems using blockchain technology, making them
                  accessible to anyone with a smartphone and internet connection.
                </p>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Key Benefits</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">+</span>
                  <span>Low minimum deposits and loans</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">+</span>
                  <span>No bank account required</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">+</span>
                  <span>Build credit history on-chain</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">+</span>
                  <span>Community-based trust system</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">+</span>
                  <span>Transparent and fair interest rates</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Status Overview Footer */}
      <div className="bg-gray-900 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            System Status
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="text-3xl font-bold text-green-400">Live</div>
              <div className="text-sm text-gray-300 mt-2">Smart Contract</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="text-3xl font-bold text-blue-400">Sepolia</div>
              <div className="text-sm text-gray-300 mt-2">Network</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="text-3xl font-bold text-yellow-400">Active</div>
              <div className="text-sm text-gray-300 mt-2">Frontend</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="text-3xl font-bold text-purple-400">Verified</div>
              <div className="text-sm text-gray-300 mt-2">DApp</div>
            </div>
          </div>
          {!isConnected ? (
            <button
              onClick={() => connectWallet()}
              className="bg-yellow-400 text-gray-900 px-8 py-4 rounded-lg font-bold text-lg hover:bg-yellow-300 transition-all transform hover:scale-105 shadow-xl"
            >
              Connect Wallet to Get Started
            </button>
          ) : (
            <Link
              href="/dashboard"
              className="inline-block bg-yellow-400 text-gray-900 px-8 py-4 rounded-lg font-bold text-lg hover:bg-yellow-300 transition-all transform hover:scale-105"
            >
              Go to Dashboard
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
