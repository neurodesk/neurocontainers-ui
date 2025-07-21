import { TrashIcon, PlusIcon } from "@heroicons/react/24/outline";
import { Input, FormField } from "@/components/ui";
import { iconStyles, textStyles, buttonStyles, cardStyles, cn } from "@/lib/styles";
import { useTheme } from "@/lib/ThemeContext";

interface DeployEnvEditorProps {
    data: { [key: string]: string };
    onChange: (data: { [key: string]: string }) => void;
}

interface EnvVariable {
    key: string;
    value: string;
    isDeploy: boolean;
}

export default function DeployEnvEditor({
    data,
    onChange,
}: DeployEnvEditorProps) {
    const { isDark } = useTheme();

    // Convert data to unified list of variables
    const variables: EnvVariable[] = Object.entries(data).map(([key, value]) => ({
        key: key.startsWith('DEPLOY_ENV_') ? key.replace('DEPLOY_ENV_', '') : key,
        value,
        isDeploy: key.startsWith('DEPLOY_ENV_')
    }));

    const addVariable = () => {
        const updated = { ...data, '': '' };
        onChange(updated);
    };

    const updateVariable = (index: number, updates: Partial<EnvVariable>) => {
        const variable = variables[index];
        const oldFullKey = variable.isDeploy ? `DEPLOY_ENV_${variable.key}` : variable.key;
        
        const newKey = updates.key !== undefined ? updates.key : variable.key;
        const newValue = updates.value !== undefined ? updates.value : variable.value;
        const newIsDeploy = updates.isDeploy !== undefined ? updates.isDeploy : variable.isDeploy;
        
        const newFullKey = newIsDeploy ? `DEPLOY_ENV_${newKey}` : newKey;
        
        const updated = { ...data };
        delete updated[oldFullKey];
        updated[newFullKey] = newValue;
        onChange(updated);
    };

    const removeVariable = (index: number) => {
        const variable = variables[index];
        const fullKey = variable.isDeploy ? `DEPLOY_ENV_${variable.key}` : variable.key;
        
        const updated = { ...data };
        delete updated[fullKey];
        onChange(updated);
    };

    return (
        <FormField
            label="Environment Variables"
            description="Environment variables for the container. Check 'Deploy' to export variables for module usage (adds DEPLOY_ENV_ prefix)."
        >
            <div className={cn(cardStyles(isDark, 'default', 'md'), "p-4")}>
                {variables.length === 0 ? (
                    <div>
                        <p className={cn(textStyles(isDark, { size: 'sm', color: 'muted' }), "text-center mb-3")}>
                            No environment variables set.
                        </p>
                        <button
                            className={cn(
                                buttonStyles(isDark, 'ghost', 'sm'),
                                "flex items-center gap-1 px-0"
                            )}
                            onClick={addVariable}
                        >
                            <PlusIcon className={iconStyles(isDark, 'sm')} />
                            Add Environment Variable
                        </button>
                    </div>
                ) : (
                    <div>
                        <div className={cn("grid grid-cols-12 gap-2 mb-3 items-center", textStyles(isDark, { size: 'sm', weight: 'medium', color: 'primary' }))}>
                            <div className="col-span-1 text-center">Deploy</div>
                            <div className="col-span-5">Variable Name</div>
                            <div className="col-span-5">Value</div>
                            <div className="col-span-1"></div>
                        </div>

                        {variables.map((variable, index) => (
                            <div key={index} className="grid grid-cols-12 gap-2 mb-2 items-center">
                                <div className="col-span-1 flex justify-center">
                                    <input
                                        type="checkbox"
                                        checked={variable.isDeploy}
                                        onChange={(e) => updateVariable(index, { isDeploy: e.target.checked })}
                                        className={cn(
                                            "h-4 w-4 rounded",
                                            isDark
                                                ? "text-[#7bb33a] border-[#374151] focus:ring-[#7bb33a] bg-[#161a0e]"
                                                : "text-[#6aa329] border-gray-300 focus:ring-[#6aa329]"
                                        )}
                                        title="Export as deploy environment variable"
                                    />
                                </div>
                                <div className="col-span-5">
                                    {variable.isDeploy ? (
                                        <div className="flex">
                                            <div className={cn(
                                                "px-3 py-2 bg-gray-100 dark:bg-gray-800 border border-r-0 rounded-l border-gray-300 dark:border-gray-600 flex items-center",
                                                textStyles(isDark, { size: 'sm', color: 'muted' })
                                            )}>
                                                DEPLOY_ENV_
                                            </div>
                                            <Input
                                                className="flex-1 rounded-l-none"
                                                value={variable.key}
                                                onChange={(e) => updateVariable(index, { key: e.target.value })}
                                                placeholder="VARIABLE_NAME"
                                                monospace
                                            />
                                        </div>
                                    ) : (
                                        <Input
                                            value={variable.key}
                                            onChange={(e) => updateVariable(index, { key: e.target.value })}
                                            placeholder="VARIABLE_NAME"
                                            monospace
                                        />
                                    )}
                                </div>
                                <div className="col-span-5">
                                    <Input
                                        value={variable.value}
                                        onChange={(e) => updateVariable(index, { value: e.target.value })}
                                        placeholder="value"
                                        monospace
                                    />
                                </div>
                                <div className="col-span-1 flex justify-center">
                                    <button
                                        className={cn(
                                            "w-8 h-8 flex justify-center items-center transition-colors rounded",
                                            isDark
                                                ? "text-[#9ca3af] hover:text-[#7bb33a] hover:bg-[#2d4222]"
                                                : "text-gray-400 hover:text-[#6aa329] hover:bg-gray-50"
                                        )}
                                        onClick={() => removeVariable(index)}
                                        title="Remove environment variable"
                                    >
                                        <TrashIcon className={iconStyles(isDark, 'sm')} />
                                    </button>
                                </div>
                            </div>
                        ))}

                        <button
                            className={cn(
                                buttonStyles(isDark, 'ghost', 'sm'),
                                "flex items-center gap-1 px-0 mt-3"
                            )}
                            onClick={addVariable}
                        >
                            <PlusIcon className={iconStyles(isDark, 'sm')} />
                            Add Environment Variable
                        </button>
                    </div>
                )}
            </div>
        </FormField>
    );
}