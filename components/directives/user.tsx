import { DirectiveContainer, Input } from "@/components/ui";

export default function UserDirectiveComponent({
    user,
    onChange
}: {
    user: string,
    onChange: (user: string) => void
}) {
    return (
        <DirectiveContainer title="User">
            <Input
                value={user}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Username"
                monospace
            />
        </DirectiveContainer>
    );
}