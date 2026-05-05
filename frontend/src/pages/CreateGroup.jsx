import React, { useState } from 'react';
import { ethers } from 'ethers';
import contractAddresses from '../contracts.json';

const { SimpleEqub, SimpleIddir } = contractAddresses.contracts;

const SimpleEqubABI = [
  "function createGroup(address[], uint256, uint256) external",
  "function getUserGroups(address) view returns (uint256[])"
];

const SimpleIddirABI = [
  "function createGroup(address[], uint256, uint256) external",
  "function getUserGroups(address) view returns (uint256[])"
];

function CreateGroup({ signer, account, translations, setCurrentView }) {
  const [groupType, setGroupType] = useState('equb');
  const [members, setMembers] = useState(['']);
  const [fee, setFee] = useState('');
  const [duration, setDuration] = useState('');
  const [maxPayout, setMaxPayout] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const addMemberField = () => {
    setMembers([...members, '']);
  };

  const removeMemberField = (index) => {
    const newMembers = members.filter((_, i) => i !== index);
    setMembers(newMembers);
  };

  const updateMember = (index, value) => {
    const newMembers = [...members];
    newMembers[index] = value;
    setMembers(newMembers);
  };

  const validateForm = () => {
    const validMembers = members.filter(member => member.trim() !== '');
    
    if (validMembers.length < 2) {
      setError(groupType === 'equb' ? translations.minTwoMembers : translations.minThreeMembers);
      return false;
    }

    if (!fee || parseFloat(fee) <= 0) {
      setError(translations.invalidFee);
      return false;
    }

    if (groupType === 'equb' && (!duration || parseInt(duration) <= 0)) {
      setError(translations.invalidDuration);
      return false;
    }

    if (groupType === 'iddir' && (!maxPayout || parseFloat(maxPayout) <= 0)) {
      setError(translations.invalidMaxPayout);
      return false;
    }

    // Validate Ethereum addresses
    for (const member of validMembers) {
      if (!ethers.utils.isAddress(member)) {
        setError(`${translations.invalidAddress}: ${member}`);
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      
      const validMembers = members.filter(member => member.trim() !== '');
      const feeInWei = ethers.utils.parseEther(fee);
      
      let contract;
      let params;
      
      if (groupType === 'equb') {
        contract = new ethers.Contract(SimpleEqub, SimpleEqubABI, signer);
        params = [validMembers, feeInWei, parseInt(duration) * 86400]; // Convert days to seconds
      } else {
        contract = new ethers.Contract(SimpleIddir, SimpleIddirABI, signer);
        params = [validMembers, feeInWei, ethers.utils.parseEther(maxPayout)];
      }
      
      const tx = await contract.createGroup(...params);
      await tx.wait();
      
      setSuccess(translations.groupCreatedSuccess);
      // Reset form
      setMembers(['']);
      setFee('');
      setDuration('');
      setMaxPayout('');
      
    } catch (error) {
      console.error('Error creating group:', error);
      setError(translations.errorCreatingGroup + ': ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-4 py-6">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">{translations.createGroup}</h2>
        
        {/* Group Type Selection */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">{translations.selectGroupType}</h3>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setGroupType('equb')}
              className={`p-4 rounded-lg border-2 text-left ${
                groupType === 'equb'
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="font-medium text-gray-900">{translations.equb}</div>
              <div className="text-sm text-gray-500 mt-1">{translations.equbDescription}</div>
            </button>
            <button
              onClick={() => setGroupType('iddir')}
              className={`p-4 rounded-lg border-2 text-left ${
                groupType === 'iddir'
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="font-medium text-gray-900">{translations.iddir}</div>
              <div className="text-sm text-gray-500 mt-1">{translations.iddirDescription}</div>
            </button>
          </div>
        </div>

        {/* Create Group Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {groupType === 'equb' ? translations.createEqub : translations.createIddir}
          </h3>
          
          {/* Members */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {translations.members} ({translations.minMembers}: {groupType === 'equb' ? '2' : '3'})
            </label>
            {members.map((member, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={member}
                  onChange={(e) => updateMember(index, e.target.value)}
                  placeholder="0x742d35Cc6634C0532925a3b8D4C9db96C4b4Db45"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {members.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeMemberField(index)}
                    className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                  >
                    {translations.remove}
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addMemberField}
              className="mt-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
            >
              {translations.addMember}
            </button>
          </div>

          {/* Fee */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {groupType === 'equb' ? translations.cycleFee : translations.monthlyFee} (ETH)
            </label>
            <input
              type="number"
              step="0.001"
              value={fee}
              onChange={(e) => setFee(e.target.value)}
              placeholder="0.1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          {/* Duration (Equb only) */}
          {groupType === 'equb' && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {translations.cycleDuration} ({translations.days})
              </label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="30"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
          )}

          {/* Max Payout (Iddir only) */}
          {groupType === 'iddir' && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {translations.maxPayout} (ETH)
              </label>
              <input
                type="number"
                step="0.001"
                value={maxPayout}
                onChange={(e) => setMaxPayout(e.target.value)}
                placeholder="1.0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
          )}

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

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? translations.creating : translations.createGroup}
            </button>
            <button
              type="button"
              onClick={() => setCurrentView('home')}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
            >
              {translations.cancel}
            </button>
          </div>
        </form>

        {/* Help Section */}
        <div className="mt-6 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900 mb-2">{translations.needHelp}</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• {translations.helpTip1}</li>
            <li>• {translations.helpTip2}</li>
            <li>• {translations.helpTip3}</li>
            <li>• {translations.helpTip4}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default CreateGroup;
