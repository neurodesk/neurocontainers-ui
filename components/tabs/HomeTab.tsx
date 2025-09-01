"use client";

import { useState } from "react";
import { useTheme } from "@/lib/ThemeContext";
import { cn, getThemeComponents } from "@/lib/styles";
import { SparklesIcon, ArrowUpTrayIcon, DocumentPlusIcon } from "@heroicons/react/24/outline";
import { Footer } from "@/components/Footer";
import { useTabs } from "@/lib/tabs/TabManager";
import { useGitHubFiles } from "@/lib/useGithub";
import { LocalContainersList } from "@/components/LocalContainersList";
import { RemoteContainersList } from "@/components/RemoteContainersList";
import { load as loadYAML } from "js-yaml";
import { migrateLegacyRecipe, type ContainerRecipe } from "@/components/common";
import { useContainerStorage } from "@/hooks/useContainerStorage";
import { Logo } from "../ui/Logo";
import YamlPasteModal from "@/components/yamlPasteModal";

export function HomeTab() {
  const { isDark } = useTheme();
  const { open } = useTabs();
  const { files } = useGitHubFiles("neurodesk", "neurocontainers", "main");
  const { deleteContainer } = useContainerStorage();

  // Match legacy: allow switching between GitHub/Local repository views
  const [filesystemMode, setFilesystemMode] = useState<"local" | "remote">("remote");
  const [isYamlPasteModalOpen, setIsYamlPasteModalOpen] = useState(false);

  const openRecipeTab = (recipe: ContainerRecipe, containerId?: string) => {
    const id = open({ type: "recipe", title: recipe.name || "Untitled", payload: { recipe: recipe, containerId } });
    return id;
  };

  const loadContainer = (recipe: ContainerRecipe, id?: string) => {
    // In the tabbed UI, loading a container opens a Recipe tab
    openRecipeTab(recipe, id);
  };

  const processYamlFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const content = String(reader.result || "");
        const recipe = migrateLegacyRecipe(loadYAML(content) as ContainerRecipe);
        openRecipeTab(recipe);
      } catch (error) {
        console.error("Failed to load YAML file:", error);
        alert("Failed to load YAML file. Please check the file format.");
      }
    };
    reader.readAsText(file);
  };

  const handlePasteYaml = () => {
    setIsYamlPasteModalOpen(true);
  };

  const layout = getThemeComponents(isDark).layout;

  return (
    <div className={cn(layout.container, "py-4 sm:py-6")}> 
      <div className="text-center mb-8 mt-8">
        <div
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4 group"
        >
          <div className="transition-transform duration-200 group-hover:scale-105">
            <Logo className="h-12 w-auto" />
          </div>
          <h1 className={cn("text-3xl font-bold transition-colors duration-200",
            isDark ? "text-[#e8f5d0] group-hover:text-[#91c84a]" : "text-[#0c0e0a] group-hover:text-[#4f7b38]"
          )}>
            NeuroContainers Builder
          </h1>
        </div>
        <p className={cn("text-lg mb-8", isDark ? "text-[#91c84a]" : "text-[#4f7b38]")}>
          Create, customize, and validate containerized neuroimaging tools
        </p>

        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
          <button
            onClick={() => open({ type: 'wizard', title: 'New Container Wizard' })}
            className={cn(
              "group relative flex items-center space-x-3 px-6 py-4 rounded-xl font-semibold transition-all duration-300 text-lg backdrop-blur-sm border transform hover:scale-[1.02] hover:backdrop-blur-md overflow-hidden",
              isDark
                ? "bg-black/40 text-green-300 hover:bg-black/50 border-green-400/30 hover:border-green-300/50 shadow-lg hover:shadow-xl"
                : "bg-white/40 text-green-700 hover:bg-white/50 border-green-400/30 hover:border-green-300/50 shadow-lg hover:shadow-xl"
            )}
          >
            {/* Glass effect overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <SparklesIcon className="h-6 w-6 relative z-10" />
            <div className="flex flex-col items-start relative z-10">
              <span className="text-xl">Create New Container</span>
              <span className="text-sm opacity-75 font-normal">Use templates & forms</span>
            </div>

            {/* Subtle shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transform -translate-x-full group-hover:translate-x-full transition-all duration-700 ease-out" />
          </button>

          <button
            onClick={handlePasteYaml}
            className={cn(
              "group relative flex items-center space-x-3 px-6 py-4 rounded-xl font-semibold transition-all duration-300 text-lg backdrop-blur-sm border transform hover:scale-[1.02] hover:backdrop-blur-md overflow-hidden",
              isDark
                ? "bg-black/30 text-green-300 hover:bg-black/40 border-green-500/20 hover:border-green-400/40 shadow-lg hover:shadow-xl"
                : "bg-white/30 text-green-700 hover:bg-white/40 border-green-500/30 hover:border-green-400/50 shadow-lg hover:shadow-xl"
            )}
          >
            {/* Glass effect overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <DocumentPlusIcon className="h-6 w-6 relative z-10" />
            <div className="flex flex-col items-start relative z-10">
              <span className="text-xl">Paste YAML Recipe</span>
              <span className="text-sm opacity-75 font-normal">Perfect for AI-generated recipes</span>
            </div>

            {/* Subtle shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transform -translate-x-full group-hover:translate-x-full transition-all duration-700 ease-out" />
          </button>

          <label className="cursor-pointer">
            <input
              type="file"
              accept=".yaml,.yml"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  processYamlFile(file);
                }
                e.target.value = '';
              }}
              className="hidden"
            />
            <div className={cn(
              "group relative flex items-center space-x-3 px-6 py-4 rounded-xl font-semibold transition-all duration-300 text-lg backdrop-blur-sm border transform hover:scale-[1.02] hover:backdrop-blur-md cursor-pointer overflow-hidden",
              isDark
                ? "bg-black/30 text-green-300 hover:bg-black/40 border-green-500/20 hover:border-green-400/40 shadow-lg hover:shadow-xl"
                : "bg-white/30 text-green-700 hover:bg-white/40 border-green-500/30 hover:border-green-400/50 shadow-lg hover:shadow-xl"
            )}>
              {/* Glass effect overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <ArrowUpTrayIcon className="h-6 w-6 relative z-10" />
              <div className="flex flex-col items-start relative z-10">
                <span className="text-xl">Upload Existing YAML</span>
                <span className="text-sm opacity-75 font-normal">Click to upload</span>
              </div>

              {/* Subtle shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transform -translate-x-full group-hover:translate-x-full transition-all duration-700 ease-out" />
            </div>
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <LocalContainersList
          onLoadContainer={loadContainer}
          onDeleteContainer={deleteContainer}
          githubFiles={files}
        />
        <RemoteContainersList
          onLoadRecipe={loadContainer}
          onLoadLocalRecipe={(content, _filename) => {
            void _filename;
            try {
              const recipe = loadYAML(content) as ContainerRecipe;
              loadContainer(migrateLegacyRecipe(recipe));
            } catch (error) {
              console.error('Failed to load local recipe:', error);
            }
          }}
          filesystemMode={filesystemMode}
          onFilesystemModeChange={setFilesystemMode}
        />
      </div>
      <Footer />
      {/* YAML Paste Modal */}
      <YamlPasteModal
        isOpen={isYamlPasteModalOpen}
        onClose={() => setIsYamlPasteModalOpen(false)}
        onLoadContainer={loadContainer}
      />
    </div >
  );
}
