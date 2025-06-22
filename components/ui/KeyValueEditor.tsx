import { TrashIcon, PlusIcon } from "@heroicons/react/24/outline";
import { Input } from "./FormField";
import { iconStyles, textStyles, cn } from "@/lib/styles";

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
                <div className="mb-4 p-4 bg-gray-50 rounded-md border border-gray-200">
                    <p className={cn(textStyles({ size: 'sm', color: 'muted' }), "text-center")}>
                        {emptyMessage}
                    </p>
                </div>
                <button
                    className={cn("flex items-center", textStyles({ size: 'sm', color: 'secondary' }), "hover:text-[#6aa329]")}
                    onClick={addItem}
                >
                    <PlusIcon className={cn(iconStyles('sm'), "mr-1")} />
                    {addButtonText}
                </button>
            </div>
        );
    }

    return (
        <div>
            {entries.length > 0 && (
                <div className="mb-4">
                    <div className={cn("grid grid-cols-12 gap-2 mb-2", textStyles({ size: 'sm', weight: 'medium', color: 'primary' }))}>
                        <div className="col-span-5">{keyLabel}</div>
                        <div className="col-span-6">{valueLabel}</div>
                        <div className="col-span-1"></div>
                    </div>

                    {entries.map(([key, value], index) => (
                        <div key={index} className="grid grid-cols-12 gap-2 mb-2">
                            <Input
                                className="col-span-5"
                                value={key}
                                onChange={(e) => updateKey(key, e.target.value)}
                                placeholder={keyPlaceholder}
                                monospace={monospace}
                            />
                            <Input
                                className="col-span-6"
                                value={value}
                                onChange={(e) => updateValue(key, e.target.value)}
                                placeholder={valuePlaceholder}
                                monospace={monospace}
                            />
                            <button
                                className="col-span-1 flex justify-center items-center text-gray-400 hover:text-[#6aa329]"
                                onClick={() => removeItem(key)}
                            >
                                <TrashIcon className={iconStyles('md')} />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <button
                className={cn("flex items-center", textStyles({ size: 'sm', color: 'secondary' }), "hover:text-[#6aa329]")}
                onClick={addItem}
            >
                <PlusIcon className={cn(iconStyles('sm'), "mr-1")} />
                {addButtonText}
            </button>
        </div>
    );
}