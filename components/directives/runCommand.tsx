import { useRef, useEffect, useState } from "react";
import { DirectiveContainer, ListEditor, Textarea } from "@/components/ui";

export default function RunCommandDirectiveComponent({
    run,
    onChange,
}: {
    run: string[];
    onChange: (run: string[]) => void;
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
        <>
            <h3 className="font-semibold text-[#0c0e0a] mb-2">
                RUN Directive
            </h3>
            <div className="text-sm text-gray-600 space-y-2">
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
                    <pre className="bg-gray-100 p-2 rounded text-xs mt-1 whitespace-pre-wrap">
                        {`mkdir -p /app/data`}
                    </pre>
                </div>
            </div>
        </>
    );

    return (
        <DirectiveContainer title="Run Commands" helpContent={helpContent}>
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
                        className="w-full px-3 py-2 border-0 rounded-none text-[#0c0e0a] focus:outline-none focus:ring-0 focus:border-transparent resize-none overflow-hidden leading-5"
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