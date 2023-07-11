import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
    console.log(process.cwd())
    Object.assign(process.env, loadEnv(mode, process.cwd(), ''))

    const { hostname, protocol } = new URL(process.env.APP_URL)

    return {
        plugins: [
            react(),
            VitePWA({
                devOptions: {
                    enabled: true,
                },
                manifest: {
                    name: 'A2HS',
                    short_name: 'A2HS',
                    description: 'React PWA Install Prompt',
                    theme_color: '#ffffff',
                    background_color: '#ffffff',
                    display: 'standalone',
                    icons: [
                        {
                            src: 'android-chrome-192x192.png',
                            sizes: '192x192',
                            type: 'image/png',
                        },
                        {
                            src: 'android-chrome-512x512.png',
                            sizes: '512x512',
                            type: 'image/png',
                        },
                    ],
                },
            }),
        ],
        server: {
            host: hostname,
            https:
                protocol === 'https:'
                    ? {
                          key: path.resolve(process.env.HOME, `.config/valet/Certificates/${hostname}.key`),
                          cert: path.resolve(process.env.HOME, `.config/valet/Certificates/${hostname}.crt`),
                      }
                    : false,
        },
    }
})
