import type { ContainerRecipe } from "@/components/common";
import {
    buildValidationSupportFiles,
    collectRecipeSupportFiles,
} from "@/lib/recipeSupportFiles";

describe("recipe support file collection", () => {
    const recipe: ContainerRecipe = {
        name: "brainager",
        version: "2.1.0",
        architectures: ["x86_64"],
        categories: ["structural imaging"],
        build: {
            kind: "neurodocker",
            "base-image": "ubuntu:24.04",
            "pkg-manager": "apt",
            directives: [
                {
                    file: {
                        name: "declared-script",
                        filename: "scripts/declared.sh",
                    },
                },
                {
                    copy: "dependencies.R /opt",
                },
                {
                    copy: "declared-script /usr/local/bin/declared-script",
                },
                {
                    group: [
                        {
                            copy: ["nested/helper.sh", "/opt/helper.sh"],
                        },
                        {
                            copy: ["{{ get_file(\"download\") }}", "/tmp/download"],
                        },
                    ],
                },
            ],
        },
    };

    it("collects local support files needed for browser validation", () => {
        expect(collectRecipeSupportFiles(recipe)).toEqual([
            "dependencies.R",
            "nested/helper.sh",
            "scripts/declared.sh",
        ]);
    });

    it("creates placeholder files and a validation warning", () => {
        const result = buildValidationSupportFiles(recipe);

        expect(Object.keys(result.files)).toEqual([
            "dependencies.R",
            "nested/helper.sh",
            "scripts/declared.sh",
        ]);
        expect(result.files["dependencies.R"]).toContain("Source path: dependencies.R");
        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0]).toContain("placeholder files");
    });
});
