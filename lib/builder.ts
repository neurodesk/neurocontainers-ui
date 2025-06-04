import { ContainerRecipe } from "@/components/common";
import type { PyodideInterface } from "pyodide";

const REPO_URL = "https://raw.githubusercontent.com/NeuroDesk/neurocontainers";

const MAIN_REF = "heads/main";

const BUILDER_PATH = "builder/build.py";
const LICENSES_PATH = "builder/licenses.json";

const BUILDER_URL = `${REPO_URL}/refs/${MAIN_REF}/${BUILDER_PATH}`;
const LICENSES_URL = `${REPO_URL}/refs/${MAIN_REF}/${LICENSES_PATH}`;

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
    recreateOutputDir?: boolean;
    checkOnly?: boolean;
    autouild?: boolean;
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
    ) => {
        name: string;
        version: string;
        tag: string;
        dockerfile_name: string;
        readme: string;
        build_directory: string;
        deploy_bins?: string[];
        deploy_path?: string[];
    } | null;
    init_new_recipe: (repoPath: string, name: string, version: string) => void;
    load_spdx_licenses: () => Set<string>;
    download_with_cache: (url: string, checkOnly?: boolean) => string;
    hash_obj: (obj: unknown) => string;
    NeuroDockerBuilder: (baseImage: string, pkgManager?: string, addDefault?: boolean) => unknown;
}

export class Builder {
    constructor(
        private pyodide: PyodideInterface,
        private pyBuilder: PyBuilderInterface,
    ) { }

    /**
     * Generate a Dockerfile from a recipe description
     */
    async generateFromDescription(
        recipeDescription: ContainerRecipe,
        outputDirectory: string = "/tmp/build",
        options: BuildOptions = {}
    ): Promise<BuildResult | null> {
        try {
            // HACK: fix for readme_url being optional
            if (Object.hasOwn(recipeDescription, "readme_url") && recipeDescription.readme_url?.length || 0 === 0) {
                delete recipeDescription.readme_url;
            }

            // convert the recipeDescription into a real python object
            const recipeDescriptionPy = this.pyodide.toPy(recipeDescription);

            const result = this.pyBuilder.generate_from_description(
                "/repo", // repo_path
                "/recipe", // recipe_path
                recipeDescriptionPy,
                outputDirectory,
                options.architecture || "x86_64",
                options.ignoreArchitecture || false,
                options.autouild || false,
                options.maxParallelJobs || 4,
                options.options ? Object.entries(options.options).map(([k, v]) => `${k}=${v}`) : null,
                options.recreateOutputDir || false,
                true
            );

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
            const validLicenses = this.pyBuilder.load_spdx_licenses();
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

export async function loadBuilder(pyodide: PyodideInterface): Promise<Builder> {
    try {
        // Ensure Micropip and basics are available
        await pyodide.loadPackage("micropip");
        await pyodide.loadPackage("pyyaml");
        await pyodide.loadPackage("jinja2");

        // Install requirements and download builder files
        await pyodide.runPythonAsync(`
      import micropip
      from pyodide.http import pyfetch
      import os

      # Install neurodocker
      await micropip.install("neurodocker")
      
      # Download builder script
      response = await pyfetch("${BUILDER_URL}")
      builder_content = await response.text()
      
      # Download licenses file
      licenses_response = await pyfetch("${LICENSES_URL}")
      licenses_content = await licenses_response.text()
      
      # Create necessary directories
      os.makedirs("/repo", exist_ok=True)
      os.makedirs("/recipe", exist_ok=True)
      os.makedirs("/tmp", exist_ok=True)
      
      # Write files
      with open("builder.py", "w") as f:
          f.write(builder_content)
      
      with open("licenses.json", "w") as f:
          f.write(licenses_content)
    `);

        // Import the builder module
        const pyBuilder = pyodide.pyimport("builder");

        return new Builder(pyodide, pyBuilder);
    } catch (error) {
        console.error("Error loading builder:", error);
        throw error;
    }
}