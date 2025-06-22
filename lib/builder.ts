import { ContainerRecipe } from "@/components/common";
import type { PyodideInterface } from "pyodide";
import { filesystemService } from "@/lib/filesystem";

const REPO_URL = "https://raw.githubusercontent.com/NeuroDesk/neurocontainers";

const MAIN_REF = "heads/main";

const REQUIRED_FILES = [
    "builder/build.py",
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
                false, // autouild
                options.maxParallelJobs || 4,
                options.options ? Object.entries(options.options).map(([k, v]) => `${k}=${v}`) : null,
                true, // recreate_output_dir
                true // check_only
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

/**
 * Generate the loader script for Pyodide with local filesystem support
 */
async function createLoaderScript(): Promise<string> {
    // Check if we have local builder script available
    const localBuilderScript = await filesystemService.getLocalBuilderScript();
    
    if (localBuilderScript) {
        console.log('Using local builder/build.py from filesystem');
        return `
import micropip
import os

# Install neurodocker
await micropip.install("pyyaml")
await micropip.install("neurodocker")

# Create necessary directories
os.makedirs("/repo", exist_ok=True)
os.makedirs("/recipe", exist_ok=True)
os.makedirs("/tmp", exist_ok=True)
os.makedirs("builder", exist_ok=True)

print("Using local builder/build.py from filesystem")

# Write local builder script
# Use base64 encoding to avoid quote escaping issues
import base64
builder_content = base64.b64decode('''${Buffer.from(localBuilderScript).toString('base64')}''').decode('utf-8')
with open("builder/build.py", "w", encoding="utf-8") as f:
    f.write(builder_content)

# Still need to download licenses.json from remote (unless we add it to local fs support)
from pyodide.http import pyfetch
base = "${REPO_URL}/${MAIN_REF}/"

# Download licenses.json
response = await pyfetch(base + "builder/licenses.json")
if response.ok:
    content = await response.bytes()
    print("Downloading builder/licenses.json")
    with open("builder/licenses.json", "wb") as f:
        f.write(content)
else:
    raise Exception("Failed to download builder/licenses.json")

# Download Repo files
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
`;
    } else {
        console.log('Using remote builder/build.py from GitHub');
        return `
import micropip
from pyodide.http import pyfetch
import os

# Install neurodocker
await micropip.install("pyyaml")
await micropip.install("neurodocker")

# Create necessary directories
os.makedirs("/repo", exist_ok=True)
os.makedirs("/recipe", exist_ok=True)
os.makedirs("/tmp", exist_ok=True)

base = "${REPO_URL}/${MAIN_REF}/"

print("Using remote builder/build.py from GitHub")

# Download required files
for url in ${JSON.stringify(REQUIRED_FILES)}:
    response = await pyfetch(base + url)
    if response.ok:
        content = await response.bytes()
        print(f"Downloading to {url}")
        os.makedirs(os.path.dirname(url), exist_ok=True)
        with open(url, "wb") as f:
            f.write(content)
    else:
        raise Exception(f"Failed to download {url}")

# Download Repo files
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
`;
    }
}

export async function loadBuilder(pyodide: PyodideInterface): Promise<Builder> {
    try {
        // Ensure Micropip and basics are available
        await pyodide.loadPackage("micropip");
        await pyodide.loadPackage("jinja2");

        // Generate the loader script (local or remote)
        const loaderScript = await createLoaderScript();

        // Install requirements and download/load builder files
        await pyodide.runPythonAsync(loaderScript);

        // Import the builder module
        const pyBuilder = pyodide.pyimport("builder.build");

        return new Builder(pyodide, pyBuilder);
    } catch (error) {
        console.error("Error loading builder:", error);
        throw error;
    }
}