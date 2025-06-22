import { DirectiveContainer, Input } from "@/components/ui";
import { DirectiveControllers } from "@/components/ui/DirectiveContainer";
import { UserIcon } from "@heroicons/react/24/outline";
import { registerDirective, DirectiveMetadata } from "./registry";
import { HELP_SECTION } from "@/lib/styles";

export default function UserDirectiveComponent({
    user,
    onChange,
    condition,
    onConditionChange,
    headerColor,
    borderColor,
    iconColor,
    icon,
    controllers,
}: {
    user: string,
    onChange: (user: string) => void,
    condition?: string;
    onConditionChange?: (condition: string | undefined) => void;
    headerColor?: string;
    borderColor?: string;
    iconColor?: string;
    icon?: React.ComponentType<{ className?: string }>;
    controllers: DirectiveControllers;
}) {
    const helpContent = (
        <div className={HELP_SECTION.container}>
            <h3 className={HELP_SECTION.title}>
                USER Directive
            </h3>
            <div className={HELP_SECTION.text}>
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
                    <div className={HELP_SECTION.code}>
                        <div><strong>Username:</strong> nginx</div>
                        <div><strong>UID:</strong> 1000</div>
                        <div><strong>User:Group:</strong> www-data:www-data</div>
                        <div><strong>UID:GID:</strong> 1000:1000</div>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <DirectiveContainer
            title="User"
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
                value={user}
                onChange={(e) => onChange(e.target.value)}
                placeholder="username or UID"
                monospace
            />
        </DirectiveContainer>
    );
}

// Register this directive
export const userDirectiveMetadata: DirectiveMetadata = {
    key: "user",
    label: "User",
    description: "Set the user context for subsequent commands",
    icon: UserIcon,
    color: "bg-teal-50 border-teal-200 hover:bg-teal-100",
    headerColor: "bg-teal-50",
    borderColor: "border-teal-200",
    iconColor: "text-teal-600",
    defaultValue: { user: "" },
    keywords: ["user", "account", "permission", "context", "identity"],
    component: UserDirectiveComponent,
};

registerDirective(userDirectiveMetadata);