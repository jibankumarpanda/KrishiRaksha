// ===================================================================
// FILE: src/providers/WalletProvider.tsx
// Main Wallet Provider - Use ONLY this one
// ===================================================================

"use client";

import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProvider, lightTheme } from '@rainbow-me/rainbowkit';
import { config } from '@/config/rainbowkit';
import { ReactNode, useEffect, useState } from 'react';

// Theme that matches app branding
const rkTheme = lightTheme({
  accentColor: '#10B981',
  accentColorForeground: '#FFFFFF',
  borderRadius: 'large',
  fontStack: 'system',
  overlayBlur: 'small',
});

// Create QueryClient outside component to prevent recreation
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export function WalletProvider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    
    // Clean up any existing MetaMask connections
    return () => {
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        try {
          (window as any).ethereum.removeAllListeners?.();
        } catch (e) {
          console.log('Cleanup error:', e);
        }
      }
    };
  }, []);

  // Show loading state during mount
  if (!mounted) {
    return <div className="min-h-screen bg-background">{children}</div>;
  }

  return (
    <WagmiProvider config={config} reconnectOnMount={false}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider 
          appInfo={{
            appName: 'Krishi Raksha',
            learnMoreUrl: 'https://krishiraksha.com/terms',
          }}
          theme={rkTheme}
          modalSize="compact"
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}