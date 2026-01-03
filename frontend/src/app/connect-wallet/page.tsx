// ===================================================================
// FILE: src/app/connect-wallet/page.tsx
// Connect Wallet Page Component
// ===================================================================

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useWallet } from '@/hooks/useWallet';
import Header from '@/components/common/Header';
import Icon from '@/components/ui/AppIcon';

export default function ConnectWalletPage() {
  const router = useRouter();
  const { isConnected, address, isSaving } = useWallet();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/authentication');
        return;
      }
      setIsAuthenticated(true);
      setIsChecking(false);
    }
  }, [router]);

  useEffect(() => {
    // Redirect to dashboard once wallet is connected and saved
    if (isConnected && address && !isSaving) {
      const timer = setTimeout(() => {
        router.push('/main-dashboard');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isConnected, address, isSaving, router]);

  if (isChecking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <Header />

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
            {/* Title Section */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                <Icon name="wallet" className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-3">
                Connect Your Wallet
              </h1>
              <p className="text-lg text-text-secondary font-body">
                Connect your wallet to access all features of KRISHI RAKSHA
              </p>
            </div>

            {/* Wallet Connection Status */}
            {isConnected && address ? (
              <div className="bg-success/10 border-2 border-success rounded-xl p-6 mb-8">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-success/20 rounded-full flex items-center justify-center">
                      <Icon name="check-circle" className="w-6 h-6 text-success" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Wallet Connected</p>
                      <p className="text-sm text-text-secondary font-mono">
                        {address.slice(0, 6)}...{address.slice(-4)}
                      </p>
                    </div>
                  </div>
                </div>

                {isSaving && (
                  <div className="flex items-center gap-2 text-text-secondary">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    <span className="text-sm">Saving wallet address...</span>
                  </div>
                )}

                {!isSaving && (
                  <div className="flex items-center gap-2 text-success">
                    <span className="text-sm">✅ Wallet address saved successfully! Redirecting to dashboard...</span>
                  </div>
                )}
              </div>
            ) : (
              <>
                {/* Instructions */}
                <div className="bg-surface rounded-xl p-6 mb-8">
                  <h3 className="text-lg font-semibold text-foreground mb-4">
                    Why connect your wallet?
                  </h3>
                  <ul className="space-y-3 text-text-secondary">
                    <li className="flex items-start gap-3">
                      <Icon name="shield-check" className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <span>Secure blockchain-based claim processing</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Icon name="file-text" className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <span>Transparent and immutable claim records</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Icon name="banknote" className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <span>Receive payments directly to your wallet</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Icon name="sparkles" className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <span>Access to all premium features</span>
                    </li>
                  </ul>
                </div>

                {/* Connect Button */}
                <div className="flex justify-center">
                  <ConnectButton.Custom>
                    {({
                      account,
                      chain,
                      openAccountModal,
                      openChainModal,
                      openConnectModal,
                      authenticationStatus,
                      mounted,
                    }) => {
                      const ready = mounted && authenticationStatus !== 'loading';
                      const connected =
                        ready &&
                        account &&
                        chain &&
                        (!authenticationStatus || authenticationStatus === 'authenticated');

                      return (
                        <div
                          {...(!ready && {
                            'aria-hidden': true,
                            style: {
                              opacity: 0,
                              pointerEvents: 'none',
                              userSelect: 'none',
                            },
                          })}
                        >
                          {(() => {
                            if (!connected) {
                              return (
                                <button
                                  onClick={openConnectModal}
                                  type="button"
                                  className="px-8 py-4 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                >
                                  Connect Wallet
                                </button>
                              );
                            }

                            if (chain.unsupported) {
                              return (
                                <button
                                  onClick={openChainModal}
                                  type="button"
                                  className="px-8 py-4 bg-error text-white font-semibold rounded-xl hover:bg-error/90 transition-all duration-200"
                                >
                                  Wrong network
                                </button>
                              );
                            }

                            return (
                              <div className="flex gap-3">
                                <button
                                  onClick={openChainModal}
                                  type="button"
                                  className="px-4 py-2 bg-surface border border-border rounded-lg hover:bg-surface-hover transition-colors flex items-center gap-2"
                                >
                                  {chain.hasIcon && (
                                    <div className="w-5 h-5">
                                      {chain.iconUrl && (
                                        <img
                                          alt={chain.name ?? 'Chain icon'}
                                          src={chain.iconUrl}
                                          className="w-5 h-5"
                                        />
                                      )}
                                    </div>
                                  )}
                                  {chain.name}
                                </button>

                                <button
                                  onClick={openAccountModal}
                                  type="button"
                                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                                >
                                  {account.displayName}
                                  {account.displayBalance ? ` (${account.displayBalance})` : ''}
                                </button>
                              </div>
                            );
                          })()}
                        </div>
                      );
                    }}
                  </ConnectButton.Custom>
                </div>
              </>
            )}

            {/* Skip for now (optional) */}
            <div className="text-center mt-6">
              <button
                onClick={() => router.push('/main-dashboard')}
                className="text-sm font-body text-text-secondary hover:text-foreground transition-colors duration-200"
              >
                Skip for now
              </button>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}