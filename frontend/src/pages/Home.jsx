import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import contractAddresses from '../contracts.json';

const { SimpleEqub, SimpleIddir, Reputation } = contractAddresses.contracts;

const SimpleEqubABI = [
  "function getUserGroups(address) view returns (uint256[])",
  "function getGroupInfo(uint256) view returns (address[], uint256, uint256, uint256, uint256, bool)",
  "function getGroupMembers(uint256) view returns (address[])"
];

const SimpleIddirABI = [
  "function getUserGroups(address) view returns (uint256[])",
  "function getGroupInfo(uint256) view returns (address[], uint256, uint256, bool)",
  "function getGroupMembers(uint256) view returns (address[])"
];

const ReputationABI = [
  "function getReputationScore(address) view returns (uint256)",
  "function getPaymentStats(address) view returns (uint256, uint256, uint256, uint256)"
];

function Home({ signer, account, translations, setCurrentView }) {
  const [balance, setBalance] = useState('0');
  const [equbGroups, setEqubGroups] = useState([]);
  const [iddirGroups, setIddirGroups] = useState([]);
  const [reputationScore, setReputationScore] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Get ETH balance
      const balance = await signer.getBalance();
      setBalance(ethers.utils.formatEther(balance));

      // Load reputation score
      try {
        const reputationContract = new ethers.Contract(Reputation, ReputationABI, signer);
        const score = await reputationContract.getReputationScore(account);
        setReputationScore(score.toNumber());
      } catch (error) {
        console.error('Error loading reputation:', error);
      }

      // Load Equb groups
      try {
        const equbContract = new ethers.Contract(SimpleEqub, SimpleEqubABI, signer);
        const userEqubGroups = await equbContract.getUserGroups(account);
        const groupsData = await Promise.all(
          userEqubGroups.map(async (groupId) => {
            const groupInfo = await equbContract.getGroupInfo(groupId);
            return {
              id: groupId.toNumber(),
              members: groupInfo[0],
              fee: ethers.utils.formatEther(groupInfo[1]),
              cycleDuration: groupInfo[2].toNumber(),
              lastPayout: groupInfo[3].toNumber(),
              currentIndex: groupInfo[4].toNumber(),
              active: groupInfo[5]
            };
          })
        );
        setEqubGroups(groupsData);
      } catch (error) {
        console.error('Error loading Equb groups:', error);
      }

      // Load Iddir groups
      try {
        const iddirContract = new ethers.Contract(SimpleIddir, SimpleIddirABI, signer);
        const userIddirGroups = await iddirContract.getUserGroups(account);
        const groupsData = await Promise.all(
          userIddirGroups.map(async (groupId) => {
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
      } catch (error) {
        console.error('Error loading Iddir groups:', error);
      }

    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (signer && account) {
      loadData();
    }
  }, [signer, account]);

  const getReputationColor = (score) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getReputationText = (score) => {
    if (score >= 90) return translations.excellent;
    if (score >= 70) return translations.good;
    return translations.needsImprovement;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">{translations.dashboard}</h2>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">{translations.balance}</h3>
            <p className="text-3xl font-bold text-indigo-600">{parseFloat(balance).toFixed(4)} ETH</p>
            <p className="text-sm text-gray-500 mt-1">{translations.sepoliaTestnet}</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">{translations.reputation}</h3>
            <p className={`text-3xl font-bold ${getReputationColor(reputationScore)}`}>
              {reputationScore}/100
            </p>
            <p className="text-sm text-gray-500 mt-1">{getReputationText(reputationScore)}</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">{translations.totalGroups}</h3>
            <p className="text-3xl font-bold text-indigo-600">
              {equbGroups.length + iddirGroups.length}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {equbGroups.length} {translations.equb}, {iddirGroups.length} {translations.iddir}
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">{translations.quickActions}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => setCurrentView('create')}
              className="px-4 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-left"
            >
              <div className="font-medium">{translations.createEqub}</div>
              <div className="text-sm opacity-90">{translations.startRotatingSavings}</div>
            </button>
            <button
              onClick={() => setCurrentView('create')}
              className="px-4 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 text-left"
            >
              <div className="font-medium">{translations.createIddir}</div>
              <div className="text-sm opacity-90">{translations.startFuneralSupport}</div>
            </button>
          </div>
        </div>

        {/* Recent Groups */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Equb Groups */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">{translations.myEqubGroups}</h3>
            </div>
            <div className="p-6">
              {equbGroups.length === 0 ? (
                <p className="text-gray-500 text-center py-4">{translations.noEqubGroups}</p>
              ) : (
                <div className="space-y-4">
                  {equbGroups.slice(0, 3).map((group) => (
                    <div key={group.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900">{translations.equb} #{group.id}</p>
                          <p className="text-sm text-gray-500">
                            {group.members.length} {translations.members}
                          </p>
                          <p className="text-sm text-gray-500">
                            {translations.fee}: {group.fee} ETH
                          </p>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          group.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {group.active ? translations.active : translations.inactive}
                        </span>
                      </div>
                    </div>
                  ))}
                  {equbGroups.length > 3 && (
                    <button
                      onClick={() => setCurrentView('groups')}
                      className="w-full text-center text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                    >
                      {translations.viewAll}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Iddir Groups */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">{translations.myIddirGroups}</h3>
            </div>
            <div className="p-6">
              {iddirGroups.length === 0 ? (
                <p className="text-gray-500 text-center py-4">{translations.noIddirGroups}</p>
              ) : (
                <div className="space-y-4">
                  {iddirGroups.slice(0, 3).map((group) => (
                    <div key={group.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900">{translations.iddir} #{group.id}</p>
                          <p className="text-sm text-gray-500">
                            {group.members.length} {translations.members}
                          </p>
                          <p className="text-sm text-gray-500">
                            {translations.monthlyFee}: {group.monthlyFee} ETH
                          </p>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          group.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {group.active ? translations.active : translations.inactive}
                        </span>
                      </div>
                    </div>
                  ))}
                  {iddirGroups.length > 3 && (
                    <button
                      onClick={() => setCurrentView('groups')}
                      className="w-full text-center text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                    >
                      {translations.viewAll}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
