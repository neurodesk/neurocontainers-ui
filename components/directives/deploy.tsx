import { DirectiveContainer, FormField, TagEditor } from "@/components/ui";
import { DirectiveControllers } from "@/components/ui/DirectiveContainer";
import { DeployInfo } from "@/components/common";
import { RocketLaunchIcon } from "@heroicons/react/24/outline";
import { registerDirective, DirectiveMetadata } from "./registry";
import { HELP_SECTION } from "@/lib/styles";

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
    headerColor?: string;
    borderColor?: string;
    iconColor?: string;
    icon?: React.ComponentType<{ className?: string }>;
    controllers: DirectiveControllers;
}) {
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
        <div className={HELP_SECTION.container}>
            <h3 className={HELP_SECTION.title}>
                DEPLOY Directive
            </h3>
            <div className={HELP_SECTION.text}>
                <p>
                    The DEPLOY directive configures deployment settings for the container, including paths and binaries.
                </p>
                <div>
                    <strong>Paths:</strong>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                        <li>Specify directories to include in deployment</li>
                        <li>Use absolute paths for clarity</li>
                        <li>Example: <code className={HELP_SECTION.code}>/app/bin</code>, <code className={HELP_SECTION.code}>/usr/local/bin</code></li>
                    </ul>
                </div>
                <div>
                    <strong>Binaries:</strong>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                        <li>List specific executable files to deploy</li>
                        <li>Binary names or full paths</li>
                        <li>Example: <code className={HELP_SECTION.code}>myapp</code>, <code className={HELP_SECTION.code}>processingTool</code></li>
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
    color: "bg-orange-50 border-orange-200 hover:bg-orange-100",
    headerColor: "bg-orange-50",
    borderColor: "border-orange-200",
    iconColor: "text-orange-600",
    defaultValue: { deploy: { path: [] as string[], bins: [] as string[] } },
    keywords: ["deploy", "deployment", "publish", "release", "launch"],
    component: DeployDirectiveComponent,
};

registerDirective(deployDirectiveMetadata);
