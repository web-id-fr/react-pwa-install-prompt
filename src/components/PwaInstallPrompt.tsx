import usePwaInstallPrompt, { type PwaInstallPromptProps } from '../hooks/usePwaInstallPrompt'

const PwaInstallPrompt = (props: PwaInstallPromptProps) => {
    const { isCompatible } = usePwaInstallPrompt(props)

    if (!isCompatible) {
        return null
    }

    return <div></div>
}

export default PwaInstallPrompt
