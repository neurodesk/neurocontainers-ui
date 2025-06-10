import { TrashIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { DirectiveContainer, FormField, Input } from "@/components/ui";
import { Template } from "@/components/common";
import { VariableComponent } from "@/components/directives/variable";

export default function TemplateDirectiveComponent({
    template,
    onChange
}: {
    template: Template,
    onChange: (template: Template) => void
}) {
    const [newParamKey, setNewParamKey] = useState("");

    const updateName = (name: string) => {
        onChange({ ...template, name });
    };

    const updateParam = (key: string, value: unknown) => {
        onChange({ ...template, [key]: value });
    };

    const removeParam = (key: string) => {
        if (key === 'name') return; // Don't allow removing the name

        const updated = { ...template };
        delete updated[key];
        onChange(updated);
    };

    const addParam = () => {
        if (newParamKey.trim() && newParamKey !== 'name') {
            onChange({ ...template, [newParamKey]: "" });
            setNewParamKey("");
        }
    };

    const helpContent = (
        <>
            <h3 className="font-semibold text-[#0c0e0a] mb-2">
                TEMPLATE Directive
            </h3>
            <div className="text-sm text-gray-600 space-y-2">
                <p>
                    The TEMPLATE directive defines reusable templates with configurable parameters.
                </p>
                <div>
                    <strong>Template Parameters:</strong>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                        <li>Define dynamic values that can be customized when using the template</li>
                        <li>Support strings, arrays, and objects (JSON format)</li>
                        <li>Use meaningful parameter names for clarity</li>
                    </ul>
                </div>
                <div>
                    <strong>Examples:</strong>
                    <div className="bg-gray-100 p-2 rounded text-xs mt-1 space-y-1">
                        <div><strong>version:</strong> &quot;1.0.0&quot;</div>
                        <div><strong>ports:</strong> [8080, 3000]</div>
                        <div><strong>config:</strong> {"{"}&quot;debug&quot;: true{"}"}</div>
                    </div>
                </div>
            </div>
        </>
    );

    return (
        <DirectiveContainer title={`Template: ${template.name}`} helpContent={helpContent}>
            <FormField label="Template Name">
                <Input
                    value={template.name}
                    onChange={(e) => updateName(e.target.value)}
                    placeholder="Enter template name"
                    monospace
                />
            </FormField>

            {Object.entries(template).map(([key, value]) => {
                if (key === 'name') return null;
                return (
                    <FormField 
                        key={key}
                        label={
                            <div className="flex justify-between items-center">
                                <span>{key}</span>
                                <button
                                    className="text-gray-400 hover:text-[#6aa329] ml-2"
                                    onClick={() => removeParam(key)}
                                    title={`Remove parameter ${key}`}
                                >
                                    <TrashIcon className="h-4 w-4" />
                                </button>
                            </div>
                        }
                        className="border-l-4 border-[#d3e7b6] pl-4"
                    >
                        <VariableComponent
                            variable={value}
                            onChange={(updated) => updateParam(key, updated)}
                        />
                    </FormField>
                );
            })}

            <FormField label="Add New Parameter">
                <div className="flex">
                    <Input
                        className="flex-grow rounded-r-none"
                        placeholder="Parameter name"
                        value={newParamKey}
                        onChange={(e) => setNewParamKey(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addParam()}
                    />
                    <button
                        className="px-4 py-2 bg-[#6aa329] text-white rounded-r-md hover:bg-[#4f7b38] disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={addParam}
                        disabled={!newParamKey.trim() || newParamKey === 'name'}
                    >
                        Add Parameter
                    </button>
                </div>
            </FormField>
        </DirectiveContainer>
    );
}