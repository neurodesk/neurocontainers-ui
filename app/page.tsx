"use client";

import { load as loadYAML, dump as dumpYAML } from "js-yaml";
import { useState, useEffect } from "react";
import { ChevronRightIcon, ChevronDownIcon, PlusIcon, TrashIcon } from "@heroicons/react/outline";

type Architecture = "x86_64" | "aarch64";

interface CopyrightInfo {
    license: string;
    url: string;
}

type Condition = string;

interface BaseDirective {
    condition?: Condition;
}

interface GroupDirective extends BaseDirective {
    group: Directive[];
}

function GroupDirectiveComponent({ group, onChange }: { group: Directive[], onChange: (group: Directive[]) => void }) {
    const [isExpanded, setIsExpanded] = useState(true);

    const handleDirectiveChange = (index: number, updatedDirective: Directive) => {
        const updatedGroup = [...group];
        updatedGroup[index] = updatedDirective;
        onChange(updatedGroup);
    };

    const addDirective = () => {
        // Default to an empty install directive as a simple starting point
        onChange([...group, { install: "" }]);
    };

    const removeDirective = (index: number) => {
        const updatedGroup = group.filter((_, i) => i !== index);
        onChange(updatedGroup);
    };

    return (
        <div className="bg-white rounded-md shadow-sm border border-[#e6f1d6] mb-4">
            <div
                className="flex items-center p-3 bg-[#f0f7e7] rounded-t-md cursor-pointer"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <button className="mr-2 text-[#4f7b38]">
                    {isExpanded ? (
                        <ChevronDownIcon className="h-5 w-5" />
                    ) : (
                        <ChevronRightIcon className="h-5 w-5" />
                    )}
                </button>
                <h2 className="text-[#0c0e0a] font-medium">Group Directive</h2>
            </div>

            {isExpanded && (
                <div className="p-4 border-t border-[#e6f1d6]">
                    {group.map((directive, index) => (
                        <div key={index} className="mb-3 last:mb-0 relative">
                            <DirectiveComponent
                                directive={directive}
                                onChange={(updated) => handleDirectiveChange(index, updated)}
                            />
                            <button
                                className="absolute top-3 right-3 text-gray-400 hover:text-[#6aa329]"
                                onClick={() => removeDirective(index)}
                            >
                                <TrashIcon className="h-5 w-5" />
                            </button>
                        </div>
                    ))}
                    <button
                        className="mt-4 flex items-center text-sm text-[#4f7b38] hover:text-[#6aa329]"
                        onClick={addDirective}
                    >
                        <PlusIcon className="h-4 w-4 mr-1" />
                        Add New Directive
                    </button>
                </div>
            )}
        </div>
    );
}

interface EnvironmentDirective extends BaseDirective {
    environment: {
        [key: string]: string;
    };
}

function EnvironmentDirectiveComponent({
    environment,
    onChange
}: {
    environment: { [key: string]: string },
    onChange: (environment: { [key: string]: string }) => void
}) {
    const [isExpanded, setIsExpanded] = useState(true);

    const addEnvironmentVariable = () => {
        onChange({ ...environment, "": "" });
    };

    const updateKey = (oldKey: string, newKey: string) => {
        const updated = { ...environment };
        const value = updated[oldKey];
        delete updated[oldKey];
        updated[newKey] = value;
        onChange(updated);
    };

    const updateValue = (key: string, value: string) => {
        onChange({ ...environment, [key]: value });
    };

    const removeVariable = (key: string) => {
        const updated = { ...environment };
        delete updated[key];
        onChange(updated);
    };

    return (
        <div className="bg-white rounded-md shadow-sm border border-[#e6f1d6] mb-4">
            <div
                className="flex items-center p-3 bg-[#f0f7e7] rounded-t-md cursor-pointer"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <button className="mr-2 text-[#4f7b38]">
                    {isExpanded ? (
                        <ChevronDownIcon className="h-5 w-5" />
                    ) : (
                        <ChevronRightIcon className="h-5 w-5" />
                    )}
                </button>
                <h2 className="text-[#0c0e0a] font-medium">Environment Variables</h2>
            </div>

            {isExpanded && (
                <div className="p-4 border-t border-[#e6f1d6]">
                    <div className="grid grid-cols-12 gap-2 mb-2 font-medium text-sm text-[#1e2a16]">
                        <div className="col-span-5">Key</div>
                        <div className="col-span-6">Value</div>
                        <div className="col-span-1"></div>
                    </div>

                    {Object.entries(environment).map(([key, value], index) => (
                        <div key={index} className="grid grid-cols-12 gap-2 mb-2">
                            <input
                                className="col-span-5 px-3 py-2 border border-gray-200 rounded-md text-[#0c0e0a] focus:outline-none focus:ring-1 focus:ring-[#6aa329] focus:border-[#6aa329]"
                                value={key}
                                onChange={(e) => updateKey(key, e.target.value)}
                            />
                            <input
                                className="col-span-6 px-3 py-2 border border-gray-200 rounded-md text-[#0c0e0a] focus:outline-none focus:ring-1 focus:ring-[#6aa329] focus:border-[#6aa329]"
                                value={value}
                                onChange={(e) => updateValue(key, e.target.value)}
                            />
                            <button
                                className="col-span-1 flex justify-center items-center text-gray-400 hover:text-[#6aa329]"
                                onClick={() => removeVariable(key)}
                            >
                                <TrashIcon className="h-5 w-5" />
                            </button>
                        </div>
                    ))}

                    <button
                        className="mt-3 flex items-center text-sm text-[#4f7b38] hover:text-[#6aa329]"
                        onClick={addEnvironmentVariable}
                    >
                        <PlusIcon className="h-4 w-4 mr-1" />
                        Add Environment Variable
                    </button>
                </div>
            )}
        </div>
    );
}

interface InstallDirective extends BaseDirective {
    install: string;
}

function InstallDirectiveComponent({
    install,
    onChange
}: {
    install: string,
    onChange: (install: string) => void
}) {
    const [isExpanded, setIsExpanded] = useState(true);

    return (
        <div className="bg-white rounded-md shadow-sm border border-[#e6f1d6] mb-4">
            <div
                className="flex items-center p-3 bg-[#f0f7e7] rounded-t-md cursor-pointer"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <button className="mr-2 text-[#4f7b38]">
                    {isExpanded ? (
                        <ChevronDownIcon className="h-5 w-5" />
                    ) : (
                        <ChevronRightIcon className="h-5 w-5" />
                    )}
                </button>
                <h2 className="text-[#0c0e0a] font-medium">Install</h2>
            </div>

            {isExpanded && (
                <div className="p-4 border-t border-[#e6f1d6]">
                    <textarea
                        className="w-full px-3 py-2 border border-gray-200 rounded-md text-[#0c0e0a] focus:outline-none focus:ring-1 focus:ring-[#6aa329] focus:border-[#6aa329] min-h-[100px]"
                        value={install}
                        onChange={(e) => onChange(e.target.value)}
                    />
                </div>
            )}
        </div>
    );
}

interface WorkingDirectoryDirective extends BaseDirective {
    workdir: string;
}

function WorkingDirectoryDirectiveComponent({
    workdir,
    onChange
}: {
    workdir: string,
    onChange: (workdir: string) => void
}) {
    const [isExpanded, setIsExpanded] = useState(true);

    return (
        <div className="bg-white rounded-md shadow-sm border border-[#e6f1d6] mb-4">
            <div
                className="flex items-center p-3 bg-[#f0f7e7] rounded-t-md cursor-pointer"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <button className="mr-2 text-[#4f7b38]">
                    {isExpanded ? (
                        <ChevronDownIcon className="h-5 w-5" />
                    ) : (
                        <ChevronRightIcon className="h-5 w-5" />
                    )}
                </button>
                <h2 className="text-[#0c0e0a] font-medium">Working Directory</h2>
            </div>

            {isExpanded && (
                <div className="p-4 border-t border-[#e6f1d6]">
                    <input
                        className="w-full px-3 py-2 border border-gray-200 rounded-md text-[#0c0e0a] focus:outline-none focus:ring-1 focus:ring-[#6aa329] focus:border-[#6aa329]"
                        value={workdir}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder="/path/to/directory"
                    />
                </div>
            )}
        </div>
    );
}

interface RunCommandDirective extends BaseDirective {
    run: string[];
}

function RunCommandDirectiveComponent({
    run,
    onChange
}: {
    run: string[],
    onChange: (run: string[]) => void
}) {
    const [isExpanded, setIsExpanded] = useState(true);

    const addCommand = () => {
        onChange([...run, ""]);
    };

    const updateCommand = (index: number, value: string) => {
        const updated = [...run];
        updated[index] = value;
        onChange(updated);
    };

    const removeCommand = (index: number) => {
        onChange(run.filter((_, i) => i !== index));
    };

    return (
        <div className="bg-white rounded-md shadow-sm border border-[#e6f1d6] mb-4">
            <div
                className="flex items-center p-3 bg-[#f0f7e7] rounded-t-md cursor-pointer"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <button className="mr-2 text-[#4f7b38]">
                    {isExpanded ? (
                        <ChevronDownIcon className="h-5 w-5" />
                    ) : (
                        <ChevronRightIcon className="h-5 w-5" />
                    )}
                </button>
                <h2 className="text-[#0c0e0a] font-medium">Run Commands</h2>
            </div>

            {isExpanded && (
                <div className="p-4 border-t border-[#e6f1d6]">
                    {run.map((command, index) => (
                        <div key={index} className="flex mb-2">
                            <input
                                className="flex-grow px-3 py-2 border border-gray-200 rounded-l-md text-[#0c0e0a] focus:outline-none focus:ring-1 focus:ring-[#6aa329] focus:border-[#6aa329]"
                                value={command}
                                onChange={(e) => updateCommand(index, e.target.value)}
                                placeholder="Command to run"
                            />
                            <button
                                className="px-3 py-2 bg-[#f0f7e7] border border-gray-200 border-l-0 rounded-r-md text-gray-400 hover:text-[#6aa329]"
                                onClick={() => removeCommand(index)}
                            >
                                <TrashIcon className="h-5 w-5" />
                            </button>
                        </div>
                    ))}

                    <button
                        className="mt-2 flex items-center text-sm text-[#4f7b38] hover:text-[#6aa329]"
                        onClick={addCommand}
                    >
                        <PlusIcon className="h-4 w-4 mr-1" />
                        Add Command
                    </button>
                </div>
            )}
        </div>
    );
}

type Variable = string | unknown;

function VariableComponent({ variable, onChange }: { variable: Variable, onChange?: (variable: Variable) => void }) {
    if (typeof variable === 'string') {
        return (
            <input
                className="w-full px-3 py-2 border border-gray-200 rounded-md text-[#0c0e0a] focus:outline-none focus:ring-1 focus:ring-[#6aa329] focus:border-[#6aa329]"
                value={variable}
                onChange={(e) => onChange && onChange(e.target.value)}
            />
        );
    } else if (Array.isArray(variable)) {
        return (
            <div className="space-y-2">
                {variable.map((item, index) => (
                    <div key={index} className="flex">
                        <input
                            className="flex-grow px-3 py-2 border border-gray-200 rounded-l-md text-[#0c0e0a] focus:outline-none focus:ring-1 focus:ring-[#6aa329] focus:border-[#6aa329]"
                            value={JSON.stringify(item)}
                            onChange={(e) => {
                                if (onChange) {
                                    try {
                                        const updated = [...variable];
                                        updated[index] = JSON.parse(e.target.value);
                                        onChange(updated);
                                    } catch (err) {
                                        // Handle parse error
                                    }
                                }
                            }}
                        />
                        {onChange && (
                            <button
                                className="px-3 py-2 bg-[#f0f7e7] border border-gray-200 border-l-0 rounded-r-md text-gray-400 hover:text-[#6aa329]"
                                onClick={() => {
                                    const updated = variable.filter((_, i) => i !== index);
                                    onChange(updated);
                                }}
                            >
                                <TrashIcon className="h-5 w-5" />
                            </button>
                        )}
                    </div>
                ))}
                {onChange && (
                    <button
                        className="mt-1 flex items-center text-sm text-[#4f7b38] hover:text-[#6aa329]"
                        onClick={() => onChange([...variable, ""])}
                    >
                        <PlusIcon className="h-4 w-4 mr-1" />
                        Add Item
                    </button>
                )}
            </div>
        );
    } else {
        return (
            <textarea
                className="w-full px-3 py-2 border border-gray-200 rounded-md text-[#0c0e0a] focus:outline-none focus:ring-1 focus:ring-[#6aa329] focus:border-[#6aa329] min-h-[80px] font-mono text-sm"
                value={JSON.stringify(variable, null, 2)}
                onChange={(e) => {
                    if (onChange) {
                        try {
                            onChange(JSON.parse(e.target.value));
                        } catch (err) {
                            // Handle parse error
                        }
                    }
                }}
            />
        );
    }
}

interface VariableDirective extends BaseDirective {
    variables: { [key: string]: Variable };
}

function VariableDirectiveComponent({
    variables,
    onChange
}: {
    variables: { [key: string]: Variable },
    onChange: (variables: { [key: string]: Variable }) => void
}) {
    const [isExpanded, setIsExpanded] = useState(true);
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

    return (
        <div className="bg-white rounded-md shadow-sm border border-[#e6f1d6] mb-4">
            <div
                className="flex items-center p-3 bg-[#f0f7e7] rounded-t-md cursor-pointer"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <button className="mr-2 text-[#4f7b38]">
                    {isExpanded ? (
                        <ChevronDownIcon className="h-5 w-5" />
                    ) : (
                        <ChevronRightIcon className="h-5 w-5" />
                    )}
                </button>
                <h2 className="text-[#0c0e0a] font-medium">Variables</h2>
            </div>

            {isExpanded && (
                <div className="p-4 border-t border-[#e6f1d6]">
                    {Object.entries(variables).map(([key, value], index) => (
                        <div key={index} className="mb-4 last:mb-0">
                            <div className="flex justify-between mb-1">
                                <span className="font-medium text-sm text-[#1e2a16]">{key}</span>
                                <button
                                    className="text-gray-400 hover:text-[#6aa329]"
                                    onClick={() => removeVariable(key)}
                                >
                                    <TrashIcon className="h-4 w-4" />
                                </button>
                            </div>
                            <div className="pl-4 border-l-2 border-[#d3e7b6]">
                                <VariableComponent
                                    variable={value}
                                    onChange={(updated) => updateVariable(key, updated)}
                                />
                            </div>
                        </div>
                    ))}

                    <div className="mt-4 flex">
                        <input
                            className="flex-grow px-3 py-2 border border-gray-200 rounded-l-md text-[#0c0e0a] focus:outline-none focus:ring-1 focus:ring-[#6aa329] focus:border-[#6aa329]"
                            placeholder="New variable name"
                            value={newVarKey}
                            onChange={(e) => setNewVarKey(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && addVariable()}
                        />
                        <button
                            className="px-4 py-2 bg-[#6aa329] text-white rounded-r-md hover:bg-[#4f7b38]"
                            onClick={addVariable}
                        >
                            Add Variable
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

interface Template {
    name: string;
    // params
    [key: string]: unknown;
}

interface TemplateDirective extends BaseDirective {
    template: Template;
}

function TemplateDirectiveComponent({
    template,
    onChange
}: {
    template: Template,
    onChange: (template: Template) => void
}) {
    const [isExpanded, setIsExpanded] = useState(true);
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

    return (
        <div className="bg-white rounded-md shadow-sm border border-[#e6f1d6] mb-4">
            <div
                className="flex items-center p-3 bg-[#f0f7e7] rounded-t-md cursor-pointer"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <button className="mr-2 text-[#4f7b38]">
                    {isExpanded ? (
                        <ChevronDownIcon className="h-5 w-5" />
                    ) : (
                        <ChevronRightIcon className="h-5 w-5" />
                    )}
                </button>
                <h2 className="text-[#0c0e0a] font-medium">Template: {template.name}</h2>
            </div>

            {isExpanded && (
                <div className="p-4 border-t border-[#e6f1d6]">
                    <div className="mb-4">
                        <label className="block mb-1 font-medium text-sm text-[#1e2a16]">Template Name</label>
                        <input
                            className="w-full px-3 py-2 border border-gray-200 rounded-md text-[#0c0e0a] focus:outline-none focus:ring-1 focus:ring-[#6aa329] focus:border-[#6aa329]"
                            value={template.name}
                            onChange={(e) => updateName(e.target.value)}
                        />
                    </div>

                    {Object.entries(template).map(([key, value]) => {
                        if (key === 'name') return null;
                        return (
                            <div key={key} className="mb-4 last:mb-0">
                                <div className="flex justify-between mb-1">
                                    <label className="block font-medium text-sm text-[#1e2a16]">{key}</label>
                                    <button
                                        className="text-gray-400 hover:text-[#6aa329]"
                                        onClick={() => removeParam(key)}
                                    >
                                        <TrashIcon className="h-4 w-4" />
                                    </button>
                                </div>
                                <div className="pl-4 border-l-2 border-[#d3e7b6]">
                                    <VariableComponent
                                        variable={value}
                                        onChange={(updated) => updateParam(key, updated)}
                                    />
                                </div>
                            </div>
                        );
                    })}

                    <div className="mt-4 flex">
                        <input
                            className="flex-grow px-3 py-2 border border-gray-200 rounded-l-md text-[#0c0e0a] focus:outline-none focus:ring-1 focus:ring-[#6aa329] focus:border-[#6aa329]"
                            placeholder="New parameter name"
                            value={newParamKey}
                            onChange={(e) => setNewParamKey(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && addParam()}
                        />
                        <button
                            className="px-4 py-2 bg-[#6aa329] text-white rounded-r-md hover:bg-[#4f7b38]"
                            onClick={addParam}
                        >
                            Add Parameter
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

interface DeployInfo {
    path?: string[];
    bins?: string[];
}

interface DeployDirective extends BaseDirective {
    deploy: DeployInfo;
}

function DeployDirectiveComponent({
    deploy,
    onChange
}: {
    deploy: DeployInfo,
    onChange: (deploy: DeployInfo) => void
}) {
    const [isExpanded, setIsExpanded] = useState(true);

    const addPath = () => {
        onChange({
            ...deploy,
            path: [...(deploy.path || []), ""]
        });
    };

    const updatePath = (index: number, value: string) => {
        const updated = [...(deploy.path || [])];
        updated[index] = value;
        onChange({ ...deploy, path: updated });
    };

    const removePath = (index: number) => {
        onChange({
            ...deploy,
            path: (deploy.path || []).filter((_, i) => i !== index)
        });
    };

    const addBin = () => {
        onChange({
            ...deploy,
            bins: [...(deploy.bins || []), ""]
        });
    };

    const updateBin = (index: number, value: string) => {
        const updated = [...(deploy.bins || [])];
        updated[index] = value;
        onChange({ ...deploy, bins: updated });
    };

    const removeBin = (index: number) => {
        onChange({
            ...deploy,
            bins: (deploy.bins || []).filter((_, i) => i !== index)
        });
    };

    return (
        <div className="bg-white rounded-md shadow-sm border border-[#e6f1d6] mb-4">
            <div
                className="flex items-center p-3 bg-[#f0f7e7] rounded-t-md cursor-pointer"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <button className="mr-2 text-[#4f7b38]">
                    {isExpanded ? (
                        <ChevronDownIcon className="h-5 w-5" />
                    ) : (
                        <ChevronRightIcon className="h-5 w-5" />
                    )}
                </button>
                <h2 className="text-[#0c0e0a] font-medium">Deploy</h2>
            </div>

            {isExpanded && (
                <div className="p-4 border-t border-[#e6f1d6]">
                    <div className="mb-6">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="font-medium text-sm text-[#1e2a16]">Paths</h3>
                            <button
                                className="text-sm text-[#4f7b38] hover:text-[#6aa329] flex items-center"
                                onClick={addPath}
                            >
                                <PlusIcon className="h-4 w-4 mr-1" />
                                Add Path
                            </button>
                        </div>

                        {(deploy.path || []).map((path, index) => (
                            <div key={index} className="flex mb-2">
                                <input
                                    className="flex-grow px-3 py-2 border border-gray-200 rounded-l-md text-[#0c0e0a] focus:outline-none focus:ring-1 focus:ring-[#6aa329] focus:border-[#6aa329]"
                                    value={path}
                                    onChange={(e) => updatePath(index, e.target.value)}
                                    placeholder="/path/to/deploy"
                                />
                                <button
                                    className="px-3 py-2 bg-[#f0f7e7] border border-gray-200 border-l-0 rounded-r-md text-gray-400 hover:text-[#6aa329]"
                                    onClick={() => removePath(index)}
                                >
                                    <TrashIcon className="h-5 w-5" />
                                </button>
                            </div>
                        ))}
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="font-medium text-sm text-[#1e2a16]">Binaries</h3>
                            <button
                                className="text-sm text-[#4f7b38] hover:text-[#6aa329] flex items-center"
                                onClick={addBin}
                            >
                                <PlusIcon className="h-4 w-4 mr-1" />
                                Add Binary
                            </button>
                        </div>

                        {(deploy.bins || []).map((bin, index) => (
                            <div key={index} className="flex mb-2">
                                <input
                                    className="flex-grow px-3 py-2 border border-gray-200 rounded-l-md text-[#0c0e0a] focus:outline-none focus:ring-1 focus:ring-[#6aa329] focus:border-[#6aa329]"
                                    value={bin}
                                    onChange={(e) => updateBin(index, e.target.value)}
                                    placeholder="binary-name"
                                />
                                <button
                                    className="px-3 py-2 bg-[#f0f7e7] border border-gray-200 border-l-0 rounded-r-md text-gray-400 hover:text-[#6aa329]"
                                    onClick={() => removeBin(index)}
                                >
                                    <TrashIcon className="h-5 w-5" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

interface UserDirective extends BaseDirective {
    user: string;
}

function UserDirectiveComponent({
    user,
    onChange
}: {
    user: string,
    onChange: (user: string) => void
}) {
    const [isExpanded, setIsExpanded] = useState(true);

    return (
        <div className="bg-white rounded-md shadow-sm border border-[#e6f1d6] mb-4">
            <div
                className="flex items-center p-3 bg-[#f0f7e7] rounded-t-md cursor-pointer"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <button className="mr-2 text-[#4f7b38]">
                    {isExpanded ? (
                        <ChevronDownIcon className="h-5 w-5" />
                    ) : (
                        <ChevronRightIcon className="h-5 w-5" />
                    )}
                </button>
                <h2 className="text-[#0c0e0a] font-medium">User</h2>
            </div>

            {isExpanded && (
                <div className="p-4 border-t border-[#e6f1d6]">
                    <input
                        className="w-full px-3 py-2 border border-gray-200 rounded-md text-[#0c0e0a] focus:outline-none focus:ring-1 focus:ring-[#6aa329] focus:border-[#6aa329]"
                        value={user}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder="Username"
                    />
                </div>
            )}
        </div>
    );
}

interface CopyDirective extends BaseDirective {
    copy: string[];
}

function CopyDirectiveComponent({
    copy,
    onChange
}: {
    copy: string[],
    onChange: (copy: string[]) => void
}) {
    const [isExpanded, setIsExpanded] = useState(true);

    const addPath = () => {
        onChange([...copy, ""]);
    };

    const updatePath = (index: number, value: string) => {
        const updated = [...copy];
        updated[index] = value;
        onChange(updated);
    };

    const removePath = (index: number) => {
        onChange(copy.filter((_, i) => i !== index));
    };

    return (
        <div className="bg-white rounded-md shadow-sm border border-[#e6f1d6] mb-4">
            <div
                className="flex items-center p-3 bg-[#f0f7e7] rounded-t-md cursor-pointer"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <button className="mr-2 text-[#4f7b38]">
                    {isExpanded ? (
                        <ChevronDownIcon className="h-5 w-5" />
                    ) : (
                        <ChevronRightIcon className="h-5 w-5" />
                    )}
                </button>
                <h2 className="text-[#0c0e0a] font-medium">Copy</h2>
            </div>

            {isExpanded && (
                <div className="p-4 border-t border-[#e6f1d6]">
                    {copy.map((path, index) => (
                        <div key={index} className="flex mb-2">
                            <input
                                className="flex-grow px-3 py-2 border border-gray-200 rounded-l-md text-[#0c0e0a] focus:outline-none focus:ring-1 focus:ring-[#6aa329] focus:border-[#6aa329]"
                                value={path}
                                onChange={(e) => updatePath(index, e.target.value)}
                                placeholder="source:destination"
                            />
                            <button
                                className="px-3 py-2 bg-[#f0f7e7] border border-gray-200 border-l-0 rounded-r-md text-gray-400 hover:text-[#6aa329]"
                                onClick={() => removePath(index)}
                            >
                                <TrashIcon className="h-5 w-5" />
                            </button>
                        </div>
                    ))}

                    <button
                        className="mt-2 flex items-center text-sm text-[#4f7b38] hover:text-[#6aa329]"
                        onClick={addPath}
                    >
                        <PlusIcon className="h-4 w-4 mr-1" />
                        Add Path
                    </button>
                </div>
            )}
        </div>
    );
}

interface FileInfo {
    name: string;
    filename: string;
}

interface FileDirective extends BaseDirective {
    file: FileInfo;
}

function FileDirectiveComponent({
    file,
    onChange
}: {
    file: FileInfo,
    onChange: (file: FileInfo) => void
}) {
    const [isExpanded, setIsExpanded] = useState(true);

    const updateName = (value: string) => {
        onChange({ ...file, name: value });
    };

    const updateFilename = (value: string) => {
        onChange({ ...file, filename: value });
    };

    return (
        <div className="bg-white rounded-md shadow-sm border border-[#e6f1d6] mb-4">
            <div
                className="flex items-center p-3 bg-[#f0f7e7] rounded-t-md cursor-pointer"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <button className="mr-2 text-[#4f7b38]">
                    {isExpanded ? (
                        <ChevronDownIcon className="h-5 w-5" />
                    ) : (
                        <ChevronRightIcon className="h-5 w-5" />
                    )}
                </button>
                <h2 className="text-[#0c0e0a] font-medium">File: {file.name}</h2>
            </div>

            {isExpanded && (
                <div className="p-4 border-t border-[#e6f1d6]">
                    <div className="mb-4">
                        <label className="block mb-1 font-medium text-sm text-[#1e2a16]">Name</label>
                        <input
                            className="w-full px-3 py-2 border border-gray-200 rounded-md text-[#0c0e0a] focus:outline-none focus:ring-1 focus:ring-[#6aa329] focus:border-[#6aa329]"
                            value={file.name}
                            onChange={(e) => updateName(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block mb-1 font-medium text-sm text-[#1e2a16]">Filename</label>
                        <input
                            className="w-full px-3 py-2 border border-gray-200 rounded-md text-[#0c0e0a] focus:outline-none focus:ring-1 focus:ring-[#6aa329] focus:border-[#6aa329]"
                            value={file.filename}
                            onChange={(e) => updateFilename(e.target.value)}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

interface BuiltinTest {
    name: string;
    builtin: "test_deploy.sh";
}

interface ScriptTest {
    name: string;
    script: string;
}

type TestInfo = BuiltinTest | ScriptTest;

interface TestDirective extends BaseDirective {
    test: TestInfo;
}

function TestDirectiveComponent({
    test,
    onChange
}: {
    test: TestInfo,
    onChange: (test: TestInfo) => void
}) {
    const [isExpanded, setIsExpanded] = useState(true);
    const isBuiltin = 'builtin' in test;

    const updateName = (value: string) => {
        onChange({ ...test, name: value });
    };

    const updateScript = (value: string) => {
        if (!isBuiltin) {
            onChange({ ...test, script: value } as ScriptTest);
        }
    };

    return (
        <div className="bg-white rounded-md shadow-sm border border-[#e6f1d6] mb-4">
            <div
                className="flex items-center p-3 bg-[#f0f7e7] rounded-t-md cursor-pointer"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <button className="mr-2 text-[#4f7b38]">
                    {isExpanded ? (
                        <ChevronDownIcon className="h-5 w-5" />
                    ) : (
                        <ChevronRightIcon className="h-5 w-5" />
                    )}
                </button>
                <h2 className="text-[#0c0e0a] font-medium">
                    Test: {test.name}
                    <span className="ml-2 text-xs font-normal bg-[#e6f1d6] px-2 py-0.5 rounded-full">
                        {isBuiltin ? 'Builtin' : 'Script'}
                    </span>
                </h2>
            </div>

            {isExpanded && (
                <div className="p-4 border-t border-[#e6f1d6]">
                    <div className="mb-4">
                        <label className="block mb-1 font-medium text-sm text-[#1e2a16]">Test Name</label>
                        <input
                            className="w-full px-3 py-2 border border-gray-200 rounded-md text-[#0c0e0a] focus:outline-none focus:ring-1 focus:ring-[#6aa329] focus:border-[#6aa329]"
                            value={test.name}
                            onChange={(e) => updateName(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block mb-1 font-medium text-sm text-[#1e2a16]">
                            {isBuiltin ? 'Builtin Test Script' : 'Test Script'}
                        </label>
                        {isBuiltin ? (
                            <div className="px-3 py-2 border border-gray-200 bg-gray-50 rounded-md text-gray-500">
                                {(test as BuiltinTest).builtin}
                            </div>
                        ) : (
                            <textarea
                                className="w-full px-3 py-2 border border-gray-200 rounded-md text-[#0c0e0a] focus:outline-none focus:ring-1 focus:ring-[#6aa329] focus:border-[#6aa329] min-h-[120px]"
                                value={(test as ScriptTest).script}
                                onChange={(e) => updateScript(e.target.value)}
                            />
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

type Directive =
    | GroupDirective
    | EnvironmentDirective
    | InstallDirective
    | WorkingDirectoryDirective
    | RunCommandDirective
    | VariableDirective
    | TemplateDirective
    | DeployDirective
    | UserDirective
    | CopyDirective
    | FileDirective
    | TestDirective;

function DirectiveComponent({ directive, onChange }: { directive: Directive, onChange: (directive: Directive) => void }) {
    if ('group' in directive) {
        return (
            <GroupDirectiveComponent
                group={directive.group}
                onChange={(group) => onChange({ ...directive, group })}
            />
        );
    } else if ('environment' in directive) {
        return (
            <EnvironmentDirectiveComponent
                environment={directive.environment}
                onChange={(environment) => onChange({ ...directive, environment })}
            />
        );
    } else if ('install' in directive) {
        return (
            <InstallDirectiveComponent
                install={directive.install}
                onChange={(install) => onChange({ ...directive, install })}
            />
        );
    } else if ('workdir' in directive) {
        return (
            <WorkingDirectoryDirectiveComponent
                workdir={directive.workdir}
                onChange={(workdir) => onChange({ ...directive, workdir })}
            />
        );
    } else if ('run' in directive) {
        return (
            <RunCommandDirectiveComponent
                run={directive.run}
                onChange={(run) => onChange({ ...directive, run })}
            />
        );
    } else if ('variables' in directive) {
        return (
            <VariableDirectiveComponent
                variables={directive.variables}
                onChange={(variables) => onChange({ ...directive, variables })}
            />
        );
    } else if ('template' in directive) {
        return (
            <TemplateDirectiveComponent
                template={directive.template}
                onChange={(template) => onChange({ ...directive, template })}
            />
        );
    } else if ('deploy' in directive) {
        return (
            <DeployDirectiveComponent
                deploy={directive.deploy}
                onChange={(deploy) => onChange({ ...directive, deploy })}
            />
        );
    } else if ('user' in directive) {
        return (
            <UserDirectiveComponent
                user={directive.user}
                onChange={(user) => onChange({ ...directive, user })}
            />
        );
    } else if ('copy' in directive) {
        return (
            <CopyDirectiveComponent
                copy={directive.copy}
                onChange={(copy) => onChange({ ...directive, copy })}
            />
        );
    } else if ('file' in directive) {
        return (
            <FileDirectiveComponent
                file={directive.file}
                onChange={(file) => onChange({ ...directive, file })}
            />
        );
    } else if ('test' in directive) {
        return (
            <TestDirectiveComponent
                test={directive.test}
                onChange={(test) => onChange({ ...directive, test })}
            />
        );
    } else {
        return (
            <div className="bg-white rounded-md shadow-sm border border-red-200 mb-4 p-4 text-red-500">
                Unknown Directive: {Object.keys(directive).join(", ")}
            </div>
        );
    }
}

interface NeuroDockerBuildRecipe {
    kind: "neurodocker";
    "base-image": string;
    "pkg-manager": string;
    directives: Directive[];
}

function NeuroDockerBuildRecipeComponent({
    recipe,
    onChange
}: {
    recipe: NeuroDockerBuildRecipe,
    onChange: (recipe: NeuroDockerBuildRecipe) => void
}) {
    const updateBaseImage = (value: string) => {
        onChange({ ...recipe, "base-image": value });
    };

    const updatePkgManager = (value: string) => {
        onChange({ ...recipe, "pkg-manager": value });
    };

    const updateDirective = (index: number, directive: Directive) => {
        const updatedDirectives = [...recipe.directives];
        updatedDirectives[index] = directive;
        onChange({ ...recipe, directives: updatedDirectives });
    };

    const addDirective = (type: string) => {
        let newDirective: Directive;

        switch (type) {
            case "group":
                newDirective = { group: [] };
                break;
            case "environment":
                newDirective = { environment: {} };
                break;
            case "install":
                newDirective = { install: "" };
                break;
            case "workdir":
                newDirective = { workdir: "" };
                break;
            case "run":
                newDirective = { run: [""] };
                break;
            case "variables":
                newDirective = { variables: {} };
                break;
            case "template":
                newDirective = { template: { name: "new-template" } };
                break;
            case "deploy":
                newDirective = { deploy: { path: [], bins: [] } };
                break;
            case "user":
                newDirective = { user: "" };
                break;
            case "copy":
                newDirective = { copy: [""] };
                break;
            case "file":
                newDirective = { file: { name: "", filename: "" } };
                break;
            case "test":
                newDirective = { test: { name: "", script: "" } };
                break;
            default:
                return;
        }

        onChange({ ...recipe, directives: [...recipe.directives, newDirective] });
    };

    const removeDirective = (index: number) => {
        onChange({
            ...recipe,
            directives: recipe.directives.filter((_, i) => i !== index)
        });
    };

    const [directiveType, setDirectiveType] = useState("");

    return (
        <div className="bg-white rounded-lg shadow-md border border-[#d3e7b6]">
            <div className="p-4 bg-[#f0f7e7] rounded-t-lg">
                <h2 className="text-xl font-semibold text-[#0c0e0a]">NeuroDocker Build Recipe</h2>
            </div>

            <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <label className="block mb-2 font-medium text-[#1e2a16]">Base Image</label>
                        <input
                            className="w-full px-3 py-2 border border-gray-200 rounded-md text-[#0c0e0a] focus:outline-none focus:ring-1 focus:ring-[#6aa329] focus:border-[#6aa329]"
                            value={recipe["base-image"]}
                            onChange={(e) => updateBaseImage(e.target.value)}
                            placeholder="e.g. ubuntu:22.04"
                        />
                    </div>

                    <div>
                        <label className="block mb-2 font-medium text-[#1e2a16]">Package Manager</label>
                        <select
                            className="w-full px-3 py-2 border border-gray-200 rounded-md text-[#0c0e0a] bg-white focus:outline-none focus:ring-1 focus:ring-[#6aa329] focus:border-[#6aa329]"
                            value={recipe["pkg-manager"]}
                            onChange={(e) => updatePkgManager(e.target.value)}
                        >
                            <option value="apt">apt</option>
                            <option value="yum">yum</option>
                            <option value="dnf">dnf</option>
                            <option value="apk">apk</option>
                        </select>
                    </div>
                </div>

                <div className="mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium text-[#0c0e0a]">Directives</h3>
                        <div className="flex">
                            <select
                                className="px-3 py-2 border border-[#6aa329] rounded-l-md text-[#0c0e0a] bg-white focus:outline-none focus:ring-1 focus:ring-[#6aa329]"
                                value={directiveType}
                                onChange={(e) => setDirectiveType(e.target.value)}
                            >
                                <option value="" disabled>Add directive...</option>
                                <option value="group">Group</option>
                                <option value="environment">Environment</option>
                                <option value="install">Install</option>
                                <option value="workdir">Working Directory</option>
                                <option value="run">Run Commands</option>
                                <option value="variables">Variables</option>
                                <option value="template">Template</option>
                                <option value="deploy">Deploy</option>
                                <option value="user">User</option>
                                <option value="copy">Copy</option>
                                <option value="file">File</option>
                                <option value="test">Test</option>
                            </select>
                            <button
                                className="px-4 py-2 bg-[#6aa329] text-white rounded-r-md hover:bg-[#4f7b38] focus:outline-none focus:ring-2 focus:ring-[#6aa329] focus:ring-offset-2"
                                onClick={() => {
                                    if (directiveType) {
                                        addDirective(directiveType);
                                        setDirectiveType("");
                                    }
                                }}
                            >
                                Add
                            </button>
                        </div>
                    </div>

                    {recipe.directives.map((directive, index) => (
                        <div key={index} className="relative">
                            <DirectiveComponent
                                directive={directive}
                                onChange={(updated) => updateDirective(index, updated)}
                            />
                            <button
                                className="absolute top-3 right-3 text-gray-400 hover:text-[#6aa329]"
                                onClick={() => removeDirective(index)}
                            >
                                <TrashIcon className="h-5 w-5" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

type BuildRecipe = NeuroDockerBuildRecipe;

function BuildRecipeComponent({ recipe, onChange }: { recipe: BuildRecipe, onChange: (recipe: BuildRecipe) => void }) {
    if (recipe.kind === "neurodocker") {
        return <NeuroDockerBuildRecipeComponent recipe={recipe} onChange={onChange} />;
    } else {
        return (
            <div className="bg-white rounded-lg shadow-md border border-red-200 p-6 text-red-500">
                Unknown Build Recipe
            </div>
        );
    }
}

interface ContainerRecipe {
    name: string;
    version: string;
    copyright?: CopyrightInfo[];
    architectures: Architecture[];
    readme?: string;
    readme_url?: string;
    build: BuildRecipe;
    files?: FileInfo[];
    deploy?: DeployInfo;
    tests: TestInfo[];
}

async function getDefaultYAML(): Promise<ContainerRecipe> {
    const res = await fetch("/qsmxt.yaml");
    if (!res.ok) {
        throw new Error("Failed to fetch YAML file");
    }
    const text = await res.text();
    return loadYAML(text) as ContainerRecipe;
}

function ContainerHeader({
    recipe,
    onChange
}: {
    recipe: ContainerRecipe,
    onChange: (recipe: ContainerRecipe) => void
}) {
    const updateName = (name: string) => {
        onChange({ ...recipe, name });
    };

    const updateVersion = (version: string) => {
        onChange({ ...recipe, version });
    };

    const updateArchitectures = (architectures: Architecture[]) => {
        onChange({ ...recipe, architectures });
    };

    const updateReadme = (readme: string) => {
        onChange({ ...recipe, readme });
    };

    const updateReadmeUrl = (readme_url: string) => {
        onChange({ ...recipe, readme_url });
    };

    const updateCopyright = (index: number, info: CopyrightInfo) => {
        if (!recipe.copyright) return;

        const updated = [...recipe.copyright];
        updated[index] = info;
        onChange({ ...recipe, copyright: updated });
    };

    const addCopyright = () => {
        const newCopyright = { license: "", url: "" };
        onChange({
            ...recipe,
            copyright: [...(recipe.copyright || []), newCopyright]
        });
    };

    const removeCopyright = (index: number) => {
        if (!recipe.copyright) return;

        onChange({
            ...recipe,
            copyright: recipe.copyright.filter((_, i) => i !== index)
        });
    };

    return (
        <div className="bg-white rounded-lg shadow-md border border-[#d3e7b6] mb-6">
            <div className="p-4 bg-[#f0f7e7] rounded-t-lg">
                <h2 className="text-xl font-semibold text-[#0c0e0a]">Container Definition</h2>
            </div>

            <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block mb-2 font-medium text-[#1e2a16]">Name</label>
                        <input
                            className="w-full px-3 py-2 border border-gray-200 rounded-md text-[#0c0e0a] focus:outline-none focus:ring-1 focus:ring-[#6aa329] focus:border-[#6aa329]"
                            value={recipe.name}
                            onChange={(e) => updateName(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block mb-2 font-medium text-[#1e2a16]">Version</label>
                        <input
                            className="w-full px-3 py-2 border border-gray-200 rounded-md text-[#0c0e0a] focus:outline-none focus:ring-1 focus:ring-[#6aa329] focus:border-[#6aa329]"
                            value={recipe.version}
                            onChange={(e) => updateVersion(e.target.value)}
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="block mb-2 font-medium text-[#1e2a16]">Architectures</label>
                        <div className="flex flex-wrap gap-3">
                            <label className="inline-flex items-center">
                                <input
                                    type="checkbox"
                                    className="rounded border-gray-300 text-[#6aa329] focus:ring-[#6aa329]"
                                    checked={recipe.architectures.includes("x86_64")}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            updateArchitectures([...recipe.architectures, "x86_64"]);
                                        } else {
                                            updateArchitectures(recipe.architectures.filter(arch => arch !== "x86_64"));
                                        }
                                    }}
                                />
                                <span className="ml-2 text-[#0c0e0a]">x86_64</span>
                            </label>

                            <label className="inline-flex items-center">
                                <input
                                    type="checkbox"
                                    className="rounded border-gray-300 text-[#6aa329] focus:ring-[#6aa329]"
                                    checked={recipe.architectures.includes("aarch64")}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            updateArchitectures([...recipe.architectures, "aarch64"]);
                                        } else {
                                            updateArchitectures(recipe.architectures.filter(arch => arch !== "aarch64"));
                                        }
                                    }}
                                />
                                <span className="ml-2 text-[#0c0e0a]">aarch64</span>
                            </label>
                        </div>
                    </div>

                    <div>
                        <label className="block mb-2 font-medium text-[#1e2a16]">Readme</label>
                        <input
                            className="w-full px-3 py-2 border border-gray-200 rounded-md text-[#0c0e0a] focus:outline-none focus:ring-1 focus:ring-[#6aa329] focus:border-[#6aa329]"
                            value={recipe.readme || ""}
                            onChange={(e) => updateReadme(e.target.value)}
                            placeholder="Path to readme file"
                        />
                    </div>

                    <div>
                        <label className="block mb-2 font-medium text-[#1e2a16]">Readme URL</label>
                        <input
                            className="w-full px-3 py-2 border border-gray-200 rounded-md text-[#0c0e0a] focus:outline-none focus:ring-1 focus:ring-[#6aa329] focus:border-[#6aa329]"
                            value={recipe.readme_url || ""}
                            onChange={(e) => updateReadmeUrl(e.target.value)}
                            placeholder="URL to readme file"
                        />
                    </div>
                </div>

                <div className="mt-6">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="font-medium text-[#1e2a16]">Copyright Information</h3>
                        <button
                            className="text-sm text-[#4f7b38] hover:text-[#6aa329] flex items-center"
                            onClick={addCopyright}
                        >
                            <PlusIcon className="h-4 w-4 mr-1" />
                            Add License
                        </button>
                    </div>

                    {(recipe.copyright || []).map((info, index) => (
                        <div key={index} className="mb-4 last:mb-0 p-4 bg-[#f0f7e7] rounded-md relative">
                            <button
                                className="absolute top-3 right-3 text-gray-400 hover:text-[#6aa329]"
                                onClick={() => removeCopyright(index)}
                            >
                                <TrashIcon className="h-5 w-5" />
                            </button>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block mb-1 text-sm font-medium text-[#1e2a16]">License</label>
                                    <input
                                        className="w-full px-3 py-2 border border-gray-200 rounded-md text-[#0c0e0a] focus:outline-none focus:ring-1 focus:ring-[#6aa329] focus:border-[#6aa329] bg-white"
                                        value={info.license}
                                        onChange={(e) => updateCopyright(index, { ...info, license: e.target.value })}
                                        placeholder="SPDX License Identifier"
                                    />
                                </div>

                                <div>
                                    <label className="block mb-1 text-sm font-medium text-[#1e2a16]">URL</label>
                                    <input
                                        className="w-full px-3 py-2 border border-gray-200 rounded-md text-[#0c0e0a] focus:outline-none focus:ring-1 focus:ring-[#6aa329] focus:border-[#6aa329] bg-white"
                                        value={info.url}
                                        onChange={(e) => updateCopyright(index, { ...info, url: e.target.value })}
                                        placeholder="License URL"
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function WizardNavigation({
    currentStep,
    totalSteps,
    onNext,
    onPrevious
}: {
    currentStep: number;
    totalSteps: number;
    onNext: () => void;
    onPrevious: () => void;
}) {
    return (
        <div className="flex justify-between items-center mt-8 pt-6 border-t border-[#e6f1d6]">
            <button
                className={`px-4 py-2 rounded-md ${currentStep > 0
                        ? "bg-[#e6f1d6] text-[#4f7b38] hover:bg-[#d3e7b6]"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    }`}
                onClick={onPrevious}
                disabled={currentStep === 0}
            >
                Previous
            </button>

            <div className="text-sm text-[#1e2a16]">
                Step {currentStep + 1} of {totalSteps}
            </div>

            <button
                className={`px-4 py-2 rounded-md ${currentStep < totalSteps - 1
                        ? "bg-[#6aa329] text-white hover:bg-[#4f7b38]"
                        : "bg-[#4f7b38] text-white"
                    }`}
                onClick={onNext}
            >
                {currentStep < totalSteps - 1 ? "Next" : "Finish"}
            </button>
        </div>
    );
}

export default function Home() {
    const [yamlData, setYamlData] = useState<ContainerRecipe | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentStep, setCurrentStep] = useState(0);
    const [yamlText, setYamlText] = useState("");

    // Simplified to just 2 steps: Basic Info and Build Recipe
    const totalSteps = 2;

    useEffect(() => {
        getDefaultYAML()
            .then((data) => {
                console.log("YAML data:", data);
                setYamlData(data);
                setYamlText(dumpYAML(data));
                setLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching YAML file:", error);
                setLoading(false);
            });
    }, []);

    // Update YAML text when yamlData changes
    useEffect(() => {
        if (yamlData) {
            try {
                setYamlText(dumpYAML(yamlData));
            } catch (err) {
                console.error("Error dumping YAML:", err);
            }
        }
    }, [yamlData]);

    const nextStep = () => {
        if (currentStep < totalSteps - 1) {
            setCurrentStep(currentStep + 1);
        }
    };

    const previousStep = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const exportYAML = () => {
        if (!yamlData) return;

        const blob = new Blob([yamlText], { type: "text/yaml" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${yamlData.name}-${yamlData.version}.yaml`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    // Update yamlData from YAML text
    const updateFromYamlText = () => {
        try {
            const parsed = loadYAML(yamlText) as ContainerRecipe;
            setYamlData(parsed);
        } catch (err) {
            console.error("Error parsing YAML:", err);
            // Could add user feedback for invalid YAML
        }
    };

    return (
        <div className="min-h-screen bg-[#f0f7e7]">
            {/* Header */}
            <header className="bg-[#0c0e0a] text-white py-4 px-6 shadow-md">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <h1 className="text-2xl font-bold">Neurocontainers Builder</h1>

                    <div className="flex items-center space-x-4">
                        <button
                            className="bg-[#1e2a16] hover:bg-[#161c10] px-4 py-2 rounded-md text-sm"
                            onClick={() => setYamlData(null)}
                        >
                            New Container
                        </button>
                        <button
                            className="bg-[#4f7b38] hover:bg-[#6aa329] px-4 py-2 rounded-md text-sm"
                            onClick={exportYAML}
                            disabled={!yamlData}
                        >
                            Export YAML
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto py-8 px-6">
                {loading ? (
                    <div className="bg-white rounded-lg shadow-md p-10 text-center">
                        <div className="animate-pulse text-[#4f7b38] text-xl">Loading...</div>
                    </div>
                ) : yamlData ? (
                    <div>
                        {/* Wizard Steps */}
                        <div className="mb-8">
                            <div className="grid grid-cols-2 gap-2">
                                <div
                                    className={`p-3 rounded-md text-center ${currentStep === 0
                                            ? "bg-[#6aa329] text-white"
                                            : "bg-[#e6f1d6] text-[#1e2a16] hover:bg-[#d3e7b6] cursor-pointer"
                                        }`}
                                    onClick={() => setCurrentStep(0)}
                                >
                                    <div className="font-medium">Basic Info</div>
                                    <div className="text-xs mt-1 opacity-80">Container metadata</div>
                                </div>

                                <div
                                    className={`p-3 rounded-md text-center ${currentStep === 1
                                            ? "bg-[#6aa329] text-white"
                                            : "bg-[#e6f1d6] text-[#1e2a16] hover:bg-[#d3e7b6] cursor-pointer"
                                        }`}
                                    onClick={() => setCurrentStep(1)}
                                >
                                    <div className="font-medium">Build Recipe</div>
                                    <div className="text-xs mt-1 opacity-80">Define build process</div>
                                </div>
                            </div>
                        </div>

                        {/* Current Step Content */}
                        <div className="mb-6">
                            {currentStep === 0 && (
                                <ContainerHeader
                                    recipe={yamlData}
                                    onChange={(updated) => setYamlData(updated)}
                                />
                            )}

                            {currentStep === 1 && (
                                <BuildRecipeComponent
                                    recipe={yamlData.build}
                                    onChange={(updated) => setYamlData({ ...yamlData, build: updated })}
                                />
                            )}
                        </div>

                        {/* YAML Preview (for power users) */}
                        <div className="bg-white rounded-lg shadow-md border border-[#d3e7b6] mb-6">
                            <div
                                className="p-4 bg-[#f0f7e7] rounded-t-lg flex justify-between items-center cursor-pointer"
                                onClick={() => document.getElementById('yaml-preview')?.classList.toggle('hidden')}
                            >
                                <h2 className="font-semibold text-[#0c0e0a]">YAML Preview</h2>
                                <ChevronDownIcon className="h-5 w-5 text-[#4f7b38]" />
                            </div>

                            <div id="yaml-preview" className="hidden p-6">
                                <textarea
                                    className="w-full h-64 px-4 py-3 font-mono text-sm bg-[#1e2a16] text-white rounded-md focus:outline-none"
                                    value={yamlText}
                                    onChange={(e) => setYamlText(e.target.value)}
                                    onBlur={updateFromYamlText}
                                ></textarea>
                                <div className="mt-3 text-right">
                                    <button
                                        className="bg-[#6aa329] text-white px-3 py-1 rounded-md text-sm hover:bg-[#4f7b38]"
                                        onClick={updateFromYamlText}
                                    >
                                        Apply YAML Changes
                                    </button>
                                </div>
                            </div>
                        </div>

                        <WizardNavigation
                            currentStep={currentStep}
                            totalSteps={totalSteps}
                            onNext={nextStep}
                            onPrevious={previousStep}
                        />
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow-md p-10 text-center">
                        <h2 className="text-xl font-semibold text-[#0c0e0a] mb-4">Start Building a Container</h2>
                        <p className="text-[#1e2a16] mb-6">
                            Create a new container definition or upload an existing YAML file
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <button className="px-6 py-3 bg-[#6aa329] text-white rounded-md hover:bg-[#4f7b38]">
                                Create New Container
                            </button>
                            <button className="px-6 py-3 bg-[#e6f1d6] text-[#4f7b38] rounded-md hover:bg-[#d3e7b6]">
                                Upload YAML File
                            </button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
