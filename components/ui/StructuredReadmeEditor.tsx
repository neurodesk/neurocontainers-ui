import { StructuredReadme, convertStructuredReadmeToText } from "@/components/common";
import { FormField } from "./FormField";
import { useState } from "react";
import { DocumentTextIcon } from "@heroicons/react/24/outline";
import { getThemePresets, iconStyles, textStyles, textareaStyles, cn } from "@/lib/styles";
import { useTheme } from "@/lib/ThemeContext";

interface StructuredReadmeEditorProps {
    value: StructuredReadme;
    onChange: (value: StructuredReadme) => void;
    containerName: string;
    containerVersion: string;
}

export function StructuredReadmeEditor({ value, onChange, containerName, containerVersion }: StructuredReadmeEditorProps) {
    const { isDark } = useTheme();
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
                <h4 className={textStyles(isDark, { size: 'sm', weight: 'medium', color: 'muted' })}>Documentation Fields</h4>
                <button
                    type="button"
                    className={cn(
                        "text-sm px-3 py-1.5 rounded-md transition-colors font-medium",
                        isDark
                            ? "bg-[#1f2e18] text-[#91c84a] hover:bg-[#2a3d20]"
                            : "bg-[#f0f7e7] text-[#4f7b38] hover:bg-[#e5f0d5]"
                    )}
                    onClick={() => setShowPreview(!showPreview)}
                >
                    {showPreview ? "Edit Fields" : "Preview README"}
                </button>
            </div>

            {showPreview ? (
                <div className={cn(
                    "border rounded-lg overflow-hidden",
                    isDark ? "border-[#374151]" : "border-gray-200"
                )}>
                    <div className={cn(
                        "px-4 py-3 border-b",
                        isDark ? "bg-[#2d4222] border-[#374151]" : "bg-gray-50 border-gray-200"
                    )}>
                        <div className={textStyles(isDark, { size: 'sm', weight: 'medium', color: 'muted' })}>Generated README Preview</div>
                    </div>
                    <div className={cn(
                        "p-6 min-h-[300px] max-h-[500px] overflow-y-auto",
                        isDark ? "bg-[#161a0e]" : "bg-white"
                    )}>
                        {previewContent ? (
                            <pre className={cn("whitespace-pre-wrap font-mono leading-relaxed", textStyles(isDark, { size: 'sm', color: 'primary' }))}>
                                {previewContent}
                            </pre>
                        ) : (
                            <div className={cn(
                                "italic text-center py-12",
                                isDark ? "text-[#9ca3af]" : "text-gray-400"
                            )}>
                                <DocumentTextIcon className={cn(
                                    iconStyles(isDark, 'lg'),
                                    "h-12 w-12 mx-auto mb-3",
                                    isDark ? "text-[#6b7280]" : "text-gray-300"
                                )} />
                                <p className={textStyles(isDark, { size: 'base', color: 'muted' })}>Fill out the fields to see the generated README</p>
                                <p className={cn(textStyles(isDark, { size: 'sm', color: 'muted' }), "mt-1")}>This preview shows exactly what will be included in your container</p>
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
                            className={textareaStyles(isDark)}
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
                            placeholder="toolname --help"
                            className={textareaStyles(isDark, { monospace: true })}
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
                            className={getThemePresets(isDark).input}
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
                            className={textareaStyles(isDark)}
                            rows={4}
                        />
                    </FormField>
                </div>
            )}
        </div>
    );
}