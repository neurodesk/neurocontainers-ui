import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import type { ContainerRecipe } from "@/components/common";
import { ThemeProvider } from "@/lib/ThemeContext";
import { RecipeTab } from "../RecipeTab";

const mockExportYAML = jest.fn();
let mockRecipe: ContainerRecipe;

jest.mock("@/lib/tabs/TabManager", () => ({
    useTabs: () => ({
        tabs: [{ id: "recipe-1", type: "recipe", title: "Example", payload: { recipe: mockRecipe } }],
        activeId: "recipe-1",
        update: jest.fn(),
    }),
}));
jest.mock("@/hooks/useContainerStorage", () => ({
    useContainerStorage: () => ({
        saveStatus: "saved",
        currentContainerId: null,
        saveToStorage: jest.fn(),
        setCurrentContainerId: jest.fn(),
        exportYAML: mockExportYAML,
    }),
}));
jest.mock("@/components/metadata", () => () => null);
jest.mock("@/components/recipe", () => () => null);
jest.mock("@/components/validate", () => () => null);

function renderRecipe(copyrightEntries: ContainerRecipe["copyright"]) {
    mockRecipe = {
        name: "example",
        version: "1.0",
        architectures: ["x86_64"],
        build: { kind: "neurodocker", "base-image": "ubuntu:24.04", "pkg-manager": "apt", directives: [] },
        copyright: copyrightEntries,
    };
    render(
        <ThemeProvider defaultTheme="light">
            <RecipeTab tabId="recipe-1" />
        </ThemeProvider>,
    );
}

describe("RecipeTab license download validation", () => {
    beforeEach(() => mockExportYAML.mockClear());

    it("blocks download when a custom license lacks a name or URL", () => {
        renderRecipe([{ name: "", url: "" }]);
        expect(screen.getByRole("button", { name: "Download YAML" })).toBeDisabled();
        expect(screen.getByRole("alert")).toHaveTextContent("Complete each license’s required fields");

        fireEvent(window, new CustomEvent("nc:recipe-download"));
        expect(mockExportYAML).not.toHaveBeenCalled();
    });

    it("downloads a recipe with a complete custom license", () => {
        renderRecipe([{ name: "Research license", url: "https://example.com/LICENSE" }]);
        fireEvent.click(screen.getByRole("button", { name: "Download YAML" }));
        expect(mockExportYAML).toHaveBeenCalledWith(mockRecipe);
    });
});
