import { TrashIcon } from "@heroicons/react/outline";
import { useState } from "react";
import { NeuroDockerBuildRecipe, Directive } from "@/components/common";
import DirectiveComponent from "@/components/directives/factory";

export default function NeuroDockerBuildRecipeComponent({
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