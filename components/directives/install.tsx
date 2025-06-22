import { useState, useEffect } from "react";
import { loadPackageDatabase } from "@/lib/packages";
import { DirectiveContainer, FormField, Select } from "@/components/ui";
import { DirectiveControllers } from "@/components/ui/DirectiveContainer";
import PackageTagEditor from "@/components/ui/PackageTagEditor";
import { CommandLineIcon } from "@heroicons/react/24/outline";
import { registerDirective, DirectiveMetadata } from "./registry";
import { HELP_SECTION } from "@/lib/styles";

type PackageManager = "system";

const packageManagers: { value: PackageManager; label: string }[] = [
    { value: "system", label: "System Package Manager" },
];

interface Package {
    name: string;
    description: string;
    version?: string;
    section?: string;
}

export default function InstallDirectiveComponent({
    install,
    baseImage,
    onChange,
    condition,
    onConditionChange,
    headerColor,
    borderColor,
    iconColor,
    icon,
    controllers,
}: {
    install: string | string[];
    baseImage: string;
    onChange: (install: string) => void;
    condition?: string;
    onConditionChange?: (condition: string | undefined) => void;
    headerColor?: string;
    borderColor?: string;
    iconColor?: string;
    icon?: React.ComponentType<{ className?: string }>;
    controllers: DirectiveControllers;
}) {
    const [packages, setPackages] = useState<string[]>([]);
    const [packageManager, setPackageManager] = useState<PackageManager>("system");
    const [isLoadingDatabase, setIsLoadingDatabase] = useState(true);
    const [databaseLoaded, setDatabaseLoaded] = useState(false);
    const [packageDatabase, setPackageDatabase] = useState<Package[]>([]);

    // Parse the install string into individual packages
    useEffect(() => {
        if (typeof install === "string") {
            setPackages(install.split(/\s+/).filter((pkg) => pkg.trim() !== ""));
        } else if (Array.isArray(install)) {
            const allPackages = install.flatMap((pkg) =>
                pkg.split(/\s+/).filter((p) => p.trim() !== "")
            );
            setPackages(allPackages);
        } else {
            setPackages([]);
        }
    }, [install]);

    // Load database on mount
    useEffect(() => {
        const loadDatabase = async () => {
            setIsLoadingDatabase(true);
            try {
                const db = await loadPackageDatabase();
                setPackageDatabase(db);
                setDatabaseLoaded(true);
            } catch (error) {
                console.error("Failed to load package database:", error);
            } finally {
                setIsLoadingDatabase(false);
            }
        };

        loadDatabase();
    }, []);

    const updatePackages = (newPackages: string[]) => {
        const newInstallString = newPackages.join(" ");
        onChange(newInstallString);
    };

    const helpContent = (
        <div className={HELP_SECTION.container}>
            <h3 className={HELP_SECTION.title}>
                INSTALL Directive
            </h3>
            <div className={HELP_SECTION.text}>
                <p>
                    Search from {databaseLoaded ? packageDatabase.length.toLocaleString() : '80,000+'} Ubuntu 24.04 packages.
                </p>
                <div>
                    <strong>Keyboard Shortcuts:</strong>
                    <ul className="list-disc list-inside mt-1 space-y-1 text-xs">
                        <li><kbd className={HELP_SECTION.code}>Enter</kbd> - Add package</li>
                        <li><kbd className={HELP_SECTION.code}>↑/↓</kbd> - Navigate suggestions</li>
                        <li><kbd className={HELP_SECTION.code}>Tab</kbd> - Autocomplete</li>
                        <li><kbd className={HELP_SECTION.code}>Backspace</kbd> - Remove last (when empty)</li>
                        <li><kbd className={HELP_SECTION.code}>Esc</kbd> - Close suggestions</li>
                    </ul>
                </div>
            </div>
        </div>
    );

    return (
        <DirectiveContainer
            title="Install"
            helpContent={helpContent}
            condition={condition}
            onConditionChange={onConditionChange}
            headerColor={headerColor}
            borderColor={borderColor}
            iconColor={iconColor}
            icon={icon}
            controllers={controllers}
        >
            <FormField label="Package Manager">
                <Select
                    value={packageManager}
                    disabled={true} // Disable for now, only system package manager supported
                    onChange={(e) => setPackageManager(e.target.value as PackageManager)}
                    className="text-gray-500 bg-gray-100 cursor-not-allowed"
                >
                    {packageManagers.map((pm) => (
                        <option key={pm.value} value={pm.value}>
                            {pm.label}
                        </option>
                    ))}
                </Select>
            </FormField>

            <PackageTagEditor
                packages={packages}
                onChange={updatePackages}
                packageDatabase={packageDatabase}
                databaseLoaded={databaseLoaded}
                isLoadingDatabase={isLoadingDatabase}
                baseImage={baseImage}
            />
        </DirectiveContainer>
    );
}

// Register this directive
export const installDirectiveMetadata: DirectiveMetadata = {
    key: "install",
    label: "Install",
    description: "Install packages or dependencies",
    icon: CommandLineIcon,
    color: "bg-purple-50 border-purple-200 hover:bg-purple-100",
    headerColor: "bg-purple-50",
    borderColor: "border-purple-200",
    iconColor: "text-purple-600",
    defaultValue: { install: "" },
    keywords: ["install", "package", "dependency", "apt", "yum", "npm"],
    component: InstallDirectiveComponent,
};

registerDirective(installDirectiveMetadata);