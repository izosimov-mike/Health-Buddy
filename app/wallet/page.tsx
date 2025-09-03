'use client';

import React, { useState } from 'react'
import { WalletConnection } from '@/components/WalletConnection'
import { TransactionSender } from '@/components/TransactionSender'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Wallet, Send, History, Info } from 'lucide-react'
import { toast } from 'sonner'

export default function WalletPage() {
  const [isWalletConnected, setIsWalletConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState<string | undefined>()
  const [transactionHistory, setTransactionHistory] = useState<string[]>([])

  const handleConnectionChange = (isConnected: boolean, address?: string) => {
    setIsWalletConnected(isConnected)
    setWalletAddress(address)
    
    if (isConnected && address) {
      toast.success('Кошелек успешно подключен!')
    } else {
      toast.info('Кошелек отключен')
      setTransactionHistory([])
    }
  }

  const handleTransactionSuccess = (txHash: string) => {
    setTransactionHistory(prev => [txHash, ...prev])
    toast.success('Транзакция успешно выполнена!')
  }

  const handleTransactionError = (error: string) => {
    toast.error(`Ошибка транзакции: ${error}`)
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Кошелек Celo</h1>
        <p className="text-muted-foreground">
          Подключите ваш кошелек и отправляйте транзакции в сети Celo через Farcaster Mini App
        </p>
      </div>

      <Alert className="mb-6">
        <Info className="h-4 w-4" />
        <AlertDescription>
          Эта функциональность работает только в Farcaster Mini App окружении в сети Celo mainnet. 
          Убедитесь, что вы открыли приложение через Farcaster клиент.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="wallet" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="wallet" className="flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            Кошелек
          </TabsTrigger>
          <TabsTrigger value="send" className="flex items-center gap-2">
            <Send className="h-4 w-4" />
            Отправить
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            История
          </TabsTrigger>
        </TabsList>

        <TabsContent value="wallet" className="space-y-6">
          <div className="flex justify-center">
            <WalletConnection onConnectionChange={handleConnectionChange} />
          </div>
          
          {isWalletConnected && (
            <Card>
              <CardHeader>
                <CardTitle>Информация о подключении</CardTitle>
                <CardDescription>
                  Детали вашего подключенного кошелька
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Статус:</span>
                    <Badge variant="default">Подключен</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Адрес:</span>
                    <span className="text-xs font-mono">
                      {walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : 'N/A'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="send" className="space-y-6">
          <div className="flex justify-center">
            <TransactionSender 
              onTransactionSuccess={handleTransactionSuccess}
              onTransactionError={handleTransactionError}
            />
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>История транзакций</CardTitle>
              <CardDescription>
                Последние транзакции, отправленные через это приложение
              </CardDescription>
            </CardHeader>
            <CardContent>
              {transactionHistory.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Нет транзакций для отображения</p>
                  <p className="text-sm">Отправьте первую транзакцию, чтобы увидеть историю</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {transactionHistory.map((txHash, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                        <div>
                          <p className="text-sm font-medium">Транзакция #{index + 1}</p>
                          <p className="text-xs text-muted-foreground font-mono">
                            {txHash.slice(0, 10)}...{txHash.slice(-8)}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline">Успешно</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}