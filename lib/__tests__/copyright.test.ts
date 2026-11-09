import { CopyrightInfoSchema } from "@/lib/zodSchema";
import { licenseIdError } from "@/lib/licenseId";
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
        { license: "NOASSERTION", url: "https://example.com" },
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
        { license: "{{ context.license_id }}" },
        { license: "MIT", url: "https://www.apache.org/licenses/LICENSE-2.0/" },
        { name: "Custom license", url: "https://" },
        { name: "Custom license", url: "https://user:secret@example.com/LICENSE" },
        { name: "Custom license", url: "{{ context.license_url }}" },
        { name: "Custom license", url: "https://{{ host }}/LICENSE" },
        { license: "NOASSERTION" },
        { license: "NONE" },
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
