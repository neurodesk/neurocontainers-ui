export type Architecture = "x86_64" | "aarch64";

export interface CopyrightInfo {
    license: string;
    url: string;
}

export type Condition = string;

export interface BaseDirective {
    condition?: Condition;
}

export interface GroupDirective extends BaseDirective {
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
    directives: Directive[];
}

export type BuildRecipe = NeuroDockerBuildRecipe;

export interface ContainerRecipe {
    name: string;
    version: string;
    copyright?: CopyrightInfo[];
    architectures: Architecture[];
    readme?: string;
    readme_url?: string;
    build: BuildRecipe;
    files?: FileInfo[];
    deploy?: DeployInfo;
    tests?: TestInfo[];
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