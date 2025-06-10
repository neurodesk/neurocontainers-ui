import { ReactNode, forwardRef } from "react";

interface FormFieldProps {
    label?: string;
    children: ReactNode;
    description?: string;
    className?: string;
}

export function FormField({ label, children, description, className = "" }: FormFieldProps) {
    return (
        <div className={`mb-4 ${className}`}>
            {label && (
                <label className="block text-sm font-medium text-[#0c0e0a] mb-2">
                    {label}
                </label>
            )}
            {children}
            {description && (
                <p className="mt-2 text-sm text-gray-500">
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
                className={`${monoClass} w-full px-3 py-2 border border-gray-200 rounded-md text-[#0c0e0a] focus:outline-none focus:ring-1 focus:ring-[#6aa329] focus:border-[#6aa329] ${className}`}
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
        const monoClass = monospace ? "font-mono" : "";
        const defaultClasses = "w-full px-3 py-2 border border-gray-200 rounded-md text-[#0c0e0a] focus:outline-none focus:ring-1 focus:ring-[#6aa329] focus:border-[#6aa329] resize-none";
        return (
            <textarea
                ref={ref}
                className={`${monoClass} ${className || defaultClasses}`}
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
            className={`w-full px-3 py-2 border border-gray-200 rounded-md text-[#0c0e0a] bg-white focus:outline-none focus:ring-1 focus:ring-[#6aa329] focus:border-[#6aa329] ${className}`}
            {...props}
        >
            {children}
        </select>
    );
}