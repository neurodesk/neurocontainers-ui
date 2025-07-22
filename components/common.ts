export const NEUROCONTAINERS_REPO = "https://github.com/neurodesk/neurocontainers";

export type Architecture = "x86_64" | "aarch64";

export interface CustomCopyrightInfo {
    name: string; // Can be any custom name
    url?: string; // Optional URL for the license
}

export interface SPDXCopyrightInfo {
    license: string; // Must be a valid SPDX license identifier
    url?: string; // Optional URL for the license
}

export type CopyrightInfo = CustomCopyrightInfo | SPDXCopyrightInfo;

export interface StructuredReadme {
    description: string;
    example: string;
    documentation: string;
    citation: string;
}

export type Condition = string;

export interface BaseDirective {
    condition?: Condition;
}

export interface GroupDirective extends BaseDirective {
    custom?: string; // Optional name for a custom group editor.
    customParams?: Record<string, unknown>; // Optional custom parameters for the group.
    group: Directive[];
}

export interface EnvironmentDirective extends BaseDirective {
    environment: {
        [key: string]: string;
    };
}

export interface InstallDirective extends BaseDirective {
    install: string | string[];
}

export interface WorkingDirectoryDirective extends BaseDirective {
    workdir: string;
}

export interface RunCommandDirective extends BaseDirective {
    run: string[];
}

export type Variable = string | unknown;

export interface VariableDirective extends BaseDirective {
    variables: { [key: string]: Variable };
}

export interface Template {
    name: string;
    // params
    [key: string]: unknown;
}

export interface TemplateDirective extends BaseDirective {
    template: Template;
}

export interface DeployInfo {
    path?: string[];
    bins?: string[];
}

export interface DeployDirective extends BaseDirective {
    deploy: DeployInfo;
}

export interface UserDirective extends BaseDirective {
    user: string;
}

export interface CopyDirective extends BaseDirective {
    copy: string[] | string;
}

export interface FileInfo {
    name: string;
    filename?: string;
    contents?: string;
    url?: string;
}

export interface FileDirective extends BaseDirective {
    file: FileInfo;
}

export interface BuiltinTest {
    name: string;
    builtin: "test_deploy.sh";
}

export interface ScriptTest {
    name: string;
    script: string;
}

export type TestInfo = BuiltinTest | ScriptTest;

export interface TestDirective extends BaseDirective {
    test: TestInfo;
}

export const IncludeMacros = ["macros/openrecon/neurodocker.yaml"] as const;

export type IncludeMacro = (typeof IncludeMacros)[number];

export interface IncludeDirective extends BaseDirective {
    include: IncludeMacro;
}

export interface BoutiqueDirective extends BaseDirective {
    boutique: import("@/types/boutique").BoutiquesDescriptor;
}

export type Directive =
    | GroupDirective
    | EnvironmentDirective
    | InstallDirective
    | WorkingDirectoryDirective
    | RunCommandDirective
    | VariableDirective
    | TemplateDirective
    | DeployDirective
    | UserDirective
    | CopyDirective
    | FileDirective
    | TestDirective
    | IncludeDirective
    | BoutiqueDirective;

export interface NeuroDockerBuildRecipe {
    kind: "neurodocker";
    "base-image": string;
    "pkg-manager": string;
    // Disable the default template from NeuroDocker. This is useful for old docker containers where APT doesn't work.
    "add-default-template"?: boolean; // defaults to true
    directives: Directive[];
}

export type BuildRecipe = NeuroDockerBuildRecipe;

export const CATEGORIES = {
    "functional imaging": { description: "fMRI analysis tools", color: "#3b82f6" },
    "structural imaging": { description: "Anatomical image processing", color: "#06b6d4" },
    "diffusion imaging": { description: "DTI/DWI analysis", color: "#8b5cf6" },
    "image segmentation": { description: "Segmentation tools", color: "#f59e0b" },
    "image registration": { description: "Registration/alignment tools", color: "#ef4444" },
    "electrophysiology": { description: "EEG/MEG analysis", color: "#10b981" },
    "workflows": { description: "Pipeline tools (fmriprep, mriqc)", color: "#6366f1" },
    "data organisation": { description: "BIDS tools, converters", color: "#84cc16" },
    "visualization": { description: "Viewing and display tools", color: "#ec4899" },
    "programming": { description: "Development environments", color: "#64748b" },
    "quantitative imaging": { description: "Quantitative analysis", color: "#14b8a6" },
    "phase processing": { description: "Phase/QSM processing", color: "#a855f7" },
    "spectroscopy": { description: "MRS analysis", color: "#f97316" },
    "machine learning": { description: "ML/AI tools", color: "#22c55e" },
    "quality control": { description: "QC tools", color: "#eab308" },
    "bids apps": { description: "BIDS-compatible applications", color: "#06b6d4" },
    "cryo EM": { description: "Cryo-electron microscopy", color: "#0ea5e9" },
    "molecular biology": { description: "Structural biology tools", color: "#a3e635" },
    "rodent imaging": { description: "Small animal imaging", color: "#fb7185" },
    "spine": { description: "Spinal cord analysis", color: "#34d399" },
    "hippocampus": { description: "Hippocampal analysis", color: "#fbbf24" },
    "body": { description: "Body imaging tools", color: "#f472b6" },
    "shape analysis": { description: "Shape analysis tools", color: "#c084fc" },
    "statistics": { description: "Statistical analysis", color: "#60a5fa" },
    "image reconstruction": { description: "Reconstruction tools", color: "#fb923c" },
};

export interface ContainerRecipe {
    name: string;
    version: string;
    icon?: string; // Base64 encoded image, 64x64 pixels
    copyright?: CopyrightInfo[];
    architectures: Architecture[];
    readme?: string;
    readme_url?: string;
    structured_readme?: StructuredReadme;
    build: BuildRecipe;
    files?: FileInfo[];
    deploy?: DeployInfo;
    tests?: TestInfo[];
    categories?: (keyof typeof CATEGORIES)[];
}

function hasJinja2Syntax(text: string): boolean {
    return /\{\{|\}\}|\{\%|\%\}/.test(text);
}

function wrapInRawBlock(text: string): string {
    return `{% raw %}\n${text}\n{% endraw %}`;
}

export function convertStructuredReadmeToText(
    structured: StructuredReadme,
    name: string,
    version: string
): string {
    const citationText = structured.citation.trim();
    const needsRawBlock = hasJinja2Syntax(citationText);
    const processedCitation = needsRawBlock ? wrapInRawBlock(citationText) : citationText;

    const lines = [
        "----------------------------------",
        `## ${name}/${version} ##`,
        "",
        structured.description.trim(),
        "",
        "Example:",
        "```",
        structured.example.trim(),
        "```",
        "",
        `More documentation can be found here: ${structured.documentation.trim()}`,
        "",
        "Citation:",
        "```",
        processedCitation,
        "```",
        ...(needsRawBlock ? [
            "",
            "Note: Citation content is wrapped in Jinja2 raw blocks to prevent template processing conflicts with BibTeX syntax."
        ] : []),
        "",
        `To run container outside of this environment: ml ${name}/${version}`,
        "",
        "----------------------------------"
    ];

    return lines.join("\n");
}

export function migrateLegacyRecipe(
    recipe: ContainerRecipe
): ContainerRecipe {
    const directives: Directive[] = [];

    // Migrate files to file directives
    if (recipe.files?.length) {
        directives.push(
            ...recipe.files.map(
                (file): FileDirective => ({
                    file,
                })
            )
        );
    }

    // Migrate deploy to deploy directive
    if (recipe.deploy) {
        directives.push({
            deploy: recipe.deploy,
        });
    }

    // Migrate tests to test directives
    if (recipe.tests?.length) {
        directives.push(
            ...recipe.tests.map(
                (test): TestDirective => ({
                    test,
                })
            )
        );
    }

    // Sanitize run commands by removing pure comment lines
    const sanitizeRunCommands = (directives: Directive[]): Directive[] => {
        return directives.map(directive => {
            if ('run' in directive && Array.isArray(directive.run)) {
                return {
                    ...directive,
                    run: directive.run.filter(cmd => {
                        if (typeof cmd !== 'string') return false;
                        // Keep non-comment lines and lines that have commands with inline comments
                        const trimmed = cmd.trim();
                        return trimmed && !trimmed.startsWith('#');
                    })
                };
            } else if ('group' in directive && Array.isArray(directive.group)) {
                return {
                    ...directive,
                    group: sanitizeRunCommands(directive.group)
                };
            }
            return directive;
        });
    };

    const allDirectives = [...directives, ...recipe.build.directives];
    const sanitizedDirectives = sanitizeRunCommands(allDirectives);

    const ret = {
        ...recipe,
        build: {
            ...recipe.build,
            directives: sanitizedDirectives,
        },
    };
    delete ret.files;
    delete ret.deploy;
    delete ret.tests;
    return ret;
}

export async function mergeAdditionalFilesIntoRecipe(recipe: ContainerRecipe, fetchFile: (filename: string) => Promise<string>): Promise<ContainerRecipe> {
    // Look for file directives in the recipe. Make sure to handle group directives.
    // For each file directive if they have a filename then download it and replace the filename with the contents.
    const processDirective = async (directive: Directive): Promise<Directive> => {
        if ('file' in directive) {
            const file = directive.file;
            if (file.filename) {
                try {
                    file.contents = await fetchFile(file.filename);
                    delete file.filename; // Remove filename after fetching
                } catch (error) {
                    console.error(`Failed to fetch file ${file.filename}:`, error);
                }
            }
        } else if ('group' in directive) {
            directive.group = await Promise.all(directive.group.map(processDirective));
        }
        return directive;
    }

    const directives = await Promise.all(recipe.build.directives.map(processDirective));
    return {
        ...recipe,
        build: {
            ...recipe.build,
            directives: directives,
        },
    };
}