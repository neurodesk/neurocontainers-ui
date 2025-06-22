import { DirectiveContainer, ListEditor, Input } from "@/components/ui";
import { DocumentIcon } from "@heroicons/react/24/outline";
import { registerDirective, DirectiveMetadata } from "./registry";

export default function CopyDirectiveComponent({
    copy,
    onChange,
    condition,
    onConditionChange,
    headerColor,
    borderColor,
    iconColor,
    icon
}: {
    copy: string[] | string,
    onChange: (copy: string[]) => void,
    condition?: string;
    onConditionChange?: (condition: string | undefined) => void;
    headerColor?: string;
    borderColor?: string;
    iconColor?: string;
    icon?: React.ComponentType<{ className?: string }>;
}) {
    const copyAsArray = Array.isArray(copy) ? copy : copy.split(" ");

    const helpContent = (
        <>
            <h3 className="font-semibold text-[#0c0e0a] mb-2">
                COPY Directive
            </h3>
            <div className="text-sm text-gray-600 space-y-2">
                <p>
                    The COPY instruction copies new files or directories from the source and adds them to the filesystem of the container.
                </p>
                <div>
                    <strong>Format:</strong>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                        <li><code>source:destination</code> - Copy from source to destination</li>
                        <li><code>file.txt:/app/</code> - Copy file to directory</li>
                        <li><code>./src:/app/src</code> - Copy directory contents</li>
                    </ul>
                </div>
            </div>
        </>
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
    color: "bg-cyan-50 border-cyan-200 hover:bg-cyan-100",
    headerColor: "bg-cyan-50",
    borderColor: "border-cyan-200",
    iconColor: "text-cyan-600",
    defaultValue: { copy: [] as string[] },
    keywords: ["copy", "file", "transfer", "duplicate", "move"],
    component: CopyDirectiveComponent,
};

registerDirective(copyDirectiveMetadata);