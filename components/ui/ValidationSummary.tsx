import { ExclamationCircleIcon } from "@heroicons/react/24/outline";
import { iconStyles, textStyles, cn } from "@/lib/styles";

interface ValidationSummaryProps {
    errors: (string | null)[];
    show: boolean;
}

export default function ValidationSummary({ errors, show }: ValidationSummaryProps) {
    const validErrors = errors.filter(Boolean) as string[];
    
    if (!show || validErrors.length === 0) {
        return null;
    }

    return (
        <div className="p-4 bg-red-50 border-b border-red-200 rounded-t-lg">
            <div className="flex items-start gap-3">
                <ExclamationCircleIcon className={cn(iconStyles('md'), "text-red-500 flex-shrink-0 mt-0.5")} />
                <div>
                    <h4 className={cn(textStyles({ size: 'sm', weight: 'medium' }), "text-red-800 mb-2")}>
                        Please fix the following issues:
                    </h4>
                    <ul className={cn(textStyles({ size: 'sm' }), "text-red-700 space-y-1")}>
                        {validErrors.map((error, index) => (
                            <li key={index}>• {error}</li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}