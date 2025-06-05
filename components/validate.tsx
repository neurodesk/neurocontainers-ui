import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import {
    PlayIcon,
    DocumentTextIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    ArrowPathIcon,
    ClipboardDocumentIcon,
} from "@heroicons/react/24/outline";
import { usePyodide } from "@/lib/python";
import { loadBuilder, Builder, type BuildOptions } from "@/lib/builder";
import { ContainerRecipe } from "@/components/common";

interface ValidationResult {
    success: boolean;
    dockerfile?: string;
    readme?: string;
    buildDirectory?: string;
    deployBins?: string[];
    deployPath?: string[];
    error?: string;
    warnings?: string[];
}

export default function ContainerValidator({
    recipe,
}: {
    recipe: ContainerRecipe;
}) {
    const { pyodide, loading: pyodideLoading, error: pyodideError, loadPyodide } = usePyodide();
    const [builder, setBuilder] = useState<Builder | null>(null);
    const [builderLoading, setBuilderLoading] = useState(false);
    const [builderError, setBuilderError] = useState<string | null>(null);
    const [validating, setValidating] = useState(false);
    const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
    const [showDockerfile, setShowDockerfile] = useState(false);
    const [buildOptions, setBuildOptions] = useState<BuildOptions>({
        architecture: "x86_64",
        ignoreArchitecture: false,
        maxParallelJobs: 4,
    });

    const dockerfileRef = useRef<HTMLPreElement>(null);
    const builderLoadAttempted = useRef(false);
    const isLoadingBuilder = useRef(false);

    // Memoize the ready state to prevent unnecessary re-renders
    const isReady = useMemo(() => {
        return pyodide && builder && !builderLoading && !pyodideLoading;
    }, [pyodide, builder, builderLoading, pyodideLoading]);

    const canValidate = useMemo(() => {
        return isReady && !validating && recipe.build.directives && recipe.build.directives.length > 0;
    }, [isReady, validating, recipe.build.directives]);

    // Stable function to load builder - prevents infinite loops
    const loadBuilderInstance = useCallback(async () => {
        if (!pyodide || builder || builderLoading || isLoadingBuilder.current || builderLoadAttempted.current) {
            return;
        }

        try {
            isLoadingBuilder.current = true;
            builderLoadAttempted.current = true;
            setBuilderLoading(true);
            setBuilderError(null);

            console.log("Loading builder instance...");
            const builderInstance = await loadBuilder(pyodide);
            console.log("Builder loaded successfully");

            setBuilder(builderInstance);
        } catch (error) {
            console.error("Failed to load builder:", error);
            setBuilderError(
                error instanceof Error ? error.message : "Failed to load builder"
            );
        } finally {
            setBuilderLoading(false);
            isLoadingBuilder.current = false;
        }
    }, [pyodide, builder, builderLoading]);

    // Load builder when Pyodide is ready - only once
    useEffect(() => {
        if (pyodide && !builder && !builderLoading && !builderLoadAttempted.current) {
            console.log("Pyodide ready, attempting to load builder...");
            loadBuilderInstance();
        }
    }, [pyodide, loadBuilderInstance, builder, builderLoading]);

    const validateRecipe = useCallback(async () => {
        if (!builder || validating) {
            console.log("Cannot validate: builder not ready or already validating");
            return;
        }

        try {
            setValidating(true);
            setValidationResult(null);
            console.log("Starting validation...");

            console.log("Container recipe:", recipe);

            // Generate the container
            const result = await builder.generateFromDescription(
                recipe,
                "/tmp/build",
                buildOptions
            );

            console.log("Validation result:", result);

            if (result) {
                setValidationResult({
                    success: true,
                    dockerfile: result.dockerfile,
                    readme: result.readme,
                    buildDirectory: result.buildDirectory,
                    deployBins: result.deployBins,
                    deployPath: result.deployPath,
                });
                setShowDockerfile(true);
            } else {
                setValidationResult({
                    success: false,
                    error: "Failed to generate container. Please check your recipe configuration.",
                });
            }
        } catch (error) {
            console.error("Validation error:", error);
            setValidationResult({
                success: false,
                error: error instanceof Error ? error.message : "Unknown validation error",
            });
        } finally {
            setValidating(false);
        }
    }, [builder, recipe, buildOptions, validating]);

    const copyDockerfile = useCallback(async () => {
        if (validationResult?.dockerfile) {
            try {
                await navigator.clipboard.writeText(validationResult.dockerfile);
                // You might want to show a toast notification here
                console.log("Dockerfile copied to clipboard");
            } catch (error) {
                console.error("Failed to copy to clipboard:", error);
            }
        }
    }, [validationResult?.dockerfile]);

    const downloadDockerfile = useCallback(() => {
        if (validationResult?.dockerfile) {
            const blob = new Blob([validationResult.dockerfile], {
                type: "text/plain",
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "Dockerfile";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    }, [validationResult?.dockerfile]);

    // Manual retry function for builder loading
    const retryLoadBuilder = useCallback(() => {
        builderLoadAttempted.current = false;
        setBuilderError(null);
        loadBuilderInstance();
    }, [loadBuilderInstance]);

    return (
        <div className="bg-white rounded-lg shadow-md border border-[#d3e7b6]">
            <div className="p-4 sm:p-6">
                {/* Status Section */}
                <div className="mb-6">
                    <h3 className="text-lg font-medium text-[#0c0e0a] mb-3">Status</h3>
                    <div className="space-y-2">
                        {/* Pyodide Status */}
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-md">
                            <div className="flex-shrink-0">
                                {pyodideLoading ? (
                                    <ArrowPathIcon className="h-5 w-5 text-blue-500 animate-spin" />
                                ) : pyodideError ? (
                                    <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
                                ) : pyodide ? (
                                    <CheckCircleIcon className="h-5 w-5 text-green-500" />
                                ) : (
                                    <div className="h-5 w-5 bg-gray-300 rounded-full" />
                                )}
                            </div>
                            <div className="flex-1">
                                <p className="font-medium text-sm">
                                    Pyodide Runtime
                                    {pyodideLoading && " (Loading...)"}
                                    {pyodideError && " (Error)"}
                                    {pyodide && " (Ready)"}
                                </p>
                                {pyodideError && (
                                    <p className="text-xs text-red-600 mt-1">
                                        {pyodideError.message}
                                    </p>
                                )}
                            </div>
                            {!pyodide && !pyodideLoading && (
                                <button
                                    onClick={loadPyodide}
                                    className="px-3 py-1 text-xs font-medium text-[#6aa329] border border-[#6aa329] rounded hover:bg-[#6aa329] hover:text-white transition-colors"
                                >
                                    Load Pyodide
                                </button>
                            )}
                        </div>

                        {/* Builder Status */}
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-md">
                            <div className="flex-shrink-0">
                                {builderLoading ? (
                                    <ArrowPathIcon className="h-5 w-5 text-blue-500 animate-spin" />
                                ) : builderError ? (
                                    <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
                                ) : builder ? (
                                    <CheckCircleIcon className="h-5 w-5 text-green-500" />
                                ) : (
                                    <div className="h-5 w-5 bg-gray-300 rounded-full" />
                                )}
                            </div>
                            <div className="flex-1">
                                <p className="font-medium text-sm">
                                    Container Builder
                                    {builderLoading && " (Loading...)"}
                                    {builderError && " (Error)"}
                                    {builder && " (Ready)"}
                                </p>
                                {builderError && (
                                    <p className="text-xs text-red-600 mt-1">{builderError}</p>
                                )}
                            </div>
                            {pyodide && !builder && !builderLoading && (
                                <button
                                    onClick={retryLoadBuilder}
                                    className="px-3 py-1 text-xs font-medium text-[#6aa329] border border-[#6aa329] rounded hover:bg-[#6aa329] hover:text-white transition-colors"
                                >
                                    {builderError ? "Retry" : "Load Builder"}
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Build Options */}
                {isReady && (
                    <div className="mb-6">
                        <h3 className="text-lg font-medium text-[#0c0e0a] mb-3">
                            Build Options
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Architecture
                                </label>
                                <select
                                    className="w-full px-3 py-2 border border-gray-200 rounded-md text-[#0c0e0a] bg-white focus:outline-none focus:ring-1 focus:ring-[#6aa329] focus:border-[#6aa329]"
                                    value={buildOptions.architecture}
                                    onChange={(e) =>
                                        setBuildOptions({
                                            ...buildOptions,
                                            architecture: e.target.value,
                                        })
                                    }
                                >
                                    <option value="x86_64">x86_64</option>
                                    <option value="aarch64">aarch64</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Max Parallel Jobs
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    max="16"
                                    className="w-full px-3 py-2 border border-gray-200 rounded-md text-[#0c0e0a] focus:outline-none focus:ring-1 focus:ring-[#6aa329] focus:border-[#6aa329]"
                                    value={buildOptions.maxParallelJobs}
                                    onChange={(e) =>
                                        setBuildOptions({
                                            ...buildOptions,
                                            maxParallelJobs: parseInt(e.target.value) || 4,
                                        })
                                    }
                                />
                            </div>
                        </div>
                        <div className="mt-4 space-y-2">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    className="mr-2 text-[#6aa329] focus:ring-[#6aa329]"
                                    checked={buildOptions.ignoreArchitecture}
                                    onChange={(e) =>
                                        setBuildOptions({
                                            ...buildOptions,
                                            ignoreArchitecture: e.target.checked,
                                        })
                                    }
                                />
                                <span className="text-sm text-gray-700">
                                    Ignore Architecture Constraints
                                </span>
                            </label>
                        </div>
                    </div>
                )}

                {/* Validation Section */}
                <div className="mb-6">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
                        <h3 className="text-lg font-medium text-[#0c0e0a]">Validation</h3>
                        <button
                            onClick={validateRecipe}
                            disabled={!canValidate}
                            className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors ${canValidate
                                ? "bg-[#6aa329] text-white hover:bg-[#5a8f23]"
                                : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                }`}
                        >
                            {validating ? (
                                <ArrowPathIcon className="h-4 w-4 animate-spin" />
                            ) : (
                                <PlayIcon className="h-4 w-4" />
                            )}
                            {validating ? "Validating..." : "Validate & Generate"}
                        </button>
                    </div>

                    {!isReady && (
                        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                            <p className="text-sm text-yellow-800">
                                Please load Pyodide and the builder to validate your recipe.
                            </p>
                        </div>
                    )}

                    {isReady && (!recipe.build.directives || recipe.build.directives.length === 0) && (
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                            <p className="text-sm text-blue-800">
                                Add some directives to your recipe before validating.
                            </p>
                        </div>
                    )}

                    {validationResult && (
                        <div
                            className={`p-4 rounded-md border ${validationResult.success
                                ? "bg-green-50 border-green-200"
                                : "bg-red-50 border-red-200"
                                }`}
                        >
                            <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 mt-0.5">
                                    {validationResult.success ? (
                                        <CheckCircleIcon className="h-5 w-5 text-green-500" />
                                    ) : (
                                        <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <p
                                        className={`font-medium text-sm ${validationResult.success
                                            ? "text-green-800"
                                            : "text-red-800"
                                            }`}
                                    >
                                        {validationResult.success
                                            ? "Validation Successful!"
                                            : "Validation Failed"}
                                    </p>
                                    {validationResult.error && (
                                        /* Display the error message as a code block with newlines */
                                        <pre className="mt-2 text-sm text-red-700 whitespace-pre-wrap">
                                            {validationResult.error}
                                        </pre>
                                    )}
                                    {validationResult.success && (
                                        <div className="mt-2 space-y-1 text-sm text-green-700">
                                            <p>✓ Dockerfile generated successfully</p>
                                            {validationResult.deployBins &&
                                                validationResult.deployBins.length > 0 && (
                                                    <p>
                                                        ✓ Deploy binaries:{" "}
                                                        {validationResult.deployBins.join(", ")}
                                                    </p>
                                                )}
                                            {validationResult.deployPath &&
                                                validationResult.deployPath.length > 0 && (
                                                    <p>
                                                        ✓ Deploy paths:{" "}
                                                        {validationResult.deployPath.join(", ")}
                                                    </p>
                                                )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Dockerfile Display */}
                {validationResult?.success && validationResult.dockerfile && (
                    <div className="mb-6">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
                            <h3 className="text-lg font-medium text-[#0c0e0a] flex items-center gap-2">
                                <DocumentTextIcon className="h-5 w-5" />
                                Generated Dockerfile
                            </h3>
                            <div className="flex gap-2">
                                <button
                                    onClick={copyDockerfile}
                                    className="flex items-center gap-2 px-3 py-1 text-sm font-medium text-[#6aa329] border border-[#6aa329] rounded hover:bg-[#6aa329] hover:text-white transition-colors"
                                >
                                    <ClipboardDocumentIcon className="h-4 w-4" />
                                    Copy
                                </button>
                                <button
                                    onClick={downloadDockerfile}
                                    className="flex items-center gap-2 px-3 py-1 text-sm font-medium text-[#6aa329] border border-[#6aa329] rounded hover:bg-[#6aa329] hover:text-white transition-colors"
                                >
                                    <DocumentTextIcon className="h-4 w-4" />
                                    Download
                                </button>
                                <button
                                    onClick={() => setShowDockerfile(!showDockerfile)}
                                    className="px-3 py-1 text-sm font-medium text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                                >
                                    {showDockerfile ? "Hide" : "Show"}
                                </button>
                            </div>
                        </div>

                        {showDockerfile && (
                            <div className="bg-gray-900 rounded-lg overflow-hidden">
                                <div className="bg-gray-800 px-4 py-2 flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-300">
                                        Dockerfile
                                    </span>
                                    <span className="text-xs text-gray-400">
                                        {validationResult.dockerfile.split('\n').length} lines
                                    </span>
                                </div>
                                <pre
                                    ref={dockerfileRef}
                                    className="p-4 text-sm text-gray-100 overflow-x-auto max-h-96 overflow-y-auto"
                                    style={{ fontFamily: 'Monaco, "Courier New", monospace' }}
                                >
                                    {validationResult.dockerfile}
                                </pre>
                            </div>
                        )}
                    </div>
                )}

                {/* Additional Information */}
                {validationResult?.success && validationResult.readme && (
                    <div className="mb-6">
                        <h3 className="text-lg font-medium text-[#0c0e0a] mb-3">
                            Build Information
                        </h3>
                        <div className="bg-gray-50 rounded-lg p-4">
                            <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                                {validationResult.readme}
                            </pre>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}