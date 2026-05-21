import { ContainerRecipe } from "@/components/common";
import type { PyodideInterface } from "pyodide";
import { filesystemService } from "@/lib/filesystem";
import { buildValidationSupportFiles } from "@/lib/recipeSupportFiles";

const REPO_URL = "https://raw.githubusercontent.com/NeuroDesk/neurocontainers";

const MAIN_REF = "heads/main";

const BUILDER_PACKAGE_FILES = [
    "builder/__init__.py",
    "builder/cache.py",
    "builder/dockerfile.py",
    "builder/ir.py",
    "builder/recipe.py",
    "builder/staging.py",
    "builder/template.py",
    "builder/template_backend.py",
    "builder/validation.py",
    "builder/templates/afni.yaml",
    "builder/templates/ants.yaml",
    "builder/templates/bids_validator.yaml",
    "builder/templates/convert3d.yaml",
    "builder/templates/dcm2niix.yaml",
    "builder/templates/freesurfer.yaml",
    "builder/templates/fsl.yaml",
    "builder/templates/matlabmcr.yaml",
    "builder/templates/minc.yaml",
    "builder/templates/miniconda.yaml",
    "builder/templates/mrtrix3.yaml",
    "builder/templates/spm12.yaml",
    "builder/licenses.json",
];

const REPO_FILES = [
    "macros/openrecon/neurodocker.yaml",
]

function bytesToString(bytes: Uint8Array, encoding: string): string {
    if (encoding === "utf-8") {
        return new TextDecoder("utf-8").decode(bytes);
    } else if (encoding === "ascii") {
        return new TextDecoder("ascii").decode(bytes);
    } else {
        throw new Error(`Unsupported encoding: ${encoding}`);
    }
}

export interface BuildOptions {
    architecture?: string;
    ignoreArchitecture?: boolean;
    maxParallelJobs?: number;
    options?: Record<string, string>;
}

export interface BuildResult {
    name: string;
    version: string;
    tag: string;
    dockerfile: string;
    readme: string;
    buildDirectory: string;
    deployBins: string[];
    deployPath: string[];
    warnings: string[];
}

interface PyBuildResult {
    name: string;
    version: string;
    tag: string;
    dockerfile_name: string;
    readme: string;
    build_directory: string;
    deploy_bins?: string[];
    deploy_path?: string[];
}

interface PyBuilderInterface {
    generate_from_description: (
        repoPath: string,
        recipePath: string,
        recipeDescription: ContainerRecipe,
        outputDirectory: string,
        architecture: string,
        ignoreArchitecture: boolean,
        autouild: boolean,
        maxParallelJobs: number,
        options: string[] | null,
        recreateOutputDir: boolean,
        checkOnly: boolean
    ) => PyBuildResult | null;
    init_new_recipe: (repoPath: string, name: string, version: string) => void;
    load_spdx_licenses: () => Set<string>;
    download_with_cache: (url: string, checkOnly?: boolean) => string;
    hash_obj: (obj: unknown) => string;
    NeuroDockerBuilder?: (baseImage: string, pkgManager?: string, addDefault?: boolean) => unknown;
}

export class Builder {
    constructor(
        private pyodide: PyodideInterface,
        private pyBuilder: PyBuilderInterface,
    ) { }

    private prepareRecipeDirectory(recipeDescription: ContainerRecipe): string[] {
        const { files, warnings } = buildValidationSupportFiles(recipeDescription);

        this.pyodide.runPython(`
import os
import shutil

shutil.rmtree("/recipe", ignore_errors=True)
os.makedirs("/recipe", exist_ok=True)
`);

        const fs = this.pyodide.FS as typeof this.pyodide.FS & {
            mkdirTree?: (path: string) => void;
            mkdir?: (path: string) => void;
        };

        for (const [relativePath, contents] of Object.entries(files)) {
            const fullPath = `/recipe/${relativePath}`;
            const lastSlash = fullPath.lastIndexOf("/");
            if (lastSlash > 0) {
                const dir = fullPath.slice(0, lastSlash);
                if (dir !== "/recipe") {
                    if (fs.mkdirTree) {
                        fs.mkdirTree(dir);
                    } else {
                        let current = "";
                        for (const part of dir.split("/").filter(Boolean)) {
                            current += `/${part}`;
                            try {
                                fs.mkdir?.(current);
                            } catch {
                                // Ignore existing directories.
                            }
                        }
                    }
                }
            }
            fs.writeFile(fullPath, contents);
        }

        return warnings;
    }

