import { DirectiveContainer, KeyValueEditor } from "@/components/ui";
import { DirectiveControllers } from "@/components/ui/DirectiveContainer";
import { CogIcon } from "@heroicons/react/24/outline";
import { registerDirective, DirectiveMetadata } from "./registry";
import { getHelpSection } from "@/lib/styles";
import { useTheme } from "@/lib/ThemeContext";

export default function EnvironmentDirectiveComponent({
    environment,
    onChange,
    condition,
    onConditionChange,
    headerColor,
    borderColor,
    iconColor,
    icon,
    controllers,
}: {
    environment: { [key: string]: string },
    onChange: (environment: { [key: string]: string }) => void
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
                ENVIRONMENT Directive
            </h3>
            <div className={getHelpSection(isDark).text}>
                <p>
                    The ENVIRONMENT directive sets environment variables that will be available in the container.
                </p>
                <div>
                    <strong>Usage Guidelines:</strong>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                        <li>Use UPPERCASE names for environment variables by convention</li>
                        <li>Avoid spaces in variable names (use underscores instead)</li>
                        <li>Values can contain spaces and special characters</li>
                        <li>Variables persist throughout the container lifecycle</li>
                    </ul>
                </div>
                <div>
                    <strong>Common Examples:</strong>
                    <div className={getHelpSection(isDark).code}>
                        <div><strong>PATH:</strong> /usr/local/bin:/usr/bin:/bin</div>
                        <div><strong>APP_ENV:</strong> production</div>
                        <div><strong>DATABASE_URL:</strong> postgresql://user:pass@localhost/db</div>
                        <div><strong>DEBUG:</strong> true</div>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <DirectiveContainer
            title="Environment Variables"
            helpContent={helpContent}
            condition={condition}
            onConditionChange={onConditionChange}
            headerColor={headerColor}
            borderColor={borderColor}
            iconColor={iconColor}
            icon={icon}
            controllers={controllers}
        >
            <KeyValueEditor
                data={environment}
                onChange={onChange}
                keyLabel="Key"
                valueLabel="Value"
                keyPlaceholder="VARIABLE_NAME"
                valuePlaceholder="value"
                addButtonText="Add Environment Variable"
                emptyMessage="No environment variables set."
                monospace
            />
        </DirectiveContainer>
    );
}

// Register this directive
export const environmentDirectiveMetadata: DirectiveMetadata = {
    key: "environment",
    label: "Environment",
    description: "Set environment variables",
    icon: CogIcon,
    color: { light: "bg-green-50 border-green-200 hover:bg-green-100", dark: "bg-green-900 border-green-700 hover:bg-green-800" },
    headerColor: { light: "bg-green-50", dark: "bg-green-900" },
    borderColor: { light: "border-green-200", dark: "border-green-700" },
    iconColor: { light: "text-green-600", dark: "text-green-400" },
    defaultValue: { environment: {} },
    keywords: ["environment", "env", "variables", "config", "settings"],
    component: EnvironmentDirectiveComponent,
};

registerDirective(environmentDirectiveMetadata);
