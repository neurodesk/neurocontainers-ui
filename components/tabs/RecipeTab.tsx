"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useTabs } from "@/lib/tabs/TabManager";
import { useTheme } from "@/lib/ThemeContext";
import { cn } from "@/lib/styles";
import { sections } from "@/lib/sections";
import ContainerMetadata from "@/components/metadata";
import BuildRecipeComponent from "@/components/recipe";
import ValidateRecipeComponent from "@/components/validate";
import { useContainerStorage } from "@/hooks/useContainerStorage";
import type { ContainerRecipe } from "@/components/common";
import { SaveStatus } from "@/lib/containerStorage";
import { CopyrightInfoSchema } from "@/lib/zodSchema";

export function RecipeTab({ tabId }: { tabId?: string }) {
  const { tabs, activeId, update } = useTabs();
  const effectiveId = tabId ?? activeId;
  const tab = useMemo(() => tabs.find(t => t.id === effectiveId), [tabs, effectiveId]);
  const { isDark } = useTheme();
  const [recipe, setRecipe] = useState<ContainerRecipe | null>(() => (tab?.payload as { recipe?: ContainerRecipe } | undefined)?.recipe ?? null);
  const hasInvalidLicenses = recipe?.copyright?.some((entry) => !CopyrightInfoSchema.safeParse(entry).success) ?? false;

  const { saveStatus, currentContainerId, saveToStorage, setCurrentContainerId, exportYAML } = useContainerStorage();
  const validateRef = useRef<HTMLDivElement | null>(null);
  const skipNextUpdateRef = useRef(false);

  // Sync local state from active tab when switching
  useEffect(() => {
    const payload = (tab?.payload as { recipe?: ContainerRecipe; containerId?: string } | undefined) || {};
    setRecipe(payload.recipe ?? null);
    if (payload.containerId) {
      setCurrentContainerId(payload.containerId);
    } else {
      setCurrentContainerId(null);
    }
    // prevent immediate payload overwrite on tab switch
    skipNextUpdateRef.current = true;
  // Only when switching tabs
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab?.id]);

  // Sync tab title with recipe name and keep recipe in payload for restore
  useEffect(() => {
    if (!tab) return;
    if (skipNextUpdateRef.current) {
      skipNextUpdateRef.current = false;
      return;
    }
    const desiredTitle = recipe?.name?.trim() || "Untitled";
    const currentTitle = tab.title;
    const currentRecipe = (tab.payload as { recipe?: ContainerRecipe } | undefined)?.recipe;
    const shouldUpdateTitle = currentTitle !== desiredTitle;
    const shouldUpdateRecipe = currentRecipe !== recipe;
    if (!shouldUpdateTitle && !shouldUpdateRecipe) return;
    update(tab.id, (draft) => {
      if (shouldUpdateTitle) draft.title = desiredTitle;
      if (shouldUpdateRecipe) {
        const base = (draft.payload as Record<string, unknown>) || {};
        draft.payload = { ...base, recipe } as unknown;
      }
    });
  }, [recipe, tab, update]);

  // Dirty flag tracking based on save status
  useEffect(() => {
    if (!tab) return;
    const dirty = saveStatus !== SaveStatus.Saved;
    update(tab.id, (draft) => { draft.dirty = dirty; });
  }, [saveStatus, tab, update]);

  const handleChange = useCallback((newRecipe: ContainerRecipe) => {
    setRecipe(newRecipe);
    // autosave via storage hook
    saveToStorage(newRecipe, currentContainerId ?? undefined);
    // capture assigned id if newly created
    // Note: the hook updates currentContainerId asynchronously after debounce; mirror it to tab payload when it changes
  }, [saveToStorage, currentContainerId]);

  // When storage hook allocates an id, persist only containerId in payload for restore
  useEffect(() => {
    if (!tab) return;
    const currentId = (tab.payload as { containerId?: string } | undefined)?.containerId;
    if (currentContainerId && currentId !== currentContainerId) {
      update(tab.id, (draft) => {
        const base = (draft.payload as Record<string, unknown>) || {};
        draft.payload = { ...base, containerId: currentContainerId } as unknown;
      });
    }
  }, [currentContainerId, tab, update]);

  // Listen for Ribbon events (focus sections, download)
  useEffect(() => {
    const onFocus = (e: Event) => {
      const ce = e as CustomEvent;
      if (ce.detail?.section === 'validate') {
        validateRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    };
    const onDownload = () => { if (recipe && !hasInvalidLicenses) exportYAML(recipe); };
    window.addEventListener('nc:focus-section', onFocus as EventListener);
    window.addEventListener('nc:recipe-download', onDownload as EventListener);
    return () => {
      window.removeEventListener('nc:focus-section', onFocus as EventListener);
      window.removeEventListener('nc:recipe-download', onDownload as EventListener);
    };
  }, [recipe, hasInvalidLicenses, exportYAML]);

  if (!tab) return null;

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className={cn("text-xl font-semibold", isDark?"text-[#e8f5d0]":"text-gray-900")}>{recipe?.name || "Untitled recipe"}</h1>
        <button
          className={cn("px-3 py-1 rounded text-sm", isDark?"bg-[#1f2e18] text-white":"bg-gray-100 text-gray-800")}
          onClick={() => { if (recipe && !hasInvalidLicenses) exportYAML(recipe); }}
          disabled={!recipe || hasInvalidLicenses}
        >
          Download YAML
        </button>
      </div>
      {hasInvalidLicenses && (
        <p role="alert" className={cn("text-sm", isDark ? "text-red-400" : "text-red-600")}>
          Complete each license’s required fields before downloading YAML.
        </p>
      )}

      {!recipe ? (
        <div className={cn("rounded-lg border p-4", isDark?"border-[#2d4222]/50":"border-[#e6f1d6]")}>No recipe loaded.</div>
      ) : (
        <>
          <div className="space-y-6">
            <div>
              <div className="mb-2">
                <div className={cn("text-sm font-medium", isDark?"text-[#c4e382]":"text-green-700")}>{sections[0].title}</div>
                <p className={cn("text-xs", isDark?"text-gray-400":"text-gray-600")}>{sections[0].description}</p>
              </div>
              <ContainerMetadata recipe={recipe} onChange={handleChange} onValidationChange={() => {}} />
            </div>
            <div>
              <div className="mb-2">
                <div className={cn("text-sm font-medium", isDark?"text-[#c4e382]":"text-green-700")}>{sections[1].title}</div>
                <p className={cn("text-xs", isDark?"text-gray-400":"text-gray-600")}>{sections[1].description}</p>
              </div>
              <BuildRecipeComponent recipe={recipe.build} onChange={(build) => handleChange({ ...recipe, build })} />
            </div>
            <div ref={validateRef}>
              <div className="mb-2">
                <div className={cn("text-sm font-medium", isDark?"text-[#c4e382]":"text-green-700")}>{sections[2].title}</div>
                <p className={cn("text-xs", isDark?"text-gray-400":"text-gray-600")}>{sections[2].description}</p>
              </div>
              <ValidateRecipeComponent recipe={recipe} onValidationChange={() => {}} onValidationResult={() => {}} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