    private sanitizeRecipeForValidation(recipeDescription: ContainerRecipe): {
        recipe: ContainerRecipe;
        warnings: string[];
    } {
        const recipe = structuredClone(recipeDescription);
        const warnings: string[] = [];
        let replacedUrlFiles = 0;

        const replaceUrlFileWithPlaceholder = (file: {
            url?: string;
            contents?: string;
            refresh?: boolean;
            retry?: number;
            insecure?: boolean;
            curl_options?: string;
        } | undefined) => {
            if (!file?.url) {
                return;
            }

            file.contents = [
                "# Placeholder generated by Neurocontainers Builder web validation.",
                `# Source URL: ${file.url}`,
                "# Remote file fetching is disabled in browser validation.",
                "",
            ].join("\n");
            delete file.url;
            delete file.refresh;
            delete file.retry;
            delete file.insecure;
            delete file.curl_options;
            replacedUrlFiles += 1;
        };

        const visitDirectives = (directives: ContainerRecipe["build"]["directives"]) => {
            for (const directive of directives) {
                if ("file" in directive) {
                    replaceUrlFileWithPlaceholder(directive.file);
                }

                if ("group" in directive) {
                    visitDirectives(directive.group);
                }
            }
        };

        if (recipe.files) {
            for (const file of recipe.files) {
                replaceUrlFileWithPlaceholder(file);
            }
        }

        visitDirectives(recipe.build.directives);

        if (replacedUrlFiles > 0) {
            warnings.push(
                `Browser validation replaced ${replacedUrlFiles} remote file declaration${replacedUrlFiles === 1 ? "" : "s"} with placeholder contents so recipes can be checked without downloading external assets.`,
            );
        }

        return { recipe, warnings };
    }

    /**
     * Generate a Dockerfile from a recipe description
     */
    async generateFromDescription(
        recipeDescription: ContainerRecipe,
        outputDirectory: string = "/tmp/build",
        options: BuildOptions = {}
    ): Promise<BuildResult | null> {
        try {
            const { recipe: validationRecipe, warnings: sanitizationWarnings } =
                this.sanitizeRecipeForValidation(recipeDescription);

            // HACK: fix for readme_url being optional
            if (Object.hasOwn(validationRecipe, "readme_url") && validationRecipe.readme_url?.length || 0 === 0) {
                delete validationRecipe.readme_url;
            }

            const warnings = [
                ...sanitizationWarnings,
                ...this.prepareRecipeDirectory(validationRecipe),
            ];

            // convert the recipeDescription into a real python object
            const recipeDescriptionPy = this.pyodide.toPy(validationRecipe);

            const rawResult = this.pyBuilder.generate_from_description(
                "/repo", // repo_path
                "/recipe", // recipe_path
                recipeDescriptionPy,
                outputDirectory,
                options.architecture || "x86_64",
                options.ignoreArchitecture || false,
                false, // autouild
                options.maxParallelJobs || 4,
                options.options ? Object.entries(options.options).map(([k, v]) => `${k}=${v}`) : null,
                true, // recreate_output_dir
                true // check_only
            );

            const result = rawResult && typeof (rawResult as unknown as { toJs?: unknown }).toJs === "function"
                ? (rawResult as unknown as { toJs: (options?: unknown) => PyBuildResult | null }).toJs({ dict_converter: Object.fromEntries })
                : rawResult;

            if (!result) return null;

            return {
                name: result.name,
                version: result.version,
                tag: result.tag,
                dockerfile: bytesToString(this.pyodide.FS.readFile(
                    `${result.build_directory}/${result.dockerfile_name}`
                ), "utf-8"),
                readme: result.readme,
                buildDirectory: result.build_directory,
                deployBins: result.deploy_bins || [],
                deployPath: result.deploy_path || [],
                warnings,
            };
        } catch (error) {
            console.error("Error generating from description:", error);
            throw error;
        }
    }

