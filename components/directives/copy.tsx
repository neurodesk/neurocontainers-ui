import { DirectiveContainer, ListEditor, Input } from "@/components/ui";
import { DirectiveControllers } from "@/components/ui/DirectiveContainer";
import { DocumentIcon } from "@heroicons/react/24/outline";
import { registerDirective, DirectiveMetadata } from "./registry";
import { getHelpSection } from "@/lib/styles";
import { useTheme } from "@/lib/ThemeContext";

export default function CopyDirectiveComponent({
    copy,
    onChange,
    condition,
    onConditionChange,
    headerColor,
    borderColor,
    iconColor,
    icon,
    controllers,
}: {
    copy: string[] | string,
    onChange: (copy: string[]) => void,
    condition?: string;
    onConditionChange?: (condition: string | undefined) => void;
    headerColor?: { light: string, dark: string };
    borderColor?: { light: string, dark: string };
    iconColor?: { light: string, dark: string };
    icon?: React.ComponentType<{ className?: string }>;
    controllers: DirectiveControllers;
}) {
    const { isDark } = useTheme();
    const copyAsArray = Array.isArray(copy) ? copy : copy.split(" ");

    const helpContent = (
        <div className={getHelpSection(isDark).container}>
            <h3 className={getHelpSection(isDark).title}>
                COPY Directive
            </h3>
            <div className={getHelpSection(isDark).text}>
                <p>
                    The COPY instruction copies new files or directories from the source and adds them to the filesystem of the container.
                </p>
                <div>
                    <strong>Format:</strong>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                        <li><code className={getHelpSection(isDark).code}>source:destination</code> - Copy from source to destination</li>
                        <li><code className={getHelpSection(isDark).code}>file.txt:/app/</code> - Copy file to directory</li>
                        <li><code className={getHelpSection(isDark).code}>./src:/app/src</code> - Copy directory contents</li>
                    </ul>
                </div>
            </div>
        </div>
    );

    return (
        <DirectiveContainer
            title="Copy"
            helpContent={helpContent}
            condition={condition}
            onConditionChange={onConditionChange}
            headerColor={headerColor}
            borderColor={borderColor}
            iconColor={iconColor}
            icon={icon}
            controllers={controllers}
        >
            <ListEditor
                items={copyAsArray}
                onChange={onChange}
                createNewItem={() => ""}
                addButtonText="Add Path"
                emptyMessage="No files or directories to copy."
                allowReorder={true}
                renderItem={(path, index, onChangePath) => (
                    <Input
                        value={path}
                        onChange={(e) => onChangePath(e.target.value)}
                        placeholder="source:destination"
                        monospace
                    />
                )}
            />
        </DirectiveContainer>
    );
}

// Register this directive
export const copyDirectiveMetadata: DirectiveMetadata = {
    key: "copy",
    label: "Copy",
    description: "Copy files and directories into the container",
    icon: DocumentIcon,
    color: { light: "bg-cyan-50 border-cyan-200 hover:bg-cyan-100", dark: "bg-cyan-900 border-cyan-700 hover:bg-cyan-800" },
    headerColor: { light: "bg-cyan-50", dark: "bg-cyan-900" },
    borderColor: { light: "border-cyan-200", dark: "border-cyan-700" },
    iconColor: { light: "text-cyan-600", dark: "text-cyan-400" },
    defaultValue: { copy: [] as string[] },
    keywords: ["copy", "file", "transfer", "duplicate", "move"],
    component: CopyDirectiveComponent,
};

registerDirective(copyDirectiveMetadata);