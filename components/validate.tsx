import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import {
    PlayIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    ArrowPathIcon,
    DocumentTextIcon,
    PlusIcon,
    PencilIcon,
    ClipboardDocumentIcon,
    ChevronDownIcon,
    ChevronUpIcon,
    CloudArrowUpIcon,
    InformationCircleIcon,
} from "@heroicons/react/24/outline";
import { usePyodide } from "@/lib/python";
import { loadBuilder, Builder, type BuildOptions } from "@/lib/builder";
import { ContainerRecipe, NEUROCONTAINERS_REPO } from "@/components/common";
import { getCards, iconStyles, cn } from "@/lib/styles";
import { useTheme } from "@/lib/ThemeContext";
import { ValidationResult } from "@/types/validation";
import { useGitHubFiles } from '@/lib/useGithub';
import { regenerateRecipe } from "@/lib/regenerateRecipe";
import pako from "pako";

export default function ContainerValidator({
    recipe,
    onValidationChange,
    onValidationResult,
    disabled,
    disabledReason,
}: {
    recipe: ContainerRecipe;
    onValidationChange?: (isValid: boolean, hasResult: boolean) => void;
    onValidationResult?: (result: ValidationResult | null) => void;
    disabled?: boolean;
    disabledReason?: string;
}) {
    const { isDark } = useTheme();
    const { pyodide, loading: pyodideLoading, error: pyodideError, loadPyodide } = usePyodide();
    const [builder, setBuilder] = useState<Builder | null>(null);
    const [builderLoading, setBuilderLoading] = useState(false);
    const [builderError, setBuilderError] = useState<string | null>(null);
    const [validating, setValidating] = useState(false);
    const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
    const [showDockerfile, setShowDockerfile] = useState(false);
    
    // Publishing state
    const [showYamlPreview, setShowYamlPreview] = useState(false);
    const [copiedYaml, setCopiedYaml] = useState(false);
    const [copiedDockerfile, setCopiedDockerfile] = useState(false);
    
    // GitHub integration
    const { files } = useGitHubFiles('neurodesk', 'neurocontainers', 'main');
    const containerExists = recipe ? files.some(file =>
        file.path === `recipes/${recipe.name}/build.yaml`
    ) : false;
    

    const builderLoadAttempted = useRef(false);
    const isLoadingBuilder = useRef(false);

    // Memoize the ready state to prevent unnecessary re-renders
    const isReady = useMemo(() => {
        return pyodide && builder && !builderLoading && !pyodideLoading;
    }, [pyodide, builder, builderLoading, pyodideLoading]);


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

    // Notify when validation result is cleared (e.g., when recipe changes)
    useEffect(() => {
        if (!validationResult) {
            onValidationChange?.(false, false);
            onValidationResult?.(null);
        } else {
            onValidationResult?.(validationResult);
        }
    }, [validationResult, onValidationChange, onValidationResult]);

    const validateRecipe = useCallback(async () => {
        if (!builder || validating) {
            console.log("Cannot validate: builder not ready or already validating");
            return;
        }

        try {
            setValidating(true);
            setValidationResult(null);
            console.log("Starting validation...");

            // Regenerate groups and structured readme before validation
            const updatedRecipe = regenerateRecipe(recipe);
            console.log("Container recipe after regeneration:", updatedRecipe);

            // Use default build options - no need to expose them to users
            const buildOptions: BuildOptions = {
                architecture: "x86_64",
                ignoreArchitecture: false,
                maxParallelJobs: 4,
            };
            
            // Generate the container using the regenerated recipe
            const result = await builder.generateFromDescription(
                updatedRecipe,
                "/tmp/build",
                buildOptions
            );

            console.log("Validation result:", result);

            if (result) {
                const validationResult = {
                    success: true,
                    dockerfile: result.dockerfile,
                    readme: result.readme,
                    buildDirectory: result.buildDirectory,
                    deployBins: result.deployBins,
                    deployPath: result.deployPath,
                };
                setValidationResult(validationResult);
                onValidationChange?.(true, true);
            } else {
                const validationResult = {
                    success: false,
                    error: "Failed to generate container. Please check your recipe configuration.",
                };
                setValidationResult(validationResult);
                onValidationChange?.(false, true);
            }
        } catch (error) {
            console.error("Validation error:", error);
            const validationResult = {
                success: false,
                error: error instanceof Error ? error.message : "Unknown validation error",
            };
            setValidationResult(validationResult);
            onValidationChange?.(false, true);
        } finally {
            setValidating(false);
        }
    }, [builder, recipe, validating, onValidationChange]);

    // Auto-load Pyodide and builder in sequence
    const autoLoadAndValidate = useCallback(async () => {
        try {
            // Step 1: Load Pyodide if not loaded
            if (!pyodide && !pyodideLoading) {
                await loadPyodide();
                return; // Let useEffect handle the next step
            }
            
            // Step 2: Load builder if Pyodide is ready but builder isn't
            if (pyodide && !builder && !builderLoading && !builderLoadAttempted.current) {
                await loadBuilderInstance();
                return; // Let user click validate again after builder loads
            }
            
            // Step 3: Validate if everything is ready
            if (isReady) {
                await validateRecipe();
            }
        } catch (error) {
            console.error("Auto-load error:", error);
        }
    }, [pyodide, pyodideLoading, loadPyodide, builder, builderLoading, loadBuilderInstance, isReady, validateRecipe]);


    // Generate YAML string for publishing
    const generateYAMLString = useCallback((data: ContainerRecipe): string => {
        const cleanData = {
            ...data,
            build: {
                ...data.build,
                directives: data.build.directives.filter(directive => {
                    // Check if the directive has content - different directives have different structures
                    if ('name' in directive && directive.name) {
                        return typeof directive.name === 'string' && directive.name.trim() !== "";
                    }
                    if ('type' in directive && directive.type) {
                        return typeof directive.type === 'string' && directive.type.trim() !== "";
                    }
                    return true; // Keep other directive types
                })
            }
        };
        
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const yaml = require('js-yaml');
        return yaml.dump(cleanData, {
            indent: 2,
            lineWidth: -1,
            noRefs: true,
            quotingType: '"'
        });
    }, []);
    
    // Compress YAML content to base64 deflate
    const compressToBase64 = useCallback((text: string): string => {
        const textEncoder = new TextEncoder();
        const compressed = pako.deflate(textEncoder.encode(text));
        return Buffer.from(compressed).toString('base64');
    }, []);
    
    // Copy functions
    const copyYamlToClipboard = useCallback(() => {
        // Regenerate before copying to ensure latest state
        const updatedRecipe = regenerateRecipe(recipe);
        const yamlText = generateYAMLString(updatedRecipe);
        navigator.clipboard.writeText(yamlText).then(() => {
            setCopiedYaml(true);
            setTimeout(() => setCopiedYaml(false), 2000);
        });
    }, [recipe, generateYAMLString]);
    
    const copyDockerfileToClipboard = useCallback(() => {
        if (validationResult?.dockerfile) {
            navigator.clipboard.writeText(validationResult.dockerfile).then(() => {
                setCopiedDockerfile(true);
                setTimeout(() => setCopiedDockerfile(false), 2000);
            });
        }
    }, [validationResult?.dockerfile]);
    
    // Handle GitHub issue creation
    const handleCreateIssue = useCallback(async (isUpdate: boolean = false) => {
        if (!recipe) return;

        // Regenerate groups and structured readme before publishing
        const updatedRecipe = regenerateRecipe(recipe);
        console.log("Publishing recipe after regeneration:", updatedRecipe);

        const yamlText = generateYAMLString(updatedRecipe);
        const compressedYaml = compressToBase64(yamlText);

        const action = isUpdate ? 'Update' : 'Add';
        const issueTitle = `[CONTRIBUTION] ${action} ${updatedRecipe.name} container`;

        const issueBodyWithYaml = `### ${action} Container Request

**Container Name:** ${updatedRecipe.name}
**Version:** ${updatedRecipe.version || 'latest'}

This is an automated contribution request to ${isUpdate ? 'update' : 'add'} the container recipe.

\`\`\`base64
${compressedYaml}
\`\`\`

---
*This issue was generated automatically by the Neurocontainers Builder UI*`;

        const isContentTooLarge = new Blob([issueBodyWithYaml]).size > 6 * 1024;

        let issueBody;
        if (isContentTooLarge) {
            issueBody = `### ${action} Container Request

**Container Name:** ${updatedRecipe.name}
**Version:** ${updatedRecipe.version || 'latest'}

This is an automated contribution request to ${isUpdate ? 'update' : 'add'} the container recipe.

Please paste the compressed YAML content from your clipboard below:

\`\`\`base64
# Paste base64 deflate compressed YAML content here
\`\`\`

---
*This issue was generated automatically by the Neurocontainers Builder UI*`;

            try {
                await navigator.clipboard.writeText(compressedYaml);
            } catch (err) {
                console.error('Failed to copy compressed YAML to clipboard:', err);
            }
        } else {
            issueBody = issueBodyWithYaml;
        }

        const targetUrl = new URL(`${NEUROCONTAINERS_REPO}/issues/new`);
        targetUrl.searchParams.append("title", issueTitle);
        targetUrl.searchParams.append("body", issueBody);

        window.open(targetUrl.toString(), "_blank", "noopener,noreferrer");
    }, [recipe, generateYAMLString, compressToBase64, regenerateRecipe]);
    
    // Determine button state and text
    const getButtonState = () => {
        if (disabled) return { text: "Cannot Validate", disabled: true, loading: false };
        if (pyodideLoading) return { text: "Loading Python Runtime...", disabled: true, loading: true };
        if (builderLoading) return { text: "Loading Container Builder...", disabled: true, loading: true };
        if (validating) return { text: "Validating Recipe...", disabled: true, loading: true };
        if (pyodideError || builderError) return { text: "Retry Validation", disabled: false, loading: false };
        return { text: "Validate Recipe", disabled: false, loading: false };
    };

    const buttonState = getButtonState();
    const isLoading = buttonState.loading;

    return (
        <div className={cn(
            getCards(isDark).minimal,
            "backdrop-blur-md",
            isDark ? "bg-black/20 border-[#2d4222]/50" : "bg-white/30 border-gray-200/50"
        )}>
            <div className="p-4 sm:p-6 space-y-6">
                {/* Big Validate Button */}
                <div className="text-center">
                    <button
                        onClick={autoLoadAndValidate}
                        disabled={buttonState.disabled || isLoading}
                        className={cn(
                            "group relative w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-semibold transition-all duration-300 text-lg backdrop-blur-sm border transform hover:scale-[1.02] hover:backdrop-blur-md overflow-hidden",
                            buttonState.disabled || isLoading
                                ? "opacity-50 cursor-not-allowed"
                                : "active:scale-[0.98]",
                            isDark
                                ? "bg-black/40 text-green-300 hover:bg-black/50 border-green-400/30 hover:border-green-300/50 shadow-lg hover:shadow-xl"
                                : "bg-white/40 text-green-700 hover:bg-white/50 border-green-400/30 hover:border-green-300/50 shadow-lg hover:shadow-xl"
                        )}
                    >
                        {/* Glass effect overlay */}
                        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        
                        {buttonState.loading ? (
                            <ArrowPathIcon className="h-6 w-6 animate-spin relative z-10" />
                        ) : (
                            <PlayIcon className="h-6 w-6 relative z-10" />
                        )}
                        <span className="relative z-10">{buttonState.text}</span>
                        
                        {/* Subtle shine effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transform -translate-x-full group-hover:translate-x-full transition-all duration-700 ease-out" />
                    </button>
                    
                    {disabled && disabledReason && (
                        <p className={cn(
                            "mt-2 text-sm",
                            isDark ? "text-red-400" : "text-red-600"
                        )}>
                            {disabledReason}
                        </p>
                    )}
                </div>

                {/* Error Messages */}
                {(pyodideError || builderError) && (
                    <div className={cn(
                        "p-4 border rounded-lg",
                        isDark ? "bg-red-900/20 border-red-700" : "bg-red-50 border-red-200"
                    )}>
                        <div className="flex items-start gap-3">
                            <ExclamationTriangleIcon className={cn(iconStyles(isDark, 'md'), "text-red-500 flex-shrink-0")} />
                            <div>
                                <p className={cn(
                                    "font-medium",
                                    isDark ? "text-red-400" : "text-red-800"
                                )}>
                                    Setup Error
                                </p>
                                <p className={cn(
                                    "text-sm mt-1",
                                    isDark ? "text-red-300" : "text-red-700"
                                )}>
                                    {pyodideError?.message || builderError}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Validation Results */}
                {validationResult && (
                    <div className={cn(
                        "border rounded-lg overflow-hidden",
                        validationResult.success
                            ? (isDark ? "bg-green-900/20 border-green-700" : "bg-green-50 border-green-200")
                            : (isDark ? "bg-red-900/20 border-red-700" : "bg-red-50 border-red-200")
                    )}>
                        {/* Validation Status */}
                        <div className="p-4">
                            <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 mt-0.5">
                                    {validationResult.success ? (
                                        <CheckCircleIcon className={cn(iconStyles(isDark, 'md'), "text-green-500")} />
                                    ) : (
                                        <ExclamationTriangleIcon className={cn(iconStyles(isDark, 'md'), "text-red-500")} />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <h3 className={cn(
                                        "font-medium",
                                        validationResult.success
                                            ? (isDark ? "text-green-400" : "text-green-800")
                                            : (isDark ? "text-red-400" : "text-red-800")
                                    )}>
                                        {validationResult.success ? "✓ Recipe Validated Successfully!" : "✗ Validation Failed"}
                                    </h3>
                                    
                                    {validationResult.error && (
                                        <pre className={cn(
                                            "mt-2 text-sm whitespace-pre-wrap break-words",
                                            isDark ? "text-red-400" : "text-red-700"
                                        )}>
                                            {validationResult.error}
                                        </pre>
                                    )}
                                    
                                    {validationResult.success && (
                                        <div className={cn(
                                            "mt-3 space-y-2",
                                            isDark ? "text-green-400" : "text-green-700"
                                        )}>
                                            <p className="text-sm">✓ Dockerfile generated and ready for deployment</p>
                                            {validationResult.deployBins && validationResult.deployBins.length > 0 && (
                                                <p className="text-sm">
                                                    ✓ Deploy binaries: <span className="font-mono text-xs">{validationResult.deployBins.join(", ")}</span>
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Publishing and Dockerfile sections (Success Only) */}
                        {validationResult.success && (
                            <div className={cn(
                                "border-t space-y-6 pt-6",
                                isDark ? "border-green-700/50" : "border-green-200"
                            )}>
                                {/* Ready to Publish Section */}
                                <div className={cn(
                                    "rounded-xl border backdrop-blur-md p-6 transition-all duration-300",
                                    isDark 
                                        ? "bg-black/20 border-white/10 shadow-lg hover:bg-black/30 hover:shadow-xl" 
                                        : "bg-white/30 border-white/20 shadow-lg hover:bg-white/40 hover:shadow-xl"
                                )}>
                                    <div className="text-center mb-6">
                                        <div className={cn(
                                            "inline-flex items-center justify-center w-12 h-12 rounded-full mb-3",
                                            isDark ? "bg-black/20 backdrop-blur-sm" : "bg-white/30 backdrop-blur-sm"
                                        )}>
                                            <CloudArrowUpIcon className={cn(
                                                "h-6 w-6",
                                                isDark ? "text-[#91c84a]" : "text-[#4f7b38]"
                                            )} />
                                        </div>
                                        <h3 className={cn(
                                            "text-lg font-semibold mb-2",
                                            isDark ? "text-[#e8f5d0]" : "text-[#0c0e0a]"
                                        )}>
                                            Ready to Publish!
                                        </h3>
                                        <p className={cn(
                                            "text-sm mb-6",
                                            isDark ? "text-[#91c84a]" : "text-[#4f7b38]"
                                        )}>
                                            Your container has been validated successfully. You can now publish it to the NeuroContainers repository.
                                        </p>
                                    </div>

                                    {/* Content Grid */}
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                                        {/* Left Column - Container Info & Preview */}
                                        <div className="space-y-4">
                                            {/* Container Info */}
                                            <div className={cn(
                                                "p-4 rounded-lg border backdrop-blur-sm",
                                                isDark ? "bg-black/20 border-white/5" : "bg-white/30 border-white/10"
                                            )}>
                                                <div className="grid grid-cols-2 gap-4 text-sm">
                                                    <div>
                                                        <span className={cn("text-xs font-medium", isDark ? "text-gray-400" : "text-gray-600")}>Container Name</span>
                                                        <p className={cn("font-semibold", isDark ? "text-[#e8f5d0]" : "text-[#0c0e0a]")}>{recipe.name}</p>
                                                    </div>
                                                    <div>
                                                        <span className={cn("text-xs font-medium", isDark ? "text-gray-400" : "text-gray-600")}>Version</span>
                                                        <p className={cn("font-semibold", isDark ? "text-[#e8f5d0]" : "text-[#0c0e0a]")}>{recipe.version || 'latest'}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* YAML Preview */}
                                            <div>
                                                <button
                                                    onClick={() => setShowYamlPreview(!showYamlPreview)}
                                                    className={cn(
                                                        "w-full flex items-center justify-between p-3 rounded-lg transition-colors border backdrop-blur-sm",
                                                        isDark 
                                                            ? "bg-black/20 hover:bg-black/30 border-white/5" 
                                                            : "bg-white/30 hover:bg-white/40 border-white/10"
                                                    )}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <DocumentTextIcon className={cn("h-4 w-4", isDark ? "text-gray-400" : "text-gray-600")} />
                                                        <span className={cn("text-sm font-medium", isDark ? "text-[#e8f5d0]" : "text-[#0c0e0a]")}>Preview YAML Recipe</span>
                                                    </div>
                                                    {showYamlPreview ? (
                                                        <ChevronUpIcon className={cn("h-4 w-4", isDark ? "text-gray-400" : "text-gray-600")} />
                                                    ) : (
                                                        <ChevronDownIcon className={cn("h-4 w-4", isDark ? "text-gray-400" : "text-gray-600")} />
                                                    )}
                                                </button>
                                                
                                                {showYamlPreview && (
                                                    <div className={cn(
                                                        "mt-2 rounded-lg border backdrop-blur-sm",
                                                        isDark ? "bg-black/30 border-white/5" : "bg-white/40 border-white/10"
                                                    )}>
                                                        <div className="flex items-center justify-between px-4 py-2 border-b border-white/5">
                                                            <span className={cn("text-xs font-medium", isDark ? "text-gray-400" : "text-gray-600")}>build.yaml</span>
                                                            <button
                                                                onClick={copyYamlToClipboard}
                                                                className={cn(
                                                                    "flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors",
                                                                    copiedYaml
                                                                        ? (isDark ? "bg-[#6ea232] text-white" : "bg-[#4f7b38] text-white")
                                                                        : (isDark
                                                                            ? "bg-black/30 text-[#91c84a] hover:bg-black/40"
                                                                            : "bg-white/30 text-[#4f7b38] hover:bg-white/40")
                                                                )}
                                                            >
                                                                <ClipboardDocumentIcon className="h-3 w-3" />
                                                                {copiedYaml ? "Copied!" : "Copy"}
                                                            </button>
                                                        </div>
                                                        <pre className={cn(
                                                            "p-4 overflow-x-auto text-xs max-h-64",
                                                            isDark ? "text-gray-300" : "text-gray-700"
                                                        )}>
                                                            <code>{generateYAMLString(regenerateRecipe(recipe))}</code>
                                                        </pre>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Right Column - Notifications */}
                                        <div className="space-y-4">
                                            {/* GitHub Login Notice */}
                                            <div className={cn(
                                                "p-4 rounded-lg border backdrop-blur-sm flex items-start gap-3",
                                                isDark ? "bg-amber-900/20 border-amber-700/30" : "bg-amber-50/50 border-amber-200/50"
                                            )}>
                                                <InformationCircleIcon className={cn(
                                                    "h-5 w-5 flex-shrink-0 mt-0.5",
                                                    isDark ? "text-amber-400" : "text-amber-600"
                                                )} />
                                                <div className="flex-1">
                                                    <p className={cn(
                                                        "text-sm font-medium",
                                                        isDark ? "text-amber-400" : "text-amber-700"
                                                    )}>GitHub Authentication Required</p>
                                                    <p className={cn(
                                                        "text-xs mt-1",
                                                        isDark ? "text-amber-400/80" : "text-amber-600"
                                                    )}>You&apos;ll need to be logged into GitHub to create an issue. The recipe will be compressed and included.</p>
                                                </div>
                                            </div>

                                            {containerExists && (
                                                <div className={cn(
                                                    "p-4 rounded-lg border backdrop-blur-sm flex items-start gap-3",
                                                    isDark ? "bg-blue-900/20 border-blue-700/30" : "bg-blue-50/50 border-blue-200/50"
                                                )}>
                                                    <PencilIcon className={cn(
                                                        "h-5 w-5 flex-shrink-0 mt-0.5",
                                                        isDark ? "text-blue-400" : "text-blue-600"
                                                    )} />
                                                    <div className="flex-1">
                                                        <p className={cn(
                                                            "text-sm font-medium",
                                                            isDark ? "text-blue-400" : "text-blue-700"
                                                        )}>Container Already Exists</p>
                                                        <p className={cn(
                                                            "text-xs mt-1",
                                                            isDark ? "text-blue-400/80" : "text-blue-600"
                                                        )}>A container named &quot;{recipe.name}&quot; already exists. You can create an update request.</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="space-y-3">
                                        {containerExists ? (
                                            <button
                                                className={cn(
                                                    "group relative w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-semibold transition-all duration-300 text-lg backdrop-blur-sm border transform hover:scale-[1.02] hover:backdrop-blur-md overflow-hidden",
                                                    isDark
                                                        ? "bg-black/40 text-green-300 hover:bg-black/50 border-green-400/30 hover:border-green-300/50 shadow-lg hover:shadow-xl"
                                                        : "bg-white/40 text-green-700 hover:bg-white/50 border-green-400/30 hover:border-green-300/50 shadow-lg hover:shadow-xl"
                                                )}
                                                onClick={() => handleCreateIssue(true)}
                                            >
                                                <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                                <PencilIcon className="h-6 w-6 relative z-10" />
                                                <span className="relative z-10">Update Existing Container</span>
                                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transform -translate-x-full group-hover:translate-x-full transition-all duration-700 ease-out" />
                                            </button>
                                        ) : (
                                            <button
                                                className={cn(
                                                    "group relative w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-semibold transition-all duration-300 text-lg backdrop-blur-sm border transform hover:scale-[1.02] hover:backdrop-blur-md overflow-hidden",
                                                    isDark
                                                        ? "bg-black/40 text-green-300 hover:bg-black/50 border-green-400/30 hover:border-green-300/50 shadow-lg hover:shadow-xl"
                                                        : "bg-white/40 text-green-700 hover:bg-white/50 border-green-400/30 hover:border-green-300/50 shadow-lg hover:shadow-xl"
                                                )}
                                                onClick={() => handleCreateIssue(false)}
                                            >
                                                <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                                <PlusIcon className="h-6 w-6 relative z-10" />
                                                <span className="relative z-10">Publish New Container</span>
                                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transform -translate-x-full group-hover:translate-x-full transition-all duration-700 ease-out" />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Dockerfile Preview */}
                                <div className={cn(
                                    "rounded-lg border backdrop-blur-sm overflow-hidden",
                                    isDark ? "bg-black/20 border-white/10" : "bg-white/20 border-white/20"
                                )}>
                                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 p-4">
                                        <h3 className={cn(
                                            "text-lg font-medium flex items-center gap-2",
                                            isDark ? "text-[#e8f5d0]" : "text-[#0c0e0a]"
                                        )}>
                                            <DocumentTextIcon className={iconStyles(isDark, 'md')} />
                                            Generated Dockerfile
                                        </h3>
                                        <div className="flex flex-wrap gap-2 sm:gap-2">
                                            <button
                                                onClick={copyDockerfileToClipboard}
                                                className={cn(
                                                    "flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                                                    copiedDockerfile
                                                        ? (isDark ? "bg-[#6ea232] text-white" : "bg-[#4f7b38] text-white")
                                                        : (isDark
                                                            ? "bg-black/30 text-[#91c84a] hover:bg-black/40 border border-white/10"
                                                            : "bg-white/30 text-[#4f7b38] hover:bg-white/40 border border-white/20")
                                                )}
                                            >
                                                <ClipboardDocumentIcon className="h-4 w-4" />
                                                <span>{copiedDockerfile ? "Copied!" : "Copy"}</span>
                                            </button>
                                            <button
                                                onClick={() => setShowDockerfile(!showDockerfile)}
                                                className={cn(
                                                    "px-3 py-2 rounded-lg text-sm font-medium transition-colors border",
                                                    isDark
                                                        ? "text-[#91c84a] hover:text-[#c4e382] hover:bg-black/30 border-white/10"
                                                        : "text-[#4f7b38] hover:text-[#2d4222] hover:bg-white/40 border-white/20"
                                                )}
                                            >
                                                {showDockerfile ? "Hide" : "Show"} Dockerfile
                                            </button>
                                        </div>
                                    </div>

                                    {showDockerfile && validationResult.dockerfile && (
                                        <div>
                                            <div className={cn(
                                                "px-4 py-2 flex items-center justify-between border-t",
                                                isDark ? "bg-black/20 border-white/5" : "bg-white/20 border-white/10"
                                            )}>
                                                <span className={cn(
                                                    "text-sm font-medium",
                                                    isDark ? "text-[#e8f5d0]" : "text-[#0c0e0a]"
                                                )}>Dockerfile</span>
                                                <span className={cn(
                                                    "text-xs",
                                                    isDark ? "text-[#91c84a]" : "text-[#4f7b38]"
                                                )}>{validationResult.dockerfile.split('\n').length} lines</span>
                                            </div>
                                            <pre className={cn(
                                                "p-3 sm:p-4 overflow-x-auto max-h-80 sm:max-h-96 overflow-y-auto",
                                                "break-words whitespace-pre-wrap text-xs sm:text-sm leading-relaxed",
                                                isDark ? "text-[#c4e382]" : "text-[#2d4222]"
                                            )} style={{ fontFamily: 'Monaco, "Courier New", monospace' }}>
                                                {validationResult.dockerfile}
                                            </pre>
                                        </div>
                                    )}
                                </div>
                                
                                {/* Additional Information */}
                                {validationResult.readme && (
                                    <div className={cn(
                                        "rounded-lg border backdrop-blur-sm p-4",
                                        isDark ? "bg-black/20 border-white/10" : "bg-white/20 border-white/20"
                                    )}>
                                        <h3 className={cn(
                                            "text-lg font-medium mb-3",
                                            isDark ? "text-[#e8f5d0]" : "text-[#0c0e0a]"
                                        )}>Build Information</h3>
                                        <pre className={cn(
                                            "text-sm whitespace-pre-wrap break-words overflow-x-auto",
                                            isDark ? "text-[#c4e382]" : "text-[#2d4222]"
                                        )}>
                                            {validationResult.readme}
                                        </pre>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}