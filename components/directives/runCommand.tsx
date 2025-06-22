import { useRef, useEffect, useState } from "react";
import { DirectiveContainer, ListEditor, Textarea } from "@/components/ui";
import { DirectiveControllers } from "@/components/ui/DirectiveContainer";
import { PlayIcon } from "@heroicons/react/24/outline";
import { registerDirective, DirectiveMetadata } from "./registry";
import { textareaStyles, cn, getHelpSection } from "@/lib/styles";
import { useTheme } from "@/lib/ThemeContext";

export default function RunCommandDirectiveComponent({
    run,
    onChange,
    condition,
    onConditionChange,
    headerColor,
    borderColor,
    iconColor,
    icon,
    controllers,
}: {
    run: string[];
    onChange: (run: string[]) => void;
    condition?: string;
    onConditionChange?: (condition: string | undefined) => void;
    headerColor?: { light: string, dark: string };
    borderColor?: { light: string, dark: string };
    iconColor?: { light: string, dark: string };
    icon?: React.ComponentType<{ className?: string }>;
    controllers: DirectiveControllers;
}) {
    const { isDark } = useTheme();
    const textareaRefs = useRef<(HTMLTextAreaElement | null)[]>([]);
    const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

    // Update refs array when run array changes
    useEffect(() => {
        textareaRefs.current = textareaRefs.current.slice(0, run.length);
    }, [run.length]);

    const adjustTextareaHeight = (textarea: HTMLTextAreaElement) => {
        textarea.style.height = "auto";
        const scrollHeight = textarea.scrollHeight;
        // Use line height to calculate minimum height for single line
        const computedStyle = getComputedStyle(textarea);
        const lineHeight = parseInt(computedStyle.lineHeight) || 20; // leading-5 = 1.25 * 16px = 20px
        const paddingTop = parseInt(computedStyle.paddingTop) || 6; // py-1.5 = 6px
        const paddingBottom = parseInt(computedStyle.paddingBottom) || 6; // py-1.5 = 6px
        const borderTop = parseInt(computedStyle.borderTopWidth) || 0;
        const borderBottom = parseInt(computedStyle.borderBottomWidth) || 0;

        const minHeight = lineHeight + paddingTop + paddingBottom + borderTop + borderBottom;
        const newHeight = Math.max(minHeight, scrollHeight);

        textarea.style.height = newHeight + "px";
    };

    const handleKeyDown = (
        e: React.KeyboardEvent<HTMLTextAreaElement>,
        index: number
    ) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            e.stopPropagation();

            // Insert new command after current one
            const newRun = [...run];
            newRun.splice(index + 1, 0, "");
            onChange(newRun);

            // Focus the new textarea after it's rendered
            setTimeout(() => {
                textareaRefs.current[index + 1]?.focus();
            }, 0);
        }
    };

    const handleTextareaChange = (
        e: React.ChangeEvent<HTMLTextAreaElement>,
        index: number,
        onChangeCommand: (command: string) => void
    ) => {
        onChangeCommand(e.target.value);
        adjustTextareaHeight(e.target);
    };

    // Adjust height on mount and when content changes
    useEffect(() => {
        textareaRefs.current.forEach((textarea) => {
            if (textarea) {
                adjustTextareaHeight(textarea);
            }
        });
    }, [run]);

    const helpContent = (
        <div className={getHelpSection(isDark).container}>
            <h3 className={getHelpSection(isDark).title}>
                RUN Directive
            </h3>
            <div className={getHelpSection(isDark).text}>
                <p>
                    The RUN instruction executes commands in a new layer on top
                    of the current image and commits the results.
                </p>
                <div>
                    <strong>Usage:</strong>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                        <li>All lines are concatenated together as a single Docker layer</li>
                        <li>Press Enter to add a new command</li>
                        <li>Press Shift+Enter for a new line within a command</li>
                        <li>Drag the handle to reorder commands</li>
                    </ul>
                </div>
                <div>
                    <strong>Examples:</strong>
                    <pre className={getHelpSection(isDark).code}>
                        {`mkdir -p /app/data`}
                    </pre>
                </div>
            </div>
        </div>
    );

    return (
        <DirectiveContainer
            title="Run Commands"
            helpContent={helpContent}
            condition={condition}
            onConditionChange={onConditionChange}
            headerColor={headerColor}
            borderColor={borderColor}
            iconColor={iconColor}
            icon={icon}
            controllers={controllers}
        >
            <ListEditor
                items={run}
                onChange={onChange}
                createNewItem={() => ""}
                addButtonText="Add Command"
                emptyMessage="No commands to run."
                allowReorder={true}
                focusedIndex={focusedIndex}
                renderItem={(command, index, onChangeCommand) => (
                    <Textarea
                        ref={(el) => { (textareaRefs.current[index] = el) }}
                        className={cn(
                            textareaStyles(isDark, {
                                monospace: true,
                                height: 'min-h-[2.5rem]'
                            }),
                            "border-0 rounded-none focus:ring-0 focus:border-transparent resize-none overflow-hidden leading-5"
                        )}
                        value={command}
                        onChange={(e) => handleTextareaChange(e, index, onChangeCommand)}
                        onKeyDown={(e) => handleKeyDown(e, index)}
                        onFocus={() => setFocusedIndex(index)}
                        onBlur={() => setFocusedIndex(null)}
                        placeholder="Command to run (Enter for new command, Shift+Enter for new line)"
                        rows={1}
                        monospace
                    />
                )}
            />
        </DirectiveContainer>
    );
}

// Register this directive
export const runDirectiveMetadata: DirectiveMetadata = {
    key: "run",
    label: "Run Commands",
    description: "Execute shell commands during container build",
    icon: PlayIcon,
    color: { light: "bg-red-50 border-red-200 hover:bg-red-100", dark: "bg-red-900 border-red-700 hover:bg-red-800" },
    headerColor: { light: "bg-red-50", dark: "bg-red-900" },
    borderColor: { light: "border-red-200", dark: "border-red-700" },
    iconColor: { light: "text-red-600", dark: "text-red-400" },
    defaultValue: { run: [] as string[] },
    keywords: ["run", "command", "execute", "bash"],
    component: RunCommandDirectiveComponent,
};

registerDirective(runDirectiveMetadata);