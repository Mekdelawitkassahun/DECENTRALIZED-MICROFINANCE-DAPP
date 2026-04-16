/* eslint-disable react/no-children-prop */
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useWallet } from '@/components/WalletProvider'
import { useMemo } from 'react'
import { ArrowRightIcon, BanknotesIcon } from '@heroicons/react/24/outline'

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/lend', label: 'Lend' },
  { href: '/borrow', label: 'Borrow' },
  { href: '/loans', label: 'My Loans' },
  { href: '/credit', label: 'Credit' },
]

function formatAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { account, isConnected, isConnecting, connectWallet, disconnectWallet } = useWallet()

  const isActive = useMemo(() => {
    return (href: string) => {
      if (href === '/' && pathname === '/') return true
      return pathname.startsWith(href) && href !== '/'
    }
  }, [pathname])

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-yellow-50 flex flex-col relative overflow-hidden">
      {/* Decorative Ethiopian color bokeh */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(7,137,48,0.16),transparent_55%),radial-gradient(ellipse_at_25%_10%,_rgba(252,244,52,0.22),transparent_45%),radial-gradient(ellipse_at_85%_15%,_rgba(218,18,26,0.14),transparent_45%)]"
      />

      <header className="sticky top-0 z-40 border-b bg-white/70 backdrop-blur">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-ethiopian-green/90 to-ethiopian-yellow/90 flex items-center justify-center shadow-sm">
              <BanknotesIcon className="w-5 h-5 text-white" />
            </div>
            <div className="leading-tight">
              <Link href="/" className="font-extrabold tracking-tight text-gray-900 hover:text-emerald-700">
                Ethiopian Microfinance
              </Link>
              <p className="text-xs text-gray-600">Equb & idir-inspired on-chain lending</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive(item.href)
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100',
                ].join(' ')}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {!isConnected ? (
              <button
                onClick={() => connectWallet()}
                disabled={isConnecting}
                className="inline-flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-800 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                <span>{isConnecting ? 'Connecting...' : 'Connect wallet'}</span>
                <ArrowRightIcon className="w-4 h-4" />
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <div className="hidden sm:block">
                  <div className="text-xs text-gray-500">Connected</div>
                  <div className="text-sm font-semibold text-gray-900">{account ? formatAddress(account) : '-'}</div>
                </div>
                <button
                  onClick={disconnectWallet}
                  className="bg-red-600 text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors"
                >
                  Disconnect
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile nav (horizontal scroll) */}
        <div className="relative md:hidden border-t bg-white/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex gap-2 overflow-x-auto">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  'shrink-0 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive(item.href)
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100',
                ].join(' ')}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </header>

      <main className="relative flex-1">{children}</main>

      <footer className="relative mt-10 border-t bg-white/60 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-sm text-gray-600 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="font-semibold text-gray-900">Ethiopian Microfinance</span> — built for transparency, trust, and community finance.
          </div>
          <div className="flex items-center gap-3">
            <Link href="/credit" className="hover:text-emerald-700 transition-colors">
              Credit Score
            </Link>
            <span className="text-gray-400">•</span>
            <Link href="/dashboard" className="hover:text-emerald-700 transition-colors">
              Dashboard
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

