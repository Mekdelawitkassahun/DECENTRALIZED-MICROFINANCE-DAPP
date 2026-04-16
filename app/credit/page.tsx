'use client'

import { useEffect, useState } from 'react'
import { useWallet } from '@/components/WalletProvider'
import { useContract } from '@/components/ContractProvider'
import Link from 'next/link'
import { ArrowLeftIcon, ArrowTrendingUpIcon, ShieldCheckIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'

export default function CreditPage() {
  const { account } = useWallet()
  const { getUserStats, isLoading } = useContract()
  const [userStats, setUserStats] = useState<any>(null)

  useEffect(() => {
    if (account) {
      loadUserStats()
    }
  }, [account])

  const loadUserStats = async () => {
    const stats = await getUserStats()
    if (stats) {
      setUserStats(stats)
    }
  }

  const getCreditTier = (score: number) => {
    if (score >= 800) return { tier: 'Excellent', color: 'text-emerald-600', bg: 'bg-emerald-100' }
    if (score >= 600) return { tier: 'Good', color: 'text-blue-600', bg: 'bg-blue-100' }
    if (score >= 400) return { tier: 'Fair', color: 'text-yellow-600', bg: 'bg-yellow-100' }
    if (score >= 200) return { tier: 'Poor', color: 'text-orange-600', bg: 'bg-orange-100' }
    return { tier: 'Very Poor', color: 'text-red-600', bg: 'bg-red-100' }
  }

  const getScoreColor = (score: number) => {
    if (score >= 800) return 'bg-emerald-500'
    if (score >= 600) return 'bg-blue-500'
    if (score >= 400) return 'bg-yellow-500'
    if (score >= 200) return 'bg-orange-500'
    return 'bg-red-500'
  }

  const getScoreProgress = (score: number) => {
    return (score / 1000) * 100
  }

  const getImprovementTips = (score: number) => {
    if (score >= 800) {
      return [
        'Maintain your excellent repayment history',
        'Continue to borrow and repay responsibly',
        'Help other community members by lending funds'
      ]
    } else if (score >= 600) {
      return [
        'Consistently repay loans on time',
        'Avoid late payments',
        'Consider smaller loans to build more history'
      ]
    } else if (score >= 400) {
      return [
        'Focus on timely repayments',
        'Start with smaller loan amounts',
        'Build a consistent repayment pattern'
      ]
    } else {
      return [
        'Start with small loans and repay them quickly',
        'Always make payments on time',
        'Avoid taking multiple loans simultaneously'
      ]
    }
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

  if (!userStats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading credit information...</p>
        </div>
      </div>
    )
  }

  const creditTier = getCreditTier(parseInt(userStats.creditScore))
  const improvementTips = getImprovementTips(parseInt(userStats.creditScore))

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
            <h1 className="text-2xl font-bold text-gray-900">Credit Score</h1>
            <p className="text-sm text-gray-500">Your on-chain creditworthiness & improvement tips</p>
          </div>
        </div>

        {/* Credit Score Card */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Your Credit Score</h2>
            <p className="text-gray-600">Based on your borrowing and repayment history</p>
          </div>

          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="w-48 h-48 rounded-full border-8 border-gray-200 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-5xl font-bold text-gray-900">{userStats.creditScore}</div>
                  <div className={`text-sm font-medium ${creditTier.color} mt-2`}>
                    {creditTier.tier}
                  </div>
                </div>
              </div>
              {/* Progress ring */}
              <svg className="absolute inset-0 w-48 h-48 transform -rotate-90">
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-gray-200"
                />
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 88}`}
                  strokeDashoffset={`${2 * Math.PI * 88 * (1 - getScoreProgress(parseInt(userStats.creditScore)) / 100)}`}
                  className={`${getScoreColor(parseInt(userStats.creditScore))} transition-all duration-1000`}
                />
              </svg>
            </div>
          </div>

          {/* Credit Tiers */}
          <div className="grid grid-cols-5 gap-2 mb-8">
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1">300</div>
              <div className="h-2 bg-red-500 rounded-full"></div>
              <div className="text-xs text-gray-500 mt-1">Poor</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1">500</div>
              <div className="h-2 bg-orange-500 rounded-full"></div>
              <div className="text-xs text-gray-500 mt-1">Fair</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1">650</div>
              <div className="h-2 bg-yellow-500 rounded-full"></div>
              <div className="text-xs text-gray-500 mt-1">Good</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1">750</div>
              <div className="h-2 bg-blue-500 rounded-full"></div>
              <div className="text-xs text-gray-500 mt-1">Very Good</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1">850</div>
              <div className="h-2 bg-emerald-500 rounded-full"></div>
              <div className="text-xs text-gray-500 mt-1">Excellent</div>
            </div>
          </div>

          {/* Current Tier Badge */}
          <div className={`inline-flex items-center px-4 py-2 rounded-full ${creditTier.bg} ${creditTier.color} font-medium mb-6`}>
            <ShieldCheckIcon className="w-5 h-5 mr-2" />
            {creditTier.tier} Credit Score
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Borrowing History</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-500">Total Borrowed:</span>
                <span className="font-medium">{userStats.totalBorrowed} ETH</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Total Repaid:</span>
                <span className="font-medium text-green-600">{userStats.totalRepaid} ETH</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Active Loans:</span>
                <span className="font-medium">{userStats.activeLoans}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Completed Loans:</span>
                <span className="font-medium text-green-600">{userStats.completedLoans}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Defaulted Loans:</span>
                <span className="font-medium text-red-600">{userStats.defaultedLoans}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Credit Benefits</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-500">Current Max Loan:</span>
                <span className="font-medium text-blue-600">{userStats.maxLoanAmount} ETH</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Interest Rate:</span>
                <span className="font-medium">5% annually</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Trust Level:</span>
                <span className={`font-medium ${creditTier.color}`}>
                  {parseInt(userStats.creditScore) >= 600 ? 'High' : parseInt(userStats.creditScore) >= 400 ? 'Medium' : 'Low'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Pool Access:</span>
                <span className="font-medium text-green-600">Full</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Community Status:</span>
                <span className={`font-medium ${creditTier.color}`}>
                  {parseInt(userStats.creditScore) >= 800 ? 'Trusted Member' : 
                   parseInt(userStats.creditScore) >= 600 ? 'Reliable Borrower' : 
                   parseInt(userStats.creditScore) >= 400 ? 'Building Credit' : 'New Member'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Improvement Tips */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <ArrowTrendingUpIcon className="w-5 h-5 mr-2 text-blue-600" />
            How to Improve Your Credit Score
          </h3>
          <div className="space-y-3">
            {improvementTips.map((tip, index) => (
              <div key={index} className="flex items-start">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mr-3 mt-0.5">
                  <span className="text-blue-600 text-xs font-medium">{index + 1}</span>
                </div>
                <p className="text-gray-700">{tip}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Warning for Low Credit */}
        {parseInt(userStats.creditScore) < 400 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <div className="flex">
              <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600 mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-yellow-900 mb-2">Credit Building Opportunity</h3>
                <p className="text-yellow-800 mb-4">
                  Your credit score is still developing. Start with smaller loans and repay them quickly to build a strong credit history. 
                  Consistent, timely repayments will significantly improve your score and access to larger loans.
                </p>
                <Link
                  href="/borrow"
                  className="inline-block bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors"
                >
                  Start Building Credit
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Success Message for High Credit */}
        {parseInt(userStats.creditScore) >= 800 && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6">
            <div className="flex">
              <ShieldCheckIcon className="w-6 h-6 text-emerald-600 mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-emerald-900 mb-2">Excellent Credit Score!</h3>
                <p className="text-emerald-800 mb-4">
                  Congratulations! You have achieved an excellent credit score through responsible borrowing and timely repayments. 
                  You now have access to the maximum loan amounts and are considered a trusted member of the community.
                </p>
                <Link
                  href="/lend"
                  className="inline-block bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  Become a Lender
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
