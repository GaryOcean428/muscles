import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { VitePWA } from 'vite-plugin-pwa'
import sourceInfo from 'vite-plugin-source-info'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const isProduction = mode === 'production'
  
  return {
    plugins: [
      react(),
      sourceInfo(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
        manifest: {
          name: 'Muscles - AI Fitness Coach',
          short_name: 'Muscles AI',
          description: 'Your personalized AI-powered fitness trainer for CrossFit, HIIT, and strength training',
          theme_color: '#3B82F6',
          background_color: '#ffffff',
          display: 'standalone',
          start_url: '/',
          icons: [
            {
              src: 'pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png'
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable'
            }
          ],
          categories: ['health', 'fitness', 'lifestyle']
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,json,vue,txt,woff2}'],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/ksrpwcmgripianipsdti\.supabase\.co\/rest\/v1\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'supabase-api-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365 // 365 days
                }
              }
            },
            {
              urlPattern: /^https:\/\/ksrpwcmgripianipsdti\.supabase\.co\/functions\/v1\/.*/i,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'supabase-functions-cache',
                networkTimeoutSeconds: 3,
                expiration: {
                  maxEntries: 5,
                  maxAgeSeconds: 60 * 60 * 24 // 24 hours
                }
              }
            },
            {
              urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365 // 365 days
                }
              }
            },
            {
              urlPattern: ({ request }) => request.destination === 'image',
              handler: 'CacheFirst',
              options: {
                cacheName: 'images-cache',
                expiration: {
                  maxEntries: 100,
                  maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
                }
              }
            }
          ]
        },
        devOptions: {
          enabled: false
        }
      })
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
            supabase: ['@supabase/supabase-js'],
            ui: [
              '@radix-ui/react-dialog', 
              '@radix-ui/react-dropdown-menu',
              '@radix-ui/react-navigation-menu',
              '@radix-ui/react-tabs'
            ],
            charts: ['recharts'],
            forms: ['react-hook-form', 'zod', '@hookform/resolvers']
          }
        }
      },
      sourcemap: !isProduction || env.VITE_DISABLE_SOURCEMAPS !== 'true',
      // Railway has memory constraints, optimize for that
      minify: isProduction ? 'esbuild' : false,
      target: 'esnext',
      assetsInlineLimit: 4096, // 4kb
      chunkSizeWarningLimit: 1000, // 1000kb
      reportCompressedSize: false
    },
    optimizeDeps: {
      exclude: ['lucide-react'],
      esbuildOptions: {
        target: 'esnext'
      }
    },
    server: {
      port: Number(env.PORT) || 3000,
      host: true
    },
    preview: {
      port: Number(env.PORT) || 3000,
      host: true
    }
  }
})
