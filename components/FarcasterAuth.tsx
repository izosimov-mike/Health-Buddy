'use client';

import { useAuthenticate } from '@coinbase/onchainkit/minikit';
import { useEffect, useState } from 'react';

interface FarcasterAuthProps {
  onAuthSuccess: (userData: any) => void;
}

export function FarcasterAuth({ onAuthSuccess }: FarcasterAuthProps) {
  const { isAuthenticated, user, authenticate, isLoading, error } = useAuthenticate();
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      onAuthSuccess(user);
    }
  }, [isAuthenticated, user, onAuthSuccess]);

  const handleAuthenticate = async () => {
    try {
      setIsAuthenticating(true);
      await authenticate();
    } catch (err) {
      console.error('Authentication failed:', err);
    } finally {
      setIsAuthenticating(false);
    }
  };

  if (isAuthenticated) {
    return (
      <div className="text-center p-4">
        <div className="text-green-600 mb-2">✓ Authenticated</div>
        <div className="text-sm text-gray-600">
          Welcome, {user?.displayName || user?.username || 'User'}!
        </div>
      </div>
    );
  }

  return (
    <div className="text-center p-6">
      <h2 className="text-xl font-bold mb-4 text-gray-800">
        Connect Your Wallet
      </h2>
      <p className="text-gray-600 mb-6">
        Connect your Farcaster or Base wallet to start tracking your health journey
      </p>
      
      <button
        onClick={handleAuthenticate}
        disabled={isLoading || isAuthenticating}
        className="bg-[#8B5CF6] hover:bg-[#7C3AED] disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 min-w-[200px]"
      >
        {isLoading || isAuthenticating ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Connecting...
          </div>
        ) : (
          'Connect Wallet'
        )}
      </button>
      
      {error && (
        <div className="mt-4 text-red-600 text-sm">
          Authentication failed. Please try again.
        </div>
      )}
    </div>
  );
}