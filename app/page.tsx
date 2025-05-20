"use client";

import { load as loadYAML } from "js-yaml";
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

function GroupDirectiveComponent({ group }: { group: Directive[] }) {
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
                <h2 className="text-[#0c0e0a] font-medium">Group Directive</h2>
            </div>

            {isExpanded && (
                <div className="p-4 border-t border-[#e6f1d6]">
                    {group.map((directive, index) => (
                        <div key={index} className="mb-3 last:mb-0">
                            <DirectiveComponent directive={directive} />
                        </div>
                    ))}
                    <button className="mt-4 flex items-center text-sm text-[#4f7b38] hover:text-[#6aa329]">
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

function EnvironmentDirectiveComponent({ environment }: { environment: { [key: string]: string } }) {
    const [isExpanded, setIsExpanded] = useState(true);
    const [envVars, setEnvVars] = useState(environment);

    const addEnvironmentVariable = () => {
        setEnvVars({ ...envVars, "": "" });
    };

    const updateKey = (oldKey: string, newKey: string) => {
        const updated = { ...envVars };
        const value = updated[oldKey];
        delete updated[oldKey];
        updated[newKey] = value;
        setEnvVars(updated);
    };

    const updateValue = (key: string, value: string) => {
        setEnvVars({ ...envVars, [key]: value });
    };

    const removeVariable = (key: string) => {
        const updated = { ...envVars };
        delete updated[key];
        setEnvVars(updated);
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

                    {Object.entries(envVars).map(([key, value], index) => (
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

function InstallDirectiveComponent({ install }: { install: string }) {
    const [isExpanded, setIsExpanded] = useState(true);
    const [value, setValue] = useState(install);

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
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                    />
                </div>
            )}
        </div>
    );
}

interface WorkingDirectoryDirective extends BaseDirective {
    workdir: string;
}

function WorkingDirectoryDirectiveComponent({ workdir }: { workdir: string }) {
    const [isExpanded, setIsExpanded] = useState(true);
    const [value, setValue] = useState(workdir);

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
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
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

function RunCommandDirectiveComponent({ run }: { run: string[] }) {
    const [isExpanded, setIsExpanded] = useState(true);
    const [commands, setCommands] = useState(run);

    const addCommand = () => {
        setCommands([...commands, ""]);
    };

    const updateCommand = (index: number, value: string) => {
        const updated = [...commands];
        updated[index] = value;
        setCommands(updated);
    };

    const removeCommand = (index: number) => {
        setCommands(commands.filter((_, i) => i !== index));
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
                    {commands.map((command, index) => (
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

function VariableComponent({ variable }: { variable: Variable }) {
    if (typeof variable === 'string') {
        return <span className="text-[#0c0e0a]">{variable}</span>;
    } else if (Array.isArray(variable)) {
        return (
            <ul className="list-disc pl-5 space-y-1">
                {variable.map((item, index) => (
                    <li key={index} className="text-[#0c0e0a]">{JSON.stringify(item)}</li>
                ))}
            </ul>
        );
    } else {
        return <pre className="bg-[#f0f7e7] p-2 rounded text-sm overflow-x-auto">{JSON.stringify(variable, null, 2)}</pre>;
    }
}

interface VariableDirective extends BaseDirective {
    variables: { [key: string]: Variable };
}

function VariableDirectiveComponent({ variables }: { variables: { [key: string]: Variable } }) {
    const [isExpanded, setIsExpanded] = useState(true);
    const [vars, setVars] = useState(variables);

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
                    {Object.entries(vars).map(([key, value], index) => (
                        <div key={index} className="mb-4 last:mb-0">
                            <div className="mb-1 font-medium text-sm text-[#1e2a16]">{key}</div>
                            <div className="pl-4 border-l-2 border-[#d3e7b6]">
                                <VariableComponent variable={value} />
                            </div>
                        </div>
                    ))}

                    <button className="mt-3 flex items-center text-sm text-[#4f7b38] hover:text-[#6aa329]">
                        <PlusIcon className="h-4 w-4 mr-1" />
                        Add Variable
                    </button>
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

function TemplateDirectiveComponent({ template }: { template: Template }) {
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
                <h2 className="text-[#0c0e0a] font-medium">Template: {template.name}</h2>
            </div>

            {isExpanded && (
                <div className="p-4 border-t border-[#e6f1d6]">
                    <div className="mb-4">
                        <label className="block mb-1 font-medium text-sm text-[#1e2a16]">Template Name</label>
                        <input
                            className="w-full px-3 py-2 border border-gray-200 rounded-md text-[#0c0e0a] focus:outline-none focus:ring-1 focus:ring-[#6aa329] focus:border-[#6aa329]"
                            value={template.name}
                        />
                    </div>

                    {Object.entries(template).map(([key, value]) => {
                        if (key === 'name') return null;
                        return (
                            <div key={key} className="mb-4 last:mb-0">
                                <label className="block mb-1 font-medium text-sm text-[#1e2a16]">{key}</label>
                                <div className="pl-4 border-l-2 border-[#d3e7b6]">
                                    <VariableComponent variable={value} />
                                </div>
                            </div>
                        );
                    })}

                    <button className="mt-3 flex items-center text-sm text-[#4f7b38] hover:text-[#6aa329]">
                        <PlusIcon className="h-4 w-4 mr-1" />
                        Add Parameter
                    </button>
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

function DeployDirectiveComponent({ deploy }: { deploy: DeployInfo }) {
    const [isExpanded, setIsExpanded] = useState(true);
    const [deployData, setDeployData] = useState(deploy);

    const addPath = () => {
        setDeployData({
            ...deployData,
            path: [...(deployData.path || []), ""]
        });
    };

    const updatePath = (index: number, value: string) => {
        const updated = [...(deployData.path || [])];
        updated[index] = value;
        setDeployData({ ...deployData, path: updated });
    };

    const removePath = (index: number) => {
        setDeployData({
            ...deployData,
            path: (deployData.path || []).filter((_, i) => i !== index)
        });
    };

    const addBin = () => {
        setDeployData({
            ...deployData,
            bins: [...(deployData.bins || []), ""]
        });
    };

    const updateBin = (index: number, value: string) => {
        const updated = [...(deployData.bins || [])];
        updated[index] = value;
        setDeployData({ ...deployData, bins: updated });
    };

    const removeBin = (index: number) => {
        setDeployData({
            ...deployData,
            bins: (deployData.bins || []).filter((_, i) => i !== index)
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

                        {(deployData.path || []).map((path, index) => (
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

                        {(deployData.bins || []).map((bin, index) => (
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

function UserDirectiveComponent({ user }: { user: string }) {
    const [isExpanded, setIsExpanded] = useState(true);
    const [value, setValue] = useState(user);

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
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
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

function CopyDirectiveComponent({ copy }: { copy: string[] }) {
    const [isExpanded, setIsExpanded] = useState(true);
    const [paths, setPaths] = useState(copy);

    const addPath = () => {
        setPaths([...paths, ""]);
    };

    const updatePath = (index: number, value: string) => {
        const updated = [...paths];
        updated[index] = value;
        setPaths(updated);
    };

    const removePath = (index: number) => {
        setPaths(paths.filter((_, i) => i !== index));
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
                    {paths.map((path, index) => (
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

function FileDirectiveComponent({ file }: { file: FileInfo }) {
    const [isExpanded, setIsExpanded] = useState(true);
    const [fileData, setFileData] = useState(file);

    const updateName = (value: string) => {
        setFileData({ ...fileData, name: value });
    };

    const updateFilename = (value: string) => {
        setFileData({ ...fileData, filename: value });
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
                <h2 className="text-[#0c0e0a] font-medium">File: {fileData.name}</h2>
            </div>

            {isExpanded && (
                <div className="p-4 border-t border-[#e6f1d6]">
                    <div className="mb-4">
                        <label className="block mb-1 font-medium text-sm text-[#1e2a16]">Name</label>
                        <input
                            className="w-full px-3 py-2 border border-gray-200 rounded-md text-[#0c0e0a] focus:outline-none focus:ring-1 focus:ring-[#6aa329] focus:border-[#6aa329]"
                            value={fileData.name}
                            onChange={(e) => updateName(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block mb-1 font-medium text-sm text-[#1e2a16]">Filename</label>
                        <input
                            className="w-full px-3 py-2 border border-gray-200 rounded-md text-[#0c0e0a] focus:outline-none focus:ring-1 focus:ring-[#6aa329] focus:border-[#6aa329]"
                            value={fileData.filename}
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

function TestDirectiveComponent({ test }: { test: TestInfo }) {
    const [isExpanded, setIsExpanded] = useState(true);
    const [testData, setTestData] = useState(test);
    const isBuiltin = 'builtin' in test;

    const updateName = (value: string) => {
        setTestData({ ...testData, name: value });
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
                    Test: {testData.name}
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
                            value={testData.name}
                            onChange={(e) => updateName(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block mb-1 font-medium text-sm text-[#1e2a16]">
                            {isBuiltin ? 'Builtin Test Script' : 'Test Script'}
                        </label>
                        {isBuiltin ? (
                            <div className="px-3 py-2 border border-gray-200 bg-gray-50 rounded-md text-gray-500">
                                {(testData as BuiltinTest).builtin}
                            </div>
                        ) : (
                            <textarea
                                className="w-full px-3 py-2 border border-gray-200 rounded-md text-[#0c0e0a] focus:outline-none focus:ring-1 focus:ring-[#6aa329] focus:border-[#6aa329] min-h-[120px]"
                                value={(testData as ScriptTest).script}
                                onChange={(e) => setTestData({ ...testData, script: e.target.value })}
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

function DirectiveComponent({ directive }: { directive: Directive }) {
    if ('group' in directive) {
        return <GroupDirectiveComponent group={directive.group} />;
    } else if ('environment' in directive) {
        return <EnvironmentDirectiveComponent environment={directive.environment} />;
    } else if ('install' in directive) {
        return <InstallDirectiveComponent install={directive.install} />;
    } else if ('workdir' in directive) {
        return <WorkingDirectoryDirectiveComponent workdir={directive.workdir} />;
    } else if ('run' in directive) {
        return <RunCommandDirectiveComponent run={directive.run} />;
    } else if ('variables' in directive) {
        return <VariableDirectiveComponent variables={directive.variables} />;
    } else if ('template' in directive) {
        return <TemplateDirectiveComponent template={directive.template} />;
    } else if ('deploy' in directive) {
        return <DeployDirectiveComponent deploy={directive.deploy} />;
    } else if ('user' in directive) {
        return <UserDirectiveComponent user={directive.user} />;
    } else if ('copy' in directive) {
        return <CopyDirectiveComponent copy={directive.copy} />;
    } else if ('file' in directive) {
        return <FileDirectiveComponent file={directive.file} />;
    } else if ('test' in directive) {
        return <TestDirectiveComponent test={directive.test} />;
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

function NeuroDockerBuildRecipeComponent({ recipe }: { recipe: NeuroDockerBuildRecipe }) {
    const [baseImage, setBaseImage] = useState(recipe["base-image"]);
    const [pkgManager, setPkgManager] = useState(recipe["pkg-manager"]);
    const [directives, setDirectives] = useState(recipe.directives);

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
                            value={baseImage}
                            onChange={(e) => setBaseImage(e.target.value)}
                            placeholder="e.g. ubuntu:22.04"
                        />
                    </div>

                    <div>
                        <label className="block mb-2 font-medium text-[#1e2a16]">Package Manager</label>
                        <select
                            className="w-full px-3 py-2 border border-gray-200 rounded-md text-[#0c0e0a] bg-white focus:outline-none focus:ring-1 focus:ring-[#6aa329] focus:border-[#6aa329]"
                            value={pkgManager}
                            onChange={(e) => setPkgManager(e.target.value)}
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
                                defaultValue=""
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
                            <button className="px-4 py-2 bg-[#6aa329] text-white rounded-r-md hover:bg-[#4f7b38] focus:outline-none focus:ring-2 focus:ring-[#6aa329] focus:ring-offset-2">
                                Add
                            </button>
                        </div>
                    </div>

                    {directives.map((directive, index) => (
                        <DirectiveComponent key={index} directive={directive} />
                    ))}
                </div>
            </div>
        </div>
    );
}

type BuildRecipe = NeuroDockerBuildRecipe;

function BuildRecipeComponent({ recipe }: { recipe: BuildRecipe }) {
    if (recipe.kind === "neurodocker") {
        return <NeuroDockerBuildRecipeComponent recipe={recipe} />;
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

function ContainerHeader({ recipe }: { recipe: ContainerRecipe }) {
    const [name, setName] = useState(recipe.name);
    const [version, setVersion] = useState(recipe.version);
    const [architectures, setArchitectures] = useState(recipe.architectures);
    const [readme, setReadme] = useState(recipe.readme || "");
    const [readmeUrl, setReadmeUrl] = useState(recipe.readme_url || "");

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
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block mb-2 font-medium text-[#1e2a16]">Version</label>
                        <input
                            className="w-full px-3 py-2 border border-gray-200 rounded-md text-[#0c0e0a] focus:outline-none focus:ring-1 focus:ring-[#6aa329] focus:border-[#6aa329]"
                            value={version}
                            onChange={(e) => setVersion(e.target.value)}
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="block mb-2 font-medium text-[#1e2a16]">Architectures</label>
                        <div className="flex flex-wrap gap-3">
                            <label className="inline-flex items-center">
                                <input
                                    type="checkbox"
                                    className="rounded border-gray-300 text-[#6aa329] focus:ring-[#6aa329]"
                                    checked={architectures.includes("x86_64")}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setArchitectures([...architectures, "x86_64"]);
                                        } else {
                                            setArchitectures(architectures.filter(arch => arch !== "x86_64"));
                                        }
                                    }}
                                />
                                <span className="ml-2 text-[#0c0e0a]">x86_64</span>
                            </label>

                            <label className="inline-flex items-center">
                                <input
                                    type="checkbox"
                                    className="rounded border-gray-300 text-[#6aa329] focus:ring-[#6aa329]"
                                    checked={architectures.includes("aarch64")}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setArchitectures([...architectures, "aarch64"]);
                                        } else {
                                            setArchitectures(architectures.filter(arch => arch !== "aarch64"));
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
                            value={readme}
                            onChange={(e) => setReadme(e.target.value)}
                            placeholder="Path to readme file"
                        />
                    </div>

                    <div>
                        <label className="block mb-2 font-medium text-[#1e2a16]">Readme URL</label>
                        <input
                            className="w-full px-3 py-2 border border-gray-200 rounded-md text-[#0c0e0a] focus:outline-none focus:ring-1 focus:ring-[#6aa329] focus:border-[#6aa329]"
                            value={readmeUrl}
                            onChange={(e) => setReadmeUrl(e.target.value)}
                            placeholder="URL to readme file"
                        />
                    </div>
                </div>

                {recipe.copyright && (
                    <div className="mt-6">
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="font-medium text-[#1e2a16]">Copyright Information</h3>
                            <button className="text-sm text-[#4f7b38] hover:text-[#6aa329] flex items-center">
                                <PlusIcon className="h-4 w-4 mr-1" />
                                Add License
                            </button>
                        </div>

                        {recipe.copyright.map((info, index) => (
                            <div key={index} className="mb-4 last:mb-0 p-4 bg-[#f0f7e7] rounded-md">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block mb-1 text-sm font-medium text-[#1e2a16]">License</label>
                                        <input
                                            className="w-full px-3 py-2 border border-gray-200 rounded-md text-[#0c0e0a] focus:outline-none focus:ring-1 focus:ring-[#6aa329] focus:border-[#6aa329] bg-white"
                                            defaultValue={info.license}
                                            placeholder="SPDX License Identifier"
                                        />
                                    </div>

                                    <div>
                                        <label className="block mb-1 text-sm font-medium text-[#1e2a16]">URL</label>
                                        <input
                                            className="w-full px-3 py-2 border border-gray-200 rounded-md text-[#0c0e0a] focus:outline-none focus:ring-1 focus:ring-[#6aa329] focus:border-[#6aa329] bg-white"
                                            defaultValue={info.url}
                                            placeholder="License URL"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
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

function TestsComponent({ tests }: { tests: TestInfo[] }) {
    return (
        <div className="bg-white rounded-lg shadow-md border border-[#d3e7b6] mb-6">
            <div className="p-4 bg-[#f0f7e7] rounded-t-lg">
                <h2 className="text-xl font-semibold text-[#0c0e0a]">Tests</h2>
            </div>

            <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-medium text-[#1e2a16]">Test Definitions</h3>
                    <div className="flex">
                        <select
                            className="px-3 py-2 border border-[#6aa329] rounded-l-md text-[#0c0e0a] bg-white focus:outline-none focus:ring-1 focus:ring-[#6aa329]"
                            defaultValue=""
                        >
                            <option value="" disabled>Add test type...</option>
                            <option value="builtin">Builtin Test</option>
                            <option value="script">Script Test</option>
                        </select>
                        <button className="px-4 py-2 bg-[#6aa329] text-white rounded-r-md hover:bg-[#4f7b38] focus:outline-none focus:ring-2 focus:ring-[#6aa329] focus:ring-offset-2">
                            Add
                        </button>
                    </div>
                </div>

                {tests.map((test, index) => (
                    <div key={index}>
                        <TestDirectiveComponent test={test} />
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function Home() {
    const [yamlData, setYamlData] = useState<ContainerRecipe | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentStep, setCurrentStep] = useState(0);
    const [yamlText, setYamlText] = useState("");

    const totalSteps = 4; // Basic Info, Build, Deploy, Tests

    useEffect(() => {
        getDefaultYAML()
            .then((data) => {
                console.log("YAML data:", data);
                setYamlData(data);
                setYamlText(JSON.stringify(data, null, 2));
                setLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching YAML file:", error);
                setLoading(false);
            });
    }, []);

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
                            <div className="grid grid-cols-4 gap-2">
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

                                <div
                                    className={`p-3 rounded-md text-center ${currentStep === 2
                                            ? "bg-[#6aa329] text-white"
                                            : "bg-[#e6f1d6] text-[#1e2a16] hover:bg-[#d3e7b6] cursor-pointer"
                                        }`}
                                    onClick={() => setCurrentStep(2)}
                                >
                                    <div className="font-medium">Deployment</div>
                                    <div className="text-xs mt-1 opacity-80">Path & binaries</div>
                                </div>

                                <div
                                    className={`p-3 rounded-md text-center ${currentStep === 3
                                            ? "bg-[#6aa329] text-white"
                                            : "bg-[#e6f1d6] text-[#1e2a16] hover:bg-[#d3e7b6] cursor-pointer"
                                        }`}
                                    onClick={() => setCurrentStep(3)}
                                >
                                    <div className="font-medium">Tests</div>
                                    <div className="text-xs mt-1 opacity-80">Validation tests</div>
                                </div>
                            </div>
                        </div>

                        {/* Current Step Content */}
                        <div className="mb-6">
                            {currentStep === 0 && <ContainerHeader recipe={yamlData} />}

                            {currentStep === 1 && <BuildRecipeComponent recipe={yamlData.build} />}

                            {currentStep === 2 && (
                                <div className="bg-white rounded-lg shadow-md border border-[#d3e7b6] mb-6">
                                    <div className="p-4 bg-[#f0f7e7] rounded-t-lg">
                                        <h2 className="text-xl font-semibold text-[#0c0e0a]">Deployment Configuration</h2>
                                    </div>

                                    <div className="p-6">
                                        {yamlData.deploy ? (
                                            <DeployDirectiveComponent deploy={yamlData.deploy} />
                                        ) : (
                                            <div className="text-center py-6">
                                                <p className="text-[#1e2a16] mb-4">No deployment configuration defined</p>
                                                <button className="px-4 py-2 bg-[#6aa329] text-white rounded-md hover:bg-[#4f7b38]">
                                                    Add Deployment Configuration
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {currentStep === 3 && <TestsComponent tests={yamlData.tests || []} />}
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
                                ></textarea>
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
