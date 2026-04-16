import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import { WalletProvider } from '@/components/WalletProvider'
import { ContractProvider } from '@/components/ContractProvider'
import { AppShell } from '@/components/AppShell'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Ethiopian Microfinance DApp',
  description: 'Decentralized microfinance platform inspired by Ethiopian iqub and idir systems',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <WalletProvider>
          <ContractProvider>
            <AppShell>{children}</AppShell>
            <Toaster 
              position="top-center"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#333',
                  color: '#fff',
                },
              }}
            />
          </ContractProvider>
        </WalletProvider>
      </body>
    </html>
  )
}
