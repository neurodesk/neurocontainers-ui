"use client";

import { load as loadYAML, dump as dumpYAML } from "js-yaml";
import { useState, useEffect } from "react";
import {
    ArrowUpTrayIcon,
    ChevronDownIcon,
    DocumentTextIcon,
    InformationCircleIcon,
    CogIcon,
    CheckCircleIcon,
    Bars3Icon,
    XMarkIcon,
    PlusIcon,
    ArrowDownTrayIcon,
    CloudArrowUpIcon,
} from "@heroicons/react/24/outline";
import { ContainerRecipe, migrateLegacyRecipe } from "@/components/common";
import BuildRecipeComponent from "@/components/recipe";
import ContainerMetadata from "@/components/metadata";
import ValidateRecipeComponent from "@/components/validate";
import RecipesList from "@/components/recipes";
import GitHubModal from "@/components/githubExport";

enum Section {
    BasicInfo = "basic-info",
    BuildRecipe = "build-recipe",
    ValidateRecipe = "validate-recipe",
}

const sections = [
    {
        id: Section.BasicInfo,
        title: "Basic Info",
        description: "Container metadata",
        icon: InformationCircleIcon,
    },
    {
        id: Section.BuildRecipe,
        title: "Build Recipe",
        description: "Define build process",
        icon: CogIcon,
    },
    {
        id: Section.ValidateRecipe,
        title: "Validate",
        description: "Test & generate",
        icon: CheckCircleIcon,
    },
];

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
            directives: [],
        },
    };
}

