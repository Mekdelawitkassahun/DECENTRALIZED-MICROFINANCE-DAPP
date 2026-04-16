'use client'

import { useEffect, useState } from 'react'
import { useWallet } from '@/components/WalletProvider'
import { useContract } from '@/components/ContractProvider'
import Link from 'next/link'
import { ArrowLeftIcon, CreditCardIcon, ClockIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'

interface Loan {
  id: string
  borrower: string
  amount: string
  interestRate: string
  duration: string
  startTime: string
  endTime: string
  amountRepaid: string
  totalOwed: string
  status: number
  purpose: string
  created: string
}

export default function LoansPage() {
  const { account } = useWallet()
  const { getUserLoans, getLoanDetails, repayLoan, isLoading } = useContract()
  const [loans, setLoans] = useState<Loan[]>([])
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null)
  const [repayAmount, setRepayAmount] = useState('')

  useEffect(() => {
    if (account) {
      loadUserLoans()
    }
  }, [account])

  const loadUserLoans = async () => {
    const loanIds = await getUserLoans()
    // Load details for each loan
    const loanDetails = await Promise.all(
      loanIds.map(async (loanId) => {
        const details = await getLoanDetails(loanId)
        return details
      })
    )
    
    setLoans(loanDetails.filter(Boolean) as Loan[])
  }

  const getStatusColor = (status: number) => {
    switch (status) {
      case 0: return 'bg-yellow-100 text-yellow-800' // Requested
      case 1: return 'bg-green-100 text-green-800' // Active
      case 2: return 'bg-blue-100 text-blue-800' // Repaying
      case 3: return 'bg-emerald-100 text-emerald-800' // Completed
      case 4: return 'bg-red-100 text-red-800' // Defaulted
      case 5: return 'bg-gray-100 text-gray-800' // Cancelled
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: number) => {
    switch (status) {
      case 0: return 'Requested'
      case 1: return 'Active'
      case 2: return 'Repaying'
      case 3: return 'Completed'
      case 4: return 'Defaulted'
      case 5: return 'Cancelled'
      default: return 'Unknown'
    }
  }

  const getStatusIcon = (status: number) => {
    switch (status) {
      case 0: return <ClockIcon className="w-4 h-4" />
      case 1: return <CreditCardIcon className="w-4 h-4" />
      case 2: return <CreditCardIcon className="w-4 h-4" />
      case 3: return <CheckCircleIcon className="w-4 h-4" />
      case 4: return <XCircleIcon className="w-4 h-4" />
      case 5: return <XCircleIcon className="w-4 h-4" />
      default: return <ClockIcon className="w-4 h-4" />
    }
  }

  const handleRepay = async (loanId: string) => {
    if (!repayAmount || parseFloat(repayAmount) <= 0) {
      return
    }
    await repayLoan(loanId, repayAmount)
    setRepayAmount('')
    setSelectedLoan(null)
    loadUserLoans()
  }

  const calculateProgress = (loan: Loan) => {
    if (parseFloat(loan.totalOwed) === 0) return 0
    return (parseFloat(loan.amountRepaid) / parseFloat(loan.totalOwed)) * 100
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-white/70 border border-gray-200 hover:bg-white transition-colors"
            aria-label="Back to dashboard"
          >
            <ArrowLeftIcon className="w-5 h-5 text-gray-700" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Loans</h1>
            <p className="text-sm text-gray-500">Track repayment progress and history</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-gray-900">{loans.length}</div>
            <div className="text-sm text-gray-500">Total Loans</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-green-600">
              {loans.filter(l => l.status === 3).length}
            </div>
            <div className="text-sm text-gray-500">Completed</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-blue-600">
              {loans.filter(l => l.status === 1 || l.status === 2).length}
            </div>
            <div className="text-sm text-gray-500">Active</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-red-600">
              {loans.filter(l => l.status === 4).length}
            </div>
            <div className="text-sm text-gray-500">Defaulted</div>
          </div>
        </div>

        {/* Loans List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Loan History</h2>
          </div>
          
          {loans.length === 0 ? (
            <div className="p-8 text-center">
              <CreditCardIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No loans yet</h3>
              <p className="text-gray-500 mb-4">You have not taken any loans yet.</p>
              <Link
                href="/borrow"
                className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Request Your First Loan
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {loans.map((loan) => (
                <div key={loan.id} className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        Loan #{loan.id}
                      </h3>
                      <p className="text-sm text-gray-500">{loan.purpose}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(loan.status)}`}>
                        {getStatusIcon(loan.status)}
                        <span className="ml-1">{getStatusText(loan.status)}</span>
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-500">Loan Amount:</span>
                        <span className="font-medium">{loan.amount} ETH</span>
                      </div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-500">Total Owed:</span>
                        <span className="font-medium">{loan.totalOwed} ETH</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Interest Rate:</span>
                        <span className="font-medium">{loan.interestRate} bps</span>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-500">Repaid:</span>
                        <span className="font-medium text-green-600">{loan.amountRepaid} ETH</span>
                      </div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-500">Remaining:</span>
                        <span className="font-medium text-blue-600">
                          {(parseFloat(loan.totalOwed) - parseFloat(loan.amountRepaid)).toFixed(6)} ETH
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Duration:</span>
                        <span className="font-medium">{parseInt(loan.duration) / 86400} days</span>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-500">Repayment Progress</span>
                      <span className="font-medium">{calculateProgress(loan).toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${calculateProgress(loan)}%` }}
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {(loan.status === 1 || loan.status === 2) && (
                    <div className="flex space-x-4">
                      <button
                        onClick={() => setSelectedLoan(loan)}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Make Repayment
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Repayment Modal */}
      {selectedLoan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Repay Loan #{selectedLoan.id}
            </h3>
            
            <div className="mb-4">
              <div className="text-sm text-gray-500 mb-2">
                Remaining Balance: {(parseFloat(selectedLoan.totalOwed) - parseFloat(selectedLoan.amountRepaid)).toFixed(6)} ETH
              </div>
              <input
                type="number"
                step="0.001"
                min="0.001"
                max={(parseFloat(selectedLoan.totalOwed) - parseFloat(selectedLoan.amountRepaid)).toString()}
                value={repayAmount}
                onChange={(e) => setRepayAmount(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Enter amount to repay"
              />
            </div>

            <div className="flex space-x-4">
              <button
                onClick={() => handleRepay(selectedLoan.id)}
                disabled={isLoading || !repayAmount || parseFloat(repayAmount) <= 0}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Processing...' : 'Repay'}
              </button>
              <button
                onClick={() => {
                  setSelectedLoan(null)
                  setRepayAmount('')
                }}
                className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
