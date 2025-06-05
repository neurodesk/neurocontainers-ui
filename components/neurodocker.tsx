import {
    TrashIcon,
    InformationCircleIcon,
    ChevronUpIcon,
    ChevronDownIcon,
    Bars3Icon,
} from "@heroicons/react/24/outline";
import { NeuroDockerBuildRecipe, Directive } from "@/components/common";
import DirectiveComponent from "@/components/directives/factory";
import AddDirectiveButton from "@/components/add";
import { useState, useRef, useEffect } from "react";

const UBUNTU_VERSIONS = [
    { value: "ubuntu:24.04", label: "Ubuntu 24.04 LTS (Noble Numbat)" },
    { value: "ubuntu:22.04", label: "Ubuntu 22.04 LTS (Jammy Jellyfish)" },
    { value: "ubuntu:20.04", label: "Ubuntu 20.04 LTS (Focal Fossa)" },
    { value: "ubuntu:18.04", label: "Ubuntu 18.04 LTS (Bionic Beaver)" },
];

const OTHER_BASE_IMAGES = [
    { value: "debian:12", label: "Debian 12 (Bookworm)", pkgManager: "apt" },
    { value: "debian:11", label: "Debian 11 (Bullseye)", pkgManager: "apt" },
    { value: "centos:8", label: "CentOS 8", pkgManager: "yum" },
    { value: "fedora:39", label: "Fedora 39", pkgManager: "yum" },
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
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
    const [deleteConfirmIndex, setDeleteConfirmIndex] = useState<number | null>(
        null
    );

    // Refs for scroll behavior - only for user-added directives
    const lastDirectiveRef = useRef<HTMLDivElement>(null);
    const shouldScrollToNew = useRef(false);

    // Determine initial base image source based on current recipe
    useEffect(() => {
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
    }, [recipe["base-image"]]);

    // Scroll to newly added directive only when explicitly added by user
    useEffect(() => {
        console.log(
            "Directives length changed, checking scroll behavior",
            recipe.directives.length,
            shouldScrollToNew.current,
            lastDirectiveRef.current
        );
        if (shouldScrollToNew.current && lastDirectiveRef.current) {
            setTimeout(() => {
                lastDirectiveRef.current?.scrollIntoView({
                    behavior: "smooth",
                    block: "nearest",
                });
            }, 100);
            shouldScrollToNew.current = false;
        }
    }, [recipe.directives.length]);

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
        // Set flag to trigger scroll for user-added directive
        shouldScrollToNew.current = true;
        onChange({ ...recipe, directives: [...recipe.directives, directive] });
    };

    const removeDirective = (index: number) => {
        onChange({
            ...recipe,
            directives: recipe.directives.filter((_, i) => i !== index),
        });
        setDeleteConfirmIndex(null);
    };

    const handleDeleteClick = (index: number) => {
        setDeleteConfirmIndex(index);
    };

    const cancelDelete = () => {
        setDeleteConfirmIndex(null);
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

    // Drag and drop handlers
    const handleDragStart = (e: React.DragEvent, index: number) => {
        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = "move";
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        setDragOverIndex(index);
    };

    const handleDragLeave = () => {
        setDragOverIndex(null);
    };

    const handleDrop = (e: React.DragEvent, dropIndex: number) => {
        e.preventDefault();

        if (draggedIndex === null || draggedIndex === dropIndex) {
            setDraggedIndex(null);
            setDragOverIndex(null);
            return;
        }

        const updatedDirectives = [...recipe.directives];
        const draggedItem = updatedDirectives[draggedIndex];

        // Remove the dragged item
        updatedDirectives.splice(draggedIndex, 1);

        // Insert at the new position
        const insertIndex =
            draggedIndex < dropIndex ? dropIndex - 1 : dropIndex;
        updatedDirectives.splice(insertIndex, 0, draggedItem);

        onChange({ ...recipe, directives: updatedDirectives });
        setDraggedIndex(null);
        setDragOverIndex(null);
    };

    const handleDragEnd = () => {
        setDraggedIndex(null);
        setDragOverIndex(null);
    };

    const handleBaseImageSourceChange = (source: BaseImageSource) => {
        setBaseImageSource(source);

        // Set default base image and package manager based on source
        if (source === "ubuntu") {
            updateBaseImage("ubuntu:22.04");
            updatePkgManager("apt");
        } else if (source === "other") {
            const defaultImage = OTHER_BASE_IMAGES[0];
            updateBaseImage(defaultImage.value);
            updatePkgManager(defaultImage.pkgManager);
        } else {
            updateBaseImage("");
            // Keep current package manager for custom images
        }
    };

    const handleBaseImageSelect = (value: string) => {
        updateBaseImage(value);

        // Auto-set package manager based on selected image
        if (baseImageSource === "ubuntu") {
            updatePkgManager("apt");
        } else if (baseImageSource === "other") {
            const selectedImage = OTHER_BASE_IMAGES.find(
                (img) => img.value === value
            );
            if (selectedImage) {
                updatePkgManager(selectedImage.pkgManager);
            }
        }
    };

    const handleCustomBaseImageChange = (value: string) => {
        setCustomBaseImage(value);
        updateBaseImage(value);
        // Don't auto-set package manager for custom images
    };

    const getPackageManagerDisplay = () => {
        if (baseImageSource === "custom") {
            return null; // Will show dropdown
        }

        const pkgManager = recipe["pkg-manager"];
        const displayText =
            pkgManager === "apt"
                ? "apt (Debian/Ubuntu)"
                : "yum (RHEL/CentOS/Fedora)";

        return (
            <div className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-700">
                {displayText}
                <span className="text-xs text-gray-500 block mt-1">
                    Automatically selected based on base image
                </span>
            </div>
        );
    };

    return (
        <div className="bg-white rounded-lg shadow-md border border-[#d3e7b6]">
            <div className="p-4 sm:p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6">
                    {/* Base Image Section */}
                    <div>
                        <div className="flex items-center gap-2 mb-3">
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
                            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md text-sm text-blue-800">
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

                        {/* Improved Base Image Source Selection */}
                        <div className="mb-4">
                            <div className="grid grid-cols-1 gap-2">
                                <label className="relative">
                                    <input
                                        type="radio"
                                        name="baseImageSource"
                                        value="ubuntu"
                                        checked={baseImageSource === "ubuntu"}
                                        onChange={() =>
                                            handleBaseImageSourceChange("ubuntu")
                                        }
                                        className="sr-only"
                                    />
                                    <div
                                        className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${baseImageSource === "ubuntu"
                                            ? "border-[#6aa329] bg-[#f0f7e7] ring-1 ring-[#6aa329]"
                                            : "border-gray-200 hover:border-gray-300"
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="font-medium text-[#0c0e0a]">
                                                    Ubuntu LTS
                                                </div>
                                                <div className="text-sm text-gray-600">
                                                    Long-term support versions
                                                    (Recommended)
                                                </div>
                                            </div>
                                            <div
                                                className={`w-4 h-4 rounded-full border-2 ${baseImageSource === "ubuntu"
                                                    ? "border-[#6aa329] bg-[#6aa329]"
                                                    : "border-gray-300"
                                                    }`}
                                            >
                                                {baseImageSource ===
                                                    "ubuntu" && (
                                                        <div className="w-full h-full rounded-full bg-white scale-50"></div>
                                                    )}
                                            </div>
                                        </div>
                                    </div>
                                </label>

                                <label className="relative">
                                    <input
                                        type="radio"
                                        name="baseImageSource"
                                        value="other"
                                        checked={baseImageSource === "other"}
                                        onChange={() =>
                                            handleBaseImageSourceChange("other")
                                        }
                                        className="sr-only"
                                    />
                                    <div
                                        className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${baseImageSource === "other"
                                            ? "border-[#6aa329] bg-[#f0f7e7] ring-1 ring-[#6aa329]"
                                            : "border-gray-200 hover:border-gray-300"
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="font-medium text-[#0c0e0a]">
                                                    Other Distributions
                                                </div>
                                                <div className="text-sm text-gray-600">
                                                    Debian, CentOS, Fedora
                                                </div>
                                            </div>
                                            <div
                                                className={`w-4 h-4 rounded-full border-2 ${baseImageSource === "other"
                                                    ? "border-[#6aa329] bg-[#6aa329]"
                                                    : "border-gray-300"
                                                    }`}
                                            >
                                                {baseImageSource === "other" && (
                                                    <div className="w-full h-full rounded-full bg-white scale-50"></div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </label>

                                <label className="relative">
                                    <input
                                        type="radio"
                                        name="baseImageSource"
                                        value="custom"
                                        checked={baseImageSource === "custom"}
                                        onChange={() =>
                                            handleBaseImageSourceChange("custom")
                                        }
                                        className="sr-only"
                                    />
                                    <div
                                        className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${baseImageSource === "custom"
                                            ? "border-[#6aa329] bg-[#f0f7e7] ring-1 ring-[#6aa329]"
                                            : "border-gray-200 hover:border-gray-300"
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="font-medium text-[#0c0e0a]">
                                                    Custom Image
                                                </div>
                                                <div className="text-sm text-gray-600">
                                                    Any Docker Hub image
                                                </div>
                                            </div>
                                            <div
                                                className={`w-4 h-4 rounded-full border-2 ${baseImageSource === "custom"
                                                    ? "border-[#6aa329] bg-[#6aa329]"
                                                    : "border-gray-300"
                                                    }`}
                                            >
                                                {baseImageSource ===
                                                    "custom" && (
                                                        <div className="w-full h-full rounded-full bg-white scale-50"></div>
                                                    )}
                                            </div>
                                        </div>
                                    </div>
                                </label>
                            </div>
                        </div>

                        {/* Conditional Base Image Selection */}
                        {baseImageSource === "ubuntu" && (
                            <div>
                                <label className="text-sm font-medium text-gray-600 mb-2 block">
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
                                <label className="text-sm font-medium text-gray-600 mb-2 block">
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
                                <label className="text-sm font-medium text-gray-600 mb-2 block">
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
                                    placeholder="e.g. neurodebian:sid"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Enter any valid Docker image name and tag
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Package Manager Section */}
                    <div>
                        <div className="flex items-center gap-2 mb-3">
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
                            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md text-sm text-blue-800">
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
                                    {baseImageSource === "custom"
                                        ? "For custom images, select the appropriate package manager."
                                        : "Package manager is automatically selected based on your base image."}
                                </p>
                            </div>
                        )}

                        {baseImageSource === "custom" ? (
                            <select
                                className="w-full px-3 py-2 border border-gray-200 rounded-md text-[#0c0e0a] bg-white focus:outline-none focus:ring-1 focus:ring-[#6aa329] focus:border-[#6aa329]"
                                value={recipe["pkg-manager"]}
                                onChange={(e) => updatePkgManager(e.target.value)}
                            >
                                <option value="apt">
                                    apt (Debian/Ubuntu)
                                </option>
                                <option value="yum">
                                    yum (RHEL/CentOS/Fedora)
                                </option>
                            </select>
                        ) : (
                            getPackageManagerDisplay()
                        )}
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
                            software that requires them. Use drag and drop or
                            the arrow buttons to reorder directives.
                        </p>
                    </div>

                    {recipe.directives.length === 0 ? (
                        <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                            <p className="mb-2">No directives added yet</p>
                            <p className="text-sm">
                                Click &quot;Add Directive&quot; to start
                                building your container
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {recipe.directives.map((directive, index) => (
                                <div
                                    key={`directive-${index}`}
                                    ref={
                                        index === recipe.directives.length - 1
                                            ? lastDirectiveRef
                                            : null
                                    }
                                    className={`flex flex-col sm:flex-row gap-3 transition-all duration-200 ${draggedIndex === index
                                        ? "opacity-50"
                                        : ""
                                        } ${dragOverIndex === index
                                            ? "border-t-2 border-[#6aa329] pt-2"
                                            : ""
                                        }`}
                                    draggable
                                    onDragStart={(e) =>
                                        handleDragStart(e, index)
                                    }
                                    onDragOver={(e) => handleDragOver(e, index)}
                                    onDragLeave={handleDragLeave}
                                    onDrop={(e) => handleDrop(e, index)}
                                    onDragEnd={handleDragEnd}
                                >
                                    {/* Mobile: Horizontal Controls */}
                                    <div className="flex sm:hidden items-center justify-between bg-gray-50 p-2 rounded-md border">
                                        <div className="flex items-center gap-2">
                                            <button
                                                className="text-gray-400 hover:text-[#6aa329] cursor-grab active:cursor-grabbing"
                                                onMouseDown={(e) =>
                                                    e.stopPropagation()
                                                }
                                            >
                                                <Bars3Icon className="h-4 w-4" />
                                            </button>
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
                                                <button
                                                    className="text-red-400 hover:text-red-600 transition-colors p-1.5 rounded hover:bg-white"
                                                    onClick={() =>
                                                        handleDeleteClick(index)
                                                    }
                                                    title="Delete directive"
                                                >
                                                    <TrashIcon className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Desktop: Vertical Controls */}
                                    <div className="hidden sm:flex flex-col items-center pt-3 flex-shrink-0">
                                        <div className="flex flex-col bg-white border border-gray-300 rounded-md shadow-sm">
                                            <button
                                                className="p-2 border-b border-gray-200 text-gray-400 hover:text-[#6aa329] cursor-grab active:cursor-grabbing transition-colors"
                                                onMouseDown={(e) =>
                                                    e.stopPropagation()
                                                }
                                                title="Drag to reorder"
                                            >
                                                <Bars3Icon className="h-5 w-5" />
                                            </button>
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
                                                className={`p-2 border-b border-gray-200 ${index ===
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
                                            <button
                                                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                                onClick={() =>
                                                    handleDeleteClick(index)
                                                }
                                                title="Delete directive"
                                            >
                                                <TrashIcon className="h-5 w-5" />
                                            </button>
                                        </div>
                                        <div className="mt-2 text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                            {index + 1}
                                        </div>
                                    </div>

                                    {/* Directive Content */}
                                    <div className="flex-1 min-w-0">
                                        <DirectiveComponent
                                            directive={directive}
                                            onChange={(updated) =>
                                                updateDirective(index, updated)
                                            }
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {deleteConfirmIndex !== null && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                        <div className="p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                    <TrashIcon className="h-6 w-6 text-red-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900">
                                        Delete Directive
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        Step {deleteConfirmIndex + 1}
                                    </p>
                                </div>
                            </div>
                            <p className="text-gray-700 mb-6">
                                Are you sure you want to delete this directive?
                                This action cannot be undone.
                            </p>
                            <div className="flex gap-3 justify-end">
                                <button
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                                    onClick={cancelDelete}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors"
                                    onClick={() =>
                                        removeDirective(deleteConfirmIndex)
                                    }
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}