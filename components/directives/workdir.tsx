import { DirectiveContainer, Input } from "@/components/ui";
import { FolderOpenIcon } from "@heroicons/react/24/outline";
import { registerDirective, DirectiveMetadata } from "./registry";

export default function WorkingDirectoryDirectiveComponent({
    workdir,
    onChange
}: {
    workdir: string,
    onChange: (workdir: string) => void
}) {
    const helpContent = (
        <>
            <h3 className="font-semibold text-[#0c0e0a] mb-2">
                WORKDIR Directive
            </h3>
            <div className="text-sm text-gray-600 space-y-2">
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
                        <li>Avoid using <code>cd</code> in RUN instructions; use WORKDIR instead</li>
                        <li>Set WORKDIR early in your Dockerfile for organization</li>
                        <li>Use meaningful directory names (e.g., /app, /usr/src/app)</li>
                    </ul>
                </div>
                <div>
                    <strong>Examples:</strong>
                    <div className="bg-gray-100 p-2 rounded text-xs mt-1 space-y-1">
                        <div><strong>Application:</strong> /app</div>
                        <div><strong>Source code:</strong> /usr/src/app</div>
                        <div><strong>Data directory:</strong> /data</div>
                        <div><strong>Config directory:</strong> /etc/myapp</div>
                    </div>
                </div>
            </div>
        </>
    );

    return (
        <DirectiveContainer title="Working Directory" helpContent={helpContent}>
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
    color: "bg-yellow-50 border-yellow-200 hover:bg-yellow-100",
    iconColor: "text-yellow-600",
    defaultValue: { workdir: "" },
    keywords: ["workdir", "directory", "folder", "path", "cd"],
    component: WorkingDirectoryDirectiveComponent,
};

registerDirective(workdirDirectiveMetadata);