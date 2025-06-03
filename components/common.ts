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
    install: string;
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

export type IncludeMacro = typeof IncludeMacros[number];

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