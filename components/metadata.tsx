import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { ContainerRecipe, Architecture, CopyrightInfo } from "@/components/common";
import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";

export default function ContainerMetadata({
    recipe,
    onChange,
}: {
    recipe: ContainerRecipe;
    onChange: (recipe: ContainerRecipe) => void;
}) {
    const [readmeContent, setReadmeContent] = useState(recipe.readme || "");
    const [showPreview, setShowPreview] = useState(false);
    const inputType = recipe.readme !== undefined ? "content" : recipe.readme_url !== undefined ? "url" : "content";

    useEffect(() => {
        // Update local state when recipe changes externally
        setReadmeContent(recipe.readme || "");
    }, [recipe.readme, recipe.readme_url]);

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
        setReadmeContent(readme);
        onChange({ ...recipe, readme, readme_url: undefined });
    };

    const updateReadmeUrl = (readme_url: string) => {
        onChange({ ...recipe, readme_url, readme: undefined });
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
            copyright: [...(recipe.copyright || []), newCopyright],
        });
    };

    const removeCopyright = (index: number) => {
        if (!recipe.copyright) return;

        onChange({
            ...recipe,
            copyright: recipe.copyright.filter((_, i) => i !== index),
        });
    };

    const toggleInputType = (type: "content" | "url") => {
        if (type === inputType) return;

        if (type === "content") {
            onChange({ ...recipe, readme: readmeContent, readme_url: undefined });
        } else {
            onChange({ ...recipe, readme: undefined, readme_url: recipe.readme_url || "" });
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-md border border-[#d3e7b6] mb-6">
            <div className="p-4 bg-[#f0f7e7] rounded-t-lg">
                <h2 className="text-xl font-semibold text-[#0c0e0a]">
                    Container Definition
                </h2>
            </div>

            <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block mb-2 font-medium text-[#1e2a16]">
                            Name
                        </label>
                        <input
                            className="w-full px-3 py-2 border border-gray-200 rounded-md text-[#0c0e0a] focus:outline-none focus:ring-1 focus:ring-[#6aa329] focus:border-[#6aa329]"
                            value={recipe.name}
                            onChange={(e) => updateName(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block mb-2 font-medium text-[#1e2a16]">
                            Version
                        </label>
                        <input
                            className="w-full px-3 py-2 border border-gray-200 rounded-md text-[#0c0e0a] focus:outline-none focus:ring-1 focus:ring-[#6aa329] focus:border-[#6aa329]"
                            value={recipe.version}
                            onChange={(e) => updateVersion(e.target.value)}
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="block mb-2 font-medium text-[#1e2a16]">
                            Architectures
                        </label>
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
                                            updateArchitectures(
                                                recipe.architectures.filter(
                                                    (arch) => arch !== "x86_64"
                                                )
                                            );
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
                                            updateArchitectures(
                                                recipe.architectures.filter(
                                                    (arch) => arch !== "aarch64"
                                                )
                                            );
                                        }
                                    }}
                                />
                                <span className="ml-2 text-[#0c0e0a]">aarch64</span>
                            </label>
                        </div>
                    </div>

                    <div className="md:col-span-2">
                        <div className="mb-4">
                            <label className="block font-medium text-[#1e2a16] mb-2">Readme</label>
                            <div className="inline-flex p-1 bg-gray-100 rounded-md mb-4">
                                <button
                                    type="button"
                                    onClick={() => toggleInputType("content")}
                                    className={`px-4 py-2 text-sm rounded-md transition-colors ${inputType === "content"
                                        ? "bg-white shadow-sm text-[#4f7b38] font-medium"
                                        : "text-gray-600 hover:text-[#4f7b38]"
                                        }`}
                                >
                                    Enter Content
                                </button>
                                <button
                                    type="button"
                                    onClick={() => toggleInputType("url")}
                                    className={`px-4 py-2 text-sm rounded-md transition-colors ${inputType === "url"
                                        ? "bg-white shadow-sm text-[#4f7b38] font-medium"
                                        : "text-gray-600 hover:text-[#4f7b38]"
                                        }`}
                                >
                                    Provide URL
                                </button>
                            </div>
                        </div>

                        {inputType === "content" ? (
                            <div className="border border-gray-200 rounded-lg overflow-hidden">
                                <div className="flex justify-between items-center px-4 py-2 bg-gray-50 border-b">
                                    <div className="text-sm font-medium text-gray-600">
                                        {showPreview ? "Preview" : "Markdown Editor"}
                                    </div>
                                    <button
                                        type="button"
                                        className="text-sm px-3 py-1 rounded-md bg-[#f0f7e7] text-[#4f7b38] hover:bg-[#e5f0d5] transition-colors"
                                        onClick={() => setShowPreview(!showPreview)}
                                    >
                                        {showPreview ? "Edit" : "Preview"}
                                    </button>
                                </div>

                                {showPreview ? (
                                    <div className="p-4 min-h-[250px] max-h-[500px] overflow-y-auto prose prose-sm max-w-none">
                                        {readmeContent ? (
                                            <ReactMarkdown>{readmeContent}</ReactMarkdown>
                                        ) : (
                                            <div className="text-gray-400 italic">
                                                Preview will appear here
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <textarea
                                        className="w-full px-4 py-3 text-[#0c0e0a] focus:outline-none focus:ring-0 border-0 min-h-[250px] resize-y"
                                        value={readmeContent}
                                        onChange={(e) => updateReadme(e.target.value)}
                                        placeholder="# Your readme content in Markdown format"
                                    />
                                )}
                            </div>
                        ) : (
                            <div>
                                <input
                                    className="w-full px-3 py-2 border border-gray-200 rounded-md text-[#0c0e0a] focus:outline-none focus:ring-1 focus:ring-[#6aa329] focus:border-[#6aa329]"
                                    value={recipe.readme_url || ""}
                                    onChange={(e) => updateReadmeUrl(e.target.value)}
                                    placeholder="URL to readme file"
                                />
                                <p className="mt-2 text-sm text-gray-500">
                                    Enter a URL to an external readme file (e.g., GitHub raw file URL)
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-6">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="font-medium text-[#1e2a16]">
                            Copyright Information
                        </h3>
                        <button
                            className="text-sm text-[#4f7b38] hover:text-[#6aa329] flex items-center"
                            onClick={addCopyright}
                        >
                            <PlusIcon className="h-4 w-4 mr-1" />
                            Add License
                        </button>
                    </div>

                    {(recipe.copyright || []).map((info, index) => (
                        <div
                            key={index}
                            className="mb-4 last:mb-0 p-4 bg-[#f0f7e7] rounded-md relative"
                        >
                            <button
                                className="absolute top-3 right-3 text-gray-400 hover:text-[#6aa329]"
                                onClick={() => removeCopyright(index)}
                            >
                                <TrashIcon className="h-5 w-5" />
                            </button>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block mb-1 text-sm font-medium text-[#1e2a16]">
                                        License
                                    </label>
                                    <input
                                        className="w-full px-3 py-2 border border-gray-200 rounded-md text-[#0c0e0a] focus:outline-none focus:ring-1 focus:ring-[#6aa329] focus:border-[#6aa329] bg-white"
                                        value={info.license}
                                        onChange={(e) =>
                                            updateCopyright(index, {
                                                ...info,
                                                license: e.target.value,
                                            })
                                        }
                                        placeholder="SPDX License Identifier"
                                    />
                                </div>

                                <div>
                                    <label className="block mb-1 text-sm font-medium text-[#1e2a16]">
                                        URL
                                    </label>
                                    <input
                                        className="w-full px-3 py-2 border border-gray-200 rounded-md text-[#0c0e0a] focus:outline-none focus:ring-1 focus:ring-[#6aa329] focus:border-[#6aa329] bg-white"
                                        value={info.url}
                                        onChange={(e) =>
                                            updateCopyright(index, { ...info, url: e.target.value })
                                        }
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
