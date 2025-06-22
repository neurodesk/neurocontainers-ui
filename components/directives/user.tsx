import { DirectiveContainer, Input } from "@/components/ui";
import { DirectiveControllers } from "@/components/ui/DirectiveContainer";
import { UserIcon } from "@heroicons/react/24/outline";
import { registerDirective, DirectiveMetadata } from "./registry";
import { getHelpSection } from "@/lib/styles";
import { useTheme } from "@/lib/ThemeContext";

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
                USER Directive
            </h3>
            <div className={getHelpSection(isDark).text}>
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
                    <div className={getHelpSection(isDark).code}>
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
    color: { light: "bg-teal-50 border-teal-200 hover:bg-teal-100", dark: "bg-teal-900 border-teal-700 hover:bg-teal-800" },
    headerColor: { light: "bg-teal-50", dark: "bg-teal-900" },
    borderColor: { light: "border-teal-200", dark: "border-teal-700" },
    iconColor: { light: "text-teal-600", dark: "text-teal-400" },
    defaultValue: { user: "" },
    keywords: ["user", "account", "permission", "context", "identity"],
    component: UserDirectiveComponent,
};

registerDirective(userDirectiveMetadata);