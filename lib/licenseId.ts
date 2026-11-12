import { findZenodoLicense, ZenodoLicenseList } from "./zenodoLicenses";

const LICENSE_REF = /^licenseref-[a-z0-9.-]+$/;
// Shape of a single license ID such as "GPL-3.0-only" or "GPL-2.0+".
const LICENSE_ID = /^[a-z0-9][a-z0-9.+-]*$/;

// Mirroring NO_LICENSE_IDS and NO_LICENSE_PHRASES from
// Neurodesk/apps.json scripts/license_terms.py: values stating that no license
// is known. DOI publication mints the record without `rights` for these.
const NO_LICENSE_IDS = new Set(["noassertion", "none", "unknown"]);
const NO_LICENSE_PHRASES = [
    "no licence published",
    "no license published",
    "does not declare a license",
    "no license declared",
];

/** Whether a license ID or custom name states that no license is known. */
export function isNoLicense(value: string): boolean {
    const lowered = value.trim().toLowerCase();
    return NO_LICENSE_IDS.has(lowered) || NO_LICENSE_PHRASES.some((phrase) => lowered.includes(phrase));
}

/**
 * Returns why `value` cannot be a recipe `license`, or null if it can.
 *
 * A license must be one ID from the Zenodo license list (any case), one of its
 * deprecated aliases, or a `LicenseRef-` identifier, so the image can get a DOI.
 * Expressions (AND/OR/WITH) are refused: DOI publication records one license
 * per copyright entry. Other IDs cannot be validated until the list loads.
 */
export function licenseIdError(value: string, list: ZenodoLicenseList | null): string | null {
    const id = value.trim();
    if (!id) return "License identifier is required";
    if (/[\s()]/.test(id)) {
        return `"${id}" is a license expression; list each license as its own entry`;
    }
    const lowered = id.toLowerCase();
    if (lowered.startsWith("licenseref-")) {
        return LICENSE_REF.test(lowered) ? null : `Invalid LicenseRef identifier: '${id}'`;
    }
    if (!LICENSE_ID.test(lowered)) return `Invalid license identifier: '${id}'`;
    if (!list) return "Zenodo license list is unavailable; wait for it to load before using this license ID";
    if (findZenodoLicense(list, id)) return null;
    return `"${id}" is not a Zenodo license ID. Add it as a custom license with a name and URL.`;
}

/**
 * Comparison key for a license URL, mirroring `canonical_url` in
 * Neurodesk/apps.json scripts/doi_license.py: host lowercased, trailing `/`
 * dropped from the path, query kept, scheme ignored. Null if not a valid URL.
 */
export function canonicalLicenseUrl(value: string): string | null {
    const trimmed = value.trim();
    if (!trimmed || trimmed.includes("{{") || trimmed.includes("{%") || licenseUrlError(trimmed)) return null;
    const url = new URL(trimmed);
    return `${url.host.toLowerCase()}${url.pathname.replace(/\/+$/, "")}${url.search}`;
}

// A literal http(s)://host before any template, so the rendered URL keeps its host.
const TEMPLATED_URL = /^https?:\/\/[^\s/?#@{}]+(?:[/?#]|$)/i;

/**
 * Returns why `value` cannot be a license URL, or null if it can (empty is
 * allowed here; whether a URL is required is decided per entry). DOI
 * publication (apps.json `canonical_url`) reads the raw recipe, so the URL
 * needs an http(s) scheme and a host, and must not carry credentials.
 */
export function licenseUrlError(value: string): string | null {
    const trimmed = value.trim();
    if (!trimmed) return null;
    if (trimmed.includes("{{") || trimmed.includes("{%")) {
        return TEMPLATED_URL.test(trimmed)
            ? null
            : "A templated license URL must start with a literal http(s)://host";
    }
    let url: URL;
    try {
        url = new URL(trimmed);
    } catch {
        return "License URL must start with http:// or https:// and include a host";
    }
    if ((url.protocol !== "http:" && url.protocol !== "https:") || !url.hostname) {
        return "License URL must start with http:// or https:// and include a host";
    }
    if (url.username || url.password) return "License URL must not contain credentials";
    return null;
}

/**
 * Returns why `url` cannot accompany the listed license `id`, or null. DOI
 * publication rejects a URL that is the terms of a different Zenodo license
 * (apps.json `resolve_recipe_license`).
 */
export function licenseUrlMismatch(id: string, url: string, list: ZenodoLicenseList | null): string | null {
    if (!list || !url.trim()) return null;
    const selected = findZenodoLicense(list, id);
    const target = canonicalLicenseUrl(url);
    if (!selected || !target) return null;
    const matches = list.licenses.filter(
        (entry) => entry.url && canonicalLicenseUrl(entry.url) === target,
    );
    if (!matches.length || matches.includes(selected)) return null;
    return `This URL is the terms of ${matches.map((entry) => entry.id).join(", ")}, not ${id.trim()}`;
}

/**
 * The only Jinja DOI publication renders in copyright entries, mirroring
 * `render_copyright` in Neurodesk/apps.json scripts/license_terms.py:
 * `{{ context.<key> }}` or `{{ <key> }}`, where key is `version`, `name` or a
 * top-level string variable. Anything else fails publication.
 */
const COPYRIGHT_TEMPLATE = /\{\{\s*(?:context\.)?([A-Za-z_]\w*)\s*\}\}/g;
const MAX_RENDER_PASSES = 10;
const UNSUPPORTED_TEMPLATE = "Only {{ context.<variable> }} substitutions are supported in licenses";

export type CopyrightTemplateValues = Record<string, string>;

export const isTemplated = (value: string) => value.includes("{{") || value.includes("{%");

/** Values a copyright template can use: string `variables`, then `version` and `name`. */
export function copyrightTemplateValues(recipe: {
    name?: unknown;
    version?: unknown;
    variables?: unknown;
}): CopyrightTemplateValues {
    const values: CopyrightTemplateValues = {};
    if (recipe.variables && typeof recipe.variables === "object" && !Array.isArray(recipe.variables)) {
        for (const [key, value] of Object.entries(recipe.variables)) {
            if (typeof value === "string") values[key] = value;
        }
    }
    for (const key of ["version", "name"] as const) {
        if (typeof recipe[key] === "string") values[key] = recipe[key];
    }
    return values;
}

/**
 * Render a copyright field. Without `values` (no recipe in reach) only the
 * template's form is checked and `value` is null: the content cannot be
 * validated until the recipe renders it.
 */
export function renderCopyrightTemplate(
    text: string,
    values?: CopyrightTemplateValues,
): { value: string | null; error?: string } {
    if (!isTemplated(text)) return { value: text };
    if (!values) {
        return isTemplated(text.replace(COPYRIGHT_TEMPLATE, ""))
            ? { value: null, error: UNSUPPORTED_TEMPLATE }
            : { value: null };
    }
    let current = text;
    for (let pass = 0; pass < MAX_RENDER_PASSES; pass++) {
        let missing: string | null = null;
        const rendered = current.replace(COPYRIGHT_TEMPLATE, (match, key: string) => {
            if (!Object.prototype.hasOwnProperty.call(values, key)) {
                missing ??= match;
                return match;
            }
            return values[key];
        });
        if (missing) {
            return {
                value: null,
                error: `Cannot render ${missing}: use version, name or a top-level text variable`,
            };
        }
        if (rendered === current) break;
        current = rendered;
    }
    return isTemplated(current) ? { value: null, error: UNSUPPORTED_TEMPLATE } : { value: current };
}
