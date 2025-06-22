import { TrashIcon, PlusIcon } from "@heroicons/react/24/outline";
import { Input } from "./FormField";
import { iconStyles, textStyles, buttonStyles, cardStyles, cn } from "@/lib/styles";
import { useTheme } from "@/lib/ThemeContext";

interface KeyValueEditorProps {
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

export default function KeyValueEditor({
    data,
    onChange,
    keyLabel = "Key",
    valueLabel = "Value",
    keyPlaceholder = "",
    valuePlaceholder = "",
    addButtonText = "Add Item",
    emptyMessage,
    monospace = false,
}: KeyValueEditorProps) {
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
                        <div className="w-8"></div>
                    </div>

                    {entries.map(([key, value], index) => (
                        <div key={index} className="flex gap-2 mb-2">
                            <Input
                                className="flex-1"
                                value={key}
                                onChange={(e) => updateKey(key, e.target.value)}
                                placeholder={keyPlaceholder}
                                monospace={monospace}
                            />
                            <Input
                                className="flex-1"
                                value={value}
                                onChange={(e) => updateValue(key, e.target.value)}
                                placeholder={valuePlaceholder}
                                monospace={monospace}
                            />
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