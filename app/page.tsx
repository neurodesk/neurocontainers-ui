"use client";

import { load as loadYAML, dump as dumpYAML } from "js-yaml";
import { useState, useEffect } from "react";
import { ChevronDownIcon, PlusIcon, TrashIcon } from "@heroicons/react/outline";
import { ContainerRecipe, Architecture, CopyrightInfo } from "@/components/common";
import BuildRecipeComponent from "@/components/recipe";

enum WizardStep {
    BasicInfo = 0,
    BuildRecipe = 1
}

async function getDefaultYAML(): Promise<ContainerRecipe> {
    const res = await fetch("/qsmxt.yaml");
    if (!res.ok) {
        throw new Error("Failed to fetch YAML file");
    }
    const text = await res.text();
    return loadYAML(text) as ContainerRecipe;
}

function ContainerHeader({
    recipe,
    onChange
}: {
    recipe: ContainerRecipe,
    onChange: (recipe: ContainerRecipe) => void
}) {
    const updateName = (name: string) => {
        onChange({ ...recipe, name });
    };

    const updateVersion = (version: string) => {
        onChange({ ...recipe, version });
    };

    const updateArchitectures = (architectures: Architecture[]) => {
        onChange({ ...recipe, architectures });
    };

    const updateReadme = (readme: string) => {
        onChange({ ...recipe, readme });
    };

    const updateReadmeUrl = (readme_url: string) => {
        onChange({ ...recipe, readme_url });
    };

    const updateCopyright = (index: number, info: CopyrightInfo) => {
        if (!recipe.copyright) return;

        const updated = [...recipe.copyright];
        updated[index] = info;
        onChange({ ...recipe, copyright: updated });
    };

    const addCopyright = () => {
        const newCopyright = { license: "", url: "" };
        onChange({
            ...recipe,
            copyright: [...(recipe.copyright || []), newCopyright]
        });
    };

    const removeCopyright = (index: number) => {
        if (!recipe.copyright) return;

        onChange({
            ...recipe,
            copyright: recipe.copyright.filter((_, i) => i !== index)
        });
    };

    return (
        <div className="bg-white rounded-lg shadow-md border border-[#d3e7b6] mb-6">
            <div className="p-4 bg-[#f0f7e7] rounded-t-lg">
                <h2 className="text-xl font-semibold text-[#0c0e0a]">Container Definition</h2>
            </div>

            <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block mb-2 font-medium text-[#1e2a16]">Name</label>
                        <input
                            className="w-full px-3 py-2 border border-gray-200 rounded-md text-[#0c0e0a] focus:outline-none focus:ring-1 focus:ring-[#6aa329] focus:border-[#6aa329]"
                            value={recipe.name}
                            onChange={(e) => updateName(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block mb-2 font-medium text-[#1e2a16]">Version</label>
                        <input
                            className="w-full px-3 py-2 border border-gray-200 rounded-md text-[#0c0e0a] focus:outline-none focus:ring-1 focus:ring-[#6aa329] focus:border-[#6aa329]"
                            value={recipe.version}
                            onChange={(e) => updateVersion(e.target.value)}
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="block mb-2 font-medium text-[#1e2a16]">Architectures</label>
                        <div className="flex flex-wrap gap-3">
                            <label className="inline-flex items-center">
                                <input
                                    type="checkbox"
                                    className="rounded border-gray-300 text-[#6aa329] focus:ring-[#6aa329]"
                                    checked={recipe.architectures.includes("x86_64")}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            updateArchitectures([...recipe.architectures, "x86_64"]);
                                        } else {
                                            updateArchitectures(recipe.architectures.filter(arch => arch !== "x86_64"));
                                        }
                                    }}
                                />
                                <span className="ml-2 text-[#0c0e0a]">x86_64</span>
                            </label>

                            <label className="inline-flex items-center">
                                <input
                                    type="checkbox"
                                    className="rounded border-gray-300 text-[#6aa329] focus:ring-[#6aa329]"
                                    checked={recipe.architectures.includes("aarch64")}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            updateArchitectures([...recipe.architectures, "aarch64"]);
                                        } else {
                                            updateArchitectures(recipe.architectures.filter(arch => arch !== "aarch64"));
                                        }
                                    }}
                                />
                                <span className="ml-2 text-[#0c0e0a]">aarch64</span>
                            </label>
                        </div>
                    </div>

                    <div>
                        <label className="block mb-2 font-medium text-[#1e2a16]">Readme</label>
                        <input
                            className="w-full px-3 py-2 border border-gray-200 rounded-md text-[#0c0e0a] focus:outline-none focus:ring-1 focus:ring-[#6aa329] focus:border-[#6aa329]"
                            value={recipe.readme || ""}
                            onChange={(e) => updateReadme(e.target.value)}
                            placeholder="Path to readme file"
                        />
                    </div>

                    <div>
                        <label className="block mb-2 font-medium text-[#1e2a16]">Readme URL</label>
                        <input
                            className="w-full px-3 py-2 border border-gray-200 rounded-md text-[#0c0e0a] focus:outline-none focus:ring-1 focus:ring-[#6aa329] focus:border-[#6aa329]"
                            value={recipe.readme_url || ""}
                            onChange={(e) => updateReadmeUrl(e.target.value)}
                            placeholder="URL to readme file"
                        />
                    </div>
                </div>

                <div className="mt-6">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="font-medium text-[#1e2a16]">Copyright Information</h3>
                        <button
                            className="text-sm text-[#4f7b38] hover:text-[#6aa329] flex items-center"
                            onClick={addCopyright}
                        >
                            <PlusIcon className="h-4 w-4 mr-1" />
                            Add License
                        </button>
                    </div>

                    {(recipe.copyright || []).map((info, index) => (
                        <div key={index} className="mb-4 last:mb-0 p-4 bg-[#f0f7e7] rounded-md relative">
                            <button
                                className="absolute top-3 right-3 text-gray-400 hover:text-[#6aa329]"
                                onClick={() => removeCopyright(index)}
                            >
                                <TrashIcon className="h-5 w-5" />
                            </button>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block mb-1 text-sm font-medium text-[#1e2a16]">License</label>
                                    <input
                                        className="w-full px-3 py-2 border border-gray-200 rounded-md text-[#0c0e0a] focus:outline-none focus:ring-1 focus:ring-[#6aa329] focus:border-[#6aa329] bg-white"
                                        value={info.license}
                                        onChange={(e) => updateCopyright(index, { ...info, license: e.target.value })}
                                        placeholder="SPDX License Identifier"
                                    />
                                </div>

                                <div>
                                    <label className="block mb-1 text-sm font-medium text-[#1e2a16]">URL</label>
                                    <input
                                        className="w-full px-3 py-2 border border-gray-200 rounded-md text-[#0c0e0a] focus:outline-none focus:ring-1 focus:ring-[#6aa329] focus:border-[#6aa329] bg-white"
                                        value={info.url}
                                        onChange={(e) => updateCopyright(index, { ...info, url: e.target.value })}
                                        placeholder="License URL"
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function WizardNavigation({
    currentStep,
    totalSteps,
    onNext,
    onPrevious
}: {
    currentStep: number;
    totalSteps: number;
    onNext: () => void;
    onPrevious: () => void;
}) {
    return (
        <div className="flex justify-between items-center mt-8 pt-6 border-t border-[#e6f1d6]">
            <button
                className={`px-4 py-2 rounded-md ${currentStep > 0
                    ? "bg-[#e6f1d6] text-[#4f7b38] hover:bg-[#d3e7b6]"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    }`}
                onClick={onPrevious}
                disabled={currentStep === 0}
            >
                Previous
            </button>

            <div className="text-sm text-[#1e2a16]">
                Step {currentStep + 1} of {totalSteps}
            </div>

            <button
                className={`px-4 py-2 rounded-md ${currentStep < totalSteps - 1
                    ? "bg-[#6aa329] text-white hover:bg-[#4f7b38]"
                    : "bg-[#4f7b38] text-white"
                    }`}
                onClick={onNext}
            >
                {currentStep < totalSteps - 1 ? "Next" : "Finish"}
            </button>
        </div>
    );
}

export default function Home() {
    const [yamlData, setYamlData] = useState<ContainerRecipe | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentStep, setCurrentStep] = useState(WizardStep.BasicInfo);
    const [yamlText, setYamlText] = useState("");

    // Simplified to just 2 steps: Basic Info and Build Recipe
    const totalSteps = 2;

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

    const nextStep = () => {
        if (currentStep < totalSteps - 1) {
            setCurrentStep(currentStep + 1);
        }
    };

    const previousStep = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
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
        <div className="min-h-screen bg-[#f0f7e7]">
            {/* Header */}
            <header className="bg-[#0c0e0a] text-white py-4 px-6 shadow-md">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <h1 className="text-2xl font-bold">Neurocontainers Builder</h1>

                    <div className="flex items-center space-x-4">
                        <button
                            className="bg-[#1e2a16] hover:bg-[#161c10] px-4 py-2 rounded-md text-sm"
                            onClick={() => setYamlData(null)}
                        >
                            New Container
                        </button>
                        <button
                            className="bg-[#4f7b38] hover:bg-[#6aa329] px-4 py-2 rounded-md text-sm"
                            onClick={exportYAML}
                            disabled={!yamlData}
                        >
                            Export YAML
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto py-8 px-6">
                {loading ? (
                    <div className="bg-white rounded-lg shadow-md p-10 text-center">
                        <div className="animate-pulse text-[#4f7b38] text-xl">Loading...</div>
                    </div>
                ) : yamlData ? (
                    <div>
                        {/* Wizard Steps */}
                        <div className="mb-8">
                            <div className="grid grid-cols-2 gap-2">
                                <div
                                    className={`p-3 rounded-md text-center ${currentStep === 0
                                        ? "bg-[#6aa329] text-white"
                                        : "bg-[#e6f1d6] text-[#1e2a16] hover:bg-[#d3e7b6] cursor-pointer"
                                        }`}
                                    onClick={() => setCurrentStep(0)}
                                >
                                    <div className="font-medium">Basic Info</div>
                                    <div className="text-xs mt-1 opacity-80">Container metadata</div>
                                </div>

                                <div
                                    className={`p-3 rounded-md text-center ${currentStep === 1
                                        ? "bg-[#6aa329] text-white"
                                        : "bg-[#e6f1d6] text-[#1e2a16] hover:bg-[#d3e7b6] cursor-pointer"
                                        }`}
                                    onClick={() => setCurrentStep(1)}
                                >
                                    <div className="font-medium">Build Recipe</div>
                                    <div className="text-xs mt-1 opacity-80">Define build process</div>
                                </div>
                            </div>
                        </div>

                        {/* Current Step Content */}
                        <div className="mb-6">
                            {currentStep === WizardStep.BasicInfo && (
                                <ContainerHeader
                                    recipe={yamlData}
                                    onChange={(updated) => setYamlData(updated)}
                                />
                            )}

                            {currentStep === WizardStep.BuildRecipe && (
                                <BuildRecipeComponent
                                    recipe={yamlData.build}
                                    onChange={(updated) => setYamlData({ ...yamlData, build: updated })}
                                />
                            )}
                        </div>

                        {/* YAML Preview (for power users) */}
                        <div className="bg-white rounded-lg shadow-md border border-[#d3e7b6] mb-6">
                            <div
                                className="p-4 bg-[#f0f7e7] rounded-t-lg flex justify-between items-center cursor-pointer"
                                onClick={() => document.getElementById('yaml-preview')?.classList.toggle('hidden')}
                            >
                                <h2 className="font-semibold text-[#0c0e0a]">YAML Preview</h2>
                                <ChevronDownIcon className="h-5 w-5 text-[#4f7b38]" />
                            </div>

                            <div id="yaml-preview" className="hidden p-6">
                                <textarea
                                    className="w-full h-64 px-4 py-3 font-mono text-sm bg-[#1e2a16] text-white rounded-md focus:outline-none"
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

                        <WizardNavigation
                            currentStep={currentStep}
                            totalSteps={totalSteps}
                            onNext={nextStep}
                            onPrevious={previousStep}
                        />
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow-md p-10 text-center">
                        <h2 className="text-xl font-semibold text-[#0c0e0a] mb-4">Start Building a Container</h2>
                        <p className="text-[#1e2a16] mb-6">
                            Create a new container definition or upload an existing YAML file
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <button className="px-6 py-3 bg-[#6aa329] text-white rounded-md hover:bg-[#4f7b38]">
                                Create New Container
                            </button>
                            <button className="px-6 py-3 bg-[#e6f1d6] text-[#4f7b38] rounded-md hover:bg-[#d3e7b6]">
                                Upload YAML File
                            </button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
