// src/config/rainbowkit.ts
// RainbowKit Configuration for Celo Alfajores

import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { celoAlfajores } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'Krishi Raksha',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'f89dc0e533cc88be28e4c21937c9b477',
  chains: [celoAlfajores],
  ssr: true,
});