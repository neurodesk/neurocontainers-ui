import { ReactNode, forwardRef } from "react";
import { presets, textareaStyles, cn } from "@/lib/styles";

interface FormFieldProps {
    label?: string | ReactNode;
    children: ReactNode;
    description?: string;
    className?: string;
}

export function FormField({ label, children, description, className = "" }: FormFieldProps) {
    return (
        <div className={cn(presets.formField, className)}>
            {label && (
                <label className={presets.formLabel}>
                    {label}
                </label>
            )}
            {children}
            {description && (
                <p className="mt-1 text-xs text-gray-500">
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
        const monoClass = monospace ? "font-mono" : "";
        return (
            <input
                ref={ref}
                className={cn(presets.input, monoClass, className)}
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
        return (
            <textarea
                ref={ref}
                className={cn(textareaStyles({ monospace }), className)}
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
    return (
        <select
            className={cn(presets.input, 'bg-white', className)}
            {...props}
        >
            {children}
        </select>
    );
}