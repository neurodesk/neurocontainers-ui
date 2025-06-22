import { Architecture } from "@/components/common";
import { textStyles, cn } from "@/lib/styles";
import { useTheme } from "@/lib/ThemeContext";

interface ArchitectureSelectorProps {
    selectedArchitectures: Architecture[];
    onChange: (architectures: Architecture[]) => void;
    error?: string | null;
    showValidation?: boolean;
}

export default function ArchitectureSelector({
    selectedArchitectures,
    onChange,
    error,
    showValidation = false,
}: ArchitectureSelectorProps) {
    const { isDark } = useTheme();
    const handleArchitectureToggle = (arch: Architecture, checked: boolean) => {
        if (checked) {
            onChange([...selectedArchitectures, arch]);
        } else {
            onChange(selectedArchitectures.filter((a) => a !== arch));
        }
    };

    return (
        <>
            <div className="flex flex-wrap gap-4">
                <label
                    className={cn(
                        "inline-flex items-center p-4 rounded-lg border cursor-pointer transition-all",
                        selectedArchitectures.includes("x86_64")
                            ? (isDark
                                ? "bg-[#1f2e18] border-[#7bb33a] shadow-sm"
                                : "bg-[#f0f7e7] border-[#6aa329] shadow-sm")
                            : (isDark
                                ? "bg-[#2d4222] border-[#374151] hover:bg-[#2d3748] hover:border-[#4a5568]"
                                : "bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-gray-300")
                    )}
                >
                    <input
                        type="checkbox"
                        className={cn(
                            "rounded",
                            isDark
                                ? "border-[#374151] text-[#7bb33a] focus:ring-[#7bb33a] bg-[#161a0e]"
                                : "border-gray-300 text-[#6aa329] focus:ring-[#6aa329]"
                        )}
                        checked={selectedArchitectures.includes("x86_64")}
                        onChange={(e) =>
                            handleArchitectureToggle("x86_64", e.target.checked)
                        }
                    />
                    <div className="ml-3">
                        <div className="flex items-center gap-2">
                            <span className={textStyles(isDark, { weight: 'medium', color: 'primary' })}>x86_64</span>
                            <span className={cn(
                                textStyles(isDark, { size: 'xs' }),
                                "px-2 py-1 rounded-full",
                                isDark ? "bg-blue-900/30 text-blue-400" : "bg-blue-100 text-blue-800"
                            )}>
                                Most Common
                            </span>
                        </div>
                        <p className={cn(textStyles(isDark, { size: 'sm', color: 'muted' }), "mt-1")}>Intel/AMD processors</p>
                        <p className={textStyles(isDark, { size: 'xs', color: 'muted' })}>Desktop, laptop, most cloud servers</p>
                    </div>
                </label>

                <label
                    className={cn(
                        "inline-flex items-center p-4 rounded-lg border cursor-pointer transition-all",
                        selectedArchitectures.includes("aarch64")
                            ? (isDark
                                ? "bg-[#1f2e18] border-[#7bb33a] shadow-sm"
                                : "bg-[#f0f7e7] border-[#6aa329] shadow-sm")
                            : (isDark
                                ? "bg-[#2d4222] border-[#374151] hover:bg-[#2d3748] hover:border-[#4a5568]"
                                : "bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-gray-300")
                    )}
                >
                    <input
                        type="checkbox"
                        className={cn(
                            "rounded",
                            isDark
                                ? "border-[#374151] text-[#7bb33a] focus:ring-[#7bb33a] bg-[#161a0e]"
                                : "border-gray-300 text-[#6aa329] focus:ring-[#6aa329]"
                        )}
                        checked={selectedArchitectures.includes("aarch64")}
                        onChange={(e) =>
                            handleArchitectureToggle("aarch64", e.target.checked)
                        }
                    />
                    <div className="ml-3">
                        <div className="flex items-center gap-2">
                            <span className={textStyles(isDark, { weight: 'medium', color: 'primary' })}>aarch64</span>
                            <span className={cn(
                                textStyles(isDark, { size: 'xs' }),
                                "px-2 py-1 rounded-full",
                                isDark ? "bg-green-900/30 text-green-400" : "bg-green-100 text-green-800"
                            )}>
                                Growing
                            </span>
                        </div>
                        <p className={cn(textStyles(isDark, { size: 'sm', color: 'muted' }), "mt-1")}>ARM 64-bit processors</p>
                        <p className={textStyles(isDark, { size: 'xs', color: 'muted' })}>
                            Apple Silicon, AWS Graviton, Raspberry Pi
                        </p>
                    </div>
                </label>
            </div>

            {showValidation && error && (
                <div className={cn(
                    "mt-3 p-3 border rounded-md",
                    textStyles(isDark, { size: 'sm' }),
                    isDark
                        ? "bg-red-900/20 border-red-700 text-red-400"
                        : "bg-red-50 border-red-200 text-red-800"
                )}>
                    <p className={textStyles(isDark, { weight: 'medium' })}>No architectures selected</p>
                    <p>Please select at least one target architecture for your container.</p>
                </div>
            )}
        </>
    );
}