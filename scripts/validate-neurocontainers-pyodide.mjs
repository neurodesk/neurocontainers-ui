#!/usr/bin/env node

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { performance } from "node:perf_hooks";
import yaml from "js-yaml";
import { loadPyodide } from "pyodide";

const NEUROCONTAINERS_REPO_URL = "https://github.com/neurodesk/neurocontainers.git";

function parseArgs(argv) {
    const options = {
        repo: null,
        clone: false,
        clonePath: null,
        ref: "main",
        limit: null,
        failFast: false,
    };

    for (let index = 0; index < argv.length; index += 1) {
        const arg = argv[index];

        if (arg === "--repo") {
            options.repo = argv[index + 1] ? path.resolve(argv[index + 1]) : null;
            index += 1;
            continue;
        }

        if (arg === "--clone") {
            options.clone = true;
            const next = argv[index + 1];
            if (next && !next.startsWith("--")) {
                options.clonePath = path.resolve(next);
                index += 1;
            }
            continue;
        }

        if (arg === "--ref") {
            options.ref = argv[index + 1] || options.ref;
            index += 1;
            continue;
        }

        if (arg === "--limit") {
            const value = Number.parseInt(argv[index + 1] || "", 10);
            if (!Number.isNaN(value) && value > 0) {
                options.limit = value;
            }
            index += 1;
            continue;
        }

        if (arg === "--fail-fast") {
            options.failFast = true;
            continue;
        }

        throw new Error(`Unknown argument: ${arg}`);
    }

    return options;
}

function ensureDirExists(dirPath) {
    fs.mkdirSync(dirPath, { recursive: true });
}

function cloneRepo(targetPath, ref) {
    const cloneTarget = targetPath || fs.mkdtempSync(path.join(os.tmpdir(), "neurocontainers-"));
    if (!targetPath) {
        console.log(`Cloning NeuroContainers into temporary directory ${cloneTarget}`);
    }
    ensureDirExists(path.dirname(cloneTarget));

    const args = ["clone", "--depth", "1", "--branch", ref, NEUROCONTAINERS_REPO_URL, cloneTarget];
    const result = spawnSync("git", args, { stdio: "inherit" });
    if (result.status !== 0) {
        throw new Error(`git clone failed with exit code ${result.status}`);
    }

    return cloneTarget;
}

function resolveRepoPath(options) {
    if (options.clone) {
        return {
            repoPath: cloneRepo(options.clonePath, options.ref),
            temporary: !options.clonePath,
        };
    }

    if (options.repo) {
        return { repoPath: options.repo, temporary: false };
    }

    const fallback = path.resolve(process.cwd(), "..", "NeuroContainers");
    if (fs.existsSync(fallback)) {
        return { repoPath: fallback, temporary: false };
    }

    return {
        repoPath: cloneRepo(options.clonePath, options.ref),
        temporary: !options.clonePath,
    };
}

function validateRepoStructure(repoPath) {
    const requiredPaths = [
        path.join(repoPath, "recipes"),
        path.join(repoPath, "builder", "recipe.py"),
        path.join(repoPath, "builder", "dockerfile.py"),
        path.join(repoPath, "macros", "openrecon", "neurodocker.yaml"),
    ];

    for (const requiredPath of requiredPaths) {
        if (!fs.existsSync(requiredPath)) {
            throw new Error(`Required path missing from NeuroContainers checkout: ${requiredPath}`);
        }
    }
}

function getRecipeDirectories(repoPath, limit) {
    const recipesRoot = path.join(repoPath, "recipes");
    const recipeDirs = fs.readdirSync(recipesRoot, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => ({
            name: entry.name,
            dir: path.join(recipesRoot, entry.name),
            buildYaml: path.join(recipesRoot, entry.name, "build.yaml"),
        }))
        .filter((entry) => fs.existsSync(entry.buildYaml))
        .sort((a, b) => a.name.localeCompare(b.name));

    return limit ? recipeDirs.slice(0, limit) : recipeDirs;
}

function writeFileToPyodide(pyodide, targetPath, content) {
    const fsApi = pyodide.FS;
    const directory = path.posix.dirname(targetPath);
    if (directory && directory !== ".") {
        fsApi.mkdirTree(directory);
    }
    fsApi.writeFile(targetPath, content);
}

function copyHostDirectoryToPyodide(pyodide, sourceDir, targetDir) {
    const entries = fs.readdirSync(sourceDir, { withFileTypes: true });
    pyodide.FS.mkdirTree(targetDir);

    for (const entry of entries) {
        const sourcePath = path.join(sourceDir, entry.name);
        const targetPath = path.posix.join(targetDir, entry.name);

        if (entry.isDirectory()) {
            copyHostDirectoryToPyodide(pyodide, sourcePath, targetPath);
            continue;
        }

        if (entry.isFile()) {
            writeFileToPyodide(pyodide, targetPath, fs.readFileSync(sourcePath));
        }
    }
}

async function createPyodideBuilder(repoPath) {
    const pyodide = await loadPyodide();
    await pyodide.loadPackage(["pyyaml", "jinja2", "attrs", "requests", "packaging", "lzma"]);

    pyodide.runPython(`
import os
import shutil
import sys

os.environ["NEURODOCKER_AUTO_UPGRADE"] = "0"
if not hasattr(os, "link"):
    def _pyodide_link(source, destination):
        shutil.copy2(source, destination)
    os.link = _pyodide_link

os.makedirs("/repo", exist_ok=True)
os.makedirs("/tmp", exist_ok=True)
os.makedirs("builder", exist_ok=True)

if "" not in sys.path:
    sys.path.insert(0, "")
`);

    copyHostDirectoryToPyodide(
        pyodide,
        path.join(repoPath, "builder"),
        `${pyodide.FS.cwd()}/builder`,
    );
    copyHostDirectoryToPyodide(
        pyodide,
        path.join(repoPath, "macros"),
        "/repo/macros",
    );

    pyodide.runPython(`
import contextlib
import io
import traceback
from pathlib import Path
from builder.recipe import compile_recipe, load_recipe
from builder.dockerfile import render_dockerfile
from builder.variants import concrete_variant_specs

def run_compile_recipe_with_output():
    output = io.StringIO()
    try:
        with contextlib.redirect_stdout(output), contextlib.redirect_stderr(output):
            spec = concrete_variant_specs(load_recipe(Path("/recipe")))[0]
            compiled = compile_recipe(
                Path("/recipe"),
                architecture=spec["architecture"],
                variant=spec["variant"],
                include_dirs=(Path("/repo"),),
                parallel_jobs=4,
            )
            result = render_dockerfile(compiled.definition)
        return {
            "result": result,
            "output": output.getvalue(),
            "error": None,
        }
    except Exception:
        return {
            "result": None,
            "output": output.getvalue(),
            "error": traceback.format_exc(),
        }
`);

    const pyCompileRecipe = pyodide.globals.get("run_compile_recipe_with_output");
    return { pyodide, pyCompileRecipe };
}

function resetRecipeDirectory(pyodide) {
    pyodide.runPython(`
import os
import shutil

shutil.rmtree("/recipe", ignore_errors=True)
os.makedirs("/recipe", exist_ok=True)
`);
}

function sanitizeRecipeDescription(recipeDescription) {
    const sanitized = structuredClone(recipeDescription);

    if (sanitized.version !== undefined && typeof sanitized.version !== "string") {
        sanitized.version = String(sanitized.version);
    }

    if (!sanitized.readme && typeof sanitized.readme_url === "string" && sanitized.readme_url.length > 0) {
        sanitized.readme = [
            "----------------------------------",
            `## ${sanitized.name}/${sanitized.version ?? "latest"} ##`,
            "",
            `External README URL: ${sanitized.readme_url}`,
            "",
            "README fetching is disabled during Pyodide validation.",
            "",
            "----------------------------------",
        ].join("\n");
        delete sanitized.readme_url;
    }

    return sanitized;
}

function normalizeCapturedOutput(output) {
    return output
        .split(/\r?\n/)
        .map((line) => line.trimEnd())
        .filter((line) => line.trim().length > 0)
        .filter((line) => !line.includes("neurodocker not available, skipping Dockerfile generation"))
        .filter((line) => line.trim() !== "Recipe validation completed (Dockerfile generation skipped)")
        .filter((line) => line.trim() !== "Recipe validation was successful")
        .filter((line) => !line.includes("Dockerfile generated successfully at"));
}

function validateSingleRecipe(pyodide, pyCompileRecipe, recipeEntry) {
    resetRecipeDirectory(pyodide);
    copyHostDirectoryToPyodide(pyodide, recipeEntry.dir, "/recipe");

    const recipeDescription = sanitizeRecipeDescription(
        yaml.load(fs.readFileSync(recipeEntry.buildYaml, "utf8")),
    );
    if (!recipeDescription || typeof recipeDescription !== "object") {
        throw new Error("build.yaml did not parse into an object");
    }

    writeFileToPyodide(pyodide, "/recipe/build.yaml", yaml.dump(recipeDescription));
    let wrapped = null;

    try {
        wrapped = pyCompileRecipe();

        const error = wrapped.get("error");
        const output = String(wrapped.get("output") || "");
        const result = wrapped.get("result");

        if (error) {
            const renderedError = String(error);
            const filteredOutput = normalizeCapturedOutput(output);
            throw new Error(
                filteredOutput.length > 0
                    ? `${filteredOutput.join("\n")}\n${renderedError}`.trim()
                    : renderedError,
            );
        }

        if (typeof result !== "string" || !result.trim()) {
            throw new Error("validation did not produce a Dockerfile");
        }

        return {
            notes: normalizeCapturedOutput(output),
        };
    } finally {
        wrapped?.destroy?.();
    }
}

async function main() {
    const startedAt = performance.now();
    const options = parseArgs(process.argv.slice(2));
    const { repoPath, temporary } = resolveRepoPath(options);

    try {
        validateRepoStructure(repoPath);
        const allRecipeDirs = fs.readdirSync(path.join(repoPath, "recipes"), { withFileTypes: true })
            .filter((entry) => entry.isDirectory())
            .map((entry) => entry.name)
            .sort();
        const recipeDirs = getRecipeDirectories(repoPath, options.limit);

        console.log(`Using NeuroContainers repo: ${repoPath}`);
        console.log(`Found ${recipeDirs.length} recipes with build.yaml`);
        console.log(`Skipped ${allRecipeDirs.length - recipeDirs.length} recipe directories without build.yaml`);

        const { pyodide, pyCompileRecipe } = await createPyodideBuilder(repoPath);
        const failures = [];

        for (const [index, recipeEntry] of recipeDirs.entries()) {
            const label = `[${index + 1}/${recipeDirs.length}] ${recipeEntry.name}`;
            const recipeStartedAt = performance.now();
            process.stdout.write(`${label} ... `);

            try {
                const validation = validateSingleRecipe(pyodide, pyCompileRecipe, recipeEntry);
                const seconds = ((performance.now() - recipeStartedAt) / 1000).toFixed(1);
                console.log(`ok (${seconds}s)`);
                for (const note of validation.notes) {
                    console.log(`  ${note.trim()}`);
                }
            } catch (error) {
                const message = error instanceof Error ? error.message : String(error);
                console.log("failed");
                console.error(`${label} failed: ${message}`);
                failures.push({ name: recipeEntry.name, message });
                if (options.failFast) {
                    break;
                }
            }
        }

        pyCompileRecipe.destroy?.();

        const totalSeconds = ((performance.now() - startedAt) / 1000).toFixed(1);
        if (failures.length > 0) {
            console.error(`Pyodide validation failed for ${failures.length} recipe(s) after ${totalSeconds}s`);
            for (const failure of failures) {
                console.error(`- ${failure.name}: ${failure.message}`);
            }
            process.exitCode = 1;
            return;
        }

        console.log(`Validated ${recipeDirs.length} recipe(s) successfully in ${totalSeconds}s`);
    } finally {
        if (temporary) {
            fs.rmSync(repoPath, { recursive: true, force: true });
        }
    }
}

await main();
