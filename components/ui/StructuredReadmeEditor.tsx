import { StructuredReadme, convertStructuredReadmeToText } from "@/components/common";
import { FormField } from "./FormField";
import { useState } from "react";
import { DocumentTextIcon } from "@heroicons/react/24/outline";
import { presets, iconStyles, textStyles, textareaStyles, cn } from "@/lib/styles";

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
                <h4 className={textStyles({ size: 'sm', weight: 'medium', color: 'muted' })}>Documentation Fields</h4>
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
                        <div className={textStyles({ size: 'sm', weight: 'medium', color: 'muted' })}>Generated README Preview</div>
                    </div>
                    <div className="p-6 min-h-[300px] max-h-[500px] overflow-y-auto bg-white">
                        {previewContent ? (
                            <pre className={cn("whitespace-pre-wrap font-mono leading-relaxed", textStyles({ size: 'sm', color: 'primary' }))}>
                                {previewContent}
                            </pre>
                        ) : (
                            <div className="text-gray-400 italic text-center py-12">
                                <DocumentTextIcon className={cn(iconStyles('lg'), "h-12 w-12 mx-auto mb-3 text-gray-300")} />
                                <p className={textStyles({ size: 'base', color: 'muted' })}>Fill out the fields to see the generated README</p>
                                <p className={cn(textStyles({ size: 'sm', color: 'muted' }), "mt-1")}>This preview shows exactly what will be included in your container</p>
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
                            className={textareaStyles()}
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
                            className={textareaStyles({ monospace: true })}
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
                            className={presets.input}
                        />
                    </FormField>

                    <FormField
                        label="Citation"
                        description="Academic citation or reference for the tool. Citations containing Jinja2 syntax will be wrapped in raw blocks to prevent template processing conflicts."
                    >
                        <textarea
                            value={value.citation}
                            onChange={(e) => updateField("citation", e.target.value)}
                            placeholder="Author et al. (Year). Title. Journal. DOI: ..."
                            className={textareaStyles()}
                            rows={4}
                        />
                    </FormField>
                </div>
            )}
        </div>
    );
}