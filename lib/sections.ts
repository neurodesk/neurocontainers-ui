import { InformationCircleIcon, CogIcon, CheckCircleIcon } from "@heroicons/react/24/outline";

export enum Section {
    BasicInfo = "basic-info",
    BuildRecipe = "build-recipe",
    ValidateRecipe = "validate-recipe",
}

export const sections = [
    {
        id: Section.BasicInfo,
        title: "Basic Info",
        description: "Container metadata",
        icon: InformationCircleIcon,
    },
    {
        id: Section.BuildRecipe,
        title: "Build Recipe",
        description: "Define build process",
        icon: CogIcon,
    },
    {
        id: Section.ValidateRecipe,
        title: "Validate",
        description: "Test & generate",
        icon: CheckCircleIcon,
    },
];