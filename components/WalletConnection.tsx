'use client';

import React from 'react'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Wallet, WalletIcon, Unplug } from 'lucide-react'

interface WalletConnectionProps {
  onConnectionChange?: (isConnected: boolean, address?: string) => void
}

export function WalletConnection({ onConnectionChange }: WalletConnectionProps) {
  const { address, isConnected, chain } = useAccount()
  const { connectors, connect, status, error } = useConnect()
  const { disconnect } = useDisconnect()

  // Уведомляем родительский компонент об изменении подключения
  React.useEffect(() => {
    onConnectionChange?.(isConnected, address)
  }, [isConnected, address, onConnectionChange])

  if (isConnected && address) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <WalletIcon className="h-5 w-5" />
            Кошелек подключен
          </CardTitle>
          <CardDescription>
            Ваш кошелек успешно подключен к приложению
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="text-sm font-medium">Адрес:</div>
            <div className="text-xs font-mono bg-muted p-2 rounded break-all">
              {address}
            </div>
          </div>
          
          {chain && (
            <div className="space-y-2">
              <div className="text-sm font-medium">Сеть:</div>
              <Badge variant="outline">
                {chain.name}
              </Badge>
            </div>
          )}
          
          <Button 
            onClick={() => disconnect()} 
            variant="outline" 
            className="w-full"
          >
            Отключить кошелек
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Подключение кошелька
        </CardTitle>
        <CardDescription>
          Подключите ваш кошелек для совершения транзакций в сети Celo
        </CardDescription>
      </CardHeader>
      <CardContent>
        {connectors.map((connector) => (
          <Button
            key={connector.uid}
            onClick={() => connect({ connector })}
            disabled={status === 'pending'}
            className="w-full"
          >
            {status === 'pending' ? 'Подключение...' : `Подключить ${connector.name}`}
          </Button>
        ))}
      </CardContent>
    </Card>
  )
}