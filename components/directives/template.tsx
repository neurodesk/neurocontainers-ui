import { TrashIcon, DocumentDuplicateIcon } from "@heroicons/react/24/outline";
import { useState, useEffect, useRef } from "react";
import { DirectiveContainer, FormField, Input, ToggleButtonGroup, TagEditor } from "@/components/ui";
import { Template } from "@/components/common";
import { VariableComponent } from "@/components/directives/variable";
import { registerDirective, DirectiveMetadata, getDirective } from "./registry";

interface BaseNeuroDockerArgument {
    name: string;
    required: boolean;
    description?: string;
    advanced?: boolean;
}

export type NeuroDockerArgument = (BaseNeuroDockerArgument & {
    type: "dropdown";
    options: string[];
    defaultValue?: string;
}) | (BaseNeuroDockerArgument & {
    type: "text";
    defaultValue?: string;
    multiline?: boolean;
}) | (BaseNeuroDockerArgument & {
    // the array is represented as space separated strings
    type: "array";
    defaultValue?: string[];
}) | (BaseNeuroDockerArgument & {
    type: "boolean";
    defaultValue?: boolean;
});

export interface NeuroDockerInstallInformation {
    arguments: NeuroDockerArgument[];
}

export interface NeuroDockerTemplateInformation {
    metadata: DirectiveMetadata;
    name: string;
    description?: string;
    url: string;
    alert?: string;
    source?: NeuroDockerInstallInformation;
    binaries?: NeuroDockerInstallInformation;
}

