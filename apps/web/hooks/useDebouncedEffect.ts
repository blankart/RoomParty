import { useEffect } from "react"

type ReturnTypeUseEffect = Parameters<typeof useEffect>

export const DEFAULT_DEBOUNCED_TIME = 1_000

export default function useDebouncedEffect(
    f: ReturnTypeUseEffect[0],
    deps: ReturnTypeUseEffect[1],
    debounceTime?: number
) {
    if (typeof debounceTime !== 'number') debounceTime = DEFAULT_DEBOUNCED_TIME

    useEffect(() => {
        let cleanup: any
        const timeout = setTimeout(() => {
            cleanup = f()
        }, debounceTime)

        return () => {
            clearTimeout(timeout)
            cleanup?.()
        }
    }, [deps])
}