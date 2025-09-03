import { http, createConfig } from 'wagmi'
import { celo } from 'wagmi/chains'
import { farcasterMiniApp as miniAppConnector } from '@farcaster/miniapp-wagmi-connector'

// Конфигурация Wagmi для работы с сетью Celo
export const wagmiConfig = createConfig({
  chains: [celo], // Основная сеть Celo
  transports: {
    [celo.id]: http(),
  },
  connectors: [
    miniAppConnector() // Farcaster Mini App коннектор
  ]
})

// Экспорт цепей для использования в компонентах
export { celo }