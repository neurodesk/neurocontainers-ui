import { DirectiveContainer, FormField, Input, Textarea, ListEditor } from "@/components/ui";
import { DirectiveControllers } from "@/components/ui/DirectiveContainer";
import { Variable } from "@/components/common";
import { TrashIcon, CubeTransparentIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { registerDirective, DirectiveMetadata } from "./registry";
import { cn, getHelpSection, useThemeStyles, buttonStyles } from "@/lib/styles";
import { useTheme } from "@/lib/ThemeContext";

export function VariableComponent({ variable, onChange }: { variable: Variable, onChange?: (variable: Variable) => void }) {
    const { isDark } = useTheme();

    if (typeof variable === 'string') {
        return (
            <Input
                value={variable}
                onChange={(e) => onChange && onChange(e.target.value)}
                monospace
                placeholder="Enter string value"
            />
        );
    } else if (Array.isArray(variable)) {
        const stringArray = variable.map(item => JSON.stringify(item));

        const handleArrayChange = (newStringArray: string[]) => {
            if (onChange) {
                try {
                    const parsed = newStringArray.map(str => JSON.parse(str));
                    onChange(parsed);
                } catch {
                    // Handle parse error - keep as strings for now
                    onChange(newStringArray);
                }
            }
        };

        return (
            <ListEditor
                items={stringArray}
                onChange={handleArrayChange}
                createNewItem={() => '""'}
                addButtonText="Add Item"
                emptyMessage="No array items"
                allowReorder={true}
                renderItem={(item, index, onChangeItem) => (
                    <Input
                        value={item}
                        onChange={(e) => onChangeItem(e.target.value)}
                        placeholder="JSON value"
                        monospace
                    />
                )}
            />
        );
    } else {
        return (
            <Textarea
                value={JSON.stringify(variable, null, 2)}
                onChange={(e) => {
                    if (onChange) {
                        try {
                            onChange(JSON.parse(e.target.value));
                        } catch {
                            // Handle parse error silently for now
                        }
                    }
                }}
                placeholder="Enter JSON object"
                className={cn(
                    "w-full min-h-[80px] px-3 py-2",
                    "border rounded-md",
                    isDark
                        ? "border-gray-700 bg-gray-800 text-gray-200"
                        : "border-gray-200 bg-white text-gray-900",
                    "focus:outline-none focus:ring-1 focus:ring-[#6aa329] focus:border-[#6aa329]",
                    "resize-none font-mono text-sm",
                )}
            />
        );
    }
}

export default function VariableDirectiveComponent({
    variables,
    onChange,
    condition,
    onConditionChange,
    headerColor,
    borderColor,
    iconColor,
    icon,
    controllers,
}: {
    variables: { [key: string]: Variable },
    onChange: (variables: { [key: string]: Variable }) => void,
    condition?: string;
    onConditionChange?: (condition: string | undefined) => void;
    headerColor?: { light: string, dark: string };
    borderColor?: { light: string, dark: string };
    iconColor?: { light: string, dark: string };
    icon?: React.ComponentType<{ className?: string }>;
    controllers: DirectiveControllers;
}) {
    const { isDark } = useTheme();
    const styles = useThemeStyles(isDark);
    const [newVarKey, setNewVarKey] = useState("");

    const updateVariable = (key: string, value: Variable) => {
        onChange({ ...variables, [key]: value });
    };

    const removeVariable = (key: string) => {
        const updated = { ...variables };
        delete updated[key];
        onChange(updated);
    };

    const addVariable = () => {
        if (newVarKey.trim()) {
            onChange({ ...variables, [newVarKey]: "" });
            setNewVarKey("");
        }
    };

    const helpContent = (
        <>
            <h3 className={getHelpSection(isDark).title}>
                VARIABLE Directive
            </h3>
            <div className={cn(getHelpSection(isDark).text, "space-y-2")}>
                <p>
                    The VARIABLE directive defines variables that can be used throughout the container build.
                </p>
                <div>
                    <strong>Variable Types:</strong>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                        <li><strong>String:</strong> Simple text values</li>
                        <li><strong>Array:</strong> Lists of values (JSON format)</li>
                        <li><strong>Object:</strong> Complex data structures (JSON format)</li>
                    </ul>
                </div>
                <div>
                    <strong>Examples:</strong>
                    <div className={getHelpSection(isDark).code}>
                        <div><strong>String:</strong> &quot;myvalue&quot; or hello_world</div>
                        <div><strong>Array:</strong> [&quot;item1&quot;, &quot;item2&quot;, &quot;item3&quot;]</div>
                        <div><strong>Object:</strong> {"{"}&quot;key&quot;: &quot;value&quot;, &quot;number&quot;: 42{"}"}</div>
                    </div>
                </div>
            </div>
        </>
    );

    return (
        <DirectiveContainer
            title="Variables"
            helpContent={helpContent}
            condition={condition}
            onConditionChange={onConditionChange}
            headerColor={headerColor}
            borderColor={borderColor}
            iconColor={iconColor}
            icon={icon}
            controllers={controllers}
        >
            {Object.entries(variables).map(([key, value]) => (
                <FormField
                    key={key}
                    label={
                        <div className="flex justify-between items-center">
                            <span>{key}</span>
                            <button
                                className={cn(styles.buttons.icon, "ml-2")}
                                onClick={() => removeVariable(key)}
                                title={`Remove variable ${key}`}
                            >
                                <TrashIcon className={styles.icon("sm")} />
                            </button>
                        </div>
                    }
                    className="border-l-4 border-[#d3e7b6] pl-4"
                >
                    <VariableComponent
                        variable={value}
                        onChange={(updated) => updateVariable(key, updated)}
                    />
                </FormField>
            ))}

            <FormField label="Add New Variable">
                <div className="flex">
                    <Input
                        className="rounded-r-none"
                        placeholder="Variable name"
                        value={newVarKey}
                        onChange={(e) => setNewVarKey(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addVariable()}
                    />
                    <button
                        className={cn(
                            buttonStyles(isDark, 'primary', 'md'),
                            "rounded-l-none rounded-r-md min-h-[44px] md:min-h-[auto]",
                            "disabled:opacity-50 disabled:cursor-not-allowed"
                        )}
                        onClick={addVariable}
                        disabled={!newVarKey.trim()}
                    >
                        Add
                    </button>
                </div>
            </FormField>
        </DirectiveContainer>
    );
}

// Register this directive
export const variablesDirectiveMetadata: DirectiveMetadata = {
    key: "variables",
    label: "Variables",
    description: "Define template variables for dynamic values",
    icon: CubeTransparentIcon,
    color: { light: "bg-green-50 border-green-200 hover:bg-green-100", dark: "bg-green-900 border-green-700 hover:bg-green-800" },
    headerColor: { light: "bg-green-50", dark: "bg-green-900" },
    borderColor: { light: "border-green-200", dark: "border-green-700" },
    iconColor: { light: "text-green-600", dark: "text-green-400" },
    defaultValue: { variables: {} },
    keywords: ["variables", "var", "template", "placeholder", "substitution"],
    component: VariableDirectiveComponent,
};

registerDirective(variablesDirectiveMetadata);