function SideNavigation({
    activeSection,
    onSectionChange,
    isOpen,
    onToggle,
    yamlData,
    onNewContainer,
    onExportYAML,
    onOpenGitHub,
}: {
    activeSection: Section;
    onSectionChange: (section: Section) => void;
    isOpen: boolean;
    onToggle: () => void;
    yamlData: ContainerRecipe | null;
    onNewContainer: () => void;
    onExportYAML: () => void;
    onOpenGitHub: () => void;
}) {
    return (
        <>
            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    onClick={onToggle}
                />
            )}

            {/* Sidebar */}
            <nav
                className={`
                    fixed lg:sticky top-0 left-0 h-full lg:h-screen
                    w-64 bg-white border-r border-[#e6f1d6] 
                    transform transition-transform duration-300 ease-in-out z-50
                    ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
                    flex flex-col
                `}
            >
                {/* Header with Title */}
                <div className="p-4 border-b border-[#e6f1d6] bg-[#0c0e0a] text-white">
                    <div className="flex items-center justify-between">
                        <h1 className="text-base font-bold">
                            Neurocontainers Builder
                        </h1>
                        <button
                            onClick={onToggle}
                            className="lg:hidden p-1 rounded-md hover:bg-[#1e2a16]"
                        >
                            <XMarkIcon className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="p-3 border-b border-[#e6f1d6] bg-[#f8fdf2]">
                    <div className="space-y-1">
                        <button
                            className="w-full flex items-center space-x-2 px-3 py-2 text-sm font-medium text-[#1e2a16] hover:bg-[#e6f1d6] rounded-md transition-colors"
                            onClick={onNewContainer}
                        >
                            <PlusIcon className="h-4 w-4" />
                            <span>New Container</span>
                        </button>
                        <button
                            className="w-full flex items-center space-x-2 px-3 py-2 text-sm font-medium text-[#1e2a16] hover:bg-[#e6f1d6] rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={onExportYAML}
                            disabled={!yamlData}
                        >
                            <ArrowDownTrayIcon className="h-4 w-4" />
                            <span>Export YAML</span>
                        </button>
                        <button
                            className="w-full flex items-center space-x-2 px-3 py-2 text-sm font-medium text-[#1e2a16] hover:bg-[#e6f1d6] rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={onOpenGitHub}
                            disabled={!yamlData}
                        >
                            <CloudArrowUpIcon className="h-4 w-4" />
                            <span>Publish to GitHub</span>
                        </button>
                    </div>
                </div>

                {/* Build Steps Header */}
                <div className="p-3 border-b border-[#e6f1d6]">
                    <h2 className="text-sm font-semibold text-[#0c0e0a]">
                        Build Steps
                    </h2>
                    <p className="text-xs text-[#4f7b38] mt-1">
                        Follow these steps to build your container
                    </p>
                </div>

                {/* Navigation Items */}
                <div className="flex-1 p-2 space-y-1 overflow-y-auto">
                    {sections.map((section, index) => {
                        const Icon = section.icon;
                        const isActive = activeSection === section.id;

                        return (
                            <button
                                key={section.id}
                                onClick={() => {
                                    onSectionChange(section.id);
                                    // Close sidebar on mobile after selection
                                    if (window.innerWidth < 1024) {
                                        onToggle();
                                    }
                                }}
                                className={`
                                    w-full text-left p-3 rounded-md transition-all duration-200
                                    flex items-start space-x-3 group relative
                                    ${isActive
                                        ? "bg-[#6aa329] text-white shadow-sm"
                                        : "hover:bg-[#f0f7e7] text-[#1e2a16]"
                                    }
                                `}
                            >
                                {/* Step number */}
                                <div
                                    className={`
                                        flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-semibold
                                        ${isActive
                                            ? "bg-white text-[#6aa329]"
                                            : "bg-[#e6f1d6] text-[#4f7b38] group-hover:bg-[#d3e7b6]"
                                        }
                                    `}
                                >
                                    {index + 1}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center space-x-2 mb-1">
                                        <Icon className="h-3 w-3 flex-shrink-0" />
                                        <div className="font-medium truncate text-sm">
                                            {section.title}
                                        </div>
                                    </div>
                                    <div
                                        className={`
                                            text-xs leading-tight
                                            ${isActive
                                                ? "text-white/90"
                                                : "text-[#4f7b38]"
                                            }
                                        `}
                                    >
                                        {section.description}
                                    </div>
                                </div>

                                {/* Active indicator */}
                                {isActive && (
                                    <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1 h-6 bg-white rounded-l-full" />
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Footer */}
                <div className="p-3 border-t border-[#e6f1d6] bg-[#f8fdf2]">
                    <div className="text-xs text-[#4f7b38] text-center">
                        v1.0.0
                    </div>
                </div>
            </nav>
        </>
    );
}

function TopNavigation({
    activeSection,
    onSectionChange,
    onSidebarToggle,
    yamlData,
    onNewContainer,
    onExportYAML,
}: {
    activeSection: Section;
    onSectionChange: (section: Section) => void;
    onSidebarToggle: () => void;
    yamlData: ContainerRecipe | null;
    onNewContainer: () => void;
    onExportYAML: () => void;
    onOpenGitHub: () => void;
}) {
    return (
        <div className="bg-white border-b border-[#e6f1d6] p-4 lg:hidden">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                    <button
                        onClick={onSidebarToggle}
                        className="p-2 rounded-md hover:bg-[#f0f7e7]"
                    >
                        <Bars3Icon className="h-5 w-5 text-[#4f7b38]" />
                    </button>
                    <h1 className="text-lg font-bold text-[#0c0e0a]">
                        Neurocontainers Builder
                    </h1>
                </div>

                {/* Action buttons for mobile */}
                <div className="flex items-center space-x-2">
                    <button
                        className="bg-[#1e2a16] hover:bg-[#161c10] px-3 py-1 rounded-md text-xs font-medium transition-colors text-white"
                        onClick={onNewContainer}
                    >
                        New
                    </button>
                    <button
                        className="bg-[#4f7b38] hover:bg-[#6aa329] px-3 py-1 rounded-md text-xs font-medium transition-colors text-white"
                        onClick={onExportYAML}
                        disabled={!yamlData}
                    >
                        Export
                    </button>
                </div>
            </div>

            {/* Progress indicator */}
            <div className="flex items-center space-x-2">
                {sections.map((section, index) => {
                    const isActive = activeSection === section.id;
                    const isCompleted = sections.findIndex(s => s.id === activeSection) > index;

                    return (
                        <div key={section.id} className="flex items-center">
                            <button
                                onClick={() => onSectionChange(section.id)}
                                className={`
                                    w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold
                                    ${isActive
                                        ? "bg-[#6aa329] text-white"
                                        : isCompleted
                                            ? "bg-[#4f7b38] text-white"
                                            : "bg-[#e6f1d6] text-[#4f7b38]"
                                    }
                                `}
                            >
                                {index + 1}
                            </button>
                            {index < sections.length - 1 && (
                                <div
                                    className={`
                                        w-8 h-0.5 mx-1
                                        ${isCompleted
                                            ? "bg-[#4f7b38]"
                                            : "bg-[#e6f1d6]"
                                        }
                                    `}
                                />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function SectionHeader({
    icon: Icon,
    title,
    description
}: {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    description: string;
}) {
    return (
        <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-[#6aa329] rounded-lg shadow-sm">
                <Icon className="h-5 w-5 text-white" />
            </div>
            <div>
                <h2 className="text-xl font-bold text-[#0c0e0a]">
                    {title}
                </h2>
                <p className="text-[#4f7b38] mt-1">
                    {description}
                </p>
            </div>
        </div>
    );
}

export default function Home() {
    const [yamlData, setYamlData] = useState<ContainerRecipe | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeSection, setActiveSection] = useState(Section.BasicInfo);
    const [yamlText, setYamlText] = useState("");
    const [isGitHubModalOpen, setIsGitHubModalOpen] = useState(false);
    const [isRecipesModalOpen, setIsRecipesModalOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const handleLoadRecipeFromList = (recipe: ContainerRecipe) => {
        setYamlData(recipe);
        setActiveSection(Section.BasicInfo);
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
        }
    };

    const scrollToSection = (sectionId: Section) => {
        setActiveSection(sectionId);
        const element = document.getElementById(sectionId);
        if (element) {
            const offset = 20;
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: "smooth",
            });
        }
    };

    return (
        <div className="min-h-screen bg-[#f8fdf2] flex">
            {loading ? (
                <div className="flex-1 flex items-center justify-center">
                    <div className="bg-white rounded-lg shadow-md p-8 text-center">
                        <div className="animate-pulse text-[#4f7b38] text-lg">
                            Loading...
                        </div>
                    </div>
                </div>
            ) : yamlData ? (
                <>
                    {/* Sidebar Navigation */}
                    <SideNavigation
                        activeSection={activeSection}
                        onSectionChange={scrollToSection}
                        isOpen={isSidebarOpen}
                        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
                        yamlData={yamlData}
                        onNewContainer={() => setYamlData(null)}
                        onExportYAML={exportYAML}
                        onOpenGitHub={() => setIsGitHubModalOpen(true)}
                    />

                    {/* Main Content */}
                    <div className="flex-1">
                        {/* Top Navigation for Mobile */}
                        <TopNavigation
                            activeSection={activeSection}
                            onSectionChange={scrollToSection}
                            onSidebarToggle={() => setIsSidebarOpen(!isSidebarOpen)}
                            yamlData={yamlData}
                            onNewContainer={() => setYamlData(null)}
                            onExportYAML={exportYAML}
                            onOpenGitHub={() => setIsGitHubModalOpen(true)}
                        />

                        <div className="max-w-5xl mx-auto px-4 py-6">
                            {/* All Sections */}
                            <div className="space-y-8">
                                {/* Basic Info Section */}
                                <section id={Section.BasicInfo}>
                                    <SectionHeader
                                        icon={InformationCircleIcon}
                                        title="Basic Information"
                                        description="Configure your container's metadata and basic settings"
                                    />
                                    <ContainerMetadata
                                        recipe={yamlData}
                                        onChange={(updated) => setYamlData(updated)}
                                    />
                                </section>

                                {/* Build Recipe Section */}
                                <section id={Section.BuildRecipe}>
                                    <SectionHeader
                                        icon={CogIcon}
                                        title="Build Recipe"
                                        description="Define the build process and software installation steps"
                                    />
                                    <BuildRecipeComponent
                                        recipe={yamlData.build}
                                        onChange={(updated) =>
                                            setYamlData({ ...yamlData, build: updated })
                                        }
                                    />
                                </section>

                                {/* Validate Section */}
                                <section id={Section.ValidateRecipe}>
                                    <SectionHeader
                                        icon={CheckCircleIcon}
                                        title="Validate & Generate"
                                        description="Test your configuration and generate the final container"
                                    />
                                    <ValidateRecipeComponent recipe={yamlData} />
                                </section>

                                {/* YAML Preview */}
                                <section className="mb-6">
                                    <div
                                        className="p-4 bg-gradient-to-r from-[#f8fdf2] to-[#f0f7e7] rounded-t-lg flex justify-between items-center cursor-pointer hover:from-[#f0f7e7] hover:to-[#e6f1d6] transition-colors"
                                        onClick={() =>
                                            document
                                                .getElementById("yaml-preview")
                                                ?.classList.toggle("hidden")
                                        }
                                    >
                                        <h3 className="font-semibold text-[#0c0e0a]">
                                            YAML Preview
                                        </h3>
                                        <ChevronDownIcon className="h-5 w-5 text-[#4f7b38]" />
                                    </div>

                                    <div id="yaml-preview" className="hidden p-4">
                                        <textarea
                                            className="w-full h-64 px-3 py-2 font-mono text-sm bg-[#1e2a16] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6aa329] resize-none"
                                            value={yamlText}
                                            onChange={(e) => setYamlText(e.target.value)}
                                            onBlur={updateFromYamlText}
                                        ></textarea>
                                        <div className="mt-3 text-right">
                                            <button
                                                className="bg-[#6aa329] text-white px-4 py-2 rounded-lg hover:bg-[#4f7b38] transition-colors font-medium"
                                                onClick={updateFromYamlText}
                                            >
                                                Apply YAML Changes
                                            </button>
                                        </div>
                                    </div>
                                </section>
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <div className="flex-1 flex items-center justify-center p-6">
                    <div className="max-w-4xl w-full">
                        {/* Hero Section */}
                        <div className="text-center mb-12">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#6aa329] rounded-2xl mb-6">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                            </div>
                            <h1 className="text-4xl font-bold text-[#0c0e0a] mb-4">
                                Neurocontainers Builder
                            </h1>
                            <p className="text-xl text-[#4f7b38] mb-6 max-w-2xl mx-auto">
                                Create reproducible neuroimaging containers with ease. Build, validate, and deploy
                                containerized neuroimaging tools using our intuitive visual interface.
                            </p>
                        </div>

                        {/* Action Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <button
                                className="group p-8 bg-white border-2 border-[#e6f1d6] rounded-2xl hover:border-[#6aa329] hover:shadow-lg transition-all duration-300 text-left"
                                onClick={() => {
                                    setYamlData(getNewContainerYAML());
                                    setActiveSection(Section.BasicInfo);
                                }}
                            >
                                <div className="flex items-center justify-center w-12 h-12 bg-[#6aa329] rounded-xl mb-4 group-hover:scale-110 transition-transform">
                                    <PlusIcon className="h-6 w-6 text-white" />
                                </div>
                                <h3 className="text-lg font-semibold text-[#0c0e0a] mb-2">
                                    Create New Container
                                </h3>
                                <p className="text-[#4f7b38] text-sm leading-relaxed">
                                    Start building a new neuroimaging container from scratch with our guided workflow.
                                </p>
                            </button>

                            <button
                                className="group p-8 bg-white border-2 border-[#e6f1d6] rounded-2xl hover:border-[#6aa329] hover:shadow-lg transition-all duration-300 text-left"
                                onClick={() => setIsRecipesModalOpen(true)}
                            >
                                <div className="flex items-center justify-center w-12 h-12 bg-[#4f7b38] rounded-xl mb-4 group-hover:scale-110 transition-transform">
                                    <DocumentTextIcon className="h-6 w-6 text-white" />
                                </div>
                                <h3 className="text-lg font-semibold text-[#0c0e0a] mb-2">
                                    Browse Existing Recipes
                                </h3>
                                <p className="text-[#4f7b38] text-sm leading-relaxed">
                                    Explore and customize pre-built container recipes from the NeuroContainers repository.
                                </p>
                            </button>

                            <div
                                className="group p-8 bg-white border-2 border-dashed border-[#e6f1d6] rounded-2xl hover:border-[#6aa329] hover:shadow-lg transition-all duration-300 cursor-pointer text-left"
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
                                <div className="flex items-center justify-center w-12 h-12 bg-[#1e2a16] rounded-xl mb-4 group-hover:scale-110 transition-transform">
                                    <ArrowUpTrayIcon className="h-6 w-6 text-white" />
                                </div>
                                <h3 className="text-lg font-semibold text-[#0c0e0a] mb-2">
                                    Upload YAML Recipe
                                </h3>
                                <p className="text-[#4f7b38] text-sm leading-relaxed">
                                    Import an existing container recipe YAML file to continue editing.
                                </p>
                            </div>
                        </div>
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