import { DirectiveContainer, FormField, Select } from "@/components/ui";
import { DirectiveControllers } from "@/components/ui/DirectiveContainer";
import { IncludeMacro, IncludeMacros } from "@/components/common";
import { DocumentArrowDownIcon } from "@heroicons/react/24/outline";
import { registerDirective, DirectiveMetadata } from "./registry";
import { HELP_SECTION } from "@/lib/styles";

export default function IncludeDirectiveComponent({
    include,
    onChange,
    condition,
    onConditionChange,
    headerColor,
    borderColor,
    iconColor,
    icon,
    controllers,
}: {
    include: IncludeMacro,
    onChange: (include: IncludeMacro) => void,
    condition?: string;
    onConditionChange?: (condition: string | undefined) => void;
    headerColor?: string;
    borderColor?: string;
    iconColor?: string;
    icon?: React.ComponentType<{ className?: string }>;
    controllers: DirectiveControllers;
}) {
    const helpContent = (
        <div className={HELP_SECTION.container}>
            <h3 className={HELP_SECTION.title}>
                INCLUDE Directive
            </h3>
            <div className={HELP_SECTION.text}>
                <p>
                    The INCLUDE directive allows you to include predefined macros or templates in your container build.
                </p>
                <div>
                    <strong>Available Macros:</strong>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                        {Object.entries(IncludeMacros).map(([key, value]) => (
                            <li key={key}>
                                <code className={HELP_SECTION.code}>{value}</code>
                            </li>
                        ))}
                    </ul>
                </div>
                <p className="text-xs">
                    Select a macro to include common configurations or setup procedures.
                </p>
            </div>
        </div>
    );

    return (
        <DirectiveContainer
            title="Include"
            helpContent={helpContent}
            condition={condition}
            onConditionChange={onConditionChange}
            headerColor={headerColor}
            borderColor={borderColor}
            iconColor={iconColor}
            icon={icon}
            controllers={controllers}
        >
            <FormField
                label="Macro"
                description="Select a predefined macro to include"
            >
                <Select
                    value={include}
                    onChange={(e) => onChange(e.target.value as IncludeMacro)}
                    className="font-mono"
                >
                    {Object.entries(IncludeMacros).map(([key, value]) => (
                        <option key={key} value={value}>
                            {value}
                        </option>
                    ))}
                </Select>
            </FormField>
        </DirectiveContainer>
    );
}

// Register this directive
export const includeDirectiveMetadata: DirectiveMetadata = {
    key: "include",
    label: "Include",
    description: "Include external macros or templates",
    icon: DocumentArrowDownIcon,
    color: "bg-slate-50 border-slate-200 hover:bg-slate-100",
    headerColor: "bg-slate-50",
    borderColor: "border-slate-200",
    iconColor: "text-slate-600",
    defaultValue: { include: "macros/openrecon/neurodocker.yaml" },
    keywords: ["include", "import", "external", "reference", "link"],
    component: IncludeDirectiveComponent,
};

registerDirective(includeDirectiveMetadata);