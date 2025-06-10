import { DirectiveContainer, KeyValueEditor } from "@/components/ui";

export default function EnvironmentDirectiveComponent({
    environment,
    onChange
}: {
    environment: { [key: string]: string },
    onChange: (environment: { [key: string]: string }) => void
}) {
    return (
        <DirectiveContainer title="Environment Variables">
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
