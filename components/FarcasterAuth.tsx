'use client';

import { useAuthenticate, useMiniKit } from '@coinbase/onchainkit/minikit';
import { useEffect, useState } from 'react';

interface FarcasterAuthProps {
  onAuthSuccess: (userData: any) => void;
}

export function FarcasterAuth({ onAuthSuccess }: FarcasterAuthProps) {
  const { signIn } = useAuthenticate();
  const { context } = useMiniKit();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isMiniApp, setIsMiniApp] = useState(false);

  useEffect(() => {
    // Проверяем, находимся ли мы в Farcaster MiniApp окружении
    const checkMiniAppEnvironment = () => {
      // Проверяем наличие Farcaster в user agent или других индикаторов MiniApp
      const userAgent = navigator.userAgent.toLowerCase();
      const isFarcasterApp = userAgent.includes('farcaster') || 
                            window.location.hostname.includes('warpcast') ||
                            typeof window !== 'undefined' && (window as any).farcaster;
      setIsMiniApp(isFarcasterApp);
    };
    
    checkMiniAppEnvironment();
  }, []);

  useEffect(() => {
    if (context?.user?.fid) {
      onAuthSuccess(context.user);
    }
  }, [context?.user, onAuthSuccess]);

  const handleAuthenticate = async () => {
    try {
      setIsAuthenticating(true);
      await signIn();
    } catch (err) {
      console.error('Authentication failed:', err);
    } finally {
      setIsAuthenticating(false);
    }
  };

  // В MiniApp окружении всегда показываем кнопку подключения
  if (isMiniApp) {
    return (
      <div className="text-center p-6">
        <h2 className="text-xl font-bold mb-4 text-gray-800">
          {context?.user?.fid ? 'Wallet Connected' : 'Connect Your Wallet'}
        </h2>
        {context?.user?.fid ? (
          <div className="mb-4">
            <div className="text-green-600 mb-2">✓ Authenticated</div>
            <div className="text-sm text-gray-600">
              Welcome, {context.user?.displayName || context.user?.username || 'User'}!
            </div>
          </div>
        ) : (
          <p className="text-gray-600 mb-6">
            Connect your Farcaster or Base wallet to start tracking your health journey
          </p>
        )}
        
        {!context?.user?.fid && (
          <button
            onClick={handleAuthenticate}
            disabled={isAuthenticating}
            className="bg-[#8B5CF6] hover:bg-[#7C3AED] disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 min-w-[200px]"
          >
            {isAuthenticating ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Connecting...
              </div>
            ) : (
              'Connect Wallet'
            )}
          </button>
        )}
      </div>
    );
  }

  // В обычном браузере показываем стандартную логику
  if (context?.user?.fid) {
    return (
      <div className="text-center p-4">
        <div className="text-green-600 mb-2">✓ Authenticated</div>
        <div className="text-sm text-gray-600">
          Welcome, {context.user?.displayName || context.user?.username || 'User'}!
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
        disabled={isAuthenticating}
        className="bg-[#8B5CF6] hover:bg-[#7C3AED] disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 min-w-[200px]"
      >
        {isAuthenticating ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Connecting...
          </div>
        ) : (
          'Connect Wallet'
        )}
      </button>
    </div>
  );
}