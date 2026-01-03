'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { mainnet } from 'viem/chains';
import { connectorsForWallets, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { walletConnectWallet } from '@rainbow-me/rainbowkit/wallets';
import '@rainbow-me/rainbowkit/styles.css';

// Create a client
const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [hasMetaMask, setHasMetaMask] = useState(false);
  const [metaMaskWalletFactory, setMetaMaskWalletFactory] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
    const detected = Boolean((window as any)?.ethereum?.isMetaMask);
    setHasMetaMask(detected);

    if (detected) {
      import('@rainbow-me/rainbowkit/wallets').then((m) => {
        setMetaMaskWalletFactory(() => m.metaMaskWallet);
      });
    }
  }, []);

  const config = useMemo(() => {
    const projectId =
      process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ||
      'f89dc0e533cc88be28e4c21937c9b477';
    const chains = [mainnet] as const;

    const connectors = connectorsForWallets(
      [
        {
          groupName: 'Wallets',
          wallets: [
            walletConnectWallet,
            ...(metaMaskWalletFactory ? [metaMaskWalletFactory] : []),
          ],
        },
      ],
      {
        appName: 'AgriInsure',
        projectId,
      }
    );

    return createConfig({
      chains,
      connectors,
      transports: {
        [mainnet.id]: http(),
      },
      ssr: true,
    });
  }, [hasMetaMask, metaMaskWalletFactory]);

  if (!mounted) return null;

  return (
    <WagmiProvider config={config} reconnectOnMount={false}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}