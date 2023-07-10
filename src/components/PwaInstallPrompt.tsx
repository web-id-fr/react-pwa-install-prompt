import usePwaInstallPrompt, { type PwaInstallPromptProps } from '../hooks/usePwaInstallPrompt'

const PwaInstallPrompt = (props: PwaInstallPromptProps) => {
    const state = usePwaInstallPrompt(props)
    console.log(state)

    if (!state.isCompatible) {
        return false
    }

    return (
        <div style={{ opacity: !state.open ? 0.1 : 1 }}>
            Install PWA
            <button onClick={state.handleClose}>Close</button>
            <button onClick={state.handleInstall}>Install</button>
        </div>
    )
}

export default PwaInstallPrompt
