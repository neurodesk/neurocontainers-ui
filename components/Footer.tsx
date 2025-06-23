import { GlobeAltIcon, CodeBracketIcon } from "@heroicons/react/24/outline";
import { cn } from "@/lib/styles";
import { useTheme } from "@/lib/ThemeContext";

export function Footer() {
    const { isDark } = useTheme();
    return (
        <footer className={cn(
            "border-t mt-12",
            isDark
                ? "bg-[#161a0e] border-[#2d4222]"
                : "bg-white border-[#e6f1d6]"
        )}>
            <div className="max-w-6xl mx-auto px-6 py-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
                    {/* Main Site */}
                    <div>
                        <h3 className={cn(
                            "text-sm font-semibold",
                            isDark ? "text-[#d1d5db]" : "text-[#0c0e0a]",
                            "mb-3"
                        )}>Neurodesk</h3>
                        <a
                            href="https://neurodesk.org"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-2 text-sm text-[#4f7b38] hover:text-[#6aa329] transition-colors"
                        >
                            <GlobeAltIcon className="h-4 w-4" />
                            <span>neurodesk.org</span>
                        </a>
                        <p className="text-xs text-gray-500 mt-2">
                            A comprehensive neuroimaging environment
                        </p>
                    </div>

                    {/* Containers Repository */}
                    <div>
                        <h3 className={cn(
                            "text-sm font-semibold",
                            isDark ? "text-[#d1d5db]" : "text-[#0c0e0a]",
                            "mb-3"
                        )}>Containers</h3>
                        <a
                            href="https://github.com/neurodesk/neurocontainers"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-2 text-sm text-[#4f7b38] hover:text-[#6aa329] transition-colors"
                        >
                            <CodeBracketIcon className="h-4 w-4" />
                            <span>neurodesk/neurocontainers</span>
                        </a>
                        <p className="text-xs text-gray-500 mt-2">
                            Container recipes and configurations
                        </p>
                    </div>

                    {/* UI Repository */}
                    <div>
                        <h3 className={cn(
                            "text-sm font-semibold",
                            isDark ? "text-[#d1d5db]" : "text-[#0c0e0a]",
                            "mb-3"
                        )}>Builder UI</h3>
                        <a
                            href="https://github.com/neurodesk/neurocontainers-ui"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-2 text-sm text-[#4f7b38] hover:text-[#6aa329] transition-colors"
                        >
                            <CodeBracketIcon className="h-4 w-4" />
                            <span>neurodesk/neurocontainers-ui</span>
                        </a>
                        <p className="text-xs text-gray-500 mt-2">
                            This visual builder interface
                        </p>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div
                    className={cn(
                        "border-t mt-8 pt-6 text-center",
                        isDark ? "border-[#2d4222]" : "border-[#e6f1d6]"
                    )}
                >
                    <p className="text-xs text-gray-500">
                        Built for the neuroimaging community by the Neurodesk team.
                    </p>
                </div>
            </div>
        </footer>
    );
}