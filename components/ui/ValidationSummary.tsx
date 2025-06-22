import { ExclamationCircleIcon } from "@heroicons/react/24/outline";
import { iconStyles, textStyles, cn } from "@/lib/styles";
import { useTheme } from "@/lib/ThemeContext";

interface ValidationSummaryProps {
    errors: (string | null)[];
    show: boolean;
}

export default function ValidationSummary({ errors, show }: ValidationSummaryProps) {
    const { isDark } = useTheme();
    const validErrors = errors.filter(Boolean) as string[];

    if (!show || validErrors.length === 0) {
        return null;
    }

    return (
        <div className={cn(
            "p-4 border-b rounded-t-lg",
            isDark ? "bg-red-900/20 border-red-700" : "bg-red-50 border-red-200"
        )}>
            <div className="flex items-start gap-3">
                <ExclamationCircleIcon className={cn(
                    iconStyles(isDark, 'md'),
                    "flex-shrink-0 mt-0.5",
                    isDark ? "text-red-400" : "text-red-500"
                )} />
                <div>
                    <h4 className={cn(
                        textStyles(isDark, { size: 'sm', weight: 'medium' }),
                        "mb-2",
                        isDark ? "text-red-400" : "text-red-800"
                    )}>
                        Please fix the following issues:
                    </h4>
                    <ul className={cn(
                        textStyles(isDark, { size: 'sm' }),
                        "space-y-1",
                        isDark ? "text-red-300" : "text-red-700"
                    )}>
                        {validErrors.map((error, index) => (
                            <li key={index}>• {error}</li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}