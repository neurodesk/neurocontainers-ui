import { z } from 'zod';
import { CATEGORIES, CopyrightInfo, IncludeMacros } from '@/components/common';
import {
    copyrightTemplateValues,
    isNoLicense,
    licenseIdError,
    licenseUrlError,
    licenseUrlMismatch,
    renderCopyrightTemplate,
    type CopyrightTemplateValues,
} from '@/lib/licenseId';
import { getZenodoLicenses, type ZenodoLicenseList } from '@/lib/zenodoLicenses';

// ============================================================================
// Base Types
// ============================================================================

export const ArchitectureSchema = z.enum(['x86_64', 'aarch64']);

export const ConditionSchema = z.string();

// ============================================================================
// Copyright Info
// ============================================================================

// Mirrors builder/validation.py in neurodesk/neurocontainers: an entry with
// `license` is a license-ID entry and may also carry a `name`; an entry without
// one is a custom license identified by `name` and the URL of its terms.
// `license` is limited to the Zenodo license list (lib/zenodoLicenses.ts) so
// the image can get a DOI; other terms are entered as custom licenses.
//
// Fields may use `{{ context.<variable> }}` templates, which DOI publication
// (Neurodesk/apps.json render_copyright) fills from the recipe's version, name
// and top-level text variables. With those values the rendered text is
// validated; without them (a lone entry) only the template's form is checked.

/** Whether an entry with this `license` must link to the license terms. */
export function licenseRequiresUrl(license: string): boolean {
    return isNoLicense(license) || license.toLowerCase().includes("licenseref-");
}

const isLicenseRef = (license: string) => license.trim().toLowerCase().startsWith("licenseref-");

type CopyrightFields = { license?: string; name?: string; url?: string };
type CopyrightIssue = { path: (keyof CopyrightFields)[]; message: string };

/** Everything wrong with a copyright entry, rendering templates with `values` when given. */
export function copyrightIssues(
    info: CopyrightFields,
    values?: CopyrightTemplateValues,
    licenseList?: ZenodoLicenseList | null,
): CopyrightIssue[] {
    const issues: CopyrightIssue[] = [];
    const activeLicenseList = licenseList === undefined ? getZenodoLicenses() : licenseList;
    // Rendered text per field; null when it is a template that cannot be rendered here.
    const rendered: { [K in keyof CopyrightFields]?: string | null } = {};
    for (const key of ["license", "name", "url"] as const) {
        const raw = info[key];
        if (raw === undefined) continue;
        const { value, error } = renderCopyrightTemplate(raw, values);
        if (error) issues.push({ path: [key], message: error });
        rendered[key] = value;
    }
    const { license, name, url } = rendered;

    if (typeof license === "string") {
        if (!license.trim()) {
            issues.push({ path: ["license"], message: "License identifier is required" });
        } else if (!isNoLicense(license)) {
            const error = licenseIdError(license, activeLicenseList);
            if (error) issues.push({ path: ["license"], message: error });
        }
    }
    if (typeof name === "string" && !name.trim()) {
        issues.push({ path: ["name"], message: "License name cannot be empty" });
    }
    if (typeof url === "string") {
        const error = licenseUrlError(url);
        if (error) issues.push({ path: ["url"], message: error });
    }

    if (info.license === undefined && info.name === undefined) {
        issues.push({ path: ["name"], message: "A custom license requires a name" });
    }
    // DOI publication titles LicenseRef- terms by their name (apps.json
    // resolve_recipe_license), so they need one as well as a URL.
    if (typeof license === "string" && isLicenseRef(license) && !info.name?.trim()) {
        issues.push({
            path: ["name"],
            message: `Custom license "${license.trim()}" needs a name; add it as a Custom License with a name and URL`,
        });
    }
    if (info.url?.trim()) {
        if (typeof license === "string" && typeof url === "string") {
            const mismatch = licenseUrlMismatch(license, url, activeLicenseList);
            if (mismatch) issues.push({ path: ["url"], message: mismatch });
        }
    } else if (info.license === undefined) {
        issues.push({ path: ["url"], message: "A custom license requires a URL to the license terms" });
    } else if (typeof license === "string" && licenseRequiresUrl(license)) {
        issues.push({ path: ["url"], message: `License "${license}" requires a URL to the license terms` });
    }
    return issues;
}

const CopyrightFieldsSchema = z.strictObject({
    license: z.string().optional(),
    name: z.string().optional(),
    url: z.string().optional(),
});

// The checks above guarantee a custom entry has both name and url.
const toCopyrightInfo = (info: CopyrightFields): CopyrightInfo =>
    info.license === undefined
        ? { name: info.name ?? "", url: info.url ?? "" }
        : { ...info, license: info.license };

