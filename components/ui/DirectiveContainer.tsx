import {
    ChevronDownIcon,
    ChevronRightIcon,
    QuestionMarkCircleIcon,
} from "@heroicons/react/24/outline";
import { useState, ReactNode } from "react";

interface DirectiveContainerProps {
    title: string;
    children: ReactNode;
    isExpanded?: boolean;
    onToggle?: (expanded: boolean) => void;
    helpContent?: ReactNode;
    className?: string;
}

export default function DirectiveContainer({
    title,
    children,
    isExpanded = true,
    onToggle,
    helpContent,
    className = "",
}: DirectiveContainerProps) {
    const [expanded, setExpanded] = useState(isExpanded);
    const [showHelp, setShowHelp] = useState(false);

    const isControlled = onToggle !== undefined;
    const currentExpanded = isControlled ? isExpanded : expanded;

    const handleToggle = () => {
        if (isControlled) {
            onToggle(!isExpanded);
        } else {
            setExpanded(!expanded);
        }
    };

    return (
        <div className={`bg-white rounded-md shadow-sm border border-[#e6f1d6] mb-4 ${className}`}>
            <div
                className="flex items-center p-3 bg-[#f0f7e7] rounded-t-md cursor-pointer"
                onClick={handleToggle}
            >
                <button className="mr-2 text-[#4f7b38]">
                    {currentExpanded ? (
                        <ChevronDownIcon className="h-5 w-5" />
                    ) : (
                        <ChevronRightIcon className="h-5 w-5" />
                    )}
                </button>
                <h2 className="text-[#0c0e0a] font-medium flex-grow">{title}</h2>
                {helpContent && (
                    <div className="relative">
                        <button
                            className="text-[#4f7b38] hover:text-[#6aa329] p-1"
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowHelp(!showHelp);
                            }}
                            title="Show documentation"
                        >
                            <QuestionMarkCircleIcon className="h-5 w-5" />
                        </button>
                        {showHelp && (
                            <>
                                <div
                                    className="fixed inset-0 z-10"
                                    onClick={() => setShowHelp(false)}
                                />
                                <div className="absolute right-0 top-8 w-80 bg-white border border-gray-200 rounded-md shadow-lg p-4 z-20">
                                    {helpContent}
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>

            {currentExpanded && (
                <div className="p-4 border-t border-[#e6f1d6]">
                    {children}
                </div>
            )}
        </div>
    );
}