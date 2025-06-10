import {
    ChevronDownIcon,
    ChevronRightIcon,
    InformationCircleIcon,
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
                    <button
                        className={`text-[#4f7b38] hover:text-[#6aa329] p-1 transition-colors ${showHelp ? 'text-[#6aa329]' : ''}`}
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowHelp(!showHelp);
                        }}
                        title={showHelp ? "Hide documentation" : "Show documentation"}
                    >
                        <InformationCircleIcon className="h-5 w-5" />
                    </button>
                )}
            </div>

            {currentExpanded && (
                <div className="border-t border-[#e6f1d6]">
                    {helpContent && showHelp && (
                        <div className="px-4 py-3 bg-[#fafcf7] border-b border-[#e6f1d6]">
                            {helpContent}
                        </div>
                    )}
                    <div className="p-4">
                        {children}
                    </div>
                </div>
            )}
        </div>
    );
}