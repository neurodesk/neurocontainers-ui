import {
    TrashIcon,
    InformationCircleIcon,
    ChevronUpIcon,
    ChevronDownIcon,
} from "@heroicons/react/outline";
import { NeuroDockerBuildRecipe, Directive } from "@/components/common";
import DirectiveComponent from "@/components/directives/factory";
import AddDirectiveButton from "@/components/add";
import { useState } from "react";

const UBUNTU_VERSIONS = [
    { value: "ubuntu:24.04", label: "Ubuntu 24.04 LTS (Noble Numbat)" },
    { value: "ubuntu:22.04", label: "Ubuntu 22.04 LTS (Jammy Jellyfish)" },
    { value: "ubuntu:20.04", label: "Ubuntu 20.04 LTS (Focal Fossa)" },
    { value: "ubuntu:18.04", label: "Ubuntu 18.04 LTS (Bionic Beaver)" },
];

const OTHER_BASE_IMAGES = [
    { value: "debian:12", label: "Debian 12 (Bookworm)" },
    { value: "debian:11", label: "Debian 11 (Bullseye)" },
    { value: "centos:8", label: "CentOS 8" },
    { value: "fedora:39", label: "Fedora 39" },
];

type BaseImageSource = "ubuntu" | "other" | "custom";

export default function NeuroDockerBuildRecipeComponent({
    recipe,
    onChange,
}: {
    recipe: NeuroDockerBuildRecipe;
    onChange: (recipe: NeuroDockerBuildRecipe) => void;
}) {
    const [showBaseImageHelp, setShowBaseImageHelp] = useState(false);
    const [showPkgManagerHelp, setShowPkgManagerHelp] = useState(false);
    const [baseImageSource, setBaseImageSource] =
        useState<BaseImageSource>("ubuntu");
    const [customBaseImage, setCustomBaseImage] = useState("");

    // Determine initial base image source based on current recipe
    useState(() => {
        if (UBUNTU_VERSIONS.some((img) => img.value === recipe["base-image"])) {
            setBaseImageSource("ubuntu");
        } else if (
            OTHER_BASE_IMAGES.some((img) => img.value === recipe["base-image"])
        ) {
            setBaseImageSource("other");
        } else if (recipe["base-image"]) {
            setBaseImageSource("custom");
            setCustomBaseImage(recipe["base-image"]);
        }
    });

    const updateBaseImage = (value: string) => {
        onChange({ ...recipe, "base-image": value });
    };

    const updatePkgManager = (value: string) => {
        onChange({ ...recipe, "pkg-manager": value });
    };

    const updateDirective = (index: number, directive: Directive) => {
        const updatedDirectives = [...recipe.directives];
        updatedDirectives[index] = directive;
        onChange({ ...recipe, directives: updatedDirectives });
    };

    const addDirective = (directive: Directive) => {
        onChange({ ...recipe, directives: [...recipe.directives, directive] });
    };

    const removeDirective = (index: number) => {
        onChange({
            ...recipe,
            directives: recipe.directives.filter((_, i) => i !== index),
        });
    };

    const moveDirective = (index: number, direction: "up" | "down") => {
        const newIndex = direction === "up" ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= recipe.directives.length) return;

        const updatedDirectives = [...recipe.directives];
        [updatedDirectives[index], updatedDirectives[newIndex]] = [
            updatedDirectives[newIndex],
            updatedDirectives[index],
        ];

        onChange({ ...recipe, directives: updatedDirectives });
    };

    const handleBaseImageSourceChange = (source: BaseImageSource) => {
        setBaseImageSource(source);

        // Clear the base image when switching sources
        if (source === "ubuntu") {
            updateBaseImage("ubuntu:22.04"); // Default to latest LTS
        } else if (source === "other") {
            updateBaseImage("debian:12"); // Default to latest Debian
        } else {
            updateBaseImage("");
        }
    };

    const handleBaseImageSelect = (value: string) => {
        updateBaseImage(value);
    };

    const handleCustomBaseImageChange = (value: string) => {
        setCustomBaseImage(value);
        updateBaseImage(value);
    };

    return (
        <div className="bg-white rounded-lg shadow-md border border-[#d3e7b6]">
            <div className="p-4 bg-[#f0f7e7] rounded-t-lg">
                <h2 className="text-xl font-semibold text-[#0c0e0a]">
                    NeuroDocker Build Recipe
                </h2>
                <p className="text-sm text-[#1e2a16] mt-1">
                    Configure your Docker container build settings and
                    installation directives
                </p>
            </div>

            <div className="p-4 sm:p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6">
                    {/* Base Image Section */}
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <label className="block font-medium text-[#1e2a16]">
                                Base Image
                            </label>
                            <button
                                type="button"
                                onClick={() =>
                                    setShowBaseImageHelp(!showBaseImageHelp)
                                }
                                className="text-gray-400 hover:text-[#6aa329]"
                            >
                                <InformationCircleIcon className="h-4 w-4" />
                            </button>
                        </div>

                        {showBaseImageHelp && (
                            <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-md text-sm text-blue-800">
                                <p className="font-medium mb-1">Base Image:</p>
                                <p>
                                    The Docker base image that your container will
                                    be built upon. This determines the operating
                                    system and initial software stack. Ubuntu LTS
                                    versions are recommended for stability and
                                    long-term support.
                                </p>
                            </div>
                        )}

                        {/* Base Image Source Selection */}
                        <div className="mb-4">
                            <label className="text-sm font-medium text-gray-600 mb-2 block">
                                Image Source
                            </label>
                            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        name="baseImageSource"
                                        value="ubuntu"
                                        checked={baseImageSource === "ubuntu"}
                                        onChange={() =>
                                            handleBaseImageSourceChange("ubuntu")
                                        }
                                        className="mr-2 text-[#6aa329] focus:ring-[#6aa329]"
                                    />
                                    <span className="text-sm">Ubuntu LTS</span>
                                </label>
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        name="baseImageSource"
                                        value="other"
                                        checked={baseImageSource === "other"}
                                        onChange={() =>
                                            handleBaseImageSourceChange("other")
                                        }
                                        className="mr-2 text-[#6aa329] focus:ring-[#6aa329]"
                                    />
                                    <span className="text-sm">Other Distros</span>
                                </label>
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        name="baseImageSource"
                                        value="custom"
                                        checked={baseImageSource === "custom"}
                                        onChange={() =>
                                            handleBaseImageSourceChange("custom")
                                        }
                                        className="mr-2 text-[#6aa329] focus:ring-[#6aa329]"
                                    />
                                    <span className="text-sm">Custom</span>
                                </label>
                            </div>
                        </div>

                        {/* Conditional Base Image Selection */}
                        {baseImageSource === "ubuntu" && (
                            <div>
                                <label className="text-sm font-medium text-gray-600 mb-1 block">
                                    Ubuntu Version
                                </label>
                                <select
                                    className="w-full px-3 py-2 border border-gray-200 rounded-md text-[#0c0e0a] bg-white focus:outline-none focus:ring-1 focus:ring-[#6aa329] focus:border-[#6aa329]"
                                    value={recipe["base-image"]}
                                    onChange={(e) =>
                                        handleBaseImageSelect(e.target.value)
                                    }
                                >
                                    {UBUNTU_VERSIONS.map((version) => (
                                        <option
                                            key={version.value}
                                            value={version.value}
                                        >
                                            {version.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {baseImageSource === "other" && (
                            <div>
                                <label className="text-sm font-medium text-gray-600 mb-1 block">
                                    Distribution
                                </label>
                                <select
                                    className="w-full px-3 py-2 border border-gray-200 rounded-md text-[#0c0e0a] bg-white focus:outline-none focus:ring-1 focus:ring-[#6aa329] focus:border-[#6aa329]"
                                    value={recipe["base-image"]}
                                    onChange={(e) =>
                                        handleBaseImageSelect(e.target.value)
                                    }
                                >
                                    {OTHER_BASE_IMAGES.map((image) => (
                                        <option
                                            key={image.value}
                                            value={image.value}
                                        >
                                            {image.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {baseImageSource === "custom" && (
                            <div>
                                <label className="text-sm font-medium text-gray-600 mb-1 block">
                                    Custom Image
                                </label>
                                <input
                                    className="w-full px-3 py-2 border border-gray-200 rounded-md text-[#0c0e0a] focus:outline-none focus:ring-1 focus:ring-[#6aa329] focus:border-[#6aa329]"
                                    value={customBaseImage}
                                    onChange={(e) =>
                                        handleCustomBaseImageChange(
                                            e.target.value
                                        )
                                    }
                                    placeholder="e.g. python:3.11-slim, node:18-alpine"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Enter any valid Docker image name and tag
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Package Manager Section */}
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <label className="block font-medium text-[#1e2a16]">
                                Package Manager
                            </label>
                            <button
                                type="button"
                                onClick={() =>
                                    setShowPkgManagerHelp(!showPkgManagerHelp)
                                }
                                className="text-gray-400 hover:text-[#6aa329]"
                            >
                                <InformationCircleIcon className="h-4 w-4" />
                            </button>
                        </div>

                        {showPkgManagerHelp && (
                            <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-md text-sm text-blue-800">
                                <p className="font-medium mb-1">
                                    Package Manager:
                                </p>
                                <ul className="list-disc list-inside space-y-1">
                                    <li>
                                        <strong>apt:</strong> Used by
                                        Debian/Ubuntu systems for installing
                                        packages
                                    </li>
                                    <li>
                                        <strong>yum:</strong> Used by
                                        RHEL/CentOS/Fedora systems for package
                                        management
                                    </li>
                                </ul>
                                <p className="mt-2">
                                    NeuroDocker supports apt and yum package
                                    managers.
                                </p>
                            </div>
                        )}

                        <select
                            className="w-full px-3 py-2 border border-gray-200 rounded-md text-[#0c0e0a] bg-white focus:outline-none focus:ring-1 focus:ring-[#6aa329] focus:border-[#6aa329]"
                            value={recipe["pkg-manager"]}
                            onChange={(e) => updatePkgManager(e.target.value)}
                        >
                            <option value="apt">
                                apt (Debian/Ubuntu) - Recommended
                            </option>
                            <option value="yum">yum (RHEL/CentOS/Fedora)</option>
                        </select>

                        <p className="text-xs text-gray-500 mt-1">
                            {recipe["pkg-manager"] === "apt" &&
                                "Advanced Package Tool - Standard for Ubuntu/Debian"}
                            {recipe["pkg-manager"] === "yum" &&
                                "Yellowdog Updater Modified - For RHEL/CentOS/Fedora"}
                        </p>
                    </div>
                </div>

                {/* Directives Section */}
                <div className="mb-6">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
                        <div className="flex items-center gap-2">
                            <h3 className="text-lg font-medium text-[#0c0e0a]">
                                Directives
                            </h3>
                            <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                {recipe.directives.length} directive
                                {recipe.directives.length !== 1 ? "s" : ""}
                            </div>
                        </div>
                        <AddDirectiveButton onAddDirective={addDirective} />
                    </div>

                    <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-800">
                        <p className="font-medium mb-1">About Directives:</p>
                        <p>
                            Directives define the software and configurations to
                            install in your container. They are executed in
                            order, so dependencies should be placed before the
                            software that requires them. Use the arrow buttons
                            to reorder directives.
                        </p>
                    </div>

                    {recipe.directives.length === 0 ? (
                        <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                            <p className="mb-2">No directives added yet</p>
                            <p className="text-sm">
                                Click &quot;Add Directive&quot; to start building your
                                container
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {recipe.directives.map((directive, index) => (
                                <div
                                    key={`directive-${index}`}
                                    className="flex flex-col sm:flex-row gap-3"
                                >
                                    {/* Mobile: Horizontal Controls */}
                                    <div className="flex sm:hidden items-center justify-between bg-gray-50 p-2 rounded-md border">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-medium text-gray-600">
                                                Step {index + 1}
                                            </span>
                                            <div className="flex gap-1">
                                                <button
                                                    className={`p-1.5 rounded ${index === 0
                                                        ? "text-gray-300 cursor-not-allowed"
                                                        : "text-gray-600 hover:text-[#6aa329] hover:bg-white"
                                                        } transition-colors`}
                                                    onClick={() =>
                                                        moveDirective(
                                                            index,
                                                            "up"
                                                        )
                                                    }
                                                    disabled={index === 0}
                                                    title="Move up"
                                                >
                                                    <ChevronUpIcon className="h-4 w-4" />
                                                </button>
                                                <button
                                                    className={`p-1.5 rounded ${index ===
                                                        recipe.directives
                                                            .length -
                                                        1
                                                        ? "text-gray-300 cursor-not-allowed"
                                                        : "text-gray-600 hover:text-[#6aa329] hover:bg-white"
                                                        } transition-colors`}
                                                    onClick={() =>
                                                        moveDirective(
                                                            index,
                                                            "down"
                                                        )
                                                    }
                                                    disabled={
                                                        index ===
                                                        recipe.directives
                                                            .length -
                                                        1
                                                    }
                                                    title="Move down"
                                                >
                                                    <ChevronDownIcon className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                        <button
                                            className="text-gray-400 hover:text-red-500 transition-colors p-1.5 rounded hover:bg-white"
                                            onClick={() =>
                                                removeDirective(index)
                                            }
                                            title="Remove directive"
                                        >
                                            <TrashIcon className="h-4 w-4" />
                                        </button>
                                    </div>

                                    {/* Desktop: Vertical Controls */}
                                    <div className="hidden sm:flex flex-col items-center pt-3 flex-shrink-0">
                                        <div className="flex flex-col bg-white border border-gray-300 rounded-md shadow-sm">
                                            <button
                                                className={`p-2 border-b border-gray-200 ${index === 0
                                                    ? "text-gray-300 cursor-not-allowed"
                                                    : "text-gray-600 hover:text-[#6aa329] hover:bg-[#f0f7e7]"
                                                    } transition-colors`}
                                                onClick={() =>
                                                    moveDirective(index, "up")
                                                }
                                                disabled={index === 0}
                                                title="Move up"
                                            >
                                                <ChevronUpIcon className="h-5 w-5" />
                                            </button>
                                            <button
                                                className={`p-2 ${index ===
                                                    recipe.directives.length - 1
                                                    ? "text-gray-300 cursor-not-allowed"
                                                    : "text-gray-600 hover:text-[#6aa329] hover:bg-[#f0f7e7]"
                                                    } transition-colors`}
                                                onClick={() =>
                                                    moveDirective(index, "down")
                                                }
                                                disabled={
                                                    index ===
                                                    recipe.directives.length - 1
                                                }
                                                title="Move down"
                                            >
                                                <ChevronDownIcon className="h-5 w-5" />
                                            </button>
                                        </div>
                                        <div className="mt-2 text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                            {index + 1}
                                        </div>
                                    </div>

                                    {/* Directive Content */}
                                    <div className="flex-1 min-w-0 relative">
                                        <DirectiveComponent
                                            directive={directive}
                                            onChange={(updated) =>
                                                updateDirective(index, updated)
                                            }
                                        />
                                        {/* Desktop: Trash button overlay */}
                                        <button
                                            className="hidden sm:block absolute top-3 right-3 text-gray-400 hover:text-red-500 transition-colors p-1 rounded hover:bg-white z-10"
                                            onClick={() =>
                                                removeDirective(index)
                                            }
                                            title="Remove directive"
                                        >
                                            <TrashIcon className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}