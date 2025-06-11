import { DirectiveContainer, KeyValueEditor } from "@/components/ui";
import { CogIcon } from "@heroicons/react/24/outline";
import { registerDirective, DirectiveMetadata } from "./registry";

export default function EnvironmentDirectiveComponent({
    environment,
    onChange
}: {
    environment: { [key: string]: string },
    onChange: (environment: { [key: string]: string }) => void
}) {
    const helpContent = (
        <>
            <h3 className="font-semibold text-[#0c0e0a] mb-2">
                ENVIRONMENT Directive
            </h3>
            <div className="text-sm text-gray-600 space-y-2">
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
                    <div className="bg-gray-100 p-2 rounded text-xs mt-1 space-y-1">
                        <div><strong>PATH:</strong> /usr/local/bin:/usr/bin:/bin</div>
                        <div><strong>APP_ENV:</strong> production</div>
                        <div><strong>DATABASE_URL:</strong> postgresql://user:pass@localhost/db</div>
                        <div><strong>DEBUG:</strong> true</div>
                    </div>
                </div>
            </div>
        </>
    );

    return (
        <DirectiveContainer title="Environment Variables" helpContent={helpContent}>
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
    color: "bg-green-50 border-green-200 hover:bg-green-100",
    iconColor: "text-green-600",
    defaultValue: { environment: {} },
    keywords: ["environment", "env", "variables", "config", "settings"],
    component: EnvironmentDirectiveComponent,
};

registerDirective(environmentDirectiveMetadata);
