import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true
      },
      manifest: {
        name: 'CampusPayX',
        short_name: 'CampusPayX',
        description: 'Campus Mess Management System',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'campuspayx_logo.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'campuspayx_logo.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
})
