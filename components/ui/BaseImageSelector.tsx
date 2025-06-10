import { useState } from "react";
import { InformationCircleIcon } from "@heroicons/react/24/outline";

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

const LATEST_UBUNTU_VERSION = "ubuntu:24.04";

type BaseImageSource = "ubuntu" | "other" | "custom";

interface BaseImageSelectorProps {
    baseImage: string;
    pkgManager: string;
    onChange: (baseImage: string, pkgManager: string) => void;
}

export default function BaseImageSelector({
    baseImage,
    pkgManager,
    onChange,
}: BaseImageSelectorProps) {
    const [showBaseImageHelp, setShowBaseImageHelp] = useState(false);
    const [showPkgManagerHelp, setShowPkgManagerHelp] = useState(false);

    // Determine current base image source
    const getBaseImageSource = (): BaseImageSource => {
        if (UBUNTU_VERSIONS.some((img) => img.value === baseImage)) {
            return "ubuntu";
        } else if (OTHER_BASE_IMAGES.some((img) => img.value === baseImage)) {
            return "other";
        } else {
            return "custom";
        }
    };

    const baseImageSource = getBaseImageSource();

    const handleBaseImageSourceChange = (source: BaseImageSource) => {
        // Set default base image and package manager based on source
        if (source === "ubuntu") {
            onChange(LATEST_UBUNTU_VERSION, "apt");
        } else if (source === "other") {
            const defaultImage = OTHER_BASE_IMAGES[0];
            onChange(defaultImage.value, defaultImage.pkgManager);
        } else {
            onChange("", "apt");
        }
    };

    const handleBaseImageSelect = (value: string) => {
        // Auto-set package manager based on selected image
        if (baseImageSource === "ubuntu") {
            onChange(value, "apt");
        } else if (baseImageSource === "other") {
            const selectedImage = OTHER_BASE_IMAGES.find((img) => img.value === value);
            if (selectedImage) {
                onChange(value, selectedImage.pkgManager);
            }
        }
    };

    const handleCustomBaseImageChange = (value: string) => {
        onChange(value, pkgManager);
    };

    const baseImageHelpContent = (
        <>
            <h4 className="font-semibold text-[#0c0e0a] mb-2">Base Image</h4>
            <div className="text-sm text-gray-600 space-y-2">
                <p>The Docker base image that your container will be built upon.</p>
                <div>
                    <strong>Options:</strong>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                        <li><strong>Ubuntu LTS:</strong> Long-term support versions, recommended for stability</li>
                        <li><strong>Other Distros:</strong> Debian, CentOS, and Fedora alternatives</li>
                        <li><strong>Custom Image:</strong> Any Docker Hub image for specialized needs</li>
                    </ul>
                </div>
                <p>This determines the operating system and initial software stack. Ubuntu LTS versions are recommended for stability and long-term support.</p>
            </div>
        </>
    );

    const pkgManagerHelpContent = (
        <>
            <h4 className="font-semibold text-[#0c0e0a] mb-2">Package Manager</h4>
            <div className="text-sm text-gray-600 space-y-2">
                <p>The package management system used by your base image:</p>
                <ul className="list-disc list-inside space-y-1">
                    <li><strong>apt:</strong> Used by Debian/Ubuntu systems for installing packages</li>
                    <li><strong>yum:</strong> Used by RHEL/CentOS/Fedora systems for package management</li>
                </ul>
                <p>For custom images, select the appropriate package manager based on the underlying distribution.</p>
            </div>
        </>
    );

    return (
        <div className="w-full">
            <div className="flex items-center gap-2 mb-4">
                <label className="block font-medium text-[#1e2a16]">Base Image</label>
                <button
                    type="button"
                    className={`text-[#4f7b38] hover:text-[#6aa329] p-1 transition-colors ${showBaseImageHelp ? 'text-[#6aa329]' : ''}`}
                    onClick={() => setShowBaseImageHelp(!showBaseImageHelp)}
                    title={showBaseImageHelp ? "Hide documentation" : "Show documentation"}
                >
                    <InformationCircleIcon className="h-4 w-4" />
                </button>
            </div>

            {showBaseImageHelp && (
                <div className="mb-6 px-4 py-3 bg-[#fafcf7] border border-[#e6f1d6] rounded-md">
                    {baseImageHelpContent}
                </div>
            )}

            {/* Base Image Source Selection */}
            <div className="mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <label className="relative group">
                        <input
                            type="radio"
                            name="baseImageSource"
                            value="ubuntu"
                            checked={baseImageSource === "ubuntu"}
                            onChange={() => handleBaseImageSourceChange("ubuntu")}
                            className="sr-only"
                        />
                        <div
                            className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 h-full ${
                                baseImageSource === "ubuntu"
                                    ? "border-[#6aa329] bg-[#f0f7e7] shadow-md ring-2 ring-[#6aa329]/20"
                                    : "border-gray-200 hover:border-[#6aa329]/50 hover:bg-gray-50 group-hover:shadow-sm"
                            }`}
                        >
                            <div className="flex flex-col items-center text-center space-y-2">
                                <div
                                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                        baseImageSource === "ubuntu"
                                            ? "border-[#6aa329] bg-[#6aa329]"
                                            : "border-gray-300"
                                    }`}
                                >
                                    {baseImageSource === "ubuntu" && (
                                        <div className="w-2 h-2 rounded-full bg-white"></div>
                                    )}
                                </div>
                                <div>
                                    <div className="font-semibold text-[#0c0e0a] mb-1">Ubuntu LTS</div>
                                    <div className="text-xs text-gray-600 leading-relaxed">
                                        Long-term support
                                        <br />
                                        <span className="text-[#6aa329] font-medium">(Recommended)</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </label>

                    <label className="relative group">
                        <input
                            type="radio"
                            name="baseImageSource"
                            value="other"
                            checked={baseImageSource === "other"}
                            onChange={() => handleBaseImageSourceChange("other")}
                            className="sr-only"
                        />
                        <div
                            className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 h-full ${
                                baseImageSource === "other"
                                    ? "border-[#6aa329] bg-[#f0f7e7] shadow-md ring-2 ring-[#6aa329]/20"
                                    : "border-gray-200 hover:border-[#6aa329]/50 hover:bg-gray-50 group-hover:shadow-sm"
                            }`}
                        >
                            <div className="flex flex-col items-center text-center space-y-2">
                                <div
                                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                        baseImageSource === "other"
                                            ? "border-[#6aa329] bg-[#6aa329]"
                                            : "border-gray-300"
                                    }`}
                                >
                                    {baseImageSource === "other" && (
                                        <div className="w-2 h-2 rounded-full bg-white"></div>
                                    )}
                                </div>
                                <div>
                                    <div className="font-semibold text-[#0c0e0a] mb-1">Other Distros</div>
                                    <div className="text-xs text-gray-600 leading-relaxed">
                                        Debian, CentOS
                                        <br />
                                        Fedora
                                    </div>
                                </div>
                            </div>
                        </div>
                    </label>

                    <label className="relative group">
                        <input
                            type="radio"
                            name="baseImageSource"
                            value="custom"
                            checked={baseImageSource === "custom"}
                            onChange={() => handleBaseImageSourceChange("custom")}
                            className="sr-only"
                        />
                        <div
                            className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 h-full ${
                                baseImageSource === "custom"
                                    ? "border-[#6aa329] bg-[#f0f7e7] shadow-md ring-2 ring-[#6aa329]/20"
                                    : "border-gray-200 hover:border-[#6aa329]/50 hover:bg-gray-50 group-hover:shadow-sm"
                            }`}
                        >
                            <div className="flex flex-col items-center text-center space-y-2">
                                <div
                                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                        baseImageSource === "custom"
                                            ? "border-[#6aa329] bg-[#6aa329]"
                                            : "border-gray-300"
                                    }`}
                                >
                                    {baseImageSource === "custom" && (
                                        <div className="w-2 h-2 rounded-full bg-white"></div>
                                    )}
                                </div>
                                <div>
                                    <div className="font-semibold text-[#0c0e0a] mb-1">Custom Image</div>
                                    <div className="text-xs text-gray-600 leading-relaxed">
                                        Any Docker Hub
                                        <br />
                                        image
                                    </div>
                                </div>
                            </div>
                        </div>
                    </label>
                </div>
            </div>

            {/* Conditional Base Image Selection */}
            {baseImageSource === "ubuntu" && (
                <div className="mb-4">
                    <label className="text-sm font-semibold text-gray-700 mb-3 block">Ubuntu Version</label>
                    <select
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg text-[#0c0e0a] bg-white focus:outline-none focus:ring-2 focus:ring-[#6aa329]/20 focus:border-[#6aa329] transition-all"
                        value={baseImage}
                        onChange={(e) => handleBaseImageSelect(e.target.value)}
                    >
                        {UBUNTU_VERSIONS.map((version) => (
                            <option key={version.value} value={version.value}>
                                {version.label}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {baseImageSource === "other" && (
                <div className="mb-4">
                    <label className="text-sm font-semibold text-gray-700 mb-3 block">Distribution</label>
                    <select
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg text-[#0c0e0a] bg-white focus:outline-none focus:ring-2 focus:ring-[#6aa329]/20 focus:border-[#6aa329] transition-all"
                        value={baseImage}
                        onChange={(e) => handleBaseImageSelect(e.target.value)}
                    >
                        {OTHER_BASE_IMAGES.map((image) => (
                            <option key={image.value} value={image.value}>
                                {image.label}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {baseImageSource === "custom" && (
                <div className="mb-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                            <label className="text-sm font-semibold text-gray-700 mb-3 block">
                                Custom Image
                            </label>
                            <input
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-[#0c0e0a] focus:outline-none focus:ring-2 focus:ring-[#6aa329]/20 focus:border-[#6aa329] transition-all"
                                value={baseImage}
                                onChange={(e) => handleCustomBaseImageChange(e.target.value)}
                                placeholder="e.g. neurodebian:sid"
                            />
                            <p className="text-xs text-gray-500 mt-2">
                                Enter any valid Docker image name and tag
                            </p>
                        </div>

                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <label className="text-sm font-semibold text-gray-700 block">
                                    Package Manager
                                </label>
                                <button
                                    type="button"
                                    className={`text-[#4f7b38] hover:text-[#6aa329] p-1 transition-colors ${showPkgManagerHelp ? 'text-[#6aa329]' : ''}`}
                                    onClick={() => setShowPkgManagerHelp(!showPkgManagerHelp)}
                                    title={showPkgManagerHelp ? "Hide documentation" : "Show documentation"}
                                >
                                    <InformationCircleIcon className="h-4 w-4" />
                                </button>
                            </div>

                            {showPkgManagerHelp && (
                                <div className="mb-4 px-4 py-3 bg-[#fafcf7] border border-[#e6f1d6] rounded-md">
                                    {pkgManagerHelpContent}
                                </div>
                            )}

                            <select
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-[#0c0e0a] bg-white focus:outline-none focus:ring-2 focus:ring-[#6aa329]/20 focus:border-[#6aa329] transition-all"
                                value={pkgManager}
                                onChange={(e) => onChange(baseImage, e.target.value)}
                            >
                                <option value="apt">apt (Debian/Ubuntu)</option>
                                <option value="yum">yum (RHEL/CentOS/Fedora)</option>
                            </select>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}