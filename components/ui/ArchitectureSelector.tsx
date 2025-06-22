import { Architecture } from "@/components/common";
import { textStyles, cn } from "@/lib/styles";

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
                    className={`inline-flex items-center p-4 rounded-lg border cursor-pointer transition-all ${
                        selectedArchitectures.includes("x86_64")
                            ? "bg-[#f0f7e7] border-[#6aa329] shadow-sm"
                            : "bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-gray-300"
                    }`}
                >
                    <input
                        type="checkbox"
                        className="rounded border-gray-300 text-[#6aa329] focus:ring-[#6aa329]"
                        checked={selectedArchitectures.includes("x86_64")}
                        onChange={(e) =>
                            handleArchitectureToggle("x86_64", e.target.checked)
                        }
                    />
                    <div className="ml-3">
                        <div className="flex items-center gap-2">
                            <span className={textStyles({ weight: 'medium', color: 'primary' })}>x86_64</span>
                            <span className={cn(textStyles({ size: 'xs' }), "px-2 py-1 bg-blue-100 text-blue-800 rounded-full")}>
                                Most Common
                            </span>
                        </div>
                        <p className={cn(textStyles({ size: 'sm', color: 'muted' }), "mt-1")}>Intel/AMD processors</p>
                        <p className={textStyles({ size: 'xs', color: 'muted' })}>Desktop, laptop, most cloud servers</p>
                    </div>
                </label>

                <label
                    className={`inline-flex items-center p-4 rounded-lg border cursor-pointer transition-all ${
                        selectedArchitectures.includes("aarch64")
                            ? "bg-[#f0f7e7] border-[#6aa329] shadow-sm"
                            : "bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-gray-300"
                    }`}
                >
                    <input
                        type="checkbox"
                        className="rounded border-gray-300 text-[#6aa329] focus:ring-[#6aa329]"
                        checked={selectedArchitectures.includes("aarch64")}
                        onChange={(e) =>
                            handleArchitectureToggle("aarch64", e.target.checked)
                        }
                    />
                    <div className="ml-3">
                        <div className="flex items-center gap-2">
                            <span className={textStyles({ weight: 'medium', color: 'primary' })}>aarch64</span>
                            <span className={cn(textStyles({ size: 'xs' }), "px-2 py-1 bg-green-100 text-green-800 rounded-full")}>
                                Growing
                            </span>
                        </div>
                        <p className={cn(textStyles({ size: 'sm', color: 'muted' }), "mt-1")}>ARM 64-bit processors</p>
                        <p className={textStyles({ size: 'xs', color: 'muted' })}>
                            Apple Silicon, AWS Graviton, Raspberry Pi
                        </p>
                    </div>
                </label>
            </div>

            {showValidation && error && (
                <div className={cn("mt-3 p-3 bg-red-50 border border-red-200 rounded-md", textStyles({ size: 'sm' }), "text-red-800")}>
                    <p className={textStyles({ weight: 'medium' })}>No architectures selected</p>
                    <p>Please select at least one target architecture for your container.</p>
                </div>
            )}
        </>
    );
}