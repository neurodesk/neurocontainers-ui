import { DirectiveContainer, FormField, Input, Textarea, ListEditor } from "@/components/ui";
import { Variable } from "@/components/common";
import { TrashIcon, CubeTransparentIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { registerDirective, DirectiveMetadata } from "./registry";

export function VariableComponent({ variable, onChange }: { variable: Variable, onChange?: (variable: Variable) => void }) {
    if (typeof variable === 'string') {
        return (
            <Input
                value={variable}
                onChange={(e) => onChange && onChange(e.target.value)}
                monospace
                placeholder="Enter string value"
            />
        );
    } else if (Array.isArray(variable)) {
        const stringArray = variable.map(item => JSON.stringify(item));
        
        const handleArrayChange = (newStringArray: string[]) => {
            if (onChange) {
                try {
                    const parsed = newStringArray.map(str => JSON.parse(str));
                    onChange(parsed);
                } catch {
                    // Handle parse error - keep as strings for now
                    onChange(newStringArray);
                }
            }
        };

        return (
            <ListEditor
                items={stringArray}
                onChange={handleArrayChange}
                createNewItem={() => '""'}
                addButtonText="Add Item"
                emptyMessage="No array items"
                allowReorder={true}
                renderItem={(item, index, onChangeItem) => (
                    <Input
                        value={item}
                        onChange={(e) => onChangeItem(e.target.value)}
                        placeholder="JSON value"
                        monospace
                    />
                )}
            />
        );
    } else {
        return (
            <Textarea
                value={JSON.stringify(variable, null, 2)}
                onChange={(e) => {
                    if (onChange) {
                        try {
                            onChange(JSON.parse(e.target.value));
                        } catch {
                            // Handle parse error silently for now
                        }
                    }
                }}
                placeholder="Enter JSON object"
                className="min-h-[80px]"
                monospace
            />
        );
    }
}

export default function VariableDirectiveComponent({
    variables,
    onChange,
    condition,
    onConditionChange,
    headerColor,
    borderColor,
    iconColor,
    icon
}: {
    variables: { [key: string]: Variable },
    onChange: (variables: { [key: string]: Variable }) => void,
    condition?: string;
    onConditionChange?: (condition: string | undefined) => void;
    headerColor?: string;
    borderColor?: string;
    iconColor?: string;
    icon?: React.ComponentType<{ className?: string }>;
}) {
    const [newVarKey, setNewVarKey] = useState("");

    const updateVariable = (key: string, value: Variable) => {
        onChange({ ...variables, [key]: value });
    };

    const removeVariable = (key: string) => {
        const updated = { ...variables };
        delete updated[key];
        onChange(updated);
    };

    const addVariable = () => {
        if (newVarKey.trim()) {
            onChange({ ...variables, [newVarKey]: "" });
            setNewVarKey("");
        }
    };

    const helpContent = (
        <>
            <h3 className="font-semibold text-[#0c0e0a] mb-2">
                VARIABLE Directive
            </h3>
            <div className="text-sm text-gray-600 space-y-2">
                <p>
                    The VARIABLE directive defines variables that can be used throughout the container build.
                </p>
                <div>
                    <strong>Variable Types:</strong>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                        <li><strong>String:</strong> Simple text values</li>
                        <li><strong>Array:</strong> Lists of values (JSON format)</li>
                        <li><strong>Object:</strong> Complex data structures (JSON format)</li>
                    </ul>
                </div>
                <div>
                    <strong>Examples:</strong>
                    <div className="bg-gray-100 p-2 rounded text-xs mt-1 space-y-1">
                        <div><strong>String:</strong> &quot;myvalue&quot; or hello_world</div>
                        <div><strong>Array:</strong> [&quot;item1&quot;, &quot;item2&quot;, &quot;item3&quot;]</div>
                        <div><strong>Object:</strong> {"{"}&quot;key&quot;: &quot;value&quot;, &quot;number&quot;: 42{"}"}</div>
                    </div>
                </div>
            </div>
        </>
    );

    return (
        <DirectiveContainer 
            title="Variables" 
            helpContent={helpContent}
            condition={condition}
            onConditionChange={onConditionChange}
            headerColor={headerColor}
            borderColor={borderColor}
            iconColor={iconColor}
            icon={icon}
        >
            {Object.entries(variables).map(([key, value]) => (
                <FormField 
                    key={key}
                    label={
                        <div className="flex justify-between items-center">
                            <span>{key}</span>
                            <button
                                className="text-gray-400 hover:text-[#6aa329] ml-2"
                                onClick={() => removeVariable(key)}
                                title={`Remove variable ${key}`}
                            >
                                <TrashIcon className="h-4 w-4" />
                            </button>
                        </div>
                    }
                    className="border-l-4 border-[#d3e7b6] pl-4"
                >
                    <VariableComponent
                        variable={value}
                        onChange={(updated) => updateVariable(key, updated)}
                    />
                </FormField>
            ))}

            <FormField label="Add New Variable">
                <div className="flex">
                    <Input
                        className="flex-grow rounded-r-none"
                        placeholder="Variable name"
                        value={newVarKey}
                        onChange={(e) => setNewVarKey(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addVariable()}
                    />
                    <button
                        className="px-3 py-1.5 text-sm bg-[#6aa329] text-white rounded-r-md hover:bg-[#4f7b38] disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={addVariable}
                        disabled={!newVarKey.trim()}
                    >
                        Add
                    </button>
                </div>
            </FormField>
        </DirectiveContainer>
    );
}

// Register this directive
export const variablesDirectiveMetadata: DirectiveMetadata = {
    key: "variables",
    label: "Variables",
    description: "Define template variables for dynamic values",
    icon: CubeTransparentIcon,
    color: "bg-indigo-50 border-indigo-200 hover:bg-indigo-100",
    headerColor: "bg-indigo-50",
    borderColor: "border-indigo-200",
    iconColor: "text-indigo-600",
    defaultValue: { variables: {} },
    keywords: ["variables", "var", "template", "placeholder", "substitution"],
    component: VariableDirectiveComponent,
};

registerDirective(variablesDirectiveMetadata);