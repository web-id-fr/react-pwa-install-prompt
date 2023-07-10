import { useEffect, useRef, useState } from 'react'
import useLocalStorage from './useLocalStorage'

export type PwaInstallPromptProps = {
    debug?: boolean
    onInstall?: () => void
    onAdd?: () => void
    onCancel?: () => void
}

type Session = {
    lastDisplayTime: number // last time we displayed the message
    displayCount: number // number of times the message has been shown
    optedOut: boolean // has the user opted out
    added: boolean // has been actually added to the home screen
}

const usePwaInstallPrompt = (props: PwaInstallPromptProps) => {
    console.log('usePwaInstallPrompt', props)
    const [platform, setPlatform] = useState<Record<string, boolean>>({})
    const initialSession: Session = {
        lastDisplayTime: 0,
        displayCount: 0,
        optedOut: false,
        added: false,
    }
    const [session, setSession] = useLocalStorage<Session>('react-pwa-install-prompt-session', initialSession)
    const [open, setOpen] = useState<boolean>(false)

    useEffect(() => {
        if (!open && !session.added && !session.optedOut) {
            setOpen(true)
        }
    }, [open, session.added, session.optedOut])

    const triggerNativePrompt = (): void => {
        if (!beforeInstallPromptEvent.current) {
            return
        }

        const event = beforeInstallPromptEvent.current as BeforeInstallPromptEvent
        void event
            .prompt()
            .then(() => {
                // Wait for the user to respond to the prompt
                return event?.userChoice
            })
            .then((choiceResult) => {
                const newSession = { ...(session as object) } as Session
                newSession.added = choiceResult?.outcome === 'accepted'

                if (newSession.added) {
                    console.log('user accepted the A2HS prompt')
                    props.onAdd?.()
                } else {
                    props.onCancel?.()
                    newSession.optedOut = true
                    console.log('user dismissed the A2HS prompt')
                }
                setSession(newSession)
            })
    }

    const beforeInstallPromptEvent = useRef<Event>()
    const handleBeforeInstallPrompt = (event: Event) => {
        console.log('handleBeforeInstallPrompt')
        event.preventDefault()
        beforeInstallPromptEvent.current = event
    }

    const handleAppInstalled = () => {
        console.log('handleAppInstalled')
    }

    const handleInstall = () => {
        props.onInstall?.()
        if (beforeInstallPromptEvent.current) {
            setOpen(false)
            triggerNativePrompt()
        }
    }

    const handleClose = () => {
        props.onCancel?.()
        setSession((session: Session) => ({ ...(session as object), optedOut: true }) as Session)
        setOpen(false)
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
        open,
        handleInstall,
        handleClose,
        isCompatible: (platform.isBworserCompatible && platform.isManifestDefined && platform.isSWReady) ?? false,
        platform,
        session,
    }
}

export default usePwaInstallPrompt
