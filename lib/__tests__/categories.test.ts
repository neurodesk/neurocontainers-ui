import { CATEGORIES } from "@/components/common";
import { CategoriesSchema } from "@/lib/zodSchema";

describe("category registry", () => {
    it.each(Object.keys(CATEGORIES))("accepts the selectable category %s", (category) => {
        expect(CategoriesSchema.parse([category])).toEqual([category]);
    });

    it("accepts preclinical imaging and molecular imaging categories", () => {
        expect(CategoriesSchema.parse(["preclinical imaging", "molecular imaging"])).toEqual([
            "preclinical imaging",
            "molecular imaging",
        ]);
    });

    it("rejects an unregistered category", () => {
        expect(CategoriesSchema.safeParse(["unregistered category"]).success).toBe(false);
    });
});
