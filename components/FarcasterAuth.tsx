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

  // Автоматическая загрузка данных аутентифицированного пользователя
  useEffect(() => {
    if (context?.user?.fid) {
      // Используем данные из context для аутентификации
      onAuthSuccess({
        fid: context.user.fid,
        displayName: context.user.displayName,
        username: context.user.username,
        pfpUrl: context.user.pfpUrl
      });
    }
  }, [context?.user, onAuthSuccess]);

  const handleAuthenticate = async () => {
    try {
      setIsAuthenticating(true);
      const result = await signIn();
      if (result) {
        // Данные будут автоматически обработаны в useEffect
        console.log('Authentication successful:', result);
      }
    } catch (err) {
      console.error('Authentication failed:', err);
    } finally {
      setIsAuthenticating(false);
    }
  };

  // В MiniApp окружении всегда показываем кнопку подключения
  if (isMiniApp) {
    const isAuthenticated = context?.user?.fid;
    const displayName = context?.user?.displayName || context?.user?.username || 'User';
    
    return (
      <div className="text-center p-6">
        <h2 className="text-xl font-bold mb-4 text-gray-800">
          {isAuthenticated ? 'Wallet Connected' : 'Connect Your Wallet'}
        </h2>
        {isAuthenticated ? (
          <div className="mb-4">
            <div className="text-green-600 mb-2">✓ {context?.user?.fid ? 'Authenticated & Verified' : 'Connected'}</div>
            <div className="text-sm text-gray-600">
              Welcome, {displayName}!
            </div>
            {context?.user?.fid && (
              <div className="text-xs text-gray-500 mt-1">
                FID: {context.user.fid} | Verified Identity
              </div>
            )}
          </div>
        ) : (
          <p className="text-gray-600 mb-6">
            Connect your Farcaster or Base wallet to start tracking your health journey
          </p>
        )}
        
        {!isAuthenticated && (
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
  const isAuthenticated = context?.user?.fid;
  const displayName = context?.user?.displayName || context?.user?.username || 'User';
  
  if (isAuthenticated) {
    return (
      <div className="text-center p-4">
        <div className="text-green-600 mb-2">✓ {context?.user?.fid ? 'Authenticated & Verified' : 'Connected'}</div>
        <div className="text-sm text-gray-600">
          Welcome, {displayName}!
        </div>
        {context?.user?.fid && (
          <div className="text-xs text-gray-500 mt-1">
            FID: {context.user.fid} | Verified Identity
          </div>
        )}
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