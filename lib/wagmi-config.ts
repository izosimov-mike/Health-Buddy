import { http, createConfig } from 'wagmi'
import { celo, base } from 'wagmi/chains'
import { farcasterMiniApp as miniAppConnector } from '@farcaster/miniapp-wagmi-connector'

// Конфигурация Wagmi для работы с сетями Celo и Base
export const wagmiConfig = createConfig({
  chains: [celo, base], // Поддержка сетей Celo и Base
  transports: {
    // Используем официальный RPC для Celo
    [celo.id]: http('https://celo.drpc.org'),
    // Используем официальный RPC для Base
    [base.id]: http('https://mainnet.base.org'),
  },
  connectors: [
    miniAppConnector() // Farcaster Mini App коннектор
  ],
  ssr: true, // Включаем поддержку SSR для предотвращения ошибок getChainId
  syncConnectedChain: true, // Синхронизируем подключенную сеть
})

// Экспорт цепей для использования в компонентах
export { celo, base }