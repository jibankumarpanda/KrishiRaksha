// ===================================================================
// FILE: frontend/src/hooks/useWallet.ts
// Custom Hook for Wallet Operations
// ===================================================================

'use client';

import { useAccount, useDisconnect } from 'wagmi';
import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';

export function useWallet() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Auto-save wallet address to backend
  // Replace the useEffect with this:
useEffect(() => {
  if (isConnected && address) {
    const walletSavedKey = `wallet_saved_${address}`;
    const wasWalletSaved = sessionStorage.getItem(walletSavedKey);
    
    if (!wasWalletSaved) {
      saveWalletAddress(address);
      sessionStorage.setItem(walletSavedKey, 'true');
    }
  }
}, [isConnected, address]);

  const saveWalletAddress = async (walletAddress: string) => {
    setIsSaving(true);
    setSaveError(null);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('⚠️ No auth token found, skipping wallet save');
        return;
      }

      await apiClient.connectWallet(walletAddress);
      console.log('✅ Wallet address saved to backend');
    } catch (error: any) {
      console.error('❌ Failed to save wallet address:', error);
      setSaveError(error.message || 'Failed to save wallet address');
    } finally {
      setIsSaving(false);
    }
  };

  return {
    address,
    isConnected,
    disconnect,
    isSaving,
    saveError,
  };
}