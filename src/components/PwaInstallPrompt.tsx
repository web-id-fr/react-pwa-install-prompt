import usePwaInstallPrompt, { type PwaInstallPromptProps } from '../hooks/usePwaInstallPrompt'

const PwaInstallPrompt = (props: PwaInstallPromptProps) => {
    const state = usePwaInstallPrompt(props)
    console.log(state)

    if (!state.isCompatible) {
        return false
    }

    return <div></div>
}

export default PwaInstallPrompt
