"use client";

import { useTheme } from "@/lib/ThemeContext";
import { cn } from "@/lib/styles";
import { Logo } from "@/components/ui/Logo";

export function TopHeader() {
  const { isDark } = useTheme();
  return (
    <div className={cn(
      "w-full border-b px-3 py-2 flex items-center gap-3",
      isDark ? "bg-[#080a07] border-[#1f2e18]" : "bg-white border-[#e6f1d6]"
    )}>
      <Logo className="h-5 w-auto" />
      <span className={cn("text-xs", isDark?"text-[#91c84a]":"text-green-700")}>Neurocontainers Builder</span>
    </div>
  );
}

