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
    | IncludeDirective;

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
    "functional imaging": "fMRI analysis tools",
    "structural imaging": "Anatomical image processing  ",
    "diffusion imaging": "DTI/DWI analysis",
    "image segmentation": "Segmentation tools",
    "image registration": "Registration/alignment tools",
    "electrophysiology": "EEG/MEG analysis",
    "workflows": "Pipeline tools (fmriprep, mriqc)",
    "data organisation": "BIDS tools, converters",
    "visualization": "Viewing and display tools",
    "programming": "Development environments",
    "quantitative imaging": "Quantitative analysis",
    "phase processing": "Phase/QSM processing",
    "spectroscopy": "MRS analysis",
    "machine learning": "ML/AI tools",
    "quality control": "QC tools",
    "bids apps": "BIDS-compatible applications",
    "cryo EM": "Cryo-electron microscopy",
    "molecular biology": "Structural biology tools",
    "rodent imaging": "Small animal imaging",
    "spine": "Spinal cord analysis",
    "hippocampus": "Hippocampal analysis",
    "body": "Body imaging tools",
    "shape analysis": "Shape analysis tools",
    "statistics": "Statistical analysis",
    "image reconstruction": "Reconstruction tools",
};

export interface ContainerRecipe {
    name: string;
    version: string;
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

    const ret = {
        ...recipe,
        build: {
            ...recipe.build,
            directives: [...directives, ...recipe.build.directives],
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