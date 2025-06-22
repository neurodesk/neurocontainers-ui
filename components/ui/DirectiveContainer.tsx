import {
    ChevronDownIcon,
    ChevronRightIcon,
    InformationCircleIcon,
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
    condition?: string;
    onConditionChange?: (condition: string | undefined) => void;
    showConditionOption?: boolean;
    headerColor?: string;
    borderColor?: string;
    iconColor?: string;
    icon?: React.ComponentType<{ className?: string }>;
}

export default function DirectiveContainer({
    title,
    children,
    isExpanded = true,
    onToggle,
    helpContent,
    className = "",
    condition,
    onConditionChange,
    showConditionOption = true,
    headerColor,
    borderColor,
    iconColor,
    icon: Icon,
}: DirectiveContainerProps) {
    const [expanded, setExpanded] = useState(isExpanded);
    const [showHelp, setShowHelp] = useState(false);
    const [showCondition, setShowCondition] = useState(false);

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
        <div className={`bg-white rounded-md shadow-sm border mb-4 ${borderColor || 'border-gray-200'} ${className}`}>
            <div className={`flex items-center p-3 rounded-t-md ${headerColor || 'bg-[#f0f7e7]'}`}>
                <button 
                    className="mr-2 text-[#4f7b38] hover:text-[#6aa329] transition-colors"
                    onClick={handleToggle}
                >
                    {currentExpanded ? (
                        <ChevronDownIcon className="h-5 w-5" />
                    ) : (
                        <ChevronRightIcon className="h-5 w-5" />
                    )}
                </button>
                {Icon && (
                    <Icon className={`h-5 w-5 mr-2 ${iconColor || 'text-gray-600'}`} />
                )}
                <h2 className="text-[#0c0e0a] font-medium flex-grow">{title}</h2>
                <div className="flex items-center gap-1">
                    {showConditionOption && onConditionChange && (
                        <button
                            className={`text-[#4f7b38] hover:text-[#6aa329] p-1 transition-colors ${showCondition ? 'text-[#6aa329]' : ''}`}
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowCondition(!showCondition);
                            }}
                            title={showCondition ? "Hide condition" : "Add condition"}
                        >
                            <QuestionMarkCircleIcon className="h-5 w-5" />
                        </button>
                    )}
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
            </div>

            {currentExpanded && (
                <div className="border-t border-[#e6f1d6]">
                    {(showCondition || condition) && onConditionChange && (
                        <div className="px-4 py-3 bg-[#f8faf6] border-b border-[#e6f1d6]">
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-gray-700">
                                    Condition
                                </label>
                                <input
                                    type="text"
                                    value={condition || ''}
                                    onChange={(e) => onConditionChange(e.target.value || undefined)}
                                    placeholder='e.g., arch=="x86_64" or platform=="linux"'
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6aa329] focus:border-transparent font-mono text-sm"
                                    onClick={(e) => e.stopPropagation()}
                                />
                                <p className="text-xs text-gray-500">
                                    This directive will only be executed when the condition is true. Leave empty to always execute.
                                </p>
                            </div>
                        </div>
                    )}
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