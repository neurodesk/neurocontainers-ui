import { FormField, Input } from "./FormField";

interface BasicInfoSectionProps {
    name: string;
    version: string;
    onNameChange: (name: string) => void;
    onVersionChange: (version: string) => void;
    nameError?: string | null;
    versionError?: string | null;
    showValidation?: boolean;
    onNameEditStart?: () => void;
    onNameEditFinish?: () => void;
}

export default function BasicInfoSection({
    name,
    version,
    onNameChange,
    onVersionChange,
    nameError,
    versionError,
    showValidation = false,
    onNameEditStart,
    onNameEditFinish,
}: BasicInfoSectionProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <FormField
                label="Container Name *"
                description={
                    showValidation && nameError
                        ? nameError
                        : "A unique identifier for your container"
                }
            >
                <Input
                    value={name}
                    onChange={(e) => onNameChange(e.target.value)}
                    onFocus={() => onNameEditStart?.()}
                    onBlur={() => onNameEditFinish?.()}
                    placeholder="e.g., fsl"
                    className={
                        showValidation && nameError
                            ? "border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50"
                            : ""
                    }
                />
            </FormField>

            <FormField
                label="Version *"
                description={
                    showValidation && versionError
                        ? versionError
                        : "Semantic version number (recommended)"
                }
            >
                <Input
                    value={version}
                    onChange={(e) => onVersionChange(e.target.value)}
                    placeholder="e.g., 1.0.0"
                    className={
                        showValidation && versionError
                            ? "border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50"
                            : ""
                    }
                />
            </FormField>
        </div>
    );
}