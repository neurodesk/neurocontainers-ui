import { convertStructuredReadmeToText, normalizeStructuredReadme } from "@/components/common";

describe("structured readme normalization", () => {
    it("fills missing structured readme fields with empty strings", () => {
        expect(
            normalizeStructuredReadme({
                description: "Tool description",
            })
        ).toEqual({
            description: "Tool description",
            example: "",
            documentation: "",
            citation: "",
        });
    });

    it("does not throw when optional structured readme fields are missing", () => {
        expect(() =>
            convertStructuredReadmeToText(
                {
                    description: " Tool description ",
                    example: " run-tool --help ",
                    documentation: undefined as unknown as string,
                    citation: undefined as unknown as string,
                },
                "example-tool",
                "1.0.0"
            )
        ).not.toThrow();
    });

    it("wraps citation text containing Jinja2 syntax in raw blocks", () => {
        const readme = convertStructuredReadmeToText(
            {
                description: "Description",
                example: "run-tool",
                documentation: "https://example.org",
                citation: "@article{{ key }}",
            },
            "example-tool",
            "1.0.0"
        );

        expect(readme).toContain("{% raw %}");
        expect(readme).toContain("{% endraw %}");
    });
});
