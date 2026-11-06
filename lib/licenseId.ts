import { findZenodoLicense, ZenodoLicenseList } from "./zenodoLicenses";

const LICENSE_REF = /^licenseref-[a-z0-9.-]+$/;
// Shape of a single license ID such as "GPL-3.0-only" or "GPL-2.0+".
const LICENSE_ID = /^[a-z0-9][a-z0-9.+-]*$/;

/**
 * Returns why `value` cannot be a recipe `license`, or null if it can.
 *
 * A license must be one ID from the Zenodo license list (any case), one of its
 * deprecated aliases, or a `LicenseRef-` identifier, so the image can get a DOI.
 * Expressions (AND/OR/WITH) are refused: DOI publication records one license
 * per copyright entry. Without a list (still loading, or unreachable) only the
 * shape is checked; the builder and DOI publication still validate the ID.
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
    if (!list || findZenodoLicense(list, id)) return null;
    return `"${id}" is not a Zenodo license ID. Add it as a custom license with a name and URL.`;
}