/** Schema for one copyright entry; pass the recipe's template values to validate rendered text. */
export function copyrightInfoSchema(values?: CopyrightTemplateValues, licenseList?: ZenodoLicenseList | null) {
    return CopyrightFieldsSchema
        .superRefine((info, ctx) => {
            for (const issue of copyrightIssues(info, values, licenseList)) {
                ctx.addIssue({ code: "custom", ...issue });
            }
        })
        .transform(toCopyrightInfo);
}

/** A copyright entry on its own: templates are checked for form only. */
export const CopyrightInfoSchema = copyrightInfoSchema();

// ============================================================================
// Structured Readme
// ============================================================================

export const StructuredReadmeSchema = z.object({
    description: z.string(),
    example: z.string(),
    documentation: z.string(),
    citation: z.string(),
});

// ============================================================================
// Directives Base
// ============================================================================

export const BaseDirectiveSchema = z.object({
    condition: ConditionSchema.optional(),
});

// ============================================================================
// Deploy Info
// ============================================================================

export const AdditionalProxySchema = z.object({
    name: z.string(),
    port: z.number(),
});

export const WebappPortsSchema = z.object({
    main: z.number(),
});

export const WebappSchema = z.object({
    title: z.string(),
    startup_command: z.string(),
    start_page: z.string(),
    ports: WebappPortsSchema,
    module: z.string().optional(),
    description: z.string().optional(),
    startup_timeout: z.number().optional(),
    category: z.string().optional(),
    icon: z.string().optional(),
    additional_proxies: z.array(AdditionalProxySchema).optional(),
});

export const DeployInfoSchema = z.object({
    path: z.array(z.string()).optional(),
    bins: z.array(z.string()).optional(),
    webapp: WebappSchema.optional(),
});

// ============================================================================
// File Info
// ============================================================================

export const FileInfoSchema = z.object({
    name: z.string(),
    filename: z.string().optional(),
    contents: z.string().optional(),
    url: z.string().url().optional(),
    sha256: z.string().optional(),
    executable: z.boolean().optional(),
    insecure: z.boolean().optional(),
    retry: z.number().optional(),
    refresh: z.boolean().optional(),
});

// ============================================================================
// Test Info
// ============================================================================

export const BuiltinTestSchema = z.object({
    name: z.string(),
    builtin: z.literal('test_deploy.sh'),
});

export const ScriptTestSchema = z.object({
    name: z.string(),
    script: z.string(),
});

export const TestInfoSchema = z.union([BuiltinTestSchema, ScriptTestSchema]);

// ============================================================================
// Template
// ============================================================================

export const TemplateSchema = z.object({
    name: z.string(),
}).catchall(z.unknown()); // Allow additional properties

// ============================================================================
// Variable
// ============================================================================

export const VariableSchema = z.union([z.string(), z.unknown()]);

// ============================================================================
// Directive Schemas
// ============================================================================

export const EnvironmentDirectiveSchema = BaseDirectiveSchema.extend({
    environment: z.record(z.string(), z.string()),
});

export const InstallDirectiveSchema = BaseDirectiveSchema.extend({
    install: z.union([z.string(), z.array(z.string())]),
});

export const WorkingDirectoryDirectiveSchema = BaseDirectiveSchema.extend({
    workdir: z.string(),
});

export const RunCommandDirectiveSchema = BaseDirectiveSchema.extend({
    run: z.array(z.string()),
});

export const VariableDirectiveSchema = BaseDirectiveSchema.extend({
    variables: z.record(z.string(), VariableSchema),
});

export const TemplateDirectiveSchema = BaseDirectiveSchema.extend({
    template: TemplateSchema,
});

export const DeployDirectiveSchema = BaseDirectiveSchema.extend({
    deploy: DeployInfoSchema,
});

export const UserDirectiveSchema = BaseDirectiveSchema.extend({
    user: z.string(),
});

export const CopyDirectiveSchema = BaseDirectiveSchema.extend({
    copy: z.union([z.array(z.string()), z.string()]),
});

export const FileDirectiveSchema = BaseDirectiveSchema.extend({
    file: FileInfoSchema,
});

export const TestDirectiveSchema = BaseDirectiveSchema.extend({
    test: TestInfoSchema,
});

export const IncludeDirectiveSchema = BaseDirectiveSchema.extend({
    include: z.enum(IncludeMacros),
});

// Import BoutiquesDescriptor schema - we'll define a minimal version for now
const BoutiquesDescriptorSchema = z.object({
    name: z.string(),
    description: z.string(),
    'tool-version': z.string(),
    'schema-version': z.literal('0.5'),
    'command-line': z.string(),
    inputs: z.array(z.object({
        id: z.string(),
        name: z.string(),
        type: z.enum(['String', 'File', 'Flag', 'Number']),
    }).catchall(z.unknown())),
}).catchall(z.unknown()); // Allow additional properties for full Boutiques support

export const BoutiqueDirectiveSchema = BaseDirectiveSchema.extend({
    boutique: BoutiquesDescriptorSchema,
});

// Create a recursive directive schema with group support
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const DirectiveSchema: z.ZodSchema<any> = z.lazy(() => z.union([
    // Group directive with recursive directives
    BaseDirectiveSchema.extend({
        custom: z.string().optional(),
        customParams: z.record(z.string(), z.unknown()).optional(),
        group: z.array(DirectiveSchema),
    }),
    EnvironmentDirectiveSchema,
    InstallDirectiveSchema,
    WorkingDirectoryDirectiveSchema,
    RunCommandDirectiveSchema,
    VariableDirectiveSchema,
    TemplateDirectiveSchema,
    DeployDirectiveSchema,
    UserDirectiveSchema,
    CopyDirectiveSchema,
    FileDirectiveSchema,
    TestDirectiveSchema,
    IncludeDirectiveSchema,
    BoutiqueDirectiveSchema,
]));

// ============================================================================
// Build Recipe
// ============================================================================

export const NeuroDockerBuildRecipeSchema = z.object({
    kind: z.literal('neurodocker'),
    'base-image': z.string(),
    'pkg-manager': z.string(),
    'add-default-template': z.boolean().optional(),
    directives: z.array(DirectiveSchema),
});

export const BuildRecipeSchema = NeuroDockerBuildRecipeSchema;

// ============================================================================
// Categories
// ============================================================================

export const CategoriesSchema = z.array(z.enum(Object.keys(CATEGORIES) as [keyof typeof CATEGORIES, ...Array<keyof typeof CATEGORIES>]));

// ============================================================================
// Main Container Recipe Schema
// ============================================================================

export const ContainerRecipeSchema = z.object({
    name: z.string().min(1, "Container name is required"),
    version: z.string().min(1, "Version is required"),
    icon: z.string().optional(), // Base64 encoded image, 64x64 pixels
    // Validated in superRefine below, where templates render with the recipe's values.
    copyright: z.array(CopyrightFieldsSchema.transform(toCopyrightInfo)).optional(),
    // Top-level variables; copyright templates can use the text ones.
    variables: z.record(z.string(), z.unknown()).optional(),
    architectures: z.array(ArchitectureSchema).min(1, "At least one architecture is required"),
    readme: z.string().optional(),
    readme_url: z.string().url().optional(),
    structured_readme: StructuredReadmeSchema.optional(),
    build: BuildRecipeSchema,
    auto_update: z.record(z.string(), z.unknown()).optional(),
    domains: z.array(z.string().regex(/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/))
        .min(1)
        .refine((domains) => new Set(domains).size === domains.length, "Domains must be unique")
        .optional(),
    files: z.array(FileInfoSchema).optional(),
    deploy: DeployInfoSchema.optional(),
    tests: z.array(TestInfoSchema).optional(),
    categories: CategoriesSchema.optional(),
}).superRefine((recipe, ctx) => {
    const values = copyrightTemplateValues(recipe);
    recipe.copyright?.forEach((entry, index) => {
        for (const issue of copyrightIssues(entry, values)) {
            ctx.addIssue({ code: "custom", message: issue.message, path: ["copyright", index, ...issue.path] });
        }
    });
});

// ============================================================================
// Export types for compatibility
// ============================================================================

export type ContainerRecipeZod = z.infer<typeof ContainerRecipeSchema>;
export type DirectiveZod = z.infer<typeof DirectiveSchema>;
export type BuildRecipeZod = z.infer<typeof BuildRecipeSchema>;

// ============================================================================
// Validation Helper Functions
// ============================================================================

export function validateContainerRecipe(data: unknown): { success: true; data: ContainerRecipeZod } | { success: false; errors: z.ZodError } {
    const result = ContainerRecipeSchema.safeParse(data);
    if (result.success) {
        return { success: true, data: result.data };
    } else {
        return { success: false, errors: result.error };
    }
}

export function getValidationErrorMessage(error: z.ZodError): string {
    const issues = error.issues.map(issue => {
        const path = issue.path.length > 0 ? issue.path.join('.') : 'root';
        return `${path}: ${issue.message}`;
    });
    return issues.join('\n');
}

export function getValidationErrorSummary(error: z.ZodError): { field: string; message: string }[] {
    return error.issues.map(issue => ({
        field: issue.path.length > 0 ? issue.path.join('.') : 'root',
        message: issue.message,
    }));
}
