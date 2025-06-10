import { DirectiveContainer, Input } from "@/components/ui";

export default function WorkingDirectoryDirectiveComponent({
    workdir,
    onChange
}: {
    workdir: string,
    onChange: (workdir: string) => void
}) {
    return (
        <DirectiveContainer title="Working Directory">
            <Input
                value={workdir}
                onChange={(e) => onChange(e.target.value)}
                placeholder="/path/to/directory"
                monospace
            />
        </DirectiveContainer>
    );
}