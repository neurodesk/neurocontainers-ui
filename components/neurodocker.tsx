import { TrashIcon } from "@heroicons/react/outline";
import { NeuroDockerBuildRecipe, Directive } from "@/components/common";
import DirectiveComponent from "@/components/directives/factory";
import AddDirectiveButton from "@/components/add";

export default function NeuroDockerBuildRecipeComponent({
    recipe,
    onChange,
}: {
    recipe: NeuroDockerBuildRecipe;
    onChange: (recipe: NeuroDockerBuildRecipe) => void;
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

    const addDirective = (directive: Directive) => {
        onChange({ ...recipe, directives: [...recipe.directives, directive] });
    };

    const removeDirective = (index: number) => {
        onChange({
            ...recipe,
            directives: recipe.directives.filter((_, i) => i !== index),
        });
    };

    return (
        <div className="bg-white rounded-lg shadow-md border border-[#d3e7b6]">
            <div className="p-4 bg-[#f0f7e7] rounded-t-lg">
                <h2 className="text-xl font-semibold text-[#0c0e0a]">
                    NeuroDocker Build Recipe
                </h2>
            </div>

            <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <label className="block mb-2 font-medium text-[#1e2a16]">
                            Base Image
                        </label>
                        <input
                            className="w-full px-3 py-2 border border-gray-200 rounded-md text-[#0c0e0a] focus:outline-none focus:ring-1 focus:ring-[#6aa329] focus:border-[#6aa329]"
                            value={recipe["base-image"]}
                            onChange={(e) => updateBaseImage(e.target.value)}
                            placeholder="e.g. ubuntu:22.04"
                        />
                    </div>

                    <div>
                        <label className="block mb-2 font-medium text-[#1e2a16]">
                            Package Manager
                        </label>
                        <select
                            className="w-full px-3 py-2 border border-gray-200 rounded-md text-[#0c0e0a] bg-white focus:outline-none focus:ring-1 focus:ring-[#6aa329] focus:border-[#6aa329]"
                            value={recipe["pkg-manager"]}
                            onChange={(e) => updatePkgManager(e.target.value)}
                        >
                            <option value="apt">apt</option>
                            <option value="yum">yum</option>
                        </select>
                    </div>
                </div>

                <div className="mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium text-[#0c0e0a]">Directives</h3>
                        <AddDirectiveButton onAddDirective={addDirective} />
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
