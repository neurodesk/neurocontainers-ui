import { CopyrightInfoSchema } from "@/lib/zodSchema";
import { spdxExpressionError } from "@/lib/licenseExpression";

// Cases mirror builder/tests/test_validation.py in neurodesk/neurocontainers.
describe("copyright metadata", () => {
    it.each([
        { license: "MIT" },
        { license: "MIT OR Apache-2.0" },
        { license: "{{ context.license_id }}" },
        { license: "LicenseRef-Example", url: "https://example.com/LICENSE" },
        { license: "NOASSERTION", url: "https://example.com" },
        { name: "Custom license", url: "https://example.com/LICENSE" },
        {
            license: "other-closed",
            name: "Custom research license",
            url: "https://example.com/LICENSE",
        },
        { license: "other-open", url: "https://example.com/LICENSE" },
    ])("accepts and preserves %j", (entry) => {
        expect(CopyrightInfoSchema.parse(entry)).toEqual(entry);
    });

    it.each([
        { license: "custom" },
        { license: "Not-A-Real-License" },
        { license: "MIT OR" },
        { license: 42 },
        { license: "other-open" },
        { license: "other-closed", url: "" },
        { license: "LicenseRef-Example" },
        { license: "NOASSERTION" },
        { license: "NONE" },
        { name: "Custom license" },
        { name: "Custom license", url: "" },
        { name: "Custom license", url: "ftp://example.com/LICENSE" },
        { license: "MIT", extra: "field" },
        {},
    ])("rejects %j", (entry) => {
        expect(CopyrightInfoSchema.safeParse(entry).success).toBe(false);
    });

    it("reports a missing custom license URL on the url field", () => {
        const result = CopyrightInfoSchema.safeParse({ name: "Custom license" });
        expect(result.success).toBe(false);
        expect(result.error?.issues.map((issue) => issue.path)).toEqual([["url"]]);
    });
});

describe("SPDX license expressions", () => {
    it.each([
        "mit",
        "GPL-2.0+",
        "MIT AND (Apache-2.0 OR BSD-2-Clause)",
        "Apache-2.0 WITH LLVM-exception",
        "LicenseRef-Custom.1",
    ])("accepts %s", (expression) => {
        expect(spdxExpressionError(expression)).toBeNull();
    });

    it.each([
        "",
        "(MIT",
        "MIT)",
        "()",
        "MIT WITH",
        "(MIT) WITH LLVM-exception",
        "MIT WITH Not-An-Exception",
        "LicenseRef-Custom+",
        "LicenseRef-under_score",
        "Use-it-after-midnight",
    ])("rejects %j", (expression) => {
        expect(spdxExpressionError(expression)).not.toBeNull();
    });
});
