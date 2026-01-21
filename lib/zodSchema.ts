import { z } from 'zod';
import { CATEGORIES, IncludeMacros } from '@/components/common';

// ============================================================================
// Base Types
// ============================================================================

export const ArchitectureSchema = z.enum(['x86_64', 'aarch64']);

export const ConditionSchema = z.string();

// ============================================================================
// Copyright Info
// ============================================================================

export const CustomCopyrightInfoSchema = z.object({
    name: z.string(),
    url: z.string().url().optional(),
});

export const SPDXCopyrightInfoSchema = z.object({
    license: z.string(),
    url: z.string().url().optional(),
});

export const CopyrightInfoSchema = z.union([
    CustomCopyrightInfoSchema,
    SPDXCopyrightInfoSchema,
]);

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
    copyright: z.array(CopyrightInfoSchema).optional(),
    architectures: z.array(ArchitectureSchema).min(1, "At least one architecture is required"),
    readme: z.string().optional(),
    readme_url: z.string().url().optional(),
    structured_readme: StructuredReadmeSchema.optional(),
    build: BuildRecipeSchema,
    files: z.array(FileInfoSchema).optional(),
    deploy: DeployInfoSchema.optional(),
    tests: z.array(TestInfoSchema).optional(),
    categories: CategoriesSchema.optional(),
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