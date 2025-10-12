'use client';

import React, { useState } from 'react'
import { useSendTransaction, useWaitForTransactionReceipt, useAccount, useChainId } from 'wagmi'
import { parseEther, formatEther } from 'viem'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { appendReferralTag, submitDivviReferral } from '@/lib/divvi-utils'

interface TransactionSenderProps {
  onTransactionSuccess?: (txHash: string) => void
  onTransactionError?: (error: string) => void
}

export function TransactionSender({ onTransactionSuccess, onTransactionError }: TransactionSenderProps) {
  const { isConnected, address } = useAccount()
  const chainId = useChainId()
  const [recipient, setRecipient] = useState('')
  const [amount, setAmount] = useState('')
  const [isValidAddress, setIsValidAddress] = useState(true)

  const { 
    sendTransaction, 
    data: hash, 
    isPending: isSending, 
    error: sendError 
  } = useSendTransaction()

  const { 
    isLoading: isConfirming, 
    isSuccess: isConfirmed,
    error: confirmError
  } = useWaitForTransactionReceipt({ 
    hash 
  })

  React.useEffect(() => {
    if (isConfirmed && hash) {
      // Submit transaction to Divvi for referral tracking
      submitDivviReferral(hash, chainId)
      
      if (onTransactionSuccess) {
        onTransactionSuccess(hash)
      }
    }
  }, [isConfirmed, hash, chainId, onTransactionSuccess])

  React.useEffect(() => {
    if (sendError && onTransactionError) {
      onTransactionError(sendError.message)
    }
    if (confirmError && onTransactionError) {
      onTransactionError(confirmError.message)
    }
  }, [sendError, confirmError, onTransactionError])

  // Валидация адреса получателя
  const validateAddress = (addr: string) => {
    const isValid = /^0x[a-fA-F0-9]{40}$/.test(addr)
    setIsValidAddress(isValid)
    return isValid
  }

  const handleSendTransaction = async () => {
    if (!recipient || !amount) {
      toast.error('Пожалуйста, заполните все поля')
      return
    }

    if (!validateAddress(recipient)) {
      toast.error('Неверный адрес получателя')
      return
    }

    if (!address) {
      toast.error('Кошелек не подключен')
      return
    }

    try {
      const value = parseEther(amount)
      
      // Add Divvi referral tag to transaction data
      const dataWithReferral = appendReferralTag(undefined, address)
      
      sendTransaction({
        to: recipient as `0x${string}`,
        value: value,
        data: dataWithReferral,
      })
      
      toast.success('Транзакция отправлена с Divvi tracking!')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка'
      toast.error(`Ошибка отправки: ${errorMessage}`)
      onTransactionError?.(errorMessage)
    }
  }

  // Обработка успешной транзакции
  React.useEffect(() => {
    if (isConfirmed && hash) {
      toast.success('Транзакция подтверждена!')
      // Очищаем форму
      setRecipient('')
      setAmount('')
    }
  }, [isConfirmed, hash])

  // Обработка ошибок
  React.useEffect(() => {
    if (sendError) {
      const errorMessage = sendError.message || 'Ошибка отправки транзакции'
      toast.error(errorMessage)
      onTransactionError?.(errorMessage)
    }
    if (confirmError) {
      const errorMessage = confirmError.message || 'Ошибка подтверждения транзакции'
      toast.error(errorMessage)
      onTransactionError?.(errorMessage)
    }
  }, [sendError, confirmError, onTransactionError])

  if (!isConnected) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Отправка транзакции
          </CardTitle>
          <CardDescription>
            Подключите кошелек для отправки транзакций
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Для отправки транзакций необходимо подключить кошелек
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="h-5 w-5" />
          Отправка CELO
        </CardTitle>
        <CardDescription>
          Отправьте CELO на любой адрес в сети Celo
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="recipient">Адрес получателя</Label>
          <Input
            id="recipient"
            placeholder="0x..."
            value={recipient}
            onChange={(e) => {
              setRecipient(e.target.value)
              if (e.target.value) validateAddress(e.target.value)
            }}
            className={!isValidAddress && recipient ? 'border-red-500' : ''}
          />
          {!isValidAddress && recipient && (
            <p className="text-sm text-red-500">Неверный формат адреса</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="amount">Сумма (CELO)</Label>
          <Input
            id="amount"
            type="number"
            step="0.001"
            placeholder="0.1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        {hash && (
          <div className="space-y-2">
            <Label>Статус транзакции</Label>
            <div className="flex items-center gap-2">
              {isConfirming && (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <Badge variant="outline">Подтверждение...</Badge>
                </>
              )}
              {isConfirmed && (
                <>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <Badge variant="default">Подтверждено</Badge>
                </>
              )}
            </div>
            <div className="text-xs font-mono bg-muted p-2 rounded break-all">
              Hash: {hash}
            </div>
          </div>
        )}

        <Button 
          onClick={handleSendTransaction}
          disabled={isSending || isConfirming || !recipient || !amount || !isValidAddress}
          className="w-full"
        >
          {isSending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Отправка...
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              Отправить транзакцию
            </>
          )}
        </Button>

        {(sendError || confirmError) && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {sendError?.message || confirmError?.message}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}