import { useState } from "react";
import { DocumentTextIcon } from "@heroicons/react/24/outline";
import ReactMarkdown from "react-markdown";
import { FormField, Input, Textarea } from "./FormField";
import ToggleButtonGroup from "./ToggleButtonGroup";

interface DocumentationSectionProps {
    readme?: string;
    readmeUrl?: string;
    onReadmeChange: (readme: string) => void;
    onReadmeUrlChange: (url: string) => void;
    error?: string | null;
    showValidation?: boolean;
}

export default function DocumentationSection({
    readme,
    readmeUrl,
    onReadmeChange,
    onReadmeUrlChange,
    error,
    showValidation = false,
}: DocumentationSectionProps) {
    const [readmeContent, setReadmeContent] = useState(readme || "");
    const [showPreview, setShowPreview] = useState(false);

    const inputType = readme !== undefined ? "content" : readmeUrl !== undefined ? "url" : "content";

    const updateReadme = (content: string) => {
        setReadmeContent(content);
        onReadmeChange(content);
    };

    const toggleInputType = (type: "content" | "url") => {
        if (type === inputType) return;

        if (type === "content") {
            onReadmeChange(readmeContent);
        } else {
            onReadmeUrlChange(readmeUrl || "");
        }
    };

    return (
        <div>
            <FormField label="Documentation Input Type">
                <ToggleButtonGroup
                    options={[
                        { value: "content", label: "Enter Content" },
                        { value: "url", label: "Provide URL" },
                    ]}
                    value={inputType}
                    onChange={(value) => toggleInputType(value as "content" | "url")}
                />
            </FormField>

            {inputType === "content" ? (
                <FormField label="Documentation Content">
                    <div
                        className={`border rounded-lg overflow-hidden ${
                            showValidation && error ? "border-red-300" : "border-gray-200"
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