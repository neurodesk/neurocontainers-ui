import { migrateLegacyRecipe, type ContainerRecipe } from "@/components/common";
import { Builder } from "@/lib/builder";
import { missingUpdatePolicyFiles, restoreUpdatePolicyFiles, validateRecipeDomains } from "@/lib/recipeFormat";
import { validateContainerRecipe } from "@/lib/zodSchema";

function recipeWithFileVersion(): ContainerRecipe {
    return {
        name: "example",
        version: "1.2.3",
        domains: ["neuroimaging"],
        architectures: ["x86_64"],
        auto_update: {
            method: "sources",
            container_version: "archive",
            sources: [{
                id: "archive",
                target: { file: "archive.zip" },
                version_regex: "archive-(?P<version>[0-9.]+)\\.zip",
            }],
        },
        files: [{
            name: "archive.zip",
            url: "https://example.org/archive-1.2.3.zip",
            sha256: "a".repeat(64),
        }],
        build: {
            kind: "neurodocker",
            "base-image": "ubuntu:24.04",
            "pkg-manager": "apt",
            directives: [{ install: ["curl"] }],
        },
    };
}

describe("update policy file restoration", () => {
    beforeAll(() => {
        globalThis.structuredClone = (value) => JSON.parse(JSON.stringify(value));
    });

    it("restores a migrated top-level file without duplicating its directive", () => {
        const migrated = migrateLegacyRecipe(recipeWithFileVersion());
        expect(migrated.files).toBeUndefined();

        const restored = restoreUpdatePolicyFiles(migrated);
        expect(restored.files).toEqual(recipeWithFileVersion().files);
        expect(restored.build.directives).toEqual([{ install: ["curl"] }]);
        expect(migrated.build.directives[0]).toHaveProperty("file");
    });

    it("keeps update metadata and file checksums when a recipe is pasted", () => {
        const result = validateContainerRecipe(recipeWithFileVersion());
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.auto_update).toEqual(recipeWithFileVersion().auto_update);
            expect(result.data.files?.[0].sha256).toBe("a".repeat(64));
            expect(result.data.domains).toEqual(["neuroimaging"]);
        }
    });

    it("reports an update source with no declared file", () => {
        const recipe = recipeWithFileVersion();
        delete recipe.files;
        expect(missingUpdatePolicyFiles(restoreUpdatePolicyFiles(recipe))).toEqual(["archive.zip"]);
    });

    it("requires a catalog domain before browser validation succeeds", () => {
        const recipe = recipeWithFileVersion();
        delete recipe.domains;
        expect(() => validateRecipeDomains(recipe)).toThrow("domains is required");
    });

    it("preserves a file URL needed to read the container version", async () => {
        const recipe = migrateLegacyRecipe(recipeWithFileVersion());
        const toPy = jest.fn((value) => value);
        const generate = jest.fn(() => null);
        const pyodide = {
            runPython: jest.fn(),
            toPy,
            FS: { writeFile: jest.fn() },
        } as unknown as ConstructorParameters<typeof Builder>[0];
        const pyBuilder = {
            generate_from_description: generate,
        } as unknown as ConstructorParameters<typeof Builder>[1];

        await new Builder(pyodide, pyBuilder).generateFromDescription(recipe);

        const prepared = toPy.mock.calls[0][0] as ContainerRecipe;
        expect(prepared.files?.[0].url).toBe("https://example.org/archive-1.2.3.zip");
        expect(prepared.build.directives).toEqual([{ install: ["curl"] }]);
    });

    it("removes a remote checksum when validation substitutes file contents", async () => {
        const recipe = recipeWithFileVersion();
        recipe.auto_update!.sources![0].target!.variables = { upstream_version: "version" };
        const toPy = jest.fn((value) => value);
        const pyodide = {
            runPython: jest.fn(),
            toPy,
            FS: { writeFile: jest.fn() },
        } as unknown as ConstructorParameters<typeof Builder>[0];
        const pyBuilder = {
            generate_from_description: jest.fn(() => null),
        } as unknown as ConstructorParameters<typeof Builder>[1];

        await new Builder(pyodide, pyBuilder).generateFromDescription(recipe);

        const prepared = toPy.mock.calls[0][0] as ContainerRecipe;
        expect(prepared.files?.[0].contents).toContain("Placeholder generated");
        expect(prepared.files?.[0].url).toBeUndefined();
        expect(prepared.files?.[0].sha256).toBeUndefined();
    });
});
