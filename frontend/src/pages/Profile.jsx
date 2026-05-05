import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import contractAddresses from '../contracts.json';

const { Reputation } = contractAddresses.contracts;

const ReputationABI = [
  "function getReputationScore(address) view returns (uint256)",
  "function getPaymentHistory(address) view returns (tuple(uint256 timestamp, uint256 amount, bool onTime, string paymentType)[])",
  "function getPaymentStats(address) view returns (uint256, uint256, uint256, uint256)",
  "function getDaysSinceLastPayment(address) view returns (uint256)"
];

function Profile({ signer, account, translations, setCurrentView }) {
  const [reputationScore, setReputationScore] = useState(0);
  const [paymentStats, setPaymentStats] = useState({
    totalPayments: 0,
    onTimePayments: 0,
    missedPayments: 0,
    reputationScore: 0
  });
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadProfileData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const reputationContract = new ethers.Contract(Reputation, ReputationABI, signer);
      
      // Get reputation score
      const score = await reputationContract.getReputationScore(account);
      setReputationScore(score.toNumber());
      
      // Get payment statistics
      const stats = await reputationContract.getPaymentStats(account);
      setPaymentStats({
        totalPayments: stats[0].toNumber(),
        onTimePayments: stats[1].toNumber(),
        missedPayments: stats[2].toNumber(),
        reputationScore: stats[3].toNumber()
      });
      
      // Get payment history
      const history = await reputationContract.getPaymentHistory(account);
      const formattedHistory = history.map((payment) => ({
        timestamp: payment.timestamp.toNumber(),
        amount: ethers.utils.formatEther(payment.amount),
        onTime: payment.onTime,
        paymentType: payment.paymentType
      }));
      setPaymentHistory(formattedHistory.reverse()); // Most recent first
      
    } catch (error) {
      console.error('Error loading profile data:', error);
      setError(translations.errorLoadingProfile);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (signer && account) {
      loadProfileData();
    }
  }, [signer, account]);

  const getReputationColor = (score) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getReputationBadge = (score) => {
    if (score >= 90) return { text: translations.excellent, color: 'bg-green-100 text-green-800' };
    if (score >= 70) return { text: translations.good, color: 'bg-yellow-100 text-yellow-800' };
    return { text: translations.needsImprovement, color: 'bg-red-100 text-red-800' };
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleTimeString();
  };

  const getPaymentRate = () => {
    if (paymentStats.totalPayments === 0) return 0;
    return Math.round((paymentStats.onTimePayments / paymentStats.totalPayments) * 100);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const reputationBadge = getReputationBadge(reputationScore);

  return (
    <div className="px-4 py-6">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">{translations.profile}</h2>
        
        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-indigo-600">
                {account.slice(2, 4).toUpperCase()}
              </span>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900">{translations.userProfile}</h3>
              <p className="text-sm text-gray-500">{account}</p>
              <div className="flex items-center space-x-2 mt-2">
                <span className={`px-3 py-1 text-sm rounded-full ${reputationBadge.color}`}>
                  {reputationBadge.text}
                </span>
                <span className={`text-lg font-bold ${getReputationColor(reputationScore)}`}>
                  {reputationScore}/100
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-indigo-600">{paymentStats.totalPayments}</div>
            <div className="text-sm text-gray-500">{translations.totalPayments}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-green-600">{paymentStats.onTimePayments}</div>
            <div className="text-sm text-gray-500">{translations.onTimePayments}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-red-600">{paymentStats.missedPayments}</div>
            <div className="text-sm text-gray-500">{translations.missedPayments}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-blue-600">{getPaymentRate()}%</div>
            <div className="text-sm text-gray-500">{translations.onTimeRate}</div>
          </div>
        </div>

        {/* Reputation Progress */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">{translations.reputationProgress}</h3>
          <div className="mb-2">
            <div className="flex justify-between text-sm">
              <span>{translations.currentScore}</span>
              <span className="font-medium">{reputationScore}/100</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full ${
                  reputationScore >= 90 ? 'bg-green-500' :
                  reputationScore >= 70 ? 'bg-yellow-500' :
                  'bg-red-500'
                }`}
                style={{ width: `${reputationScore}%` }}
              ></div>
            </div>
          </div>
          <div className="text-sm text-gray-600">
            <p>• {translations.reputationTip1}</p>
            <p>• {translations.reputationTip2}</p>
            <p>• {translations.reputationTip3}</p>
          </div>
        </div>

        {/* Payment History */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">{translations.paymentHistory}</h3>
          </div>
          <div className="p-6">
            {paymentHistory.length === 0 ? (
              <p className="text-gray-500 text-center py-4">{translations.noPaymentHistory}</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {translations.date}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {translations.type}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {translations.amount}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {translations.status}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paymentHistory.map((payment, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div>{formatDate(payment.timestamp)}</div>
                          <div className="text-gray-500">{formatTime(payment.timestamp)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            payment.paymentType === 'equb' 
                              ? 'bg-indigo-100 text-indigo-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {payment.paymentType === 'equb' ? translations.equb : translations.iddir}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {payment.amount} ETH
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            payment.onTime 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {payment.onTime ? translations.onTime : translations.late}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900 mb-4">{translations.quickActions}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => setCurrentView('create')}
              className="px-4 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-left"
            >
              <div className="font-medium">{translations.createNewGroup}</div>
              <div className="text-sm opacity-90">{translations.startNewGroup}</div>
            </button>
            <button
              onClick={() => setCurrentView('groups')}
              className="px-4 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 text-left"
            >
              <div className="font-medium">{translations.manageGroups}</div>
              <div className="text-sm opacity-90">{translations.viewAndManageGroups}</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
