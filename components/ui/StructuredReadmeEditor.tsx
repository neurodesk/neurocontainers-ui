import { StructuredReadme, convertStructuredReadmeToText } from "@/components/common";
import { FormField } from "./FormField";
import { useState } from "react";
import { DocumentTextIcon } from "@heroicons/react/24/outline";

interface StructuredReadmeEditorProps {
    value: StructuredReadme;
    onChange: (value: StructuredReadme) => void;
    containerName: string;
    containerVersion: string;
}

export function StructuredReadmeEditor({ value, onChange, containerName, containerVersion }: StructuredReadmeEditorProps) {
    const [showPreview, setShowPreview] = useState(false);

    const updateField = (field: keyof StructuredReadme, fieldValue: string) => {
        onChange({
            ...value,
            [field]: fieldValue,
        });
    };

    const previewContent = convertStructuredReadmeToText(value, containerName, containerVersion);

    return (
        <div className="space-y-4">
            {/* Preview Toggle */}
            <div className="flex justify-between items-center">
                <h4 className="text-sm font-medium text-gray-700">Documentation Fields</h4>
                <button
                    type="button"
                    className="text-sm px-3 py-1.5 rounded-md bg-[#f0f7e7] text-[#4f7b38] hover:bg-[#e5f0d5] transition-colors font-medium"
                    onClick={() => setShowPreview(!showPreview)}
                >
                    {showPreview ? "Edit Fields" : "Preview README"}
                </button>
            </div>

            {showPreview ? (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                        <div className="text-sm font-medium text-gray-700">Generated README Preview</div>
                    </div>
                    <div className="p-6 min-h-[300px] max-h-[500px] overflow-y-auto bg-white">
                        {previewContent ? (
                            <pre className="whitespace-pre-wrap text-sm text-gray-900 font-mono leading-relaxed">
                                {previewContent}
                            </pre>
                        ) : (
                            <div className="text-gray-400 italic text-center py-12">
                                <DocumentTextIcon className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                                <p className="text-base">Fill out the fields to see the generated README</p>
                                <p className="text-sm mt-1">This preview shows exactly what will be included in your container</p>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
            <FormField
                label="Description *"
                description="Brief description of the tool and its capabilities (2-3 paragraphs)"
            >
                <textarea
                    value={value.description}
                    onChange={(e) => updateField("description", e.target.value)}
                    placeholder="Enter a description of the neuroimaging tool..."
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#6aa329] focus:border-[#6aa329] sm:text-sm resize-none"
                    rows={4}
                />
            </FormField>

            <FormField
                label="Usage Example *"
                description="Basic usage commands and examples"
            >
                <textarea
                    value={value.example}
                    onChange={(e) => updateField("example", e.target.value)}
                    placeholder="ml toolname/version&#10;toolname --help"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#6aa329] focus:border-[#6aa329] sm:text-sm font-mono resize-none"
                    rows={3}
                />
            </FormField>

            <FormField
                label="Documentation URL *"
                description="Link to official documentation or project website"
            >
                <input
                    type="url"
                    value={value.documentation}
                    onChange={(e) => updateField("documentation", e.target.value)}
                    placeholder="https://..."
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#6aa329] focus:border-[#6aa329] sm:text-sm"
                />
            </FormField>

            <FormField
                label="Citation"
                description="Academic citation or reference for the tool"
            >
                <textarea
                    value={value.citation}
                    onChange={(e) => updateField("citation", e.target.value)}
                    placeholder="Author et al. (Year). Title. Journal. DOI: ..."
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#6aa329] focus:border-[#6aa329] sm:text-sm resize-none"
                    rows={2}
                />
            </FormField>
                </div>
            )}
        </div>
    );
}