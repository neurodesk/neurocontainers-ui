import { useState, useEffect } from "react";
import { DirectiveContainer, FormField, Input, Textarea, ToggleButtonGroup } from "@/components/ui";
import { FileInfo } from "@/components/common";
import { ClipboardDocumentListIcon } from "@heroicons/react/24/outline";
import { registerDirective, DirectiveMetadata } from "./registry";

export default function FileDirectiveComponent({
    file,
    onChange,
}: {
    file: FileInfo;
    onChange: (file: FileInfo) => void;
}) {
    const [fileContent, setFileContent] = useState(file.contents || "");

    // Determine input type based on file properties
    const getInputType: () => "content" | "url" | "filename" = () => {
        if (file.contents !== undefined) return "content";
        if (file.url !== undefined) return "url";
        return "filename";
    };

    const inputType = getInputType();

    useEffect(() => {
        // Update local state when file changes externally
        setFileContent(file.contents || "");
    }, [file.contents]);

    const updateName = (value: string) => {
        onChange({ ...file, name: value });
    };

    const updateFilename = (value: string) => {
        onChange({
            ...file,
            filename: value,
            contents: undefined,
            url: undefined,
        });
    };

    const updateContents = (value: string) => {
        setFileContent(value);
        onChange({
            ...file,
            contents: value,
            filename: undefined,
            url: undefined,
        });
    };

    const updateUrl = (value: string) => {
        onChange({
            ...file,
            url: value,
            contents: undefined,
            filename: undefined,
        });
    };

    const toggleInputType = (type: "content" | "filename" | "url") => {
        if (type === inputType) return;

        if (type === "content") {
            onChange({
                ...file,
                contents: fileContent,
                filename: undefined,
                url: undefined,
            });
        } else if (type === "filename") {
            onChange({
                ...file,
                contents: undefined,
                filename: file.filename || "",
                url: undefined,
            });
        } else if (type === "url") {
            onChange({
                ...file,
                contents: undefined,
                filename: undefined,
                url: file.url || "",
            });
        }
    };

    const helpContent = (
        <>
            <h3 className="font-semibold text-[#0c0e0a] mb-2">
                FILE Directive
            </h3>
            <div className="text-sm text-gray-600 space-y-2">
                <p>
                    The FILE directive allows you to include files in your container build process.
                </p>
                <div>
                    <strong>File Source Options:</strong>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                        <li><strong>Enter Content:</strong> Directly input the file content inline</li>
                        <li><strong>Provide Filename:</strong> Reference an existing file by path</li>
                        <li><strong>Provide URL:</strong> Fetch content from a web address</li>
                    </ul>
                </div>
                <div>
                    <strong>Examples:</strong>
                    <div className="bg-gray-100 p-2 rounded text-xs mt-1 space-y-1">
                        <div><strong>Content:</strong> Direct text input</div>
                        <div><strong>Filename:</strong> ./config/app.conf</div>
                        <div><strong>URL:</strong> https://example.com/config.json</div>
                    </div>
                </div>
            </div>
        </>
    );

    return (
        <DirectiveContainer title={`File: ${file.name || 'Untitled'}`} helpContent={helpContent}>
            <FormField label="Name">
                <Input
                    value={file.name}
                    onChange={(e) => updateName(e.target.value)}
                    placeholder="Enter file name"
                />
            </FormField>

            <FormField label="File Source">
                <ToggleButtonGroup
                    options={[
                        { value: "content", label: "Enter Content" },
                        { value: "filename", label: "Provide Filename" },
                        { value: "url", label: "Provide URL" }
                    ]}
                    value={inputType}
                    onChange={(value) => toggleInputType(value as "content" | "filename" | "url")}
                />
            </FormField>

            {inputType === "content" ? (
                <FormField label="File Contents">
                    <Textarea
                        value={fileContent}
                        onChange={(e) => updateContents(e.target.value)}
                        placeholder="Enter file contents here..."
                        className="min-h-[200px] w-full"
                        monospace
                    />
                </FormField>
            ) : inputType === "filename" ? (
                <FormField
                    label="Filename"
                    description="Enter the path to an existing file"
                >
                    <Input
                        value={file.filename || ""}
                        onChange={(e) => updateFilename(e.target.value)}
                        placeholder="Path to the file"
                        monospace
                    />
                </FormField>
            ) : (
                <FormField
                    label="URL"
                    description="Enter a URL to reference a file from the web"
                >
                    <Input
                        value={file.url || ""}
                        onChange={(e) => updateUrl(e.target.value)}
                        placeholder="https://example.com/file.txt"
                    />
                </FormField>
            )}
        </DirectiveContainer>
    );
}

// Register this directive
export const fileDirectiveMetadata: DirectiveMetadata = {
    key: "file",
    label: "File",
    description: "Create or manage files in the container",
    icon: ClipboardDocumentListIcon,
    color: "bg-emerald-50 border-emerald-200 hover:bg-emerald-100",
    iconColor: "text-emerald-600",
    defaultValue: { file: { name: "", filename: "" } },
    keywords: ["file", "create", "manage", "document", "content"],
    component: FileDirectiveComponent,
};

registerDirective(fileDirectiveMetadata);