export function createNeuroDockerTemplateComponent(templateInfo: NeuroDockerTemplateInformation) {
    return function NeuroDockerTemplateComponent({
        template,
        onChange
    }: {
        template: Template,
        onChange: (template: Template) => void
    }) {
        const [showAdvanced, setShowAdvanced] = useState(false);

        const updateParam = (key: string, value: unknown) => {
            onChange({ ...template, [key]: value });
        };

        const renderArgument = (arg: NeuroDockerArgument) => {
            const getDefaultValue = () => {
                if (arg.type === 'boolean' && 'defaultValue' in arg) {
                    return arg.defaultValue ?? false;
                }
                if (arg.type === 'text' && 'defaultValue' in arg) {
                    return arg.defaultValue ?? '';
                }
                return '';
            };

            const currentValue = template[arg.name] ?? getDefaultValue();

            if (arg.advanced && !showAdvanced) return null;

            switch (arg.type) {
                case 'dropdown':
                    return (
                        <FormField key={arg.name} label={arg.name} description={arg.description}>
                            <select
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6aa329] focus:border-transparent"
                                value={String(currentValue)}
                                onChange={(e) => updateParam(arg.name, e.target.value)}
                            >
                                {arg.options.map(option => (
                                    <option key={option} value={option}>{option}</option>
                                ))}
                            </select>
                        </FormField>
                    );

                case 'boolean':
                    return (
                        <FormField key={arg.name} label={arg.name} description={arg.description}>
                            <ToggleButtonGroup
                                options={[
                                    { value: 'true', label: 'Yes' },
                                    { value: 'false', label: 'No' }
                                ]}
                                value={String(currentValue)}
                                onChange={(value) => updateParam(arg.name, value === 'true')}
                            />
                        </FormField>
                    );

                case 'array':
                    const displayName = arg.name
                        .replace(/_/g, ' ')
                        .replace(/\b\w/g, l => l.toUpperCase());
                    return (
                        <FormField key={arg.name} label={arg.name} description={arg.description}>
                            <TagEditor
                                tags={Array.isArray(currentValue) ? currentValue : (typeof currentValue === 'string' ? currentValue.split(' ').filter(s => s.trim()) : [])}
                                onChange={(tags) => updateParam(arg.name, tags.join(' '))}
                                placeholder={`Add ${displayName.toLowerCase()}...`}
                                emptyMessage={`No ${displayName.toLowerCase()} added yet`}
                            />
                        </FormField>
                    );

                case 'text':
                default:
                    return (
                        <FormField key={arg.name} label={arg.name} description={arg.description}>
                            {arg.multiline ? (
                                <textarea
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6aa329] focus:border-transparent font-mono text-sm"
                                    rows={6}
                                    value={String(currentValue)}
                                    onChange={(e) => updateParam(arg.name, e.target.value)}
                                    placeholder={`Enter ${arg.name}`}
                                />
                            ) : (
                                <Input
                                    value={String(currentValue)}
                                    onChange={(e) => updateParam(arg.name, e.target.value)}
                                    placeholder={`Enter ${arg.name}`}
                                    monospace
                                />
                            )}
                        </FormField>
                    );
            }
        };

        const helpContent = (
            <>
                <h3 className="font-semibold text-[#0c0e0a] mb-2">
                    {templateInfo.metadata.label} Template
                </h3>
                <div className="text-sm text-gray-600 space-y-2">
                    <p>{templateInfo.description}</p>
                    {templateInfo.alert && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-2">
                            <p className="text-yellow-800 text-xs font-medium">⚠️ {templateInfo.alert}</p>
                        </div>
                    )}
                    {templateInfo.url && (
                        <p>
                            <a
                                href={templateInfo.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#6aa329] hover:underline"
                            >
                                Documentation →
                            </a>
                        </p>
                    )}
                </div>
            </>
        );

        const templateArgs = templateInfo.binaries?.arguments || templateInfo.source?.arguments || [];
        const basicArgs = templateArgs.filter(arg => !arg.advanced);
        const advancedArgs = templateArgs.filter(arg => arg.advanced);

        // Ensure required arguments have default values set
        const initializedRef = useRef(false);
        useEffect(() => {
            if (initializedRef.current) return;

            const updates: { [key: string]: unknown } = {};
            templateArgs.forEach(arg => {
                if (arg.required && !(arg.name in template)) {
                    const defaultValue = (() => {
                        if (arg.type === 'boolean' && 'defaultValue' in arg) {
                            return arg.defaultValue ?? false;
                        }
                        if (arg.type === 'text' && 'defaultValue' in arg) {
                            return arg.defaultValue ?? '';
                        }
                        if (arg.type === 'dropdown') {
                            return arg.options[0];
                        }
                        if (arg.type === 'array') {
                            return arg.defaultValue?.join(' ') || '';
                        }
                        return '';
                    })();
                    updates[arg.name] = defaultValue;
                }
            });

            if (Object.keys(updates).length > 0) {
                onChange({ ...template, ...updates });
                initializedRef.current = true;
            }
        });

        return (
            <DirectiveContainer title={templateInfo.metadata.label} helpContent={helpContent}>
                <div className="space-y-4">
                    {basicArgs.map(renderArgument)}
                </div>

                {advancedArgs.length > 0 && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h4 className="font-medium text-sm text-gray-700">Advanced Settings</h4>
                            <button
                                onClick={() => setShowAdvanced(!showAdvanced)}
                                className="text-xs text-[#6aa329] hover:underline"
                            >
                                {showAdvanced ? 'Hide' : 'Show'} Advanced
                            </button>
                        </div>
                        {showAdvanced && (
                            <div className="space-y-4 border-l-4 border-[#d3e7b6] pl-4">
                                {advancedArgs.map(renderArgument)}
                            </div>
                        )}
                    </div>
                )}
            </DirectiveContainer>
        );
    };
}

export function registerNeuroDockerTemplate(template: NeuroDockerTemplateInformation) {
    const component = createNeuroDockerTemplateComponent(template);
    const metadata = {
        ...template.metadata,
        component
    };
    registerDirective(metadata);
}

export default function TemplateDirectiveComponent({
    template,
    onChange
}: {
    template: Template,
    onChange: (template: Template) => void
}) {
    const [newParamKey, setNewParamKey] = useState("");

    // Check if there's a special editor for this template name
    const specialEditor = getDirective(template.name);
    if (specialEditor && specialEditor.component !== TemplateDirectiveComponent) {
        const SpecialComponent = specialEditor.component;
        return <SpecialComponent template={template} onChange={onChange} />;
    }

    // Fall back to generic template editor

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

// Register this directive
export const templateDirectiveMetadata: DirectiveMetadata = {
    key: "template",
    label: "Template",
    description: "Create reusable templates with parameters",
    icon: DocumentDuplicateIcon,
    color: "bg-pink-50 border-pink-200 hover:bg-pink-100",
    iconColor: "text-pink-600",
    defaultValue: { template: { name: "new-template" } },
    keywords: ["template", "reusable", "pattern", "blueprint"],
    component: TemplateDirectiveComponent,
};

registerDirective(templateDirectiveMetadata);