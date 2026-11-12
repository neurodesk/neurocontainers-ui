import {
    ContainerRecipe,
    Architecture,
    CopyrightInfo,
    convertStructuredReadmeToText,
    Directive,
} from "@/components/common";
import rPackageMarkdown from "@/copy/templates/r-package.md";
import {
    validateGitHubUrl,
    validateContainerName,
    validateVersion,
} from "./pythonPackage";
import type { ContainerTemplate } from "./pythonPackage";

// R Package specific validation
export const validateRPackageName = (name: string): string | null => {
    if (!name.trim()) return "R package name is required";
    // R package names should be valid R identifiers
    const validRNameRegex = /^[a-zA-Z][a-zA-Z0-9.]*$/;
    if (!validRNameRegex.test(name)) {
        return "R package name must start with a letter and contain only letters, numbers, and dots";
    }
    return null;
};

// Extract R package name from GitHub URL or use fallback
export const extractRPackageName = (githubUrl: string): string => {
    const repoMatch = githubUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (repoMatch && repoMatch[2]) {
        return repoMatch[2].replace(/\.git$/, "");
    }
    return "MyRPackage";
};

// R Package Template
export const R_PACKAGE_TEMPLATE: ContainerTemplate = {
    id: "r-package",
    name: "R Package from GitHub",
    description:
        "Create a container for an R package hosted on GitHub with CRAN and Bioconductor support",
    detailedDescription: rPackageMarkdown,
    icon: "📊",
    category: "Programming",
    fields: [
        {
            id: "githubUrl",
            label: "GitHub Repository URL",
            type: "url",
            required: true,
            placeholder: "https://github.com/user/MyRPackage",
            description:
                "The GitHub repository URL for the R package you want to containerize",
            validation: validateGitHubUrl,
        },
        {
            id: "containerName",
            label: "Container Name",
            type: "text",
            required: true,
            placeholder: "myrpackage",
            description:
                "A unique name for your container (lowercase letters and numbers only)",
            validation: validateContainerName,
        },
        {
            id: "rPackageName",
            label: "R Package Name",
            type: "text",
            required: true,
            placeholder: "MyRPackage",
            description:
                "The name of the R package (as it appears in DESCRIPTION file)",
            validation: validateRPackageName,
        },
        {
            id: "version",
            label: "Version",
            type: "text",
            required: true,
            placeholder: "1.0.0",
            description: "Version number for your container",
            validation: validateVersion,
        },
        {
            id: "license",
            label: "License",
            type: "license",
            required: true,
            description: "Choose the license for your container",
        },
        {
            id: "description",
            label: "Description",
            type: "textarea",
            required: true,
            placeholder:
                "Brief description of what this R package does and its purpose",
            description:
                "A clear description of what your R package does and its purpose",
        },
        {
            id: "cranPackages",
            label: "Additional CRAN Packages",
            type: "string-list",
            required: false,
            placeholder: "Add CRAN package name...",
            description:
                "Additional CRAN packages to install (e.g., ggplot2, dplyr, tidyr)",
        },
        {
            id: "biocPackages",
            label: "Bioconductor Packages",
            type: "string-list",
            required: false,
            placeholder: "Add Bioconductor package name...",
            description:
                "Bioconductor packages to install (e.g., GenomicRanges, DESeq2)",
        },
        {
            id: "systemPackages",
            label: "System Dependencies",
            type: "packages",
            required: false,
            placeholder: "Add system package name...",
            description:
                "System packages needed for compilation (e.g., libxml2-dev, libcurl4-openssl-dev)",
            packageType: "ubuntu",
        },
        {
            id: "deployBins",
            label: "Deploy Scripts",
            type: "string-list",
            required: false,
            placeholder: "Add script name...",
            description:
                "R scripts or shell scripts that should be available as commands (e.g., run-analysis.R)",
        },
        {
            id: "categories",
            label: "Categories",
            type: "categories",
            required: true,
            description:
                "Select categories that best describe your container",
        },
    ],
    generateRecipe: (
        values: Record<string, string | string[] | object | null>
    ): ContainerRecipe => {
        const githubUrl = String(values.githubUrl || "").trim();
        const rPackageName = String(
            values.rPackageName || extractRPackageName(githubUrl)
        );

        // Parse packages from arrays
        const cranPackages = Array.isArray(values.cranPackages)
            ? values.cranPackages
            : [];
        const biocPackages = Array.isArray(values.biocPackages)
            ? values.biocPackages
            : [];
        const systemPackages = Array.isArray(values.systemPackages)
            ? values.systemPackages
            : [];
        const deployBins = Array.isArray(values.deployBins)
            ? values.deployBins
            : [];

        // Create copyright info from license selection
        const copyright:
            | CopyrightInfo[]
            | [] = values.license ? [values.license as CopyrightInfo] : [];

        // Create directives
        const directives: Directive[] = [];

        // Install system dependencies if any
        if (systemPackages.length > 0) {
            directives.push({
                install: systemPackages,
            });
        }

        // Install R base
        directives.push({
            install: ["r-base", "r-base-dev"],
        });

        // Helper to safely create R string literals within single quotes
        const toRString = (s: string) =>
            `'${String(s).replace(/\\/g, "\\\\").replace(/'/g, "\\'")}'`;

        // Normalize "owner/repo" from the GitHub URL for remotes::install_github
        const ownerRepo = (() => {
            try {
                const u = new URL(githubUrl);
                const parts = u.pathname
                    .replace(/^\/|\/$/g, "")
                    .replace(/\.git$/i, "")
                    .split("/");
                return parts.length >= 2 ? `${parts[0]}/${parts[1]}` : githubUrl;
            } catch {
                return githubUrl
                    .replace(/^https?:\/\/github\.com\//i, "")
                    .replace(/\.git$/i, "")
                    .replace(/\/+$/g, "");
            }
        })();

        // Build consolidated R installation scripts

        const rInstallCommands: string[] = [];

        // Add CRAN packages installation if any (install only missing)
        if (cranPackages.length > 0) {
            const cranPkgsR = cranPackages.map(toRString).join(", ");
            const cranScript = [
                'R --slave -e "',
                "options(repos = c(CRAN = 'https://cloud.r-project.org'));",
                `pkgs <- c(${cranPkgsR});`,
                "mis <- setdiff(pkgs, rownames(installed.packages()));",
                "if (length(mis)) install.packages(mis, dependencies = TRUE);",
                "cat('Installed CRAN packages:\\n');",
                "if (length(pkgs)) cat(paste(pkgs, collapse = ', '), '\\n')",
                '"',
            ].join(" ");
            rInstallCommands.push(cranScript);
        }

        // Add Bioconductor packages installation if any (install only missing)
        if (biocPackages.length > 0) {
            const biocPkgsR = biocPackages.map(toRString).join(", ");
            const biocScript = [
                'R --slave -e "',
                "options(repos = c(CRAN = 'https://cloud.r-project.org'));",
                "if (!requireNamespace('BiocManager', quietly = TRUE)) ",
                "  install.packages('BiocManager');",
                `pkgs <- c(${biocPkgsR});`,
                "mis <- setdiff(pkgs, rownames(installed.packages()));",
                "if (length(mis)) ",
                "  BiocManager::install(mis, ask = FALSE, update = FALSE);",
                "cat('Installed Bioconductor packages:\\n');",
                "if (length(pkgs)) cat(paste(pkgs, collapse = ', '), '\\n')",
                '"',
            ].join(" ");
            rInstallCommands.push(biocScript);
        }

        // Add main package installation from GitHub using remotes (lighter than devtools)
        const mainPackageScript = [
            'R --slave -e "',
            "options(repos = c(CRAN = 'https://cloud.r-project.org'));",
            "if (!requireNamespace('remotes', quietly = TRUE)) ",
            "  install.packages('remotes');",
            `remotes::install_github('${ownerRepo}', `,
            "  dependencies = NA, upgrade = 'never', build_vignettes = FALSE",
            ");",
            `cat('Installed ${rPackageName} from GitHub (', '${ownerRepo}', `,
            ")\\n')",
            '"',
        ].join(" ");
        rInstallCommands.push(mainPackageScript);

        // Add single consolidated run directive if there are any R commands
        if (rInstallCommands.length > 0) {
            directives.push({
                run: rInstallCommands,
            });
        }

        // Add deployment info if scripts are specified
        if (deployBins.length > 0) {
            directives.push({
                deploy: {
                    bins: deployBins,
                },
            });
        }

        // Pre-compute key packages for test
        const keyPackagesR = [...cranPackages, ...biocPackages]
            .map(toRString)
            .join(", ");

        // Add comprehensive test
        directives.push({
            test: {
                name: "verify_r_installation",
                script: [
                    `# Test R installation`,
                    `R --version`,
                    `echo "Testing R package installation..."`,
                    `R --slave -e "`,
                    `  # Check R version`,
                    `  cat('R version:', R.version.string, '\\n')`,
                    `  `,
                    `  # Test main package`,
                    `  tryCatch({`,
                    `    library("${rPackageName}")`,
                    `    cat('Successfully loaded ${rPackageName}\\n')`,
                    `    `,
                    `    # Try to get package info`,
                    `    pkg_info <- packageDescription('${rPackageName}')`,
                    `    if (!is.na(pkg_info)) {`,
                    `      cat('Package version:', pkg_info[['Version']], '\\n')`,
                    `      cat('Package title:', pkg_info[['Title']], '\\n')`,
                    `    }`,
                    `  }, error = function(e) {`,
                    `    cat('Warning: Could not load ${rPackageName}:', `,
                    `        e[['message']], '\\n')`,
                    `    cat('Installed packages:\\n')`,
                    `    print(installed.packages()[,c('Package', 'Version')])`,
                    `  })`,
                    `  `,
                    `  # List key installed packages`,
                    `  key_packages <- c(${keyPackagesR})`,
                    `  if (length(key_packages) > 0) {`,
                    `    cat('Checking additional packages:\\n')`,
                    `    for (pkg in key_packages) {`,
                    `      if (require(pkg, character.only = TRUE, quietly = TRUE)) {`,
                    `        cat('  ✓', pkg, '\\n')`,
                    `      } else {`,
                    `        cat('  ✗', pkg, '(not found)\\n')`,
                    `      }`,
                    `    }`,
                    `  }`,
                    `"`,
                ].join("\n"),
            },
        });

        const structured_readme = {
            description: String(values.description || ""),
            example: "",
            documentation: `This container includes:
- R
- The R package ${rPackageName} from ${githubUrl}
- Additional CRAN packages: ${cranPackages.join(", ") || "none"}
- Additional Bioconductor packages: ${biocPackages.join(", ") || "none"}
- System dependencies: ${systemPackages.join(", ") || "none"}
- Deployed scripts: ${deployBins.join(", ") || "none"}

For detailed package documentation, see: ${githubUrl}`,
            citation: `Please cite the original authors of the ${rPackageName} package when using this container. Repository: ${githubUrl}`,
        };

        const containerName = String(values.containerName || "");
        const version = String(values.version || "");

        return {
            name: containerName,
            version,
            domains: ["neuroimaging"],
            copyright,
            architectures: ["x86_64"] as Architecture[],
            structured_readme,
            readme: convertStructuredReadmeToText(
                structured_readme,
                containerName,
                version
            ),
            build: {
                kind: "neurodocker",
                "base-image": "ubuntu:24.04",
                "pkg-manager": "apt",
                directives,
            },
            categories: Array.isArray(values.categories)
                ? values.categories
                : ["programming"],
        };
    },
};
