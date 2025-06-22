import { useRef, useEffect, useState } from "react";
import { DirectiveContainer, ListEditor, Textarea } from "@/components/ui";
import { DirectiveControllers } from "@/components/ui/DirectiveContainer";
import { PlayIcon } from "@heroicons/react/24/outline";
import { registerDirective, DirectiveMetadata } from "./registry";
import { HELP_SECTION, textStyles, cn } from "@/lib/styles";

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
    headerColor?: string;
    borderColor?: string;
    iconColor?: string;
    icon?: React.ComponentType<{ className?: string }>;
    controllers: DirectiveControllers;
}) {
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
        const lineHeight = parseInt(getComputedStyle(textarea).lineHeight) || 20;
        const padding = 16; // py-2 = 8px top + 8px bottom
        const minHeight = lineHeight + padding;
        textarea.style.height = Math.max(minHeight, scrollHeight) + "px";
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
        <div className={HELP_SECTION.container}>
            <h3 className={HELP_SECTION.title}>
                RUN Directive
            </h3>
            <div className={HELP_SECTION.text}>
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
                    <pre className={HELP_SECTION.code}>
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
                            "w-full px-3 py-2 border-0 rounded-none focus:outline-none focus:ring-0 focus:border-transparent resize-none overflow-hidden leading-5",
                            textStyles({ color: 'primary' })
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
    color: "bg-red-50 border-red-200 hover:bg-red-100",
    headerColor: "bg-red-50",
    borderColor: "border-red-200",
    iconColor: "text-red-600",
    defaultValue: { run: [] as string[] },
    keywords: ["run", "command", "execute", "bash"],
    component: RunCommandDirectiveComponent,
};

registerDirective(runDirectiveMetadata);