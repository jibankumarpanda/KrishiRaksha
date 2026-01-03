'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useDisconnect } from 'wagmi';
import Icon from '@/components/ui/AppIcon';

interface HeaderProps {
  isAuthenticated?: boolean;
  userName?: string;
  onLogout?: () => void;
}

const Header = ({
  isAuthenticated = false,
  onLogout,
}: HeaderProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Default logout handler
  const handleLogout = async () => {
    if (isLoggingOut) return;
    
    setIsLoggingOut(true);
    
    try {
      // Disconnect wallet if connected
      if (isConnected) {
        disconnect();
      }
      
      // Clear all authentication data
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('userName');
        localStorage.removeItem('userId');
      }
      
      // Call custom logout handler if provided
      if (onLogout) {
        onLogout();
      }
      
      // Redirect to authentication page
      router.push('/authentication');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const navigationItems = [
    { label: 'Dashboard', path: '/main-dashboard', icon: 'ChartBarIcon' },
    { label: 'Claims', path: '/claims-management', icon: 'DocumentTextIcon' },
    { label: 'Profile', path: '/user-profile', icon: 'UserIcon' },
    { label: 'About', path: '/about', icon: 'InformationCircleIcon' },
    { label: 'Wallet', path: '/connect-wallet', icon: 'WalletIcon' },
  ];

  const isActivePath = (path: string) => pathname === path;

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : 'unset';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);


  return (
    <header className="sticky top-0 z-[100] bg-card border-b border-border shadow-card">
      <nav className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/landing-page" className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <Icon name="HomeIcon" size={22} className="text-primary-foreground" />
            </div>
            <span className="hidden sm:block text-xl font-heading font-bold">
              KRISHI RAKSHA
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navigationItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`px-4 py-2 rounded-md flex items-center space-x-2 transition-all ${
                  isActivePath(item.path)
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted'
                }`}
              >
                <Icon name={item.icon as any} size={18} />
                <span>{item.label}</span>
              </Link>
            ))}
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-3">
            {/* Wallet Connection (Desktop) */}
            {isAuthenticated && (
              <div className="hidden lg:block">
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
                      (!authenticationStatus ||
                        authenticationStatus === 'authenticated');

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
                                className="px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-body font-medium text-sm transition-all duration-200 shadow-sm hover:shadow-md flex items-center space-x-2"
                              >
                                <Icon name="WalletIcon" size={18} />
                                <span>Connect Wallet</span>
                              </button>
                            );
                          }

                          if (chain.unsupported) {
                            return (
                              <button
                                onClick={openChainModal}
                                type="button"
                                className="px-4 py-2 rounded-lg bg-error/10 hover:bg-error/20 text-error border border-error/20 font-body font-medium text-sm transition-all duration-200"
                              >
                                Wrong network
                              </button>
                            );
                          }

                          return (
                            <button
                              onClick={openAccountModal}
                              type="button"
                              className="px-4 py-2 rounded-lg bg-success/10 hover:bg-success/20 text-success border border-success/20 font-body font-medium text-sm transition-all duration-200 flex items-center space-x-2"
                            >
                              <Icon name="WalletIcon" size={18} />
                              <span>
                                {account.displayName}
                                {account.displayBalance
                                  ? ` (${account.displayBalance})`
                                  : ''}
                              </span>
                            </button>
                          );
                        })()}
                      </div>
                    );
                  }}
                </ConnectButton.Custom>
              </div>
            )}

            {/* Logout (Desktop) */}
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="hidden lg:flex items-center space-x-2 px-4 py-2 rounded-lg bg-error/10 hover:bg-error/20 text-error border border-error/20 hover:border-error/40 transition-all duration-200 font-body font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
              >
                {isLoggingOut ? (
                  <>
                    <div className="w-4 h-4 border-2 border-error border-t-transparent rounded-full animate-spin" />
                    <span>Logging out...</span>
                  </>
                ) : (
                  <>
                    <Icon name="ArrowRightOnRectangleIcon" size={18} />
                    <span>Logout</span>
                  </>
                )}
              </button>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-md hover:bg-muted"
            >
              <Icon name={isMobileMenuOpen ? 'XMarkIcon' : 'Bars3Icon'} size={24} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-[150]"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          <div className="fixed top-16 right-0 bottom-0 w-64 bg-card border-l border-border z-[200] p-4 space-y-2">
            {navigationItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-4 py-2 rounded-md hover:bg-muted"
              >
                {item.label}
              </Link>
            ))}

            {isAuthenticated && (
              <>
                <div className="border-t border-border my-3" />

                {/* Wallet Connection (Mobile) */}
                <div className="mb-2">
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
                        (!authenticationStatus ||
                          authenticationStatus === 'authenticated');

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
                                  onClick={() => {
                                    openConnectModal();
                                    setIsMobileMenuOpen(false);
                                  }}
                                  type="button"
                                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-body font-medium transition-all duration-200"
                                >
                                  <Icon name="WalletIcon" size={18} />
                                  <span>Connect Wallet</span>
                                </button>
                              );
                            }

                            if (chain.unsupported) {
                              return (
                                <button
                                  onClick={openChainModal}
                                  type="button"
                                  className="w-full px-4 py-2 rounded-lg bg-error/10 hover:bg-error/20 text-error border border-error/20 font-body font-medium text-sm transition-all duration-200"
                                >
                                  Wrong network
                                </button>
                              );
                            }

                            return (
                              <button
                                onClick={() => {
                                  openAccountModal();
                                  setIsMobileMenuOpen(false);
                                }}
                                type="button"
                                className="w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg bg-success/10 hover:bg-success/20 text-success border border-success/20 font-body font-medium transition-all duration-200"
                              >
                                <Icon name="WalletIcon" size={18} />
                                <span>
                                  {account.displayName}
                                  {account.displayBalance
                                    ? ` (${account.displayBalance})`
                                    : ''}
                                </span>
                              </button>
                            );
                          })()}
                        </div>
                      );
                    }}
                  </ConnectButton.Custom>
                </div>

                <button
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  disabled={isLoggingOut}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg bg-error/10 hover:bg-error/20 text-error border border-error/20 hover:border-error/40 transition-all duration-200 font-body font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoggingOut ? (
                    <>
                      <div className="w-4 h-4 border-2 border-error border-t-transparent rounded-full animate-spin" />
                      <span>Logging out...</span>
                    </>
                  ) : (
                    <>
                      <Icon name="ArrowRightOnRectangleIcon" size={18} />
                      <span>Logout</span>
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </>
      )}
    </header>
  );
};

export default Header;
