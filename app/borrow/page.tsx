'use client'

import { useState } from 'react'
import { useWallet } from '@/components/WalletProvider'
import { useContract } from '@/components/ContractProvider'
import Link from 'next/link'
import { ArrowLeftIcon, InformationCircleIcon } from '@heroicons/react/24/outline'

export default function BorrowPage() {
  const { account } = useWallet()
  const { requestLoan, isLoading } = useContract()
  const [loanAmount, setLoanAmount] = useState('')
  const [loanDuration, setLoanDuration] = useState('30')
  const [loanPurpose, setLoanPurpose] = useState('')

  const handleRequestLoan = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!loanAmount || parseFloat(loanAmount) <= 0 || !loanPurpose) {
      return
    }
    await requestLoan(loanAmount, loanDuration, loanPurpose)
    setLoanAmount('')
    setLoanDuration('30')
    setLoanPurpose('')
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
            <h1 className="text-2xl font-bold text-gray-900">Request Loan</h1>
            <p className="text-sm text-gray-500">Ask for a micro-loan backed by on-chain credit scoring</p>
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <div className="flex">
            <InformationCircleIcon className="w-6 h-6 text-blue-600 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-blue-900 mb-2">How Loans Work</h3>
              <p className="text-blue-800">
                Request micro-loans for your business or personal needs. Build your credit score through timely repayments.
                Loans are funded by the community pool and automatically managed by smart contracts.
              </p>
            </div>
          </div>
        </div>

        {/* Loan Request Form */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="p-6">
            <form onSubmit={handleRequestLoan} className="space-y-6">
              <div>
                <label htmlFor="loanAmount" className="block text-sm font-medium text-gray-700 mb-2">
                  Loan Amount (ETH)
                </label>
                <input
                  type="number"
                  id="loanAmount"
                  step="0.001"
                  min="0.005"
                  max="10"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(e.target.value)}
                  className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.1"
                  required
                />
                <p className="mt-2 text-sm text-gray-500">
                  Minimum: 0.005 ETH | Maximum: 10 ETH
                </p>
              </div>

              <div>
                <label htmlFor="loanDuration" className="block text-sm font-medium text-gray-700 mb-2">
                  Loan Duration
                </label>
                <select
                  id="loanDuration"
                  value={loanDuration}
                  onChange={(e) => setLoanDuration(e.target.value)}
                  className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="30">30 days</option>
                  <option value="60">60 days</option>
                  <option value="90">90 days</option>
                  <option value="120">120 days</option>
                  <option value="180">180 days</option>
                </select>
                <p className="mt-2 text-sm text-gray-500">
                  Choose how long you need to repay the loan
                </p>
              </div>

              <div>
                <label htmlFor="loanPurpose" className="block text-sm font-medium text-gray-700 mb-2">
                  Loan Purpose
                </label>
                <textarea
                  id="loanPurpose"
                  rows={4}
                  value={loanPurpose}
                  onChange={(e) => setLoanPurpose(e.target.value)}
                  className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Describe how you plan to use the loan (e.g., business expansion, education, emergency expenses)"
                  required
                />
                <p className="mt-2 text-sm text-gray-500">
                  Be specific about your loan purpose to increase approval chances
                </p>
              </div>

              {/* Loan Summary */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Loan Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Loan Amount:</span>
                    <span className="font-medium">{loanAmount || '0'} ETH</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-medium">{loanDuration} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Interest Rate:</span>
                    <span className="font-medium text-blue-600">5% annual</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Estimated Total Repayment:</span>
                    <span className="font-medium text-green-600">
                      {loanAmount && loanDuration 
                        ? (parseFloat(loanAmount) * (1 + (0.05 * parseInt(loanDuration) / 365))).toFixed(6)
                        : '0'} ETH
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || !loanAmount || parseFloat(loanAmount) <= 0 || !loanPurpose}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Processing...' : 'Request Loan'}
              </button>
            </form>
          </div>
        </div>

        {/* Loan Guidelines */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Loan Guidelines</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-700 mb-3">Eligibility Requirements</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">+</span>
                  <span>Registered user with wallet</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">+</span>
                  <span>Minimum credit score of 100</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">+</span>
                  <span>No active loans exceeding limit</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">+</span>
                  <span>Good repayment history</span>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 mb-3">Repayment Terms</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">+</span>
                  <span>5% annual interest rate</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">+</span>
                  <span>7-day grace period</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">+</span>
                  <span>Partial payments allowed</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">+</span>
                  <span>Credit score impacts</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="font-medium text-yellow-900 mb-2">Important Notes</h4>
            <ul className="space-y-1 text-sm text-yellow-800">
              <li> Late payments will negatively affect your credit score</li>
              <li> Defaulted loans will significantly reduce your borrowing capacity</li>
              <li> Successful repayments will improve your credit score and increase loan limits</li>
              <li> All loan activity is recorded permanently on the blockchain</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
