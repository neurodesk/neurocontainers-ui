import { DirectiveContainer, FormField, Input, Textarea } from "@/components/ui";
import { TestInfo, ScriptTest, BuiltinTest } from "@/components/common";

export default function TestDirectiveComponent({
    test,
    onChange
}: {
    test: TestInfo,
    onChange: (test: TestInfo) => void
}) {
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
            <h3 className="font-semibold text-[#0c0e0a] mb-2">
                TEST Directive
            </h3>
            <div className="text-sm text-gray-600 space-y-2">
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
                    <div className="bg-gray-100 p-2 rounded text-xs mt-1 space-y-1">
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
        <DirectiveContainer title={title} helpContent={helpContent}>
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
                    <div className="px-3 py-2 border border-gray-200 bg-gray-50 rounded-md text-gray-500 font-mono">
                        {(test as BuiltinTest).builtin}
                    </div>
                ) : (
                    <Textarea
                        value={(test as ScriptTest).script}
                        onChange={(e) => updateScript(e.target.value)}
                        placeholder="Enter test script commands..."
                        className="min-h-[120px]"
                        monospace
                    />
                )}
            </FormField>
        </DirectiveContainer>
    );
}