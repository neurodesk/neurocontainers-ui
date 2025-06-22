import { ReactNode, forwardRef } from "react";
import { textStyles, cn, useThemeStyles } from "@/lib/styles";
import { useTheme } from "@/lib/ThemeContext";

interface FormFieldProps {
    label?: string | ReactNode;
    children: ReactNode;
    description?: string;
    className?: string;
}

export function FormField({ label, children, description, className = "" }: FormFieldProps) {
    const { isDark } = useTheme();
    const styles = useThemeStyles(isDark);

    return (
        <div className={cn(styles.classes.formField, className)}>
            {label && (
                <label className={styles.classes.formLabel}>
                    {label}
                </label>
            )}
            {children}
            {description && (
                <p className={cn("mt-1", textStyles(isDark, { size: 'xs', color: 'muted' }))}>
                    {description}
                </p>
            )}
        </div>
    );
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    monospace?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className = "", monospace = false, ...props }, ref) => {
        const { isDark } = useTheme();
        const styles = useThemeStyles(isDark);
        const monoClass = monospace ? "font-mono" : "";
        return (
            <input
                ref={ref}
                className={cn(styles.classes.input, monoClass, className)}
                {...props}
            />
        );
    }
);

Input.displayName = "Input";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    monospace?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className = "", monospace = false, ...props }, ref) => {
        const { isDark } = useTheme();
        const styles = useThemeStyles(isDark);
        return (
            <textarea
                ref={ref}
                className={cn(styles.textarea({ monospace }), className)}
                {...props}
            />
        );
    }
);

Textarea.displayName = "Textarea";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    children: React.ReactNode;
}

export function Select({ className = "", children, ...props }: SelectProps) {
    const { isDark } = useTheme();
    const styles = useThemeStyles(isDark);
    return (
        <select
            className={cn(styles.classes.input, className)}
            {...props}
        >
            {children}
        </select>
    );
}