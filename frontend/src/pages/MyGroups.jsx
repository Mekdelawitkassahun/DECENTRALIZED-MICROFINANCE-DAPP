import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import contractAddresses from '../contracts.json';

const { SimpleEqub, SimpleIddir } = contractAddresses.contracts;

const SimpleEqubABI = [
  "function getUserGroups(address) view returns (uint256[])",
  "function getGroupInfo(uint256) view returns (address[], uint256, uint256, uint256, uint256, bool)",
  "function getGroupMembers(uint256) view returns (address[])",
  "function payFee(uint256) external payable"
];

const SimpleIddirABI = [
  "function getUserGroups(address) view returns (uint256[])",
  "function getGroupInfo(uint256) view returns (address[], uint256, uint256, bool)",
  "function getGroupMembers(uint256) view returns (address[])",
  "function payMonthlyFee(uint256) external payable",
  "function requestPayout(uint256, string, uint256) external",
  "function voteOnPayout(uint256, bool) external",
  "function getRequestInfo(uint256) view returns (address, string, uint256, uint256, uint256, uint256, bool, bool)",
  "function groupRequests(uint256) view returns (uint256[])"
];

function MyGroups({ signer, account, translations, setCurrentView }) {
  const [activeTab, setActiveTab] = useState('equb');
  const [equbGroups, setEqubGroups] = useState([]);
  const [iddirGroups, setIddirGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (signer && account) {
      loadGroups();
    }
  }, [signer, account, loadGroups]);

  const loadGroups = async () => {
    try {
      setLoading(true);
      setError('');
      
      if (activeTab === 'equb') {
        const equbContract = new ethers.Contract(SimpleEqub, SimpleEqubABI, signer);
        const userGroups = await equbContract.getUserGroups(account);
        const groupsData = await Promise.all(
          userGroups.map(async (groupId) => {
            const groupInfo = await equbContract.getGroupInfo(groupId);
            return {
              id: groupId.toNumber(),
              members: groupInfo[0],
              fee: ethers.utils.formatEther(groupInfo[1]),
              cycleDuration: groupInfo[2].toNumber(),
              lastPayout: groupInfo[3].toNumber(),
              currentIndex: groupInfo[4].toNumber(),
              active: groupInfo[5],
              type: 'equb'
            };
          })
        );
        setEqubGroups(groupsData);
      } else {
        const iddirContract = new ethers.Contract(SimpleIddir, SimpleIddirABI, signer);
        const userGroups = await iddirContract.getUserGroups(account);
        const groupsData = await Promise.all(
          userGroups.map(async (groupId) => {
            const groupInfo = await iddirContract.getGroupInfo(groupId);
            const requests = await iddirContract.groupRequests(groupId);
            const requestsData = await Promise.all(
              requests.map(async (requestId) => {
                const requestInfo = await iddirContract.getRequestInfo(requestId);
                return {
                  id: requestId.toNumber(),
                  requester: requestInfo[0],
                  familyMemberName: requestInfo[1],
                  amount: ethers.utils.formatEther(requestInfo[2]),
                  deadline: requestInfo[3].toNumber(),
                  yesVotes: requestInfo[4].toNumber(),
                  noVotes: requestInfo[5].toNumber(),
                  approved: requestInfo[6],
                  paid: requestInfo[7]
                };
              })
            );
            return {
              id: groupId.toNumber(),
              members: groupInfo[0],
              monthlyFee: ethers.utils.formatEther(groupInfo[1]),
              maxPayout: ethers.utils.formatEther(groupInfo[2]),
              active: groupInfo[3],
              requests: requestsData
            };
          })
        );
        setIddirGroups(groupsData);
      }
    } catch (error) {
      console.error('Error loading groups:', error);
      setError(translations.errorLoadingGroups);
    } finally {
      setLoading(false);
    }
  };

  const payEqubFee = async (groupId, fee) => {
    try {
      setActionLoading(true);
      setError('');
      setSuccess('');
      
      const equbContract = new ethers.Contract(SimpleEqub, SimpleEqubABI, signer);
      const tx = await equbContract.payFee(groupId, { value: ethers.utils.parseEther(fee) });
      await tx.wait();
      
      setSuccess(translations.paymentSuccessful);
      loadGroups();
    } catch (error) {
      console.error('Error paying fee:', error);
      setError(translations.paymentError + ': ' + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const payIddirFee = async (groupId, fee) => {
    try {
      setActionLoading(true);
      setError('');
      setSuccess('');
      
      const iddirContract = new ethers.Contract(SimpleIddir, SimpleIddirABI, signer);
      const tx = await iddirContract.payMonthlyFee(groupId, { value: ethers.utils.parseEther(fee) });
      await tx.wait();
      
      setSuccess(translations.paymentSuccessful);
      loadGroups();
    } catch (error) {
      console.error('Error paying fee:', error);
      setError(translations.paymentError + ': ' + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const voteOnPayout = async (requestId, approve) => {
    try {
      setActionLoading(true);
      setError('');
      setSuccess('');
      
      const iddirContract = new ethers.Contract(SimpleIddir, SimpleIddirABI, signer);
      const tx = await iddirContract.voteOnPayout(requestId, approve);
      await tx.wait();
      
      setSuccess(translations.voteSuccessful);
      loadGroups();
    } catch (error) {
      console.error('Error voting:', error);
      setError(translations.voteError + ': ' + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  const currentGroups = activeTab === 'equb' ? equbGroups : iddirGroups;

  return (
    <div className="px-4 py-6">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">{translations.myGroups}</h2>
        
        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('equb')}
                className={`py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === 'equb'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {translations.equb} ({equbGroups.length})
              </button>
              <button
                onClick={() => setActiveTab('iddir')}
                className={`py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === 'iddir'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {translations.iddir} ({iddirGroups.length})
              </button>
            </nav>
          </div>
        </div>

        {/* Error and Success Messages */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-700">{error}</p>
          </div>
        )}
        
        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
            <p className="text-green-700">{success}</p>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : currentGroups.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500 mb-4">
              {activeTab === 'equb' ? translations.noEqubGroups : translations.noIddirGroups}
            </p>
            <button
              onClick={() => setCurrentView('create')}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              {translations.createFirstGroup}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {currentGroups.map((group) => (
              <div key={group.id} className="bg-white rounded-lg shadow">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {activeTab === 'equb' ? translations.equb : translations.iddir} #{group.id}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {group.members.length} {translations.members}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      group.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {group.active ? translations.active : translations.inactive}
                    </span>
                  </div>

                  {/* Group Details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">
                        {activeTab === 'equb' ? translations.cycleFee : translations.monthlyFee}:
                      </span>
                      <span className="text-sm font-medium">
                        {activeTab === 'equb' ? group.fee : group.monthlyFee} ETH
                      </span>
                    </div>
                    {activeTab === 'equb' && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">{translations.cycleDuration}:</span>
                        <span className="text-sm font-medium">{group.cycleDuration / 86400} {translations.days}</span>
                      </div>
                    )}
                    {activeTab === 'iddir' && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">{translations.maxPayout}:</span>
                        <span className="text-sm font-medium">{group.maxPayout} ETH</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="border-t pt-4">
                    {activeTab === 'equb' ? (
                      <button
                        onClick={() => payEqubFee(group.id, group.fee)}
                        disabled={actionLoading || !group.active}
                        className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                      >
                        {actionLoading ? translations.processing : translations.payFee}
                      </button>
                    ) : (
                      <div className="space-y-2">
                        <button
                          onClick={() => payIddirFee(group.id, group.monthlyFee)}
                          disabled={actionLoading || !group.active}
                          className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                        >
                          {actionLoading ? translations.processing : translations.payMonthlyFee}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Iddir Payout Requests */}
                  {activeTab === 'iddir' && group.requests && group.requests.length > 0 && (
                    <div className="mt-4 border-t pt-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">{translations.payoutRequests}</h4>
                      <div className="space-y-2">
                        {group.requests.map((request) => (
                          <div key={request.id} className="border rounded p-3">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <p className="text-sm font-medium">{request.familyMemberName}</p>
                                <p className="text-xs text-gray-500">
                                  {translations.amount}: {request.amount} ETH
                                </p>
                                <p className="text-xs text-gray-500">
                                  {translations.deadline}: {formatTimestamp(request.deadline)}
                                </p>
                              </div>
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                request.approved ? 'bg-green-100 text-green-800' :
                                request.paid ? 'bg-blue-100 text-blue-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {request.approved ? translations.approved :
                                 request.paid ? translations.paid :
                                 translations.pending}
                              </span>
                            </div>
                            {!request.paid && !request.approved && (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => voteOnPayout(request.id, true)}
                                  disabled={actionLoading}
                                  className="flex-1 px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
                                >
                                  {translations.yes} ({request.yesVotes})
                                </button>
                                <button
                                  onClick={() => voteOnPayout(request.id, false)}
                                  disabled={actionLoading}
                                  className="flex-1 px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                                >
                                  {translations.no} ({request.noVotes})
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyGroups;
