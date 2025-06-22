import { BuildRecipe } from "./common";
import NeuroDockerBuildRecipeComponent from "./neurodocker";
import { cn } from "@/lib/styles";
import { useTheme } from "@/lib/ThemeContext";

export default function BuildRecipeComponent({ recipe, onChange }: { recipe: BuildRecipe, onChange: (recipe: BuildRecipe) => void }) {
    const { isDark } = useTheme();
    
    if (recipe.kind === "neurodocker") {
        return <NeuroDockerBuildRecipeComponent recipe={recipe} onChange={onChange} />;
    } else {
        return (
            <div className={cn(
                "border-2 rounded-lg p-4",
                isDark ? "border-red-500 text-red-400 bg-[#161a0e]" : "border-red-200 text-red-500 bg-white"
            )}>
                Unknown Build Recipe
            </div>
        );
    }
}
