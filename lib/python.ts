import { useEffect, useState, useCallback } from "react";
import type { loadPyodide, PyodideInterface } from "pyodide";
import type { PyProxy } from "pyodide/ffi";

// Global state management
let globalPyodide: PyodideInterface | undefined;
let loadingPromise: Promise<PyodideInterface> | undefined;
let isScriptLoaded = false;

// Script loading utility
const loadPyodideScript = (): Promise<void> => {
    return new Promise((resolve, reject) => {
        if (isScriptLoaded) {
            resolve();
            return;
        }

        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/pyodide/v0.27.7/full/pyodide.js";
        script.async = true;
        script.onload = () => {
            isScriptLoaded = true;
            resolve();
        };
        script.onerror = () => reject(new Error("Failed to load Pyodide script"));
        document.head.appendChild(script);
    });
};

// Global Pyodide loader
async function loadGlobalPyodide(): Promise<PyodideInterface> {
    if (globalPyodide) {
        return globalPyodide;
    }

    if (loadingPromise) {
        return loadingPromise;
    }

    loadingPromise = (async () => {
        try {
            // Ensure script is loaded first
            await loadPyodideScript();

            // Wait for loadPyodide to be available
            const loadPyodideFunc = (
                globalThis as typeof globalThis & {
                    loadPyodide: typeof loadPyodide;
                }
            ).loadPyodide;

            if (!loadPyodideFunc) {
                throw new Error("loadPyodide function not available");
            }

            globalPyodide = await loadPyodideFunc({
                indexURL: "https://cdn.jsdelivr.net/pyodide/v0.27.7/full/",
            });

            return globalPyodide;
        } catch (error) {
            loadingPromise = undefined; // Reset on error to allow retry
            throw error;
        }
    })();

    return loadingPromise;
}

// Update the usePyodide hook
export function usePyodide(autoLoad: boolean = false) {
    const [pyodide, setPyodide] = useState<PyodideInterface | undefined>(
        globalPyodide
    );
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | undefined>();

    const loadPyodide = useCallback(async () => {
        if (globalPyodide) {
            setPyodide(globalPyodide);
            setLoading(false);
            return globalPyodide;
        }

        try {
            setLoading(true);
            setError(undefined);
            const pyodideInstance = await loadGlobalPyodide();
            setPyodide(pyodideInstance);
            return pyodideInstance;
        } catch (err) {
            const error = err instanceof Error ? err : new Error("Unknown error");
            setError(error);
            throw error;
        } finally {
            setLoading(false);
        }
    }, []);

    const runPython = useCallback(
        async (code: string, options?: {
            globals?: PyProxy;
            locals?: PyProxy;
            filename?: string;
        }) => {
            if (!pyodide) {
                throw new Error("Pyodide not loaded");
            }
            return pyodide.runPython(code, options);
        },
        [pyodide]
    );

    const installPackage = useCallback(
        async (names: string | PyProxy | Array<string>, options?: {
            messageCallback?: (message: string) => void;
            errorCallback?: (message: string) => void;
            checkIntegrity?: boolean;
        }) => {
            if (!pyodide) {
                throw new Error("Pyodide not loaded");
            }
            await pyodide.loadPackage(names, options);
        },
        [pyodide]
    );

    useEffect(() => {
        if (autoLoad && !globalPyodide && !loading && !error) {
            loadPyodide().catch(() => {
                // Error is already handled in loadPyodide
            });
        }
    }, [loadPyodide, loading, error, autoLoad]);

    return {
        pyodide,
        loading,
        error,
        loadPyodide,
        runPython,
        installPackage,
        isReady: !!pyodide && !loading,
    };
}