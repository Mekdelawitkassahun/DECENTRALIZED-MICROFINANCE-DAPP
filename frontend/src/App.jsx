import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import Web3Modal from 'web3modal';
import WalletConnectProvider from '@walletconnect/web3-provider';
import Home from './pages/Home';
import CreateGroup from './pages/CreateGroup';
import MyGroups from './pages/MyGroups';
import Profile from './pages/Profile';
import en from './locales/en.json';
import am from './locales/am.json';
import contractAddresses from './contracts.json';

const TARGET_CHAIN_ID = contractAddresses.chainId;
const LOCALHOST_CHAIN_ID = '0x7a69'; // 31337 in hex
const SEPOLIA_CHAIN_ID = '0xaa36a7'; // 11155111 in hex

const web3Modal = new Web3Modal({
  network: TARGET_CHAIN_ID === 31337 ? 'localhost' : 'sepolia',
  cacheProvider: false,
  providerOptions: {
    walletconnect: {
      package: WalletConnectProvider,
      options: {
        rpc: {
          31337: 'http://127.0.0.1:8545',
          11155111: 'https://sepolia.infura.io/v3/YOUR_INFURA_KEY'
        }
      }
    }
  }
});

function App() {
  const [account, setAccount] = useState(null);
  const [signer, setSigner] = useState(null);
  const [web3Provider, setWeb3Provider] = useState(null);
  const [currentView, setCurrentView] = useState('home');
  const [language, setLanguage] = useState('en');
  const [translations, setTranslations] = useState(en);

  useEffect(() => {
    setTranslations(language === 'en' ? en : am);
  }, [language]);

  const switchNetwork = async (provider) => {
    try {
      const chainIdHex = TARGET_CHAIN_ID === 31337 ? LOCALHOST_CHAIN_ID : SEPOLIA_CHAIN_ID;
      await provider.send('wallet_switchEthereumChain', [{ chainId: chainIdHex }]);
    } catch (switchError) {
      if (switchError.code === 4902) {
        const chainIdHex = TARGET_CHAIN_ID === 31337 ? LOCALHOST_CHAIN_ID : SEPOLIA_CHAIN_ID;
        const chainName = TARGET_CHAIN_ID === 31337 ? 'Localhost' : 'Sepolia Testnet';
        const rpcUrl = TARGET_CHAIN_ID === 31337 ? 'http://127.0.0.1:8545' : 'https://sepolia.infura.io/v3/YOUR_INFURA_KEY';
        await provider.send('wallet_addEthereumChain', [
          {
            chainId: chainIdHex,
            chainName: chainName,
            rpcUrls: [rpcUrl],
            nativeCurrency: {
              name: 'ETH',
              symbol: 'ETH',
              decimals: 18,
            },
          },
        ]);
      }
    }
  };

  const connectWallet = async () => {
    try {
      const instance = await web3Modal.connect();
      const provider = new ethers.providers.Web3Provider(instance);
      const network = await provider.getNetwork();
      
      if (network.chainId !== TARGET_CHAIN_ID) {
        await switchNetwork(instance);
      }
      
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      
      setWeb3Provider(instance);
      setSigner(signer);
      setAccount(address);

      instance.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          setAccount(accounts[0]);
        }
      });

      instance.on('chainChanged', () => {
        window.location.reload();
      });

    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  };

  const disconnectWallet = async () => {
    if (web3Provider && web3Provider.close) {
      await web3Provider.close();
    }
    web3Modal.clearCachedProvider();
    setAccount(null);
    setSigner(null);
    setWeb3Provider(null);
  };

  const renderView = () => {
    switch (currentView) {
      case 'home':
        return <Home signer={signer} account={account} translations={translations} setCurrentView={setCurrentView} />;
      case 'create':
        return <CreateGroup signer={signer} account={account} translations={translations} setCurrentView={setCurrentView} />;
      case 'groups':
        return <MyGroups signer={signer} account={account} translations={translations} setCurrentView={setCurrentView} />;
      case 'profile':
        return <Profile signer={signer} account={account} translations={translations} setCurrentView={setCurrentView} />;
      default:
        return <Home signer={signer} account={account} translations={translations} setCurrentView={setCurrentView} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-indigo-600">Ensirat</h1>
              <span className="ml-2 text-sm text-gray-500">{translations.blockchainFinance}</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setLanguage(language === 'en' ? 'am' : 'en')}
                className="px-3 py-1 text-sm bg-gray-100 rounded-md hover:bg-gray-200"
              >
                {language === 'en' ? 'አማርኛ' : 'English'}
              </button>
              
              {account ? (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">
                    {account.slice(0, 6)}...{account.slice(-4)}
                  </span>
                  <button
                    onClick={disconnectWallet}
                    className="px-3 py-1 text-sm bg-red-500 text-white rounded-md hover:bg-red-600"
                  >
                    {translations.disconnect}
                  </button>
                </div>
              ) : (
                <button
                  onClick={connectWallet}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  {translations.connectWallet}
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setCurrentView('home')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                currentView === 'home'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {translations.home}
            </button>
            <button
              onClick={() => setCurrentView('create')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                currentView === 'create'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {translations.createGroup}
            </button>
            <button
              onClick={() => setCurrentView('groups')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                currentView === 'groups'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {translations.myGroups}
            </button>
            <button
              onClick={() => setCurrentView('profile')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                currentView === 'profile'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {translations.profile}
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {!account ? (
          <div className="text-center py-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{translations.welcome}</h2>
            <p className="text-lg text-gray-600 mb-8">{translations.connectToStart}</p>
            <button
              onClick={connectWallet}
              className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-lg"
            >
              {translations.connectWallet}
            </button>
          </div>
        ) : (
          renderView()
        )}
      </main>
    </div>
  );
}

export default App;
