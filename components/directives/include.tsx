import { DirectiveContainer, FormField, Select } from "@/components/ui";
import { DirectiveControllers } from "@/components/ui/DirectiveContainer";
import { IncludeMacro, IncludeMacros } from "@/components/common";
import { DocumentArrowDownIcon } from "@heroicons/react/24/outline";
import { registerDirective, DirectiveMetadata } from "./registry";
import { getHelpSection } from "@/lib/styles";
import { useTheme } from "@/lib/ThemeContext";

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
    headerColor?: { light: string, dark: string };
    borderColor?: { light: string, dark: string };
    iconColor?: { light: string, dark: string };
    icon?: React.ComponentType<{ className?: string }>;
    controllers: DirectiveControllers;
}) {
    const { isDark } = useTheme();
    const helpContent = (
        <div className={getHelpSection(isDark).container}>
            <h3 className={getHelpSection(isDark).title}>
                INCLUDE Directive
            </h3>
            <div className={getHelpSection(isDark).text}>
                <p>
                    The INCLUDE directive allows you to include predefined macros or templates in your container build.
                </p>
                <div>
                    <strong>Available Macros:</strong>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                        {Object.entries(IncludeMacros).map(([key, value]) => (
                            <li key={key}>
                                <code className={getHelpSection(isDark).code}>{value}</code>
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
    color: { light: "bg-slate-50 border-slate-200 hover:bg-slate-100", dark: "bg-slate-900 border-slate-700 hover:bg-slate-800" },
    headerColor: { light: "bg-slate-50", dark: "bg-slate-900" },
    borderColor: { light: "border-slate-200", dark: "border-slate-700" },
    iconColor: { light: "text-slate-600", dark: "text-slate-400" },
    defaultValue: { include: "macros/openrecon/neurodocker.yaml" },
    keywords: ["include", "import", "external", "reference", "link"],
    component: IncludeDirectiveComponent,
};

registerDirective(includeDirectiveMetadata);