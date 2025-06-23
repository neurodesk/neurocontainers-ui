import { useState, useEffect } from "react";
import { DirectiveContainer, FormField, Input, Textarea, Select } from "@/components/ui";
import { DirectiveControllers } from "@/components/ui/DirectiveContainer";
import { DocumentTextIcon, CodeBracketIcon, PencilIcon } from "@heroicons/react/24/outline";
import { registerDirective, DirectiveMetadata } from "./registry";
import { getHelpSection, buttonStyles } from "@/lib/styles";
import { useTheme } from "@/lib/ThemeContext";
import { 
    BoutiquesDescriptor, 
    BoutiquesInput, 
    BoutiquesInputType,
    BoutiquesOutputFile
} from "@/types/boutique";

type ViewMode = "visual" | "json";

interface BoutiquesEditorProps {
    boutique: BoutiquesDescriptor;
    onChange: (boutique: BoutiquesDescriptor) => void;
    condition?: string;
    onConditionChange?: (condition: string | undefined) => void;
    headerColor?: { light: string, dark: string };
    borderColor?: { light: string, dark: string };
    iconColor?: { light: string, dark: string };
    icon?: React.ComponentType<{ className?: string }>;
    controllers: DirectiveControllers;
}

export default function BoutiqueDirectiveComponent({
    boutique,
    onChange,
    condition,
    onConditionChange,
    headerColor,
    borderColor,
    iconColor,
    icon,
    controllers,
}: BoutiquesEditorProps) {
    const { isDark } = useTheme();
    const [viewMode, setViewMode] = useState<ViewMode>("visual");
    const [jsonText, setJsonText] = useState("");
    const [jsonError, setJsonError] = useState<string | null>(null);

    // Initialize JSON text when boutique changes
    useEffect(() => {
        setJsonText(JSON.stringify(boutique, null, 2));
        setJsonError(null);
    }, [boutique]);

    const handleJsonChange = (value: string) => {
        setJsonText(value);
        setJsonError(null);
        
        try {
            const parsed = JSON.parse(value) as BoutiquesDescriptor;
            onChange(parsed);
        } catch (error) {
            setJsonError(error instanceof Error ? error.message : "Invalid JSON");
        }
    };

    const updateBoutique = (updates: Partial<BoutiquesDescriptor>) => {
        onChange({ ...boutique, ...updates });
    };

    const addInput = () => {
        const newInput: BoutiquesInput = {
            id: `input_${boutique.inputs.length + 1}`,
            name: "New Input",
            type: "String",
            description: ""
        } as BoutiquesInput;
        updateBoutique({ inputs: [...boutique.inputs, newInput] });
    };

    const updateInput = (index: number, input: BoutiquesInput) => {
        const newInputs = [...boutique.inputs];
        newInputs[index] = input;
        updateBoutique({ inputs: newInputs });
    };

    const removeInput = (index: number) => {
        const newInputs = boutique.inputs.filter((_, i) => i !== index);
        updateBoutique({ inputs: newInputs });
    };

    const addOutput = () => {
        const newOutput: BoutiquesOutputFile = {
            id: `output_${(boutique["output-files"]?.length || 0) + 1}`,
            name: "New Output",
            description: "",
            optional: true
        };
        updateBoutique({ 
            "output-files": [...(boutique["output-files"] || []), newOutput] 
        });
    };

    const updateOutput = (index: number, output: BoutiquesOutputFile) => {
        const newOutputs = [...(boutique["output-files"] || [])];
        newOutputs[index] = output;
        updateBoutique({ "output-files": newOutputs });
    };

    const removeOutput = (index: number) => {
        const newOutputs = (boutique["output-files"] || []).filter((_, i) => i !== index);
        updateBoutique({ "output-files": newOutputs });
    };

    const helpContent = (
        <div className={getHelpSection(isDark).container}>
            <h3 className={getHelpSection(isDark).title}>
                BOUTIQUE Directive
            </h3>
            <div className={getHelpSection(isDark).text}>
                <p>
                    The BOUTIQUE directive embeds a Boutiques descriptor for tool integration.
                    Boutiques is a framework for describing neuroimaging applications.
                </p>
                <div>
                    <strong>Editor Modes:</strong>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                        <li><strong>Visual:</strong> Graphical form-based editor</li>
                        <li><strong>JSON:</strong> Direct JSON editing and preview</li>
                    </ul>
                </div>
                <div>
                    <strong>Key Components:</strong>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                        <li>Tool metadata (name, version, description)</li>
                        <li>Input parameters and their types</li>
                        <li>Output file specifications</li>
                        <li>Command-line template</li>
                        <li>Container configuration</li>
                    </ul>
                </div>
            </div>
        </div>
    );

    return (
        <DirectiveContainer
            title="Boutique Tool Descriptor"
            helpContent={helpContent}
            condition={condition}
            onConditionChange={onConditionChange}
            headerColor={headerColor}
            borderColor={borderColor}
            iconColor={iconColor}
            icon={icon}
            controllers={controllers}
        >
            {/* View Mode Selector */}
            <div className="flex gap-2 mb-4">
                <button
                    className={buttonStyles(isDark, viewMode === "visual" ? "primary" : "secondary", "sm") + " flex items-center gap-1"}
                    onClick={() => setViewMode("visual")}
                >
                    <PencilIcon className="w-4 h-4" />
                    Visual Editor
                </button>
                <button
                    className={buttonStyles(isDark, viewMode === "json" ? "primary" : "secondary", "sm") + " flex items-center gap-1"}
                    onClick={() => setViewMode("json")}
                >
                    <CodeBracketIcon className="w-4 h-4" />
                    JSON Editor
                </button>
            </div>

            {viewMode === "visual" ? (
                <div className="space-y-6">
                    {/* Basic Information */}
                    <div className="space-y-4">
                        <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300">
                            Basic Information
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField label="Tool Name">
                                <Input
                                    value={boutique.name}
                                    onChange={(e) => updateBoutique({ name: e.target.value })}
                                    placeholder="Enter tool name"
                                />
                            </FormField>
                            <FormField label="Tool Version">
                                <Input
                                    value={boutique["tool-version"]}
                                    onChange={(e) => updateBoutique({ "tool-version": e.target.value })}
                                    placeholder="1.0.0"
                                />
                            </FormField>
                        </div>
                        <FormField label="Description">
                            <Textarea
                                value={boutique.description}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateBoutique({ description: e.target.value })}
                                placeholder="Describe what this tool does"
                                rows={3}
                            />
                        </FormField>
                        <FormField label="Command Line Template">
                            <Input
                                value={boutique["command-line"]}
                                onChange={(e) => updateBoutique({ "command-line": e.target.value })}
                                placeholder="tool [OPTIONS] [INPUT_FILE]"
                                className="font-mono text-sm"
                            />
                        </FormField>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField label="Author">
                                <Input
                                    value={boutique.author || ""}
                                    onChange={(e) => updateBoutique({ author: e.target.value || undefined })}
                                    placeholder="Author name"
                                />
                            </FormField>
                            <FormField label="URL">
                                <Input
                                    value={boutique.url || ""}
                                    onChange={(e) => updateBoutique({ url: e.target.value || undefined })}
                                    placeholder="https://tool-website.com"
                                />
                            </FormField>
                        </div>
                    </div>

                    {/* Inputs Section */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300">
                                Input Parameters ({boutique.inputs.length})
                            </h4>
                            <button className={buttonStyles(isDark, 'secondary', 'sm')} onClick={addInput}>
                                Add Input
                            </button>
                        </div>
                        {boutique.inputs.map((input, index) => (
                            <InputEditor
                                key={input.id}
                                input={input}
                                onChange={(updated) => updateInput(index, updated)}
                                onRemove={() => removeInput(index)}
                                isDark={isDark}
                            />
                        ))}
                    </div>

                    {/* Outputs Section */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300">
                                Output Files ({boutique["output-files"]?.length || 0})
                            </h4>
                            <button className={buttonStyles(isDark, 'secondary', 'sm')} onClick={addOutput}>
                                Add Output
                            </button>
                        </div>
                        {(boutique["output-files"] || []).map((output, index) => (
                            <OutputEditor
                                key={output.id}
                                output={output}
                                onChange={(updated) => updateOutput(index, updated)}
                                onRemove={() => removeOutput(index)}
                                isDark={isDark}
                            />
                        ))}
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    {jsonError && (
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                            <p className="text-sm text-red-700 dark:text-red-300">
                                JSON Error: {jsonError}
                            </p>
                        </div>
                    )}
                    <FormField label="Boutiques Descriptor JSON">
                        <Textarea
                            value={jsonText}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleJsonChange(e.target.value)}
                            className="font-mono text-sm"
                            rows={20}
                            placeholder="JSON representation of the Boutiques descriptor"
                        />
                    </FormField>
                </div>
            )}
        </DirectiveContainer>
    );
}

// Input Parameter Editor Component
function InputEditor({ 
    input, 
    onChange, 
    onRemove, 
    isDark 
}: { 
    input: BoutiquesInput; 
    onChange: (input: BoutiquesInput) => void; 
    onRemove: () => void;
    isDark: boolean;
}) {
    const updateInput = (updates: Partial<BoutiquesInput>) => {
        onChange({ ...input, ...updates } as BoutiquesInput);
    };

    return (
        <div className={`p-4 border rounded-lg ${
            isDark 
                ? "border-gray-600 bg-gray-800/30" 
                : "border-gray-200 bg-gray-50"
        }`}>
            <div className="flex items-center justify-between mb-3">
                <h5 className="font-medium text-sm">Input Parameter</h5>
                <button className={buttonStyles(isDark, 'danger', 'sm')} onClick={onRemove}>
                    Remove
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <FormField label="ID">
                    <Input
                        value={input.id}
                        onChange={(e) => updateInput({ id: e.target.value })}
                        placeholder="input_id"
                    />
                </FormField>
                <FormField label="Name">
                    <Input
                        value={input.name}
                        onChange={(e) => updateInput({ name: e.target.value })}
                        placeholder="Input name"
                    />
                </FormField>
                <FormField label="Type">
                    <Select
                        value={input.type}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateInput({ type: e.target.value as BoutiquesInputType })}
                    >
                        <option value="String">String</option>
                        <option value="File">File</option>
                        <option value="Number">Number</option>
                        <option value="Flag">Flag</option>
                    </Select>
                </FormField>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                <FormField label="Description">
                    <Textarea
                        value={input.description || ""}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateInput({ description: e.target.value || undefined })}
                        placeholder="Describe this input parameter"
                        rows={2}
                    />
                </FormField>
                <FormField label="Command Line Flag">
                    <Input
                        value={input["command-line-flag"] || ""}
                        onChange={(e) => updateInput({ "command-line-flag": e.target.value || undefined })}
                        placeholder="--input-file"
                    />
                </FormField>
            </div>
            <div className="flex items-center gap-4 mt-3">
                <label className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={input.optional || false}
                        onChange={(e) => updateInput({ optional: e.target.checked || undefined })}
                        className="rounded"
                    />
                    <span className="text-sm">Optional</span>
                </label>
                <label className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={input.list || false}
                        onChange={(e) => updateInput({ list: e.target.checked || undefined })}
                        className="rounded"
                    />
                    <span className="text-sm">List</span>
                </label>
            </div>
        </div>
    );
}

// Output File Editor Component
function OutputEditor({ 
    output, 
    onChange, 
    onRemove, 
    isDark 
}: { 
    output: BoutiquesOutputFile; 
    onChange: (output: BoutiquesOutputFile) => void; 
    onRemove: () => void;
    isDark: boolean;
}) {
    const updateOutput = (updates: Partial<BoutiquesOutputFile>) => {
        onChange({ ...output, ...updates });
    };

    return (
        <div className={`p-4 border rounded-lg ${
            isDark 
                ? "border-gray-600 bg-gray-800/30" 
                : "border-gray-200 bg-gray-50"
        }`}>
            <div className="flex items-center justify-between mb-3">
                <h5 className="font-medium text-sm">Output File</h5>
                <button className={buttonStyles(isDark, 'danger', 'sm')} onClick={onRemove}>
                    Remove
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormField label="ID">
                    <Input
                        value={output.id}
                        onChange={(e) => updateOutput({ id: e.target.value })}
                        placeholder="output_id"
                    />
                </FormField>
                <FormField label="Name">
                    <Input
                        value={output.name}
                        onChange={(e) => updateOutput({ name: e.target.value })}
                        placeholder="Output name"
                    />
                </FormField>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                <FormField label="Description">
                    <Textarea
                        value={output.description || ""}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateOutput({ description: e.target.value || undefined })}
                        placeholder="Describe this output file"
                        rows={2}
                    />
                </FormField>
                <FormField label="Path Template">
                    <Input
                        value={output["path-template"] || ""}
                        onChange={(e) => updateOutput({ "path-template": e.target.value || undefined })}
                        placeholder="./output.txt"
                        className="font-mono text-sm"
                    />
                </FormField>
            </div>
            <div className="flex items-center gap-4 mt-3">
                <label className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={output.optional || false}
                        onChange={(e) => updateOutput({ optional: e.target.checked || undefined })}
                        className="rounded"
                    />
                    <span className="text-sm">Optional</span>
                </label>
                <label className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={output.list || false}
                        onChange={(e) => updateOutput({ list: e.target.checked || undefined })}
                        className="rounded"
                    />
                    <span className="text-sm">List</span>
                </label>
            </div>
        </div>
    );
}

// Create default Boutiques descriptor
const createDefaultBoutique = (): BoutiquesDescriptor => ({
    name: "New Tool",
    description: "Tool description",
    "tool-version": "1.0.0",
    "schema-version": "0.5",
    "command-line": "tool [OPTIONS]",
    inputs: [],
});

// Register this directive
export const boutiqueDirectiveMetadata: DirectiveMetadata = {
    key: "boutique",
    label: "Boutique",
    description: "Embed a Boutiques tool descriptor",
    icon: DocumentTextIcon,
    color: { light: "bg-blue-50 border-blue-200 hover:bg-blue-100", dark: "bg-blue-900 border-blue-700 hover:bg-blue-800" },
    headerColor: { light: "bg-blue-50", dark: "bg-blue-900" },
    borderColor: { light: "border-blue-200", dark: "border-blue-700" },
    iconColor: { light: "text-blue-600", dark: "text-blue-400" },
    defaultValue: { boutique: createDefaultBoutique() },
    keywords: ["boutique", "tool", "descriptor", "neuroimaging", "cbrain", "clowdr"],
    component: BoutiqueDirectiveComponent,
};

registerDirective(boutiqueDirectiveMetadata);