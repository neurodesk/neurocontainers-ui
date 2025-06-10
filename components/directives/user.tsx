import { DirectiveContainer, Input } from "@/components/ui";

export default function UserDirectiveComponent({
    user,
    onChange
}: {
    user: string,
    onChange: (user: string) => void
}) {
    const helpContent = (
        <>
            <h3 className="font-semibold text-[#0c0e0a] mb-2">
                USER Directive
            </h3>
            <div className="text-sm text-gray-600 space-y-2">
                <p>
                    The USER directive sets the user name or UID to use when running the container and for any subsequent commands.
                </p>
                <div>
                    <strong>Usage Options:</strong>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                        <li><strong>Username:</strong> Use an existing user name (e.g., root, www-data)</li>
                        <li><strong>UID:</strong> Use a numeric user ID (e.g., 1000, 33)</li>
                        <li><strong>User:Group:</strong> Specify both user and group (e.g., user:group, 1000:1000)</li>
                    </ul>
                </div>
                <div>
                    <strong>Security Notes:</strong>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                        <li>Avoid running as root (UID 0) unless absolutely necessary</li>
                        <li>Create non-root users for better security practices</li>
                        <li>Ensure the user exists in the container or create it first</li>
                    </ul>
                </div>
                <div>
                    <strong>Examples:</strong>
                    <div className="bg-gray-100 p-2 rounded text-xs mt-1 space-y-1">
                        <div><strong>Username:</strong> nginx</div>
                        <div><strong>UID:</strong> 1000</div>
                        <div><strong>User:Group:</strong> www-data:www-data</div>
                        <div><strong>UID:GID:</strong> 1000:1000</div>
                    </div>
                </div>
            </div>
        </>
    );

    return (
        <DirectiveContainer title="User" helpContent={helpContent}>
            <Input
                value={user}
                onChange={(e) => onChange(e.target.value)}
                placeholder="username or UID"
                monospace
            />
        </DirectiveContainer>
    );
}