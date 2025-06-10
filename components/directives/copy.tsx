import { DirectiveContainer, ListEditor, Input } from "@/components/ui";

export default function CopyDirectiveComponent({
    copy,
    onChange
}: {
    copy: string[] | string,
    onChange: (copy: string[]) => void
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
        <DirectiveContainer title="Copy" helpContent={helpContent}>
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