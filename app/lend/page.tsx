'use client'

import { useState } from 'react'
import { useWallet } from '@/components/WalletProvider'
import { useContract } from '@/components/ContractProvider'
import Link from 'next/link'
import { ArrowLeftIcon, BanknotesIcon, InformationCircleIcon } from '@heroicons/react/24/outline'

export default function LendPage() {
  const { account } = useWallet()
  const { depositFunds, withdrawFunds, isLoading } = useContract()
  const [depositAmount, setDepositAmount] = useState('')
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw'>('deposit')

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      return
    }
    await depositFunds(depositAmount)
    setDepositAmount('')
  }

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      return
    }
    await withdrawFunds(withdrawAmount)
    setWithdrawAmount('')
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-white/70 border border-gray-200 hover:bg-white transition-colors"
            aria-label="Back to dashboard"
          >
            <ArrowLeftIcon className="w-5 h-5 text-gray-700" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Lend Funds</h1>
            <p className="text-sm text-gray-500">Deposit ETH into the community lending pool</p>
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <div className="flex">
            <InformationCircleIcon className="w-6 h-6 text-blue-600 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-blue-900 mb-2">How Lending Works</h3>
              <p className="text-blue-800">
                When you deposit ETH into the lending pool, your funds are used to provide micro-loans to borrowers.
                You earn interest as borrowers repay their loans. All transactions are transparent and managed by smart contracts.
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('deposit')}
                className={`py-4 px-6 text-sm font-medium border-b-2 ${
                  activeTab === 'deposit'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Deposit Funds
              </button>
              <button
                onClick={() => setActiveTab('withdraw')}
                className={`py-4 px-6 text-sm font-medium border-b-2 ${
                  activeTab === 'withdraw'
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Withdraw Funds
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'deposit' ? (
              <form onSubmit={handleDeposit} className="space-y-6">
                <div>
                  <label htmlFor="depositAmount" className="block text-sm font-medium text-gray-700 mb-2">
                    Deposit Amount (ETH)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <BanknotesIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="number"
                      id="depositAmount"
                      step="0.001"
                      min="0.001"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="0.1"
                      required
                    />
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    Minimum deposit: 0.001 ETH
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Deposit Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Amount to deposit:</span>
                      <span className="font-medium">{depositAmount || '0'} ETH</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Expected annual return:</span>
                      <span className="font-medium text-green-600">~5%</span>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !depositAmount || parseFloat(depositAmount) <= 0}
                  className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? 'Processing...' : 'Deposit Funds'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleWithdraw} className="space-y-6">
                <div>
                  <label htmlFor="withdrawAmount" className="block text-sm font-medium text-gray-700 mb-2">
                    Withdraw Amount (ETH)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <BanknotesIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="number"
                      id="withdrawAmount"
                      step="0.001"
                      min="0.001"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      placeholder="0.1"
                      required
                    />
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    You can only withdraw funds that are not currently lent out
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Withdrawal Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Amount to withdraw:</span>
                      <span className="font-medium">{withdrawAmount || '0'} ETH</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Network fee:</span>
                      <span className="font-medium">~0.001 ETH</span>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !withdrawAmount || parseFloat(withdrawAmount) <= 0}
                  className="w-full bg-red-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? 'Processing...' : 'Withdraw Funds'}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Pool Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Lending Pool Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-700 mb-3">Key Features</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">+</span>
                  <span>5% annual interest rate</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">+</span>
                  <span>No lock-up period</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">+</span>
                  <span>Transparent on-chain tracking</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">+</span>
                  <span>Community-based lending</span>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 mb-3">Risk Factors</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <span className="text-yellow-600 mr-2">!</span>
                  <span>Smart contract risk</span>
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-600 mr-2">!</span>
                  <span>Borrower default risk</span>
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-600 mr-2">!</span>
                  <span>Market volatility</span>
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-600 mr-2">!</span>
                  <span>Liquidity constraints</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
