import { DirectiveContainer, FormField, Input, Textarea } from "@/components/ui";
import { DirectiveControllers } from "@/components/ui/DirectiveContainer";
import { TestInfo, ScriptTest, BuiltinTest } from "@/components/common";
import { BeakerIcon } from "@heroicons/react/24/outline";
import { registerDirective, DirectiveMetadata } from "./registry";
import { cn, getHelpSection } from "@/lib/styles";
import { useTheme } from "@/lib/ThemeContext";

export default function TestDirectiveComponent({
    test,
    onChange,
    condition,
    onConditionChange,
    headerColor,
    borderColor,
    iconColor,
    icon,
    controllers,
}: {
    test: TestInfo,
    onChange: (test: TestInfo) => void,
    condition?: string;
    onConditionChange?: (condition: string | undefined) => void;
    headerColor?: { light: string, dark: string };
    borderColor?: { light: string, dark: string };
    iconColor?: { light: string, dark: string };
    icon?: React.ComponentType<{ className?: string }>;
    controllers: DirectiveControllers;
}) {
    const { isDark } = useTheme();
    const isBuiltin = 'builtin' in test;

    const updateName = (value: string) => {
        onChange({ ...test, name: value });
    };

    const updateScript = (value: string) => {
        if (!isBuiltin) {
            onChange({ ...test, script: value } as ScriptTest);
        }
    };

    const helpContent = (
        <>
            <h3 className={getHelpSection(isDark).title}>
                TEST Directive
            </h3>
            <div className={cn(getHelpSection(isDark).text, "space-y-2")}>
                <p>
                    The TEST directive defines test scripts to validate the container functionality.
                </p>
                <div>
                    <strong>Test Types:</strong>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                        <li><strong>Script Test:</strong> Custom test script that you write</li>
                        <li><strong>Builtin Test:</strong> Predefined test from the system</li>
                    </ul>
                </div>
                <div>
                    <strong>Examples:</strong>
                    <div className={getHelpSection(isDark).code}>
                        <div><strong>Script:</strong> echo &quot;Hello World&quot; && exit 0</div>
                        <div><strong>Builtin:</strong> System-provided test scripts</div>
                    </div>
                </div>
            </div>
        </>
    );

    const testTypeLabel = isBuiltin ? 'Builtin' : 'Script';
    const title = `Test: ${test.name} (${testTypeLabel})`;

    return (
        <DirectiveContainer
            title={title}
            helpContent={helpContent}
            condition={condition}
            onConditionChange={onConditionChange}
            headerColor={headerColor}
            borderColor={borderColor}
            iconColor={iconColor}
            icon={icon}
            controllers={controllers}
        >
            <FormField label="Test Name">
                <Input
                    value={test.name}
                    onChange={(e) => updateName(e.target.value)}
                    placeholder="Enter test name"
                />
            </FormField>

            <FormField
                label={isBuiltin ? 'Builtin Test Script' : 'Test Script'}
                description={isBuiltin ? 'This test uses a predefined builtin script' : 'Write your custom test script'}
            >
                {isBuiltin ? (
                    <div className={cn(
                        "px-3 py-1.5 border rounded-md font-mono text-sm",
                        isDark ? "border-[#2d4222] bg-[#161a0e] text-[#575c4e]" : "border-gray-200 bg-gray-50 text-gray-500"
                    )}>
                        {(test as BuiltinTest).builtin}
                    </div>
                ) : (
                    <Textarea
                        value={(test as ScriptTest).script}
                        onChange={(e) => updateScript(e.target.value)}
                        placeholder="Enter test script commands..."
                        className="h-64"
                        monospace
                    />
                )}
            </FormField>
        </DirectiveContainer>
    );
}

// Register this directive
export const testDirectiveMetadata: DirectiveMetadata = {
    key: "test",
    label: "Test",
    description: "Define test scripts to validate container functionality",
    icon: BeakerIcon,
    color: { light: "bg-violet-50 border-violet-200 hover:bg-violet-100", dark: "bg-violet-900 border-violet-700 hover:bg-violet-800" },
    headerColor: { light: "bg-violet-50", dark: "bg-violet-900" },
    borderColor: { light: "border-violet-200", dark: "border-violet-700" },
    iconColor: { light: "text-violet-600", dark: "text-violet-400" },
    defaultValue: { test: { name: "", script: "" } },
    keywords: ["test", "testing", "validation", "check", "verify"],
    component: TestDirectiveComponent,
};

registerDirective(testDirectiveMetadata);