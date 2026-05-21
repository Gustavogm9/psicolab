import { VitePWAOptions } from 'vite-plugin-pwa';

export const pwaConfig: Partial<VitePWAOptions> = {
  registerType: 'autoUpdate',
  includeAssets: ['favicon.ico', 'favicon.png', 'favicon.svg', 'robots.txt'],
  manifest: {
    name: 'MenteMetrics - Saúde Mental Corporativa',
    short_name: 'MenteMetrics',
    description: 'Plataforma integrada de avaliação de riscos psicossociais e bem-estar organizacional.',
    theme_color: '#6366f1',
    background_color: '#ffffff',
    display: 'standalone',
    orientation: 'portrait',
    start_url: '/',
    scope: '/',
    icons: [
      {
        src: '/favicon.png',
        sizes: '192x192',
        type: 'image/png'
      },
      {
        src: '/favicon.png',
        sizes: '512x512',
        type: 'image/png'
      },
      {
        src: '/favicon.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable'
      }
    ]
  },
  workbox: {
    globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
    runtimeCaching: [
      {
        // Cache de fontes do Google
        urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'google-fonts-cache',
          expiration: {
            maxEntries: 10,
            maxAgeSeconds: 60 * 60 * 24 * 365 // 1 ano
          }
        }
      },
      {
        // Cache de imagens do Supabase Storage (Logos de Whitelabel)
        urlPattern: /.*\.supabase\.co\/storage\/v1\/object\/public\/.*/i,
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'supabase-storage-cache',
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 60 * 60 * 24 * 30 // 30 dias
          }
        }
      },
      {
        // API Rest do Supabase (Consultas de tabelas estáticas)
        urlPattern: /.*\.supabase\.co\/rest\/v1\/.*/i,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'supabase-api-cache',
          networkTimeoutSeconds: 5,
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 60 * 60 * 24 // 1 dia
          }
        }
      }
    ]
  }
};
export default pwaConfig;
