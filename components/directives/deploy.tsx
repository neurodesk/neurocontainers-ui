import { DirectiveContainer, FormField, TagEditor } from "@/components/ui";
import { DirectiveControllers } from "@/components/ui/DirectiveContainer";
import { DeployInfo } from "@/components/common";
import { RocketLaunchIcon } from "@heroicons/react/24/outline";
import { registerDirective, DirectiveMetadata } from "./registry";
import { getHelpSection } from "@/lib/styles";
import { useTheme } from "@/lib/ThemeContext";

export default function DeployDirectiveComponent({
    deploy,
    onChange,
    condition,
    onConditionChange,
    headerColor,
    borderColor,
    iconColor,
    icon,
    controllers,
}: {
    deploy: DeployInfo;
    onChange: (deploy: DeployInfo) => void;
    condition?: string;
    onConditionChange?: (condition: string | undefined) => void;
    headerColor?: { light: string, dark: string };
    borderColor?: { light: string, dark: string };
    iconColor?: { light: string, dark: string };
    icon?: React.ComponentType<{ className?: string }>;
    controllers: DirectiveControllers;
}) {
    const { isDark } = useTheme();
    const updatePaths = (paths: string[]) => {
        onChange({
            ...deploy,
            path: paths,
        });
    };

    const updateBins = (bins: string[]) => {
        onChange({
            ...deploy,
            bins: bins,
        });
    };

    const helpContent = (
        <div className={getHelpSection(isDark).container}>
            <h3 className={getHelpSection(isDark).title}>
                DEPLOY Directive
            </h3>
            <div className={getHelpSection(isDark).text}>
                <p>
                    The DEPLOY directive configures deployment settings for the container, including paths and binaries.
                </p>
                <div>
                    <strong>Paths:</strong>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                        <li>Specify directories to include in deployment</li>
                        <li>Use absolute paths for clarity</li>
                        <li>Example: <code className={getHelpSection(isDark).code}>/app/bin</code>, <code className={getHelpSection(isDark).code}>/usr/local/bin</code></li>
                    </ul>
                </div>
                <div>
                    <strong>Binaries:</strong>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                        <li>List specific executable files to deploy</li>
                        <li>Binary names or full paths</li>
                        <li>Example: <code className={getHelpSection(isDark).code}>myapp</code>, <code className={getHelpSection(isDark).code}>processingTool</code></li>
                    </ul>
                </div>
            </div>
        </div>
    );

    return (
        <DirectiveContainer
            title="Deploy"
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
                label="Paths"
                description="Add directories to include in deployment"
            >
                <TagEditor
                    tags={deploy.path || []}
                    onChange={updatePaths}
                    placeholder="Add a path..."
                    emptyMessage="No paths added yet"
                />
            </FormField>

            <FormField
                label="Binaries"
                description="Add specific executable files to deploy"
            >
                <TagEditor
                    tags={deploy.bins || []}
                    onChange={updateBins}
                    placeholder="Add a binary..."
                    emptyMessage="No binaries added yet"
                />
            </FormField>
        </DirectiveContainer>
    );
}

// Register this directive
export const deployDirectiveMetadata: DirectiveMetadata = {
    key: "deploy",
    label: "Deploy",
    description: "Configure deployment settings for the container",
    icon: RocketLaunchIcon,
    color: { light: "bg-orange-50 border-orange-200 hover:bg-orange-100", dark: "bg-orange-900 border-orange-700 hover:bg-orange-800" },
    headerColor: { light: "bg-orange-50", dark: "bg-orange-900" },
    borderColor: { light: "border-orange-200", dark: "border-orange-700" },
    iconColor: { light: "text-orange-600", dark: "text-orange-400" },
    defaultValue: { deploy: { path: [] as string[], bins: [] as string[] } },
    keywords: ["deploy", "deployment", "publish", "release", "launch"],
    component: DeployDirectiveComponent,
};

registerDirective(deployDirectiveMetadata);
