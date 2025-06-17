import { useState, useEffect } from "react";
import { DocumentTextIcon } from "@heroicons/react/24/outline";
import ReactMarkdown from "react-markdown";
import { FormField, Input, Textarea } from "./FormField";
import ToggleButtonGroup from "./ToggleButtonGroup";
import { StructuredReadmeEditor } from "./StructuredReadmeEditor";
import { StructuredReadme } from "@/components/common";

interface DocumentationSectionProps {
    readme?: string;
    readmeUrl?: string;
    structuredReadme?: StructuredReadme;
    containerName: string;
    containerVersion: string;
    onReadmeChange: (readme: string) => void;
    onReadmeUrlChange: (url: string) => void;
    onStructuredReadmeChange: (structured: StructuredReadme) => void;
    error?: string | null;
    showValidation?: boolean;
}

export default function DocumentationSection({
    readme,
    readmeUrl,
    structuredReadme,
    containerName,
    containerVersion,
    onReadmeChange,
    onReadmeUrlChange,
    onStructuredReadmeChange,
    error,
    showValidation = false,
}: DocumentationSectionProps) {
    const [readmeContent, setReadmeContent] = useState(readme || "");
    const [showPreview, setShowPreview] = useState(false);
    const [userSelectedMode, setUserSelectedMode] = useState<"structured" | "content" | "url" | null>(null);

    // Reset local state when container changes
    useEffect(() => {
        setReadmeContent(readme || "");
        setUserSelectedMode(null);
        setShowPreview(false);
    }, [containerName, containerVersion, readme, readmeUrl, structuredReadme]);

    // Default structured readme
    const defaultStructuredReadme: StructuredReadme = {
        description: "",
        example: `ml ${containerName}/${containerVersion}\n${containerName} --help`,
        documentation: "",
        citation: "",
    };

    const currentStructuredReadme = structuredReadme || defaultStructuredReadme;

    // Determine input type based on user selection or data that exists
    const inputType = userSelectedMode ||
        (structuredReadme !== undefined ? "structured" :
            readmeUrl !== undefined ? "url" :
                readme !== undefined ? "content" : "structured");

    const updateReadme = (content: string) => {
        setReadmeContent(content);
        onReadmeChange(content);
    };

    const updateStructuredReadme = (structured: StructuredReadme) => {
        onStructuredReadmeChange(structured);
        // Note: The parent component handles generating the plain text readme
    };

    const toggleInputType = (type: "content" | "url" | "structured") => {
        if (type === inputType) return;

        setUserSelectedMode(type);

        if (type === "content") {
            onReadmeChange(readmeContent);
        } else if (type === "url") {
            onReadmeUrlChange(readmeUrl || "");
        } else if (type === "structured") {
            onStructuredReadmeChange(currentStructuredReadme);
        }
    };

    return (
        <div>
            <FormField label="Documentation Input Type">
                <ToggleButtonGroup
                    options={[
                        { value: "structured", label: "Structured" },
                        { value: "content", label: "Enter Content" },
                        { value: "url", label: "Provide URL" },
                    ]}
                    value={inputType}
                    onChange={(value) => toggleInputType(value as "structured" | "content" | "url")}
                />
            </FormField>

            {inputType === "structured" ? (
                <FormField label="Structured Documentation">
                    <StructuredReadmeEditor
                        value={currentStructuredReadme}
                        onChange={updateStructuredReadme}
                        containerName={containerName}
                        containerVersion={containerVersion}
                    />
                </FormField>
            ) : inputType === "content" ? (
                <FormField label="Documentation Content">
                    <div
                        className={`border rounded-lg overflow-hidden ${showValidation && error ? "border-red-300" : "border-gray-200"
                            }`}
                    >
                        <div className="flex justify-between items-center px-4 py-3 bg-gray-50 border-b">
                            <div className="text-sm font-medium text-gray-700">
                                {showPreview ? "Markdown Preview" : "Markdown Editor"}
                            </div>
                            <button
                                type="button"
                                className="text-sm px-3 py-1.5 rounded-md bg-[#f0f7e7] text-[#4f7b38] hover:bg-[#e5f0d5] transition-colors font-medium"
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
                                    <div className="text-gray-400 italic text-center py-8">
                                        <DocumentTextIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                                        <p>Preview will appear here when you add content</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Textarea
                                className="w-full px-4 py-3 text-[#0c0e0a] focus:outline-none focus:ring-0 border-0 min-h-[250px] resize-y font-mono text-sm leading-relaxed"
                                value={readmeContent}
                                onChange={(e) => updateReadme(e.target.value)}
                                style={{
                                    fontFamily:
                                        'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
                                }}
                            />
                        )}
                    </div>
                </FormField>
            ) : (
                <FormField
                    label="Documentation URL"
                    description={
                        showValidation && error
                            ? error
                            : "Enter a URL to an external documentation file. GitHub raw file URLs work well for this purpose."
                    }
                >
                    <Input
                        value={readmeUrl || ""}
                        onChange={(e) => onReadmeUrlChange(e.target.value)}
                        placeholder="https://raw.githubusercontent.com/user/repo/main/README.md"
                        className={
                            showValidation && error
                                ? "border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50"
                                : ""
                        }
                    />
                </FormField>
            )}
        </div>
    );
}