import { BuildRecipe } from "./common";
import NeuroDockerBuildRecipeComponent from "./neurodocker";
import { CARDS } from "@/lib/styles";

export default function BuildRecipeComponent({ recipe, onChange }: { recipe: BuildRecipe, onChange: (recipe: BuildRecipe) => void }) {
    if (recipe.kind === "neurodocker") {
        return <NeuroDockerBuildRecipeComponent recipe={recipe} onChange={onChange} />;
    } else {
        return (
            <div className={CARDS.default + " border-red-200 text-red-500"}>
                Unknown Build Recipe
            </div>
        );
    }
}
