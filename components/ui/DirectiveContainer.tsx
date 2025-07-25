import {
    ChevronDownIcon,
    InformationCircleIcon,
    AdjustmentsHorizontalIcon,
    Bars3Icon,
    ChevronUpIcon,
    TrashIcon,
} from "@heroicons/react/24/outline";
import { useState, ReactNode } from "react";
import { getThemePresets, iconStyles, textStyles, cn, useThemeStyles } from "@/lib/styles";
import { colors } from "@/lib/theme";
import { useTheme } from "@/lib/ThemeContext";
import { Input } from "./FormField";

export interface DirectiveControllers {
    onMoveUp?: () => void;
    onMoveDown?: () => void;
    onDelete?: () => void;
    canMoveUp?: boolean;
    canMoveDown?: boolean;
    stepNumber?: number;
    draggable?: boolean;
    onDragStart?: (e: React.DragEvent) => void;
    onDragOver?: (e: React.DragEvent) => void;
    onDragLeave?: (e: React.DragEvent) => void;
    onDrop?: (e: React.DragEvent) => void;
    onDragEnd?: (e: React.DragEvent) => void;
}

interface DirectiveContainerProps {
    title: string;
    children: ReactNode;
    helpContent?: ReactNode;
    className?: string;
    condition?: string;
    onConditionChange?: (condition: string | undefined) => void;
    showConditionOption?: boolean;
    headerColor?: { light: string, dark: string };
    borderColor?: { light: string, dark: string };
    iconColor?: { light: string, dark: string };
    icon?: React.ComponentType<{ className?: string }>;
    // Unified drag controllers
    controllers: DirectiveControllers;
}

export default function DirectiveContainer({
    title,
    children,
    helpContent,
    className = "",
    condition,
    onConditionChange,
    showConditionOption = true,
    headerColor,
    borderColor,
    iconColor,
    icon: Icon,
    controllers,
}: DirectiveContainerProps) {
    const { isDark } = useTheme();
    const styles = useThemeStyles(isDark);
    const [showHelp, setShowHelp] = useState(false);
    const [showCondition, setShowCondition] = useState(false);

    return (
        <div
            className={cn(
                styles.card("default", "zero"),
                isDark ? borderColor?.dark || "border-[#2d4222]" : borderColor?.light || "border-gray-200",
                className,
            )}
            draggable={controllers?.draggable}
            onDragStart={controllers?.onDragStart}
            onDragOver={controllers?.onDragOver}
            onDragLeave={controllers?.onDragLeave}
            onDrop={controllers?.onDrop}
            onDragEnd={controllers?.onDragEnd}
        >
            <div className={cn(
                "flex items-center w-full p-1 rounded-t-md",
                isDark ? headerColor?.dark || "bg-[#1f2e18]" : headerColor?.light || "bg-[#f0f7e7]",
            )}>
                {/* Left-aligned Controls */}
                {controllers && (
                    <div className="flex items-center gap-0.5 mr-2 flex-shrink-0">
                        {/* Drag Handle */}
                        <button
                            className={cn(
                                "cursor-grab active:cursor-grabbing transition-colors flex items-center justify-center touch-manipulation",
                                "p-1 md:p-1 min-h-[44px] min-w-[44px] md:min-h-[auto] md:min-w-[auto]",
                                isDark ? "text-[#9ca3af] hover:text-[#91c84a]" : `text-gray-400 hover:text-[${colors.primary[600]}]`
                            )}
                            onMouseDown={(e) => e.stopPropagation()}
                            title="Drag to reorder"
                        >
                            <Bars3Icon className={cn(iconStyles(isDark, 'sm'), "md:h-4 md:w-4 h-5 w-5")} />
                        </button>

                        {/* Step Number */}
                        {controllers.stepNumber && (
                            <div className={cn(
                                "px-1.5 py-0.5 rounded text-xs font-medium min-w-[1.5rem] text-center flex items-center justify-center",
                                isDark ? "bg-[#374151] text-[#d1d5db]" : "bg-gray-200 text-gray-600"
                            )}>
                                {controllers.stepNumber}
                            </div>
                        )}

                        {/* Reorder Controls - Vertically Centered */}
                        <div className="flex flex-col gap-1 md:gap-0 md:-space-y-px">
                            <button
                                className={cn(
                                    "transition-colors flex items-center justify-center touch-manipulation",
                                    "p-2 md:p-0.5 min-h-[36px] min-w-[36px] md:min-h-[auto] md:min-w-[auto]",
                                    controllers.canMoveUp
                                        ? (isDark ? "text-[#d1d5db] hover:text-[#91c84a]" : `text-gray-600 hover:text-[${colors.primary[600]}]`)
                                        : (isDark ? "text-[#6b7280] cursor-not-allowed" : "text-gray-300 cursor-not-allowed")
                                )}
                                onClick={controllers.onMoveUp}
                                disabled={!controllers.canMoveUp}
                                title="Move up"
                            >
                                <ChevronUpIcon className="w-4 h-4 md:w-3 md:h-3" />
                            </button>
                            <button
                                className={cn(
                                    "transition-colors flex items-center justify-center touch-manipulation",
                                    "p-2 md:p-0.5 min-h-[36px] min-w-[36px] md:min-h-[auto] md:min-w-[auto]",
                                    controllers.canMoveDown
                                        ? (isDark ? "text-[#d1d5db] hover:text-[#91c84a]" : `text-gray-600 hover:text-[${colors.primary[600]}]`)
                                        : (isDark ? "text-[#6b7280] cursor-not-allowed" : "text-gray-300 cursor-not-allowed")
                                )}
                                onClick={controllers.onMoveDown}
                                disabled={!controllers.canMoveDown}
                                title="Move down"
                            >
                                <ChevronDownIcon className="w-4 h-4 md:w-3 md:h-3" />
                            </button>
                        </div>
                        <button
                            className={cn(
                                "transition-colors flex items-center justify-center touch-manipulation",
                                "p-2 md:p-1 min-h-[44px] min-w-[44px] md:min-h-[auto] md:min-w-[auto]",
                                `text-[${colors.error}] hover:text-red-600`
                            )}
                            onClick={controllers.onDelete}
                            title="Delete directive"
                        >
                            <TrashIcon className={cn(iconStyles(isDark, 'sm'), "md:h-4 md:w-4 h-5 w-5")} />
                        </button>
                    </div>
                )}

                {/* Icon and Title */}
                {Icon && (
                    <Icon className={cn(
                        iconStyles(isDark, 'md'), "mr-2",
                        isDark ? iconColor?.dark || "text-gray-400" : iconColor?.light || "text-gray-600"
                    )} />
                )}
                <h2 className={cn(textStyles(isDark, { size: 'base', weight: 'medium', color: 'primary' }), "flex-1")}>{title}</h2>

                {/* Right-aligned Controls */}
                <div className="flex items-center gap-1 flex-shrink-0 pr-1">
                    {showConditionOption && onConditionChange && (
                        <button
                            className={cn(
                                "transition-all duration-200 flex items-center justify-center touch-manipulation rounded-md",
                                "p-2 min-h-[44px] min-w-[44px] md:min-h-[36px] md:min-w-[36px]",
                                "border", // Always have a border to prevent layout shift
                                showCondition
                                    ? (isDark
                                        ? "bg-[#1f2e18] text-[#7bb33a] border-[#2d4222]"
                                        : "bg-green-50 text-green-600 border-green-200")
                                    : (isDark
                                        ? "text-[#9ca3af] hover:text-[#7bb33a] hover:bg-[#1f2e18] border-transparent hover:border-[#2d4222]"
                                        : "text-gray-500 hover:text-green-600 hover:bg-green-50 border-transparent hover:border-green-200")
                            )}
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowCondition(!showCondition);
                            }}
                            title={showCondition ? "Hide condition" : "Add condition"}
                        >
                            <AdjustmentsHorizontalIcon className="h-5 w-5" />
                        </button>
                    )}
                    {helpContent && (
                        <button
                            className={cn(
                                "transition-all duration-200 flex items-center justify-center touch-manipulation rounded-md",
                                "p-2 min-h-[44px] min-w-[44px] md:min-h-[36px] md:min-w-[36px]",
                                "border", // Always have a border to prevent layout shift
                                showHelp
                                    ? (isDark
                                        ? "bg-[#1f2e18] text-[#7bb33a] border-[#2d4222]"
                                        : "bg-blue-50 text-blue-600 border-blue-200")
                                    : (isDark
                                        ? "text-[#9ca3af] hover:text-[#7bb33a] hover:bg-[#1f2e18] border-transparent hover:border-[#2d4222]"
                                        : "text-gray-500 hover:text-blue-600 hover:bg-blue-50 border-transparent hover:border-blue-200")
                            )}
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

            <div className="border-t border-[#e6f1d6]">
                {(showCondition || condition) && onConditionChange && (
                    <div className={cn(
                        "px-4 py-3 border-b",
                        isDark ? "bg-[#1f2e18] border-[#374151]" : "bg-[#f8faf6] border-[#e6f1d6]",
                    )}>
                        <div className="flex flex-col gap-2">
                            <label className={getThemePresets(isDark).formLabel}>
                                Condition
                            </label>
                            <Input
                                value={condition || ''}
                                onChange={(e) => onConditionChange(e.target.value || undefined)}
                                placeholder='e.g., arch=="x86_64" or platform=="linux"'
                                onClick={(e) => e.stopPropagation()}
                                monospace
                                className={cn(isDark ? "bg-grey-600" : "bg-white")}
                            />
                            <p className={textStyles(isDark, { size: 'xs', color: 'muted' })}>
                                This directive will only be executed when the condition is true. Leave empty to always execute.
                            </p>
                        </div>
                    </div>
                )}
                {helpContent && showHelp && (
                    <div className={cn(
                        "px-4 py-3 border-b",
                        isDark ? "bg-[#1a2113] border-[#2d4222]" : "bg-[#fafcf7] border-[#e6f1d6]"
                    )}>
                        {helpContent}
                    </div>
                )}
                <div className="p-4">
                    {children}
                </div>
            </div>
        </div>
    );
}