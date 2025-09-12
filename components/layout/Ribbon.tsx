"use client";

import { useTabs } from "@/lib/tabs/TabManager";
import { useTheme } from "@/lib/ThemeContext";
import { cn, getThemeComponents, textStyles } from "@/lib/styles";
import { FolderPlusIcon, BookOpenIcon, DocumentTextIcon, PlusIcon, CheckBadgeIcon, ArrowDownTrayIcon, MoonIcon, SunIcon, BugAntIcon } from "@heroicons/react/24/outline";
import { Logo } from "@/components/ui/Logo";

export function Ribbon() {
  const { open } = useTabs();
  const { isDark, toggleTheme, resolvedTheme } = useTheme();
  const tc = getThemeComponents(isDark);
  const btnBase = "inline-flex items-center gap-1 px-2 py-1 sm:px-3 sm:py-1.5 rounded-md text-xs sm:text-sm whitespace-nowrap focus:outline-none focus:ring-1 transition-colors";
  const btnPrimary = isDark
    ? "bg-green-700 text-white hover:bg-green-600 focus:ring-green-500"
    : "bg-[#15803d] text-white hover:bg-[#166534] focus:ring-[#15803d]";
  const btnSecondary = isDark
    ? "bg-[#161a0e] text-[#e8f5d0] border border-[#2d4222] hover:bg-[#1f2e18] focus:ring-[#7bb33a]"
    : "bg-white text-[#15803d] border border-[#16a34a] hover:bg-green-50 focus:ring-[#15803d]";

  return (
    <div className={cn("w-full", isDark ? "bg-[#0a0c08]" : "bg-white")}> 
      <div className={cn(tc.layout.container, "py-1 flex items-center justify-between gap-3")}> 
        {/* Brand */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Logo className="h-5 w-auto" />
          <span className={cn(textStyles(isDark, { size: 'xs', color: 'secondary' }), "hidden xs:inline")}>Neurocontainers Builder</span>
        </div>

        {/* Actions: use a horizontally scrollable region on small screens */}
        <div className="flex-1 overflow-x-auto">
          <div className="flex items-center gap-2 justify-end min-w-max">
        <div className="flex items-center gap-2">
          <button className={cn(btnBase, btnPrimary)} onClick={() => {
            open({ type: 'wizard', title: 'New Container Wizard' });
          }} aria-label="New">
            <PlusIcon className="h-4 w-4"/> <span className="hidden sm:inline">New</span>
          </button>
          <button className={cn(btnBase, btnSecondary)} onClick={() => open({ type:"home", title:"Library" })} aria-label="Library">
            <FolderPlusIcon className="h-4 w-4"/> <span className="hidden sm:inline">Library</span>
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button className={cn(btnBase, btnSecondary)} onClick={() => open({ type:"docs", title:"Docs", payload:{} })} aria-label="Docs">
            <BookOpenIcon className="h-4 w-4"/> <span className="hidden sm:inline">Docs</span>
          </button>
          <button className={cn(btnBase, btnSecondary)} onClick={() => open({ type:"group-editor", title:"Group Editor", payload:{} })} aria-label="Group Editor">
            <DocumentTextIcon className="h-4 w-4"/> <span className="hidden sm:inline">Group Editor</span>
          </button>
        </div>
        {/* Contextual actions for active recipe tab */}
        <RecipeActions />
        {/* Far right: Report issue + Theme toggle */}
        <div className="flex items-center gap-2 pl-2">
          <a
            href="https://github.com/NeuroDesk/neurocontainers-ui/issues/new"
            target="_blank"
            rel="noopener noreferrer"
            className={cn("inline-flex items-center justify-center p-2 rounded-md border", isDark ? "bg-[#161a0e] border-[#2d4222] text-[#e8f5d0] hover:bg-[#1f2e18]" : "bg-white border-[#e6f1d6] text-[#0c0e0a] hover:bg-green-50")}
            title="Report an issue"
          >
            <BugAntIcon className="h-4 w-4"/>
          </a>
          <button
            className={cn("inline-flex items-center justify-center p-2 rounded-md border", isDark ? "bg-[#161a0e] border-[#2d4222] text-[#e8f5d0] hover:bg-[#1f2e18]" : "bg-white border-[#e6f1d6] text-[#0c0e0a] hover:bg-green-50")}
            onClick={toggleTheme}
            title={resolvedTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {resolvedTheme === 'dark' ? <SunIcon className="h-4 w-4"/> : <MoonIcon className="h-4 w-4"/>}
          </button>
        </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function RecipeActions() {
  const { tabs, activeId } = useTabs();
  const { isDark } = useTheme();
  const active = tabs.find(t => t.id === activeId);
  if (!active || active.type !== 'recipe') return null;
  type RecipePayload = { recipe?: unknown; containerId?: string } | undefined;
  const payload = active.payload as RecipePayload;
  const hasRecipe = Boolean(payload?.recipe);
  const btnBase = "inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-sm whitespace-nowrap focus:outline-none focus:ring-1 transition-colors";
  const btnSecondary = isDark
    ? "bg-[#161a0e] text-[#e8f5d0] border border-[#2d4222] hover:bg-[#1f2e18] focus:ring-[#7bb33a]"
    : "bg-white text-[#15803d] border border-[#16a34a] hover:bg-green-50 focus:ring-[#15803d]";
  return (
    <div className="flex items-center gap-2">
      <button
        className={cn(btnBase, btnSecondary)}
        onClick={() => {
          window.dispatchEvent(new CustomEvent('nc:focus-section', { detail: { section: 'validate' } }));
        }}
        disabled={!hasRecipe}
        title="Jump to Validate"
      >
        <CheckBadgeIcon className="h-4 w-4"/> <span className="hidden sm:inline">Validate</span>
      </button>
      <button
        className={cn(btnBase, btnSecondary)}
        onClick={() => { window.dispatchEvent(new CustomEvent('nc:recipe-download')); }}
        disabled={!hasRecipe}
        title="Download YAML"
      >
        <ArrowDownTrayIcon className="h-4 w-4"/> <span className="hidden sm:inline">Download</span>
      </button>
    </div>
  );
}
