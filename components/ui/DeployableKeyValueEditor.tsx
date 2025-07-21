import { TrashIcon, PlusIcon } from "@heroicons/react/24/outline";
import { Input } from "./FormField";
import { iconStyles, textStyles, buttonStyles, cardStyles, cn } from "@/lib/styles";
import { useTheme } from "@/lib/ThemeContext";

interface DeployableKeyValueEditorProps {
    data: { [key: string]: string };
    onChange: (data: { [key: string]: string }) => void;
    keyLabel?: string;
    valueLabel?: string;
    keyPlaceholder?: string;
    valuePlaceholder?: string;
    addButtonText?: string;
    emptyMessage?: string;
    monospace?: boolean;
}

export default function DeployableKeyValueEditor({
    data,
    onChange,
    keyLabel = "Key",
    valueLabel = "Value",
    keyPlaceholder = "",
    valuePlaceholder = "",
    addButtonText = "Add Item",
    emptyMessage,
    monospace = false,
}: DeployableKeyValueEditorProps) {
    const { isDark } = useTheme();

    const addItem = () => {
        onChange({ ...data, "": "" });
    };

    const updateKey = (oldKey: string, newKey: string) => {
        const updated = { ...data };
        const value = updated[oldKey];
        delete updated[oldKey];
        updated[newKey] = value;
        onChange(updated);
    };

    const updateValue = (key: string, value: string) => {
        onChange({ ...data, [key]: value });
    };

    const removeItem = (key: string) => {
        const updated = { ...data };
        delete updated[key];
        onChange(updated);
    };

    const toggleDeploy = (key: string) => {
        const updated = { ...data };
        const value = updated[key];
        
        if (key.startsWith('DEPLOY_ENV_')) {
            // Remove DEPLOY_ENV_ prefix
            const newKey = key.replace(/^DEPLOY_ENV_/, '');
            delete updated[key];
            updated[newKey] = value;
        } else {
            // Add DEPLOY_ENV_ prefix
            const newKey = `DEPLOY_ENV_${key}`;
            delete updated[key];
            updated[newKey] = value;
        }
        
        onChange(updated);
    };

    const getDisplayKey = (key: string) => {
        return key.startsWith('DEPLOY_ENV_') ? key.replace(/^DEPLOY_ENV_/, '') : key;
    };

    const isDeployVariable = (key: string) => {
        return key.startsWith('DEPLOY_ENV_');
    };

    const entries = Object.entries(data);

    if (entries.length === 0 && emptyMessage) {
        return (
            <div>
                <div className={cn(cardStyles(isDark, 'default', 'md'), "mb-3")}>
                    <p className={cn(textStyles(isDark, { size: 'sm', color: 'muted' }), "text-center")}>
                        {emptyMessage}
                    </p>
                </div>
                <button
                    className={cn(
                        buttonStyles(isDark, 'ghost', 'sm'),
                        "flex items-center gap-1 px-0"
                    )}
                    onClick={addItem}
                >
                    <PlusIcon className={iconStyles(isDark, 'sm')} />
                    {addButtonText}
                </button>
            </div>
        );
    }

    return (
        <div>
            {entries.length > 0 && (
                <div className="mb-3">
                    <div className={cn("flex gap-2 mb-2", textStyles(isDark, { size: 'sm', weight: 'medium', color: 'primary' }))}>
                        <div className="flex-1">{keyLabel}</div>
                        <div className="flex-1">{valueLabel}</div>
                        <div className="w-20 text-center">Deploy</div>
                        <div className="w-8"></div>
                    </div>

                    {entries.map(([key, value], index) => (
                        <div key={index} className="flex gap-2 mb-2 items-center">
                            <div className="flex-1 flex items-center gap-1">
                                {isDeployVariable(key) && (
                                    <span className={cn(
                                        "text-xs px-1.5 py-0.5 rounded font-mono",
                                        isDark 
                                            ? "bg-blue-900 text-blue-200 border border-blue-700"
                                            : "bg-blue-50 text-blue-700 border border-blue-200"
                                    )}>
                                        DEPLOY_ENV_
                                    </span>
                                )}
                                <Input
                                    className="flex-1"
                                    value={getDisplayKey(key)}
                                    onChange={(e) => {
                                        const newDisplayKey = e.target.value;
                                        const newKey = isDeployVariable(key) ? `DEPLOY_ENV_${newDisplayKey}` : newDisplayKey;
                                        updateKey(key, newKey);
                                    }}
                                    placeholder={keyPlaceholder}
                                    monospace={monospace}
                                />
                            </div>
                            <Input
                                className="flex-1"
                                value={value}
                                onChange={(e) => updateValue(key, e.target.value)}
                                placeholder={valuePlaceholder}
                                monospace={monospace}
                            />
                            <div className="w-20 flex justify-center">
                                <input
                                    type="checkbox"
                                    checked={isDeployVariable(key)}
                                    onChange={() => toggleDeploy(key)}
                                    className={cn(
                                        "rounded border-2 focus:ring-2",
                                        isDark
                                            ? "bg-gray-700 border-gray-600 text-blue-500 focus:ring-blue-500"
                                            : "bg-white border-gray-300 text-blue-600 focus:ring-blue-500"
                                    )}
                                    title="Export this variable for module usage"
                                />
                            </div>
                            <button
                                className={cn(
                                    "w-8 h-8 flex justify-center items-center transition-colors rounded",
                                    isDark
                                        ? "text-[#9ca3af] hover:text-[#7bb33a] hover:bg-[#2d4222]"
                                        : "text-gray-400 hover:text-[#6aa329] hover:bg-gray-50"
                                )}
                                onClick={() => removeItem(key)}
                                title="Remove item"
                            >
                                <TrashIcon className={iconStyles(isDark, 'sm')} />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <button
                className={cn(
                    buttonStyles(isDark, 'ghost', 'sm'),
                    "flex items-center gap-1 px-0"
                )}
                onClick={addItem}
            >
                <PlusIcon className={iconStyles(isDark, 'sm')} />
                {addButtonText}
            </button>
        </div>
    );
}