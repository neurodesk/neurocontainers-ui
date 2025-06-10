interface ToggleOption {
    value: string;
    label: string;
}

interface ToggleButtonGroupProps {
    options: ToggleOption[];
    value: string;
    onChange: (value: string) => void;
    className?: string;
}

export default function ToggleButtonGroup({
    options,
    value,
    onChange,
    className = ""
}: ToggleButtonGroupProps) {
    return (
        <div className={`inline-flex p-1 bg-gray-100 rounded-md ${className}`}>
            {options.map((option) => (
                <button
                    key={option.value}
                    type="button"
                    onClick={() => onChange(option.value)}
                    className={`px-4 py-2 text-sm rounded-md transition-colors ${
                        value === option.value
                            ? "bg-white shadow-sm text-[#4f7b38] font-medium"
                            : "text-gray-600 hover:text-[#4f7b38]"
                    }`}
                >
                    {option.label}
                </button>
            ))}
        </div>
    );
}