import { TrashIcon, PlusIcon } from "@heroicons/react/24/outline";
import { Input, FormField } from "@/components/ui";
import { iconStyles, textStyles, buttonStyles, cardStyles, cn } from "@/lib/styles";
import { useTheme } from "@/lib/ThemeContext";

interface DeployEnvEditorProps {
    data: { [key: string]: string };
    onChange: (data: { [key: string]: string }) => void;
}

export default function DeployEnvEditor({
    data,
    onChange,
}: DeployEnvEditorProps) {
    const { isDark } = useTheme();

    // Extract DEPLOY_ENV_ variables and regular variables
    const deployEnvVars: { [key: string]: string } = {};
    const regularVars: { [key: string]: string } = {};

    Object.entries(data).forEach(([key, value]) => {
        if (key.startsWith('DEPLOY_ENV_')) {
            deployEnvVars[key] = value;
        } else {
            regularVars[key] = value;
        }
    });

    const addDeployEnvVar = () => {
        const newKey = 'DEPLOY_ENV_';
        onChange({ ...data, [newKey]: '' });
    };

    const updateDeployEnvKey = (oldKey: string, newKey: string) => {
        // Ensure the new key has the DEPLOY_ENV_ prefix
        const prefixedKey = newKey.startsWith('DEPLOY_ENV_') ? newKey : `DEPLOY_ENV_${newKey}`;
        
        const updated = { ...data };
        const value = updated[oldKey];
        delete updated[oldKey];
        updated[prefixedKey] = value;
        onChange(updated);
    };

    const updateDeployEnvValue = (key: string, value: string) => {
        onChange({ ...data, [key]: value });
    };

    const removeDeployEnvVar = (key: string) => {
        const updated = { ...data };
        delete updated[key];
        onChange(updated);
    };

    const updateRegularVar = (updates: { [key: string]: string }) => {
        // Merge regular variables with deploy env variables
        const allDeployEnvVars: { [key: string]: string } = {};
        Object.entries(data).forEach(([key, value]) => {
            if (key.startsWith('DEPLOY_ENV_')) {
                allDeployEnvVars[key] = value;
            }
        });
        onChange({ ...allDeployEnvVars, ...updates });
    };

    const deployEnvEntries = Object.entries(deployEnvVars);

    return (
        <div className="space-y-6">
            {/* Deploy Environment Variables Section */}
            <FormField
                label="Deploy Environment Variables"
                description="Environment variables exported by neurocommand for module usage (automatically prefixed with DEPLOY_ENV_)"
            >
                <div className={cn(cardStyles(isDark, 'default', 'md'), "p-4")}>
                    {deployEnvEntries.length === 0 ? (
                        <div>
                            <p className={cn(textStyles(isDark, { size: 'sm', color: 'muted' }), "text-center mb-3")}>
                                No deploy environment variables set.
                            </p>
                            <button
                                className={cn(
                                    buttonStyles(isDark, 'ghost', 'sm'),
                                    "flex items-center gap-1 px-0"
                                )}
                                onClick={addDeployEnvVar}
                            >
                                <PlusIcon className={iconStyles(isDark, 'sm')} />
                                Add Deploy Environment Variable
                            </button>
                        </div>
                    ) : (
                        <div>
                            <div className={cn("flex gap-2 mb-2", textStyles(isDark, { size: 'sm', weight: 'medium', color: 'primary' }))}>
                                <div className="flex-1">Variable Name (after DEPLOY_ENV_)</div>
                                <div className="flex-1">Value</div>
                                <div className="w-8"></div>
                            </div>

                            {deployEnvEntries.map(([key, value], index) => {
                                const displayKey = key.replace('DEPLOY_ENV_', '');
                                return (
                                    <div key={index} className="flex gap-2 mb-2">
                                        <div className="flex-1 flex">
                                            <div className={cn(
                                                "px-3 py-2 bg-gray-100 dark:bg-gray-800 border border-r-0 rounded-l border-gray-300 dark:border-gray-600 flex items-center",
                                                textStyles(isDark, { size: 'sm', color: 'muted' })
                                            )}>
                                                DEPLOY_ENV_
                                            </div>
                                            <Input
                                                className="flex-1 rounded-l-none"
                                                value={displayKey}
                                                onChange={(e) => updateDeployEnvKey(key, e.target.value)}
                                                placeholder="VARIABLE_NAME"
                                                monospace
                                            />
                                        </div>
                                        <Input
                                            className="flex-1"
                                            value={value}
                                            onChange={(e) => updateDeployEnvValue(key, e.target.value)}
                                            placeholder="value"
                                            monospace
                                        />
                                        <button
                                            className={cn(
                                                "w-8 h-8 flex justify-center items-center transition-colors rounded",
                                                isDark
                                                    ? "text-[#9ca3af] hover:text-[#7bb33a] hover:bg-[#2d4222]"
                                                    : "text-gray-400 hover:text-[#6aa329] hover:bg-gray-50"
                                            )}
                                            onClick={() => removeDeployEnvVar(key)}
                                            title="Remove deploy environment variable"
                                        >
                                            <TrashIcon className={iconStyles(isDark, 'sm')} />
                                        </button>
                                    </div>
                                );
                            })}

                            <button
                                className={cn(
                                    buttonStyles(isDark, 'ghost', 'sm'),
                                    "flex items-center gap-1 px-0 mt-2"
                                )}
                                onClick={addDeployEnvVar}
                            >
                                <PlusIcon className={iconStyles(isDark, 'sm')} />
                                Add Deploy Environment Variable
                            </button>
                        </div>
                    )}
                </div>
            </FormField>

            {/* Regular Environment Variables Section */}
            <FormField
                label="Standard Environment Variables"
                description="Regular environment variables available within the container"
            >
                <KeyValueEditor
                    data={regularVars}
                    onChange={updateRegularVar}
                    keyLabel="Key"
                    valueLabel="Value"
                    keyPlaceholder="VARIABLE_NAME"
                    valuePlaceholder="value"
                    addButtonText="Add Environment Variable"
                    emptyMessage="No environment variables set."
                    monospace
                />
            </FormField>
        </div>
    );
}