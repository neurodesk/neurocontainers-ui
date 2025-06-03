import { ChevronDownIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { TestInfo, ScriptTest, BuiltinTest } from "@/components/common";

export default function TestDirectiveComponent({
    test,
    onChange
}: {
    test: TestInfo,
    onChange: (test: TestInfo) => void
}) {
    const [isExpanded, setIsExpanded] = useState(true);
    const isBuiltin = 'builtin' in test;

    const updateName = (value: string) => {
        onChange({ ...test, name: value });
    };

    const updateScript = (value: string) => {
        if (!isBuiltin) {
            onChange({ ...test, script: value } as ScriptTest);
        }
    };

    return (
        <div className="bg-white rounded-md shadow-sm border border-[#e6f1d6] mb-4">
            <div
                className="flex items-center p-3 bg-[#f0f7e7] rounded-t-md cursor-pointer"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <button className="mr-2 text-[#4f7b38]">
                    {isExpanded ? (
                        <ChevronDownIcon className="h-5 w-5" />
                    ) : (
                        <ChevronRightIcon className="h-5 w-5" />
                    )}
                </button>
                <h2 className="text-[#0c0e0a] font-medium">
                    Test: {test.name}
                    <span className="ml-2 text-xs font-normal bg-[#e6f1d6] px-2 py-0.5 rounded-full">
                        {isBuiltin ? 'Builtin' : 'Script'}
                    </span>
                </h2>
            </div>

            {isExpanded && (
                <div className="p-4 border-t border-[#e6f1d6]">
                    <div className="mb-4">
                        <label className="block mb-1 font-medium text-sm text-[#1e2a16]">Test Name</label>
                        <input
                            className="w-full px-3 py-2 border border-gray-200 rounded-md text-[#0c0e0a] focus:outline-none focus:ring-1 focus:ring-[#6aa329] focus:border-[#6aa329]"
                            value={test.name}
                            onChange={(e) => updateName(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block mb-1 font-medium text-sm text-[#1e2a16]">
                            {isBuiltin ? 'Builtin Test Script' : 'Test Script'}
                        </label>
                        {isBuiltin ? (
                            <div className="px-3 py-2 border border-gray-200 bg-gray-50 rounded-md text-gray-500">
                                {(test as BuiltinTest).builtin}
                            </div>
                        ) : (
                            <textarea
                                className="font-mono w-full px-3 py-2 border border-gray-200 rounded-md text-[#0c0e0a] focus:outline-none focus:ring-1 focus:ring-[#6aa329] focus:border-[#6aa329] min-h-[120px]"
                                value={(test as ScriptTest).script}
                                onChange={(e) => updateScript(e.target.value)}
                            />
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}