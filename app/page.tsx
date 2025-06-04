"use client";

import { load as loadYAML, dump as dumpYAML } from "js-yaml";
import { useState, useEffect, useRef } from "react";
import {
    ArrowUpTrayIcon,
    ChevronDownIcon,
    DocumentTextIcon,
    ExclamationCircleIcon
} from "@heroicons/react/24/outline";
import { ContainerRecipe, migrateLegacyRecipe } from "@/components/common";
import BuildRecipeComponent from "@/components/recipe";
import ContainerMetadata from "@/components/metadata";
import ValidateRecipeComponent from "@/components/validate";
import RecipesList from "@/components/recipes";

enum WizardStep {
    BasicInfo = 0,
    BuildRecipe = 1,
    ValidateRecipe = 2
}

const NEUROCONTAINERS_REPO = "https://github.com/neurodesk/neurocontainers";

const TOTAL_STEPS = 3; // Updated to include validation step

async function getDefaultYAML(): Promise<ContainerRecipe> {
    const res = await fetch("/qsmxt.yaml");
    if (!res.ok) {
        throw new Error("Failed to fetch YAML file");
    }
    const text = await res.text();
    return loadYAML(text) as ContainerRecipe;
}

function getNewContainerYAML(): ContainerRecipe {
    return {
        name: "new-container",
        version: "1.0.0",
        architectures: ["x86_64", "aarch64"],
        readme: "",
        readme_url: "",
        build: {
            kind: "neurodocker",
            "base-image": "ubuntu:24.04",
            "pkg-manager": "apt",
            directives: []
        }
    };
}

function WizardNavigation({
    currentStep,
    totalSteps,
    onNext,
    onPrevious,
    canProceed = true
}: {
    currentStep: number;
    totalSteps: number;
    onNext: () => void;
    onPrevious: () => void;
    canProceed?: boolean;
}) {
    const getNextButtonText = () => {
        switch (currentStep) {
            case WizardStep.BasicInfo:
                return "Next: Build Recipe";
            case WizardStep.BuildRecipe:
                return "Next: Validate";
            case WizardStep.ValidateRecipe:
                return "Download YAML";
            default:
                return "Next";
        }
    };

    const getPreviousButtonText = () => {
        switch (currentStep) {
            case WizardStep.BuildRecipe:
                return "Back: Basic Info";
            case WizardStep.ValidateRecipe:
                return "Back: Build Recipe";
            default:
                return "Previous";
        }
    };

    return (
        <div className="flex justify-between items-center py-4 px-4 sm:px-6 border-t border-[#e6f1d6] bg-white">
            <button
                className={`px-3 py-2 sm:px-4 sm:py-2 rounded-md text-sm ${currentStep > 0
                    ? "bg-[#e6f1d6] text-[#4f7b38] hover:bg-[#d3e7b6]"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    }`}
                onClick={onPrevious}
                disabled={currentStep === 0}
            >
                {getPreviousButtonText()}
            </button>

            <div className="text-xs sm:text-sm text-[#1e2a16]">
                Step {currentStep + 1} of {totalSteps}
            </div>

            <button
                className={`px-3 py-2 sm:px-4 sm:py-2 rounded-md text-sm ${canProceed
                    ? currentStep < totalSteps - 1
                        ? "bg-[#6aa329] text-white hover:bg-[#4f7b38]"
                        : "bg-[#4f7b38] text-white hover:bg-[#3d5f2b]"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                onClick={onNext}
                disabled={!canProceed}
            >
                {getNextButtonText()}
            </button>
        </div>
    );
}

// GitHub modal component
function GitHubModal({
    isOpen,
    onClose,
    yamlData,
    yamlText
}: {
    isOpen: boolean;
    onClose: () => void;
    yamlData: ContainerRecipe | null;
    yamlText: string;
}) {
    const modalRef = useRef(null);
    const [clipboardContent, setClipboardContent] = useState("");
    const [isCopied, setIsCopied] = useState(false);

    const yamlSize = new Blob([yamlText]).size;
    const isYamlTooLarge = yamlSize > 6 * 1024; // 6KB threshold

    useEffect(() => {
        if (isYamlTooLarge && yamlData) {
            setClipboardContent(yamlText);
        }
    }, [isYamlTooLarge, yamlText, yamlData]);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(clipboardContent).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        });
    };

    const handleExportToGitHub = () => {
        if (!yamlData) return;

        const targetUrl = new URL(
            `${NEUROCONTAINERS_REPO}/new/main/recipes/${yamlData.name}`
        );
        targetUrl.searchParams.append("filename", `build.yaml`);

        // If YAML is too large, don't include it in the URL
        if (!isYamlTooLarge) {
            targetUrl.searchParams.append("value", yamlText);
        }

        window.open(targetUrl.toString(), "_blank", "noopener,noreferrer");
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div
                ref={modalRef}
                className="bg-white rounded-lg shadow-xl max-w-md w-full p-4 sm:p-6"
            >
                <h3 className="text-xl font-semibold text-[#0c0e0a] mb-4">
                    Export to GitHub
                </h3>

                <div className="mb-4 p-4 bg-[#f0f7e7] rounded-md flex items-start">
                    <ExclamationCircleIcon className="h-6 w-6 text-[#6aa329] mr-3 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-[#1e2a16] mb-2">
                            You&apos;ll need to be logged into GitHub to complete this action.
                        </p>
                        {isYamlTooLarge ? (
                            <p className="text-[#1e2a16] text-sm">
                                Your YAML content is too large to include in the URL. You&apos;ll
                                need to copy it to your clipboard and paste it into GitHub after
                                clicking the link.
                            </p>
                        ) : (
                            <p className="text-[#1e2a16] text-sm">
                                This will open a new GitHub page with your container recipe
                                pre-filled.
                            </p>
                        )}
                    </div>
                </div>

                {isYamlTooLarge && (
                    <div className="mb-4">
                        <button
                            className={`w-full py-2 px-4 rounded-md ${isCopied
                                ? "bg-[#4f7b38] text-white"
                                : "bg-[#e6f1d6] text-[#4f7b38] hover:bg-[#d3e7b6]"
                                }`}
                            onClick={copyToClipboard}
                        >
                            {isCopied ? "Copied!" : "Copy YAML to Clipboard"}
                        </button>
                    </div>
                )}

                <div className="flex justify-end space-x-3">
                    <button
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                    <button
                        className="px-4 py-2 bg-[#6aa329] text-white rounded-md hover:bg-[#4f7b38]"
                        onClick={handleExportToGitHub}
                    >
                        Continue to GitHub
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function Home() {
    const [yamlData, setYamlData] = useState<ContainerRecipe | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentStep, setCurrentStep] = useState(WizardStep.BasicInfo);
    const [yamlText, setYamlText] = useState("");
    const [isGitHubModalOpen, setIsGitHubModalOpen] = useState(false);
    const [isRecipesModalOpen, setIsRecipesModalOpen] = useState(false);

    const handleLoadRecipeFromList = (recipe: ContainerRecipe) => {
        setYamlData(recipe);
        setCurrentStep(WizardStep.BasicInfo);
        setIsRecipesModalOpen(false);
    };

    useEffect(() => {
        getDefaultYAML()
            .then((data) => {
                console.log("YAML data:", data);
                setYamlData(data);
                setYamlText(dumpYAML(data));
                setLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching YAML file:", error);
                setLoading(false);
            });
    }, []);

    // Update YAML text when yamlData changes
    useEffect(() => {
        if (yamlData) {
            try {
                setYamlText(dumpYAML(yamlData));
            } catch (err) {
                console.error("Error dumping YAML:", err);
            }
        }
    }, [yamlData]);

    // Check if we can proceed to the next step
    const canProceedToNext = () => {
        if (!yamlData) return false;

        switch (currentStep) {
            case WizardStep.BasicInfo:
                // Basic validation for metadata
                return yamlData.name !== "" && yamlData.version !== "" && yamlData.name.trim() !== "";
            case WizardStep.BuildRecipe:
                // Check if we have at least one directive or it's intentionally empty
                return yamlData.build !== undefined && yamlData.build["base-image"] !== "";
            case WizardStep.ValidateRecipe:
                // Always allow download from validation step
                return true;
            default:
                return true;
        }
    };

    const nextStep = () => {
        if (currentStep < TOTAL_STEPS - 1) {
            setCurrentStep(currentStep + 1);
            // Scroll to top when changing steps
            window.scrollTo(0, 0);
        } else {
            // Download YAML file
            const blob = new Blob([yamlText], { type: "text/yaml" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${yamlData?.name}-${yamlData?.version}.yaml`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    };

    const previousStep = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
            // Scroll to top when changing steps
            window.scrollTo(0, 0);
        }
    };

    const exportYAML = () => {
        if (!yamlData) return;

        const blob = new Blob([yamlText], { type: "text/yaml" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${yamlData.name}-${yamlData.version}.yaml`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    // Update yamlData from YAML text
    const updateFromYamlText = () => {
        try {
            const parsed = loadYAML(yamlText) as ContainerRecipe;
            setYamlData(parsed);
        } catch (err) {
            console.error("Error parsing YAML:", err);
            // Could add user feedback for invalid YAML
        }
    };

    return (
        <div className="min-h-screen bg-[#f0f7e7] flex flex-col">
            {/* Fixed Header */}
            <header className="bg-[#0c0e0a] text-white py-3 px-4 sm:py-4 sm:px-6 shadow-md fixed top-0 left-0 right-0 z-10">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <h1 className="text-lg sm:text-2xl font-bold truncate">
                        Neurocontainers Builder
                    </h1>

                    <div className="flex items-center space-x-2 sm:space-x-4">
                        <button
                            className="bg-[#1e2a16] hover:bg-[#161c10] px-2 py-1 sm:px-4 sm:py-2 rounded-md text-xs sm:text-sm"
                            onClick={() => setYamlData(null)}
                        >
                            New
                        </button>
                        <button
                            className="bg-[#4f7b38] hover:bg-[#6aa329] px-2 py-1 sm:px-4 sm:py-2 rounded-md text-xs sm:text-sm"
                            onClick={exportYAML}
                            disabled={!yamlData}
                        >
                            Export
                        </button>
                        <button
                            className="bg-[#1e2a16] hover:bg-[#161c10] px-2 py-1 sm:px-4 sm:py-2 rounded-md text-xs sm:text-sm flex items-center"
                            onClick={() => setIsGitHubModalOpen(true)}
                            disabled={!yamlData}
                            title="Export to GitHub"
                        >
                            <svg
                                className="h-4 w-4 sm:h-5 sm:w-5 sm:mr-1"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                                aria-hidden="true"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                                    clipRule="evenodd"
                                />
                            </svg>
                            <span className="hidden sm:inline">Publish</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Main content with padding for fixed header and footer */}
            <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 pt-20 pb-20">
                {loading ? (
                    <div className="bg-white rounded-lg shadow-md p-6 sm:p-10 text-center mt-4">
                        <div className="animate-pulse text-[#4f7b38] text-xl">
                            Loading...
                        </div>
                    </div>
                ) : yamlData ? (
                    <div className="mt-4">
                        {/* Wizard Steps */}
                        <div className="mb-6">
                            <div className="grid grid-cols-3 gap-2">
                                <div
                                    className={`p-2 sm:p-3 rounded-md text-center transition-colors ${currentStep === 0
                                        ? "bg-[#6aa329] text-white"
                                        : "bg-[#e6f1d6] text-[#1e2a16] hover:bg-[#d3e7b6] cursor-pointer"
                                        }`}
                                    onClick={() => setCurrentStep(0)}
                                >
                                    <div className="font-medium text-sm sm:text-base">
                                        Basic Info
                                    </div>
                                    <div className="text-xs mt-1 opacity-80 hidden sm:block">
                                        Container metadata
                                    </div>
                                </div>

                                <div
                                    className={`p-2 sm:p-3 rounded-md text-center transition-colors ${currentStep === 1
                                        ? "bg-[#6aa329] text-white"
                                        : "bg-[#e6f1d6] text-[#1e2a16] hover:bg-[#d3e7b6] cursor-pointer"
                                        }`}
                                    onClick={() => setCurrentStep(1)}
                                >
                                    <div className="font-medium text-sm sm:text-base">
                                        Build Recipe
                                    </div>
                                    <div className="text-xs mt-1 opacity-80 hidden sm:block">
                                        Define build process
                                    </div>
                                </div>

                                <div
                                    className={`p-2 sm:p-3 rounded-md text-center transition-colors ${currentStep === 2
                                        ? "bg-[#6aa329] text-white"
                                        : "bg-[#e6f1d6] text-[#1e2a16] hover:bg-[#d3e7b6] cursor-pointer"
                                        }`}
                                    onClick={() => setCurrentStep(2)}
                                >
                                    <div className="font-medium text-sm sm:text-base">
                                        Validate
                                    </div>
                                    <div className="text-xs mt-1 opacity-80 hidden sm:block">
                                        Test & generate
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Progress Indicator */}
                        <div className="mb-6">
                            <div className="flex items-center">
                                <div className="flex-1 bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-[#6aa329] h-2 rounded-full transition-all duration-300"
                                        style={{
                                            width: `${((currentStep + 1) / TOTAL_STEPS) * 100}%`,
                                        }}
                                    ></div>
                                </div>
                                <span className="ml-3 text-sm text-[#1e2a16] font-medium">
                                    {Math.round(((currentStep + 1) / TOTAL_STEPS) * 100)}%
                                </span>
                            </div>
                        </div>

                        {/* Current Step Content */}
                        <div className="mb-6">
                            {currentStep === WizardStep.BasicInfo && (
                                <ContainerMetadata
                                    recipe={yamlData}
                                    onChange={(updated) => setYamlData(updated)}
                                />
                            )}

                            {currentStep === WizardStep.BuildRecipe && (
                                <BuildRecipeComponent
                                    recipe={yamlData.build}
                                    onChange={(updated) =>
                                        setYamlData({ ...yamlData, build: updated })
                                    }
                                />
                            )}

                            {currentStep === WizardStep.ValidateRecipe && (
                                <ValidateRecipeComponent
                                    recipe={yamlData}
                                />
                            )}
                        </div>

                        {/* YAML Preview (for power users) */}
                        <div className="bg-white rounded-lg shadow-md border border-[#d3e7b6] mb-6">
                            <div
                                className="p-3 sm:p-4 bg-[#f0f7e7] rounded-t-lg flex justify-between items-center cursor-pointer"
                                onClick={() =>
                                    document
                                        .getElementById("yaml-preview")
                                        ?.classList.toggle("hidden")
                                }
                            >
                                <h2 className="font-semibold text-[#0c0e0a] text-sm sm:text-base">
                                    YAML Preview
                                </h2>
                                <ChevronDownIcon className="h-5 w-5 text-[#4f7b38]" />
                            </div>

                            <div id="yaml-preview" className="hidden p-4 sm:p-6">
                                <textarea
                                    className="w-full h-48 sm:h-64 px-3 py-2 sm:px-4 sm:py-3 font-mono text-xs sm:text-sm bg-[#1e2a16] text-white rounded-md focus:outline-none"
                                    value={yamlText}
                                    onChange={(e) => setYamlText(e.target.value)}
                                    onBlur={updateFromYamlText}
                                ></textarea>
                                <div className="mt-3 text-right">
                                    <button
                                        className="bg-[#6aa329] text-white px-3 py-1 rounded-md text-sm hover:bg-[#4f7b38]"
                                        onClick={updateFromYamlText}
                                    >
                                        Apply YAML Changes
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow-md p-6 sm:p-10 text-center mt-4">
                        <h2 className="text-lg sm:text-xl font-semibold text-[#0c0e0a] mb-4">
                            Start Building a Container
                        </h2>
                        <p className="text-[#1e2a16] mb-6">
                            Create a new container definition, browse existing recipes, or upload a YAML file
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                            <button
                                className="p-6 border-2 border-[#d3e7b6] rounded-lg hover:border-[#6aa329] hover:bg-[#f9fdf5] transition-colors"
                                onClick={() => {
                                    setYamlData(getNewContainerYAML());
                                    setCurrentStep(WizardStep.BasicInfo);
                                }}
                            >
                                <div className="text-[#6aa329] mb-2">
                                    <svg className="h-8 w-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                </div>
                                <h3 className="font-semibold text-[#0c0e0a] mb-1">Create New</h3>
                                <p className="text-sm text-[#4f7b38]">Start from scratch</p>
                            </button>

                            <button
                                className="p-6 border-2 border-[#d3e7b6] rounded-lg hover:border-[#6aa329] hover:bg-[#f9fdf5] transition-colors"
                                onClick={() => setIsRecipesModalOpen(true)}
                            >
                                <div className="text-[#6aa329] mb-2">
                                    <DocumentTextIcon className="h-8 w-8 mx-auto" />
                                </div>
                                <h3 className="font-semibold text-[#0c0e0a] mb-1">Browse Recipes</h3>
                                <p className="text-sm text-[#4f7b38]">Load existing recipe</p>
                            </button>

                            <div
                                className="p-6 border-2 border-dashed border-[#d3e7b6] rounded-lg hover:border-[#6aa329] hover:bg-[#f9fdf5] transition-colors cursor-pointer"
                                onClick={() => {
                                    const input = document.createElement("input");
                                    input.type = "file";
                                    input.accept = ".yaml, .yml";
                                    input.onchange = (e) => {
                                        const file = (e.target as HTMLInputElement).files?.[0];
                                        if (file) {
                                            const reader = new FileReader();
                                            reader.onload = (event) => {
                                                const text = event.target?.result as string;
                                                try {
                                                    let parsed = loadYAML(text) as ContainerRecipe;
                                                    parsed = migrateLegacyRecipe(parsed);
                                                    setYamlData(parsed);
                                                } catch (err) {
                                                    console.error("Error parsing YAML:", err);
                                                }
                                            };
                                            reader.readAsText(file);
                                        }
                                    };
                                    input.click();
                                }}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    const file = e.dataTransfer.files[0];
                                    if (file) {
                                        const reader = new FileReader();
                                        reader.onload = (event) => {
                                            const text = event.target?.result as string;
                                            try {
                                                let parsed = loadYAML(text) as ContainerRecipe;
                                                parsed = migrateLegacyRecipe(parsed);
                                                setYamlData(parsed);
                                            } catch (err) {
                                                console.error("Error parsing YAML:", err);
                                            }
                                        };
                                        reader.readAsText(file);
                                    }
                                }}
                            >
                                <div className="text-[#6aa329] mb-2">
                                    <ArrowUpTrayIcon className="h-8 w-8 mx-auto" />
                                </div>
                                <h3 className="font-semibold text-[#0c0e0a] mb-1">Upload YAML</h3>
                                <p className="text-sm text-[#4f7b38]">Drag & drop or click</p>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* Fixed Footer Navigation */}
            {yamlData && (
                <div className="fixed bg-white bottom-0 left-0 right-0 shadow-[0_-2px_10px_rgba(0,0,0,0.1)] z-10">
                    <div className="max-w-7xl mx-auto">
                        <WizardNavigation
                            currentStep={currentStep}
                            totalSteps={TOTAL_STEPS}
                            onNext={nextStep}
                            onPrevious={previousStep}
                            canProceed={canProceedToNext()}
                        />
                    </div>
                </div>
            )}

            {/* GitHub Export Modal */}
            <GitHubModal
                isOpen={isGitHubModalOpen}
                onClose={() => setIsGitHubModalOpen(false)}
                yamlData={yamlData}
                yamlText={yamlText}
            />

            {/* Recipes Modal */}
            {isRecipesModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <RecipesList
                        owner="NeuroDesk"
                        repo="NeuroContainers"
                        showAsModal={true}
                        onLoadRecipe={handleLoadRecipeFromList}
                        onClose={() => setIsRecipesModalOpen(false)}
                    />
                </div>
            )}
        </div>
    );
}
