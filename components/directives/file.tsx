import { ChevronDownIcon, ChevronRightIcon } from "@heroicons/react/outline";
import { useState, useEffect } from "react";
import { FileInfo } from "@/components/common";

export default function FileDirectiveComponent({
    file,
    onChange,
}: {
    file: FileInfo;
    onChange: (file: FileInfo) => void;
}) {
    const [isExpanded, setIsExpanded] = useState(true);
    const [fileContent, setFileContent] = useState(file.contents || "");
    const inputType = file.contents !== undefined ? "content" : "filename";

    useEffect(() => {
        // Update local state when file changes externally
        setFileContent(file.contents || "");
    }, [file.contents]);

    const updateName = (value: string) => {
        onChange({ ...file, name: value });
    };

    const updateFilename = (value: string) => {
        onChange({ ...file, filename: value, contents: undefined });
    };

    const updateContents = (value: string) => {
        setFileContent(value);
        onChange({ ...file, contents: value, filename: undefined });
    };

    const toggleInputType = (type: "content" | "filename") => {
        if (type === inputType) return;

        if (type === "content") {
            onChange({ ...file, contents: fileContent, filename: undefined });
        } else {
            onChange({ ...file, contents: undefined, filename: file.filename || "" });
        }
    };

    return (
        <div className="bg-white rounded-md shadow-sm border border-[#e6f1d6] mb-4">
            <div
                className="flex items-center p-3 bg-[#f0f7e7] rounded-t-md cursor-pointer"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <button className="mr-2 text-[#4f7b38]">
                    {isExpanded ? (
                        <ChevronDownIcon className="h-5 w-5" />
                    ) : (
                        <ChevronRightIcon className="h-5 w-5" />
                    )}
                </button>
                <h2 className="text-[#0c0e0a] font-medium">
                    File: <span className="font-mono">{file.name}</span>
                </h2>
            </div>

            {isExpanded && (
                <div className="p-4 border-t border-[#e6f1d6]">
                    <div className="mb-4">
                        <label className="block mb-1 font-medium text-sm text-[#1e2a16]">
                            Name
                        </label>
                        <input
                            className="w-full px-3 py-2 border border-gray-200 rounded-md text-[#0c0e0a] focus:outline-none focus:ring-1 focus:ring-[#6aa329] focus:border-[#6aa329]"
                            value={file.name}
                            onChange={(e) => updateName(e.target.value)}
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block font-medium text-sm text-[#1e2a16] mb-2">
                            File Source
                        </label>
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
                                onClick={() => toggleInputType("filename")}
                                className={`px-4 py-2 text-sm rounded-md transition-colors ${inputType === "filename"
                                        ? "bg-white shadow-sm text-[#4f7b38] font-medium"
                                        : "text-gray-600 hover:text-[#4f7b38]"
                                    }`}
                            >
                                Provide Filename
                            </button>
                        </div>
                    </div>

                    {inputType === "content" ? (
                        <div>
                            <label className="block mb-1 font-medium text-sm text-[#1e2a16]">
                                File Contents
                            </label>
                            <textarea
                                className="w-full px-3 py-2 border border-gray-200 rounded-md text-[#0c0e0a] focus:outline-none focus:ring-1 focus:ring-[#6aa329] focus:border-[#6aa329] font-mono min-h-[200px]"
                                value={fileContent}
                                onChange={(e) => updateContents(e.target.value)}
                                placeholder="Enter file contents here..."
                            />
                        </div>
                    ) : (
                        <div>
                            <label className="block mb-1 font-medium text-sm text-[#1e2a16]">
                                Filename
                            </label>
                            <input
                                className="w-full px-3 py-2 border border-gray-200 rounded-md text-[#0c0e0a] focus:outline-none focus:ring-1 focus:ring-[#6aa329] focus:border-[#6aa329]"
                                value={file.filename || ""}
                                onChange={(e) => updateFilename(e.target.value)}
                                placeholder="Path to the file"
                            />
                            <p className="mt-2 text-sm text-gray-500">
                                Enter the path to an existing file
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