    /**
     * Initialize a new recipe template
     */
    async initNewRecipe(name: string, version: string): Promise<string> {
        try {
            this.pyBuilder.init_new_recipe("/repo", name, version);
            const recipePath = `/repo/recipes/${name}`;
            const buildYaml = this.pyodide.FS.readFile(
                `${recipePath}/build.yaml`
            );
            return bytesToString(buildYaml, "utf-8");
        } catch (error) {
            console.error("Error initializing recipe:", error);
            throw error;
        }
    }

    /**
     * Load and validate a recipe description file
     */
    async loadDescriptionFile(yamlContent: string): Promise<ContainerRecipe> {
        try {
            // Write the YAML content to a temporary file
            this.pyodide.FS.writeFile("/tmp/build.yaml", yamlContent);

            const yaml = this.pyodide.pyimport("yaml");
            const result = yaml.safe_load(yamlContent);

            return result.toJs({ dict_converter: Object.fromEntries });
        } catch (error) {
            console.error("Error loading description file:", error);
            throw error;
        }
    }

    /**
     * Validate SPDX license
     */
    async validateLicense(license: string): Promise<boolean> {
        try {
            const rawLicenses = this.pyBuilder.load_spdx_licenses();
            const validLicenses = rawLicenses && typeof (rawLicenses as unknown as { toJs?: unknown }).toJs === "function"
                ? (rawLicenses as unknown as { toJs: () => Set<string> }).toJs()
                : rawLicenses;
            return validLicenses.has(license);
        } catch (error) {
            console.error("Error validating license:", error);
            return false;
        }
    }

    /**
     * Get available architectures
     */
    getAvailableArchitectures(): string[] {
        return ["x86_64", "aarch64"];
    }

    /**
     * Create a NeuroDocker builder instance
     */
    createNeuroDockerBuilder(
        baseImage: string,
        pkgManager: string = "apt",
        addDefault: boolean = true
    ): NeuroDockerBuilder {
        if (!this.pyBuilder.NeuroDockerBuilder) {
            throw new Error("NeuroDockerBuilder is not available in the current NeuroContainers builder");
        }

        const builder = this.pyBuilder.NeuroDockerBuilder(
            baseImage,
            pkgManager,
            addDefault
        );
        return new NeuroDockerBuilder(builder as PyNeuroDockerBuilder);
    }

    /**
     * Download file with caching
     */
    async downloadWithCache(url: string, checkOnly: boolean = false): Promise<string> {
        try {
            return this.pyBuilder.download_with_cache(url, checkOnly);
        } catch (error) {
            console.error("Error downloading file:", error);
            throw error;
        }
    }

    /**
     * Hash an object using SHA256
     */
    hashObject(obj: unknown): string {
        return this.pyBuilder.hash_obj(obj);
    }
}

interface PyNeuroDockerBuilder {
    install_packages(packages: string[]): void;
    run_command(command: string): void;
    set_user(user: string): void;
    set_workdir(path: string): void;
    set_entrypoint(entrypoint: string): void;
    set_environment(key: string, value: string): void;
    copy(...args: string[]): void;
    generate(): string;
}

export class NeuroDockerBuilder {
    constructor(private pyBuilder: PyNeuroDockerBuilder) { }

    installPackages(packages: string[]): void {
        this.pyBuilder.install_packages(packages);
    }

    runCommand(command: string): void {
        this.pyBuilder.run_command(command);
    }

    setUser(user: string): void {
        this.pyBuilder.set_user(user);
    }

    setWorkdir(path: string): void {
        this.pyBuilder.set_workdir(path);
    }

    setEntrypoint(entrypoint: string): void {
        this.pyBuilder.set_entrypoint(entrypoint);
    }

    setEnvironment(key: string, value: string): void {
        this.pyBuilder.set_environment(key, value);
    }

    copy(...args: string[]): void {
        this.pyBuilder.copy(...args);
    }

    generate(): string {
        return this.pyBuilder.generate();
    }
}

/**
 * Generate the loader script for Pyodide with local filesystem support
 */
async function createLoaderScript(): Promise<string> {
    const localBuilderFiles = await filesystemService.getLocalBuilderPackageFiles();
    const packageSetupScript = localBuilderFiles
        ? createLocalBuilderPackageScript(localBuilderFiles)
        : createRemoteBuilderPackageScript();

    return `
import micropip
import os
import json

os.environ["NEURODOCKER_AUTO_UPGRADE"] = "0"
await micropip.install(["pyyaml", "attrs"])

os.makedirs("/repo", exist_ok=True)
os.makedirs("/recipe", exist_ok=True)
os.makedirs("/tmp", exist_ok=True)

${packageSetupScript}

from pyodide.http import pyfetch
base = "${REPO_URL}/${MAIN_REF}/"

for url in ${JSON.stringify(REPO_FILES)}:
    response = await pyfetch(base + url)
    if response.ok:
        content = await response.bytes()
        print(f"Downloading to {url}")
        os.makedirs("/repo/" + os.path.dirname(url), exist_ok=True)
        with open("/repo/" + url, "wb") as f:
            f.write(content)
    else:
        raise Exception(f"Failed to download {url}")

${PYODIDE_BRIDGE_SCRIPT}
`;
}

function createLocalBuilderPackageScript(files: Record<string, string>): string {
    return `
print("Using local builder package from filesystem")
for path, content in json.loads(${JSON.stringify(JSON.stringify(files))}).items():
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
`;
}

function createRemoteBuilderPackageScript(): string {
    return `
from pyodide.http import pyfetch
base = "${REPO_URL}/${MAIN_REF}/"

print("Using remote builder package from GitHub")
for url in ${JSON.stringify(BUILDER_PACKAGE_FILES)}:
    response = await pyfetch(base + url)
    if response.ok:
        content = await response.bytes()
        print(f"Downloading to {url}")
        os.makedirs(os.path.dirname(url), exist_ok=True)
        with open(url, "wb") as f:
            f.write(content)
    else:
        raise Exception(f"Failed to download {url}")
`;
}

const PYODIDE_BRIDGE_SCRIPT = `
import hashlib
import json
import os
import shutil
from pathlib import Path
from urllib.request import urlopen

import yaml

from builder.dockerfile import render_dockerfile
from builder.recipe import compile_recipe


def _dockerfile_name(name, version):
    return f"{name}_{str(version).replace(':', '_')}".lower() + ".Dockerfile"


def _to_bool(value):
    return str(value).strip().lower() in {"1", "true", "yes", "y", "on"}


def _option_overrides(values):
    overrides = {}
    for value in values or []:
        key, separator, raw = str(value).partition("=")
        if key and separator == "=":
            overrides[key] = _to_bool(raw)
    return overrides


def _readme_from_url(recipe):
    readme_url = recipe.get("readme_url")
    if not readme_url:
        return None
    with urlopen(str(readme_url), timeout=30) as response:
        return response.read().decode("utf-8")


def generate_from_description(
    repo_path,
    recipe_path,
    recipe_description,
    output_directory,
    architecture,
    ignore_architecture,
    autobuild,
    max_parallel_jobs,
    options,
    recreate_output_dir,
    check_only,
):
    recipe_dir = Path(recipe_path)
    recipe_dir.mkdir(parents=True, exist_ok=True)

    recipe = dict(recipe_description)
    recipe_file = recipe_dir / "build.yaml"
    recipe_file.write_text(yaml.safe_dump(recipe, sort_keys=False), encoding="utf-8")

    compiled = compile_recipe(
        recipe_dir,
        architecture=architecture,
        ignore_architecture=ignore_architecture,
        include_dirs=(Path(repo_path),),
        parallel_jobs=max_parallel_jobs,
        option_overrides=_option_overrides(options),
    )

    build_dir = Path(output_directory) / compiled.name
    if build_dir.exists() and recreate_output_dir:
        shutil.rmtree(build_dir)
    build_dir.mkdir(parents=True, exist_ok=True)

    dockerfile_name = _dockerfile_name(compiled.name, compiled.version)
    (build_dir / dockerfile_name).write_text(render_dockerfile(compiled.definition), encoding="utf-8")
    readme = _readme_from_url(recipe) or compiled.readme
    (build_dir / "README.md").write_text(readme.rstrip() + "\\n", encoding="utf-8")
    shutil.copy2(recipe_file, build_dir / "build.yaml")

    return {
        "name": compiled.name,
        "version": compiled.version,
        "tag": compiled.tag,
        "dockerfile_name": dockerfile_name,
        "readme": readme,
        "build_directory": str(build_dir),
        "deploy_bins": [],
        "deploy_path": [],
    }


def init_new_recipe(repo_path, name, version):
    recipe_dir = Path(repo_path) / "recipes" / name
    recipe_dir.mkdir(parents=True, exist_ok=True)
    recipe_file = recipe_dir / "build.yaml"
    recipe_file.write_text(
        f"""name: {name}
version: {version}

architectures:
  - x86_64

copyright:
  - license: TODO
    url: TODO

build:
  kind: neurodocker
  base-image: ubuntu:24.04
  pkg-manager: apt
  directives:
    - file:
        name: hello.txt
        contents: Hello, world!
    - run:
        - cat {{{{ get_file("hello.txt") }}}}
    - deploy:
        bins:
          - TODO

readme: TODO
""",
        encoding="utf-8",
    )


def load_spdx_licenses():
    with open("builder/licenses.json", "r", encoding="utf-8") as f:
        data = json.load(f)
    return {item["licenseId"] for item in data.get("licenses", []) if "licenseId" in item}


def download_with_cache(url, check_only=False):
    digest = hashlib.sha256(str(url).encode("utf-8")).hexdigest()
    cache_dir = Path("/tmp/neurocontainers-cache")
    cache_dir.mkdir(parents=True, exist_ok=True)
    target = cache_dir / digest
    if check_only:
        return str(target)
    if not target.exists():
        with urlopen(str(url), timeout=60) as response:
            target.write_bytes(response.read())
    return str(target)


def hash_obj(obj):
    if isinstance(obj, str):
        data = obj.encode("utf-8")
    else:
        data = yaml.safe_dump(obj).encode("utf-8")
    return hashlib.sha256(data).hexdigest()

import types
ui_bridge = types.SimpleNamespace(
    generate_from_description=generate_from_description,
    init_new_recipe=init_new_recipe,
    load_spdx_licenses=load_spdx_licenses,
    download_with_cache=download_with_cache,
    hash_obj=hash_obj,
)
`;

export async function loadBuilder(pyodide: PyodideInterface): Promise<Builder> {
    try {
        // Ensure Micropip and basics are available
        await pyodide.loadPackage("micropip");
        await pyodide.loadPackage("jinja2");

        // Generate the loader script (local or remote)
        const loaderScript = await createLoaderScript();

        // Install requirements and download/load builder files
        await pyodide.runPythonAsync(loaderScript);

        // Get the browser compatibility bridge loaded by the script above.
        const pyBuilder = pyodide.runPython("ui_bridge");

        return new Builder(pyodide, pyBuilder);
    } catch (error) {
        console.error("Error loading builder:", error);
        throw error;
    }
}
