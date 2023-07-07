import { useEffect, useState } from 'react'

export type PwaInstallPromptProps = {
    debug?: boolean
}

const usePwaInstallPrompt = (props: PwaInstallPromptProps) => {
    console.log('usePwaInstallPrompt', props)
    const [platform, setPlatform] = useState<Record<string, boolean>>({})
    const handleBeforeInstallPrompt = (event: Event) => {
        console.log('handleBeforeInstallPrompt')
        event.preventDefault()
    }

    const handleAppInstalled = () => {
        console.log('handleAppInstalled')
    }

    useEffect(() => {
        const platform: Record<string, boolean> = {}
        platform.isIDevice =
            /iPad|iPhone|iPod/i.test(navigator.userAgent) ||
            (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
        platform.isSamsung = /Samsung/i.test(navigator.userAgent)
        platform.isFireFox = /Firefox/i.test(navigator.userAgent)
        platform.isOpera = /Opera/i.test(navigator.userAgent)
        platform.isEdge = /Edge/i.test(navigator.userAgent)

        // Opera & FireFox only Trigger on Android
        if (platform.isFireFox) {
            platform.isFireFox = /Android/i.test(navigator.userAgent)
        }
        if (platform.isOpera) {
            platform.isOpera = /Android/i.test(navigator.userAgent)
        }

        platform.isChromium = 'onbeforeinstallprompt' in window
        platform.isInWebAppiOS = 'standalone' in window.navigator && window.navigator.standalone === true
        platform.isInWebAppChrome = window.matchMedia('(display-mode: standalone)').matches
        platform.isStandalone = platform.isInWebAppiOS || platform.isInWebAppChrome
        platform.isBworserCompatible =
            platform.isChromium || platform.isIDevice || platform.isSamsung || platform.isFireFox || platform.isOpera

        const manifest = document.querySelector('[rel="manifest"]')
        platform.isManifestDefined = Boolean(manifest)
        platform.isSWReady = false
        setPlatform(platform)

        if ('serviceWorker' in navigator) {
            void navigator.serviceWorker.ready.then((sw) => {
                console.log('ready', sw)
                setPlatform((platform) => ({ ...platform, isSWReady: true }))
            })
        }

        if ('onbeforeinstallprompt' in window) {
            window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
        }
        if ('onappinstalled' in window) {
            window.addEventListener('appinstalled', handleAppInstalled)
        }

        return () => {
            if ('onbeforeinstallprompt' in window) {
                window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
            }
            if ('onappinstalled' in window) {
                window.removeEventListener('appinstalled', handleAppInstalled)
            }
        }
    }, [])

    return {
        isCompatible: (platform.isBworserCompatible && platform.isManifestDefined && platform.isSWReady) ?? false,
        ...platform,
    }
}

export default usePwaInstallPrompt
