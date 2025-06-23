import { cn } from "@/lib/styles";
import { useTheme } from "@/lib/ThemeContext";

interface SectionHeaderProps {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    description: string;
}

export function SectionHeader({
    icon: Icon,
    title,
    description
}: SectionHeaderProps) {
    const { isDark } = useTheme();
    return (
        <div className="flex items-center space-x-3 mb-4">
            <div className={cn(
                "p-2 rounded-lg shadow-sm",
                isDark ? "bg-[#7bb33a]" : "bg-[#6aa329]"
            )}>
                <Icon className="h-5 w-5 text-white" />
            </div>
            <div>
                <h2 className={cn("text-xl font-bold", isDark ? "text-white" : "text-[#0c0e0a]")}>
                    {title}
                </h2>
                <p className="text-[#4f7b38] mt-1">
                    {description}
                </p>
            </div>
        </div>
    );
}