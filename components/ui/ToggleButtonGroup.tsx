import { textStyles, cn } from "@/lib/styles";
import { useTheme } from "@/lib/ThemeContext";

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
    const { isDark } = useTheme();
    return (
        <div className={cn(
            "inline-flex p-1 rounded-md",
            isDark ? "bg-[#2d4222]" : "bg-gray-100",
            className
        )}>
            {options.map((option) => (
                <button
                    key={option.value}
                    type="button"
                    onClick={() => onChange(option.value)}
                    className={cn(
                        "px-4 py-2 rounded-md transition-colors",
                        textStyles(isDark, { size: 'sm' }),
                        value === option.value
                            ? (isDark
                                ? "bg-[#161a0e] shadow-sm text-[#91c84a] font-medium"
                                : "bg-white shadow-sm text-[#4f7b38] font-medium")
                            : (isDark
                                ? "text-[#d1d5db] hover:text-[#91c84a]"
                                : "text-gray-600 hover:text-[#4f7b38]")
                    )}
                >
                    {option.label}
                </button>
            ))}
        </div>
    );
}