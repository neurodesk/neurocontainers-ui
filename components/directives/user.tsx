import { ChevronDownIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

export default function UserDirectiveComponent({
    user,
    onChange
}: {
    user: string,
    onChange: (user: string) => void
}) {
    const [isExpanded, setIsExpanded] = useState(true);

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
                <h2 className="text-[#0c0e0a] font-medium">User</h2>
            </div>

            {isExpanded && (
                <div className="p-4 border-t border-[#e6f1d6]">
                    <input
                        className="font-mono w-full px-3 py-2 border border-gray-200 rounded-md text-[#0c0e0a] focus:outline-none focus:ring-1 focus:ring-[#6aa329] focus:border-[#6aa329]"
                        value={user}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder="Username"
                    />
                </div>
            )}
        </div>
    );
}