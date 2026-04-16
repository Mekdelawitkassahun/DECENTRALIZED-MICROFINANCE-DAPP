'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { ethers } from 'ethers'
import toast from 'react-hot-toast'

interface WalletContextType {
  account: string | null
  provider: ethers.BrowserProvider | null
  signer: ethers.JsonRpcSigner | null
  isConnected: boolean
  isConnecting: boolean
  connectWallet: (forceSelect?: boolean) => Promise<void>
  disconnectWallet: () => void
  switchToSepolia: () => Promise<void>
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

const SEPOLIA_CHAIN_ID = '0xaa36a7' // 11155111 in hex

export function WalletProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<string | null>(null)
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null)
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)

  useEffect(() => {
    checkConnection()
    setupEventListeners()
  }, [])

  const checkConnection = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum)
        const accounts = await provider.listAccounts()
        
        if (accounts.length > 0) {
          const signer = await provider.getSigner()
          const network = await provider.getNetwork()
          
          if (Number(network.chainId) === 11155111) {
            setAccount(accounts[0].address)
            setProvider(provider)
            setSigner(signer)
            setIsConnected(true)
          }
        }
      } catch (error) {
        console.error('Error checking connection:', error)
      }
    }
  }

  const setupEventListeners = () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged)
      window.ethereum.on('chainChanged', handleChainChanged)
    }
  }

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      disconnectWallet()
    } else {
      setAccount(accounts[0])
    }
  }

  const handleChainChanged = () => {
    window.location.reload()
  }

  const connectWallet = async (forceSelect = false) => {
    if (typeof window === 'undefined' || !window.ethereum) {
      toast.error('MetaMask is not installed. Please install MetaMask to continue.')
      return
    }

    setIsConnecting(true)
    
    try {
      const provider = new ethers.BrowserProvider(window.ethereum)
      
      if (forceSelect) {
        // Force account selection dialog
        await window.ethereum.request({
          method: 'wallet_requestPermissions',
          params: [{ eth_accounts: {} }],
        })
      } else {
        // Request account access
        await provider.send('eth_requestAccounts', [])
      }
      
      const signer = await provider.getSigner()
      const network = await provider.getNetwork()
      
      // Check if we're on Sepolia
      if (Number(network.chainId) !== 11155111) {
        await switchToSepolia()
        return
      }
      
      setAccount(signer.address)
      setProvider(provider)
      setSigner(signer)
      setIsConnected(true)
      
      toast.success('Wallet connected successfully!')
    } catch (error: any) {
      console.error('Error connecting wallet:', error)
      if (error.code === 4001) {
        toast.error('Please connect your wallet to continue.')
      } else {
        toast.error('Failed to connect wallet. Please try again.')
      }
    } finally {
      setIsConnecting(false)
    }
  }

  const switchToSepolia = async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      return
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: SEPOLIA_CHAIN_ID }],
      })
      
      toast.success('Switched to Sepolia testnet!')
      
      // Re-check connection after switching
      setTimeout(checkConnection, 1000)
    } catch (error: any) {
      if (error.code === 4902) {
        // Chain doesn't exist, add it
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: SEPOLIA_CHAIN_ID,
                chainName: 'Sepolia Testnet',
                rpcUrls: ['https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161'],
                nativeCurrency: {
                  name: 'ETH',
                  symbol: 'ETH',
                  decimals: 18,
                },
                blockExplorerUrls: ['https://sepolia.etherscan.io'],
              },
            ],
          })
          
          toast.success('Sepolia testnet added to wallet!')
        } catch (addError) {
          console.error('Error adding Sepolia network:', addError)
          toast.error('Failed to add Sepolia network. Please add it manually.')
        }
      } else {
        console.error('Error switching to Sepolia:', error)
        toast.error('Failed to switch to Sepolia testnet.')
      }
    }
  }

  const disconnectWallet = () => {
    setAccount(null)
    setProvider(null)
    setSigner(null)
    setIsConnected(false)
    toast.success('Wallet disconnected')
  }

  return (
    <WalletContext.Provider
      value={{
        account,
        provider,
        signer,
        isConnected,
        isConnecting,
        connectWallet,
        disconnectWallet,
        switchToSepolia,
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider')
  }
  return context
}

// Type declaration for window.ethereum
declare global {
  interface Window {
    ethereum?: any
  }
}
