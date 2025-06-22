import { DirectiveContainer, Input } from "@/components/ui";
import { DirectiveControllers } from "@/components/ui/DirectiveContainer";
import { FolderOpenIcon } from "@heroicons/react/24/outline";
import { registerDirective, DirectiveMetadata } from "./registry";
import { getHelpSection } from "@/lib/styles";
import { useTheme } from "@/lib/ThemeContext";

export default function WorkingDirectoryDirectiveComponent({
    workdir,
    onChange,
    condition,
    onConditionChange,
    headerColor,
    borderColor,
    iconColor,
    icon,
    controllers,
}: {
    workdir: string,
    onChange: (workdir: string) => void,
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
                WORKDIR Directive
            </h3>
            <div className={getHelpSection(isDark).text}>
                <p>
                    The WORKDIR directive sets the working directory for any subsequent ADD, COPY, ENTRYPOINT, CMD, and RUN instructions.
                </p>
                <div>
                    <strong>Key Features:</strong>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                        <li>Creates the directory if it doesn&apos;t exist</li>
                        <li>Can be used multiple times in a Dockerfile</li>
                        <li>Supports absolute and relative paths</li>
                        <li>Affects all subsequent instructions until changed</li>
                    </ul>
                </div>
                <div>
                    <strong>Best Practices:</strong>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                        <li>Use absolute paths for clarity and predictability</li>
                        <li>Avoid using <code className={getHelpSection(isDark).code}>cd</code> in RUN instructions; use WORKDIR instead</li>
                        <li>Set WORKDIR early in your Dockerfile for organization</li>
                        <li>Use meaningful directory names (e.g., /app, /usr/src/app)</li>
                    </ul>
                </div>
                <div>
                    <strong>Examples:</strong>
                    <div className={getHelpSection(isDark).code}>
                        <div><strong>Application:</strong> /app</div>
                        <div><strong>Source code:</strong> /usr/src/app</div>
                        <div><strong>Data directory:</strong> /data</div>
                        <div><strong>Config directory:</strong> /etc/myapp</div>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <DirectiveContainer
            title="Working Directory"
            helpContent={helpContent}
            condition={condition}
            onConditionChange={onConditionChange}
            headerColor={headerColor}
            borderColor={borderColor}
            iconColor={iconColor}
            icon={icon}
            controllers={controllers}
        >
            <Input
                value={workdir}
                onChange={(e) => onChange(e.target.value)}
                placeholder="/path/to/directory"
                monospace
            />
        </DirectiveContainer>
    );
}

// Register this directive
export const workdirDirectiveMetadata: DirectiveMetadata = {
    key: "workdir",
    label: "Working Directory",
    description: "Set the working directory for subsequent commands",
    icon: FolderOpenIcon,
    color: { light: "bg-yellow-50 border-yellow-200 hover:bg-yellow-100", dark: "bg-yellow-900 border-yellow-700 hover:bg-yellow-800" },
    headerColor: { light: "bg-yellow-50", dark: "bg-yellow-900" },
    borderColor: { light: "border-yellow-200", dark: "border-yellow-700" },
    iconColor: { light: "text-yellow-600", dark: "text-yellow-400" },
    defaultValue: { workdir: "" },
    keywords: ["workdir", "directory", "folder", "path", "cd"],
    component: WorkingDirectoryDirectiveComponent,
};

registerDirective(workdirDirectiveMetadata);