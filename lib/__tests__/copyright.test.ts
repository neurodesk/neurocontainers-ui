import { ContainerRecipeSchema, CopyrightInfoSchema, copyrightInfoSchema } from "@/lib/zodSchema";
import { copyrightTemplateValues, isNoLicense, licenseIdError, renderCopyrightTemplate } from "@/lib/licenseId";
import { setZenodoLicenses } from "@/lib/zenodoLicenses";
import { zenodoLicenseFixture } from "@/jest.mocks/zenodoLicenses";

beforeEach(() => setZenodoLicenses(zenodoLicenseFixture));
afterAll(() => setZenodoLicenses(null));

// Cases follow builder/tests/test_validation.py in neurodesk/neurocontainers,
// limited to the Zenodo license list so every image can get a DOI.
describe("copyright metadata", () => {
    it.each([
        { license: "MIT" },
        { license: "gpl-3.0-only" },
        { license: "GPL-3.0" },
        { license: "LGPL-2.1+" },
        { license: "LicenseRef-Example", name: "Example License", url: "https://example.com/LICENSE" },
        { license: "MIT", url: "http://opensource.org/license/mit" },
        { license: "GPL-3.0", url: "https://www.gnu.org/licenses/gpl-3.0-standalone.html" },
        { name: "Custom license", url: "https://example.com/{{ context.version }}/LICENSE" },
        { license: "{{ context.license_id }}" },
        { name: "{{ name }} license", url: "{{ context.license_url }}" },
        { license: "NOASSERTION", url: "https://example.com" },
        { license: "noassertion", url: "https://example.com" },
        { license: "NONE", url: "https://example.com" },
        { license: "unknown", url: "https://example.com" },
        { name: "Custom license", url: "https://example.com/LICENSE" },
    ])("accepts and preserves %j", (entry) => {
        expect(CopyrightInfoSchema.parse(entry)).toEqual(entry);
    });

    it.each([
        { license: "custom" },
        { license: "Not-A-Real-License" },
        { license: "MIT OR" },
        { license: "MIT OR Apache-2.0" },
        { license: "BSD-2-Clause-FreeBSD" },
        { license: 42 },
        { license: "other-open", url: "https://example.com/LICENSE" },
        { license: "other-closed", name: "Custom license", url: "https://example.com/LICENSE" },
        { license: "LicenseRef-Example" },
        { license: "LicenseRef-Example", url: "https://example.com/LICENSE" },
        { license: "LicenseRef-Example", name: "  ", url: "https://example.com/LICENSE" },
        { license: "MIT", url: "https://www.apache.org/licenses/LICENSE-2.0/" },
        { license: "{% if x %}MIT{% endif %}" },
        { license: "{{ context.license | upper }}" },
        { name: "Custom license", url: "https://" },
        { name: "Custom license", url: "https://user:secret@example.com/LICENSE" },
        { license: "NOASSERTION" },
        { license: "NONE" },
        { license: "unknown" },
        { name: "Custom license" },
        { name: "Custom license", url: "" },
        { name: "Custom license", url: "ftp://example.com/LICENSE" },
        { license: "MIT", extra: "field" },
        { url: "https://example.com/LICENSE" },
        {},
    ])("rejects %j", (entry) => {
        expect(CopyrightInfoSchema.safeParse(entry).success).toBe(false);
    });

    it("reports a missing custom license URL on the url field", () => {
        const result = CopyrightInfoSchema.safeParse({ name: "Custom license" });
        expect(result.success).toBe(false);
        expect(result.error?.issues.map((issue) => issue.path)).toEqual([["url"]]);
    });

    it("reports a missing custom license name on the name field", () => {
        const result = CopyrightInfoSchema.safeParse({ url: "https://example.com/LICENSE" });
        expect(result.success).toBe(false);
        expect(result.error?.issues.map((issue) => issue.path)).toEqual([["name"]]);
    });

    it("reports a nameless LicenseRef on the name field", () => {
        const result = CopyrightInfoSchema.safeParse({ license: "LicenseRef-Example", url: "https://example.com/LICENSE" });
        expect(result.error?.issues.map((issue) => issue.path)).toEqual([["name"]]);
    });

    it("reports a URL of a different Zenodo license on the url field", () => {
        const result = CopyrightInfoSchema.safeParse({ license: "MIT", url: "https://www.apache.org/licenses/LICENSE-2.0" });
        expect(result.error?.issues.map((issue) => [issue.path, issue.message])).toEqual([
            [["url"], "This URL is the terms of Apache-2.0, not MIT"],
        ]);
    });

    it("requires both fields for a custom license", () => {
        const result = CopyrightInfoSchema.safeParse({});
        expect(result.success).toBe(false);
        expect(result.error?.issues.map((issue) => issue.path)).toEqual([["name"], ["url"]]);
        expect(CopyrightInfoSchema.safeParse({ name: "  ", url: "https://example.com/LICENSE" }).success).toBe(false);
    });
});

describe("license IDs", () => {
    it.each([
        "mit",
        "GPL-3.0",
        "LGPL-2.1+",
        "LicenseRef-Custom.1",
    ])("accepts %s", (id) => {
        expect(licenseIdError(id, zenodoLicenseFixture)).toBeNull();
    });

    it.each([
        ["", /required/],
        ["MIT AND Apache-2.0", /list each license as its own entry/],
        ["(MIT)", /list each license as its own entry/],
        ["Apache-2.0 WITH LLVM-exception", /list each license as its own entry/],
        ["BSD-2-Clause-FreeBSD", /not a Zenodo license ID/],
        ["other-open", /not a Zenodo license ID/],
        ["GPL-3.0+", /not a Zenodo license ID/],
        ["LicenseRef-Custom+", /Invalid LicenseRef/],
        ["LicenseRef-under_score", /Invalid LicenseRef/],
        ["MIT,", /Invalid license identifier/],
    ])("rejects %j", (id, message) => {
        expect(licenseIdError(id, zenodoLicenseFixture)).toMatch(message);
    });

    it("checks only the shape while the list is unavailable", () => {
        expect(licenseIdError("BSD-2-Clause-FreeBSD", null)).toBeNull();
        expect(licenseIdError("MIT OR Apache-2.0", null)).not.toBeNull();
        setZenodoLicenses(null);
        expect(CopyrightInfoSchema.safeParse({ license: "BSD-2-Clause-FreeBSD" }).success).toBe(true);
    });
});

describe("no-license detection", () => {
    it.each([
        "NOASSERTION", "noassertion", "Noassertion",
        "NONE", "none", "None",
        "unknown", "Unknown", "UNKNOWN",
    ])("recognises %j as no-license", (value) => {
        expect(isNoLicense(value)).toBe(true);
    });

    it.each([
        "no licence published",
        "no license published",
        "This tool does not declare a license",
        "no license declared for this tool",
    ])("recognises phrase %j as no-license", (value) => {
        expect(isNoLicense(value)).toBe(true);
    });

    it.each(["MIT", "GPL-3.0", "other-open", ""])("does not match %j", (value) => {
        expect(isNoLicense(value)).toBe(false);
    });
});

describe("copyright templates", () => {
    const values = copyrightTemplateValues({
        name: "prequal",
        version: "1.2.0",
        variables: {
            license_id: "MIT",
            license_url: "https://github.com/MASILab/PreQual/blob/v{{ context.version }}/LICENSE.md",
            not_text: ["x"],
        },
    });

    it("renders like apps.json render_copyright, including nested variables", () => {
        expect(renderCopyrightTemplate("{{ context.license_url }}", values)).toEqual({
            value: "https://github.com/MASILab/PreQual/blob/v1.2.0/LICENSE.md",
        });
        expect(renderCopyrightTemplate("{{name}}-{{ context.version }}", values)).toEqual({ value: "prequal-1.2.0" });
    });

    it.each([
        ["{{ context.missing }}", /Cannot render \{\{ context.missing \}\}/],
        ["{{ context.not_text }}", /Cannot render/],
        ["{{ context.version | upper }}", /Only \{\{ context.<variable> \}\}/],
        ["{% if a %}MIT{% endif %}", /Only \{\{ context.<variable> \}\}/],
    ])("refuses %j", (text, message) => {
        expect(renderCopyrightTemplate(text, values).error).toMatch(message);
    });

    it("validates the rendered text with the recipe's values", () => {
        const schema = copyrightInfoSchema(values);
        expect(schema.safeParse({ license: "{{ context.license_id }}" }).success).toBe(true);
        expect(schema.safeParse({ name: "Custom", url: "{{ context.license_url }}" }).success).toBe(true);
        expect(copyrightInfoSchema({ license_id: "Not-A-Real-License" }).safeParse({ license: "{{ license_id }}" }).success).toBe(false);
        expect(copyrightInfoSchema({ license_url: "ftp://x.org" }).safeParse({ name: "C", url: "{{ license_url }}" }).success).toBe(false);
        // Rendering keeps the recipe's original, templated text.
        expect(schema.parse({ license: "{{ context.license_id }}" })).toEqual({ license: "{{ context.license_id }}" });
    });

    it("validates copyright inside a recipe with its name, version and variables", () => {
        const recipe = {
            name: "prequal",
            version: "1.2.0",
            architectures: ["x86_64"],
            build: { kind: "neurodocker", "base-image": "ubuntu:24.04", "pkg-manager": "apt", directives: [] },
            variables: { license_url: "https://github.com/MASILab/PreQual/blob/v{{ context.version }}/LICENSE.md" },
            copyright: [{ name: "PreQual license", url: "{{ context.license_url }}" }],
        };
        const ok = ContainerRecipeSchema.safeParse(recipe);
        expect(ok.success).toBe(true);
        expect(ok.data?.variables).toEqual(recipe.variables);

        const bad = ContainerRecipeSchema.safeParse({ ...recipe, copyright: [{ license: "{{ context.unknown }}" }] });
        expect(bad.error?.issues.map((issue) => issue.path)).toEqual([["copyright", 0, "license"]]);
    });
});
