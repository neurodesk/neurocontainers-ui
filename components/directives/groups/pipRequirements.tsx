import { DocumentTextIcon } from "@heroicons/react/24/outline";
import { registerGroupEditor } from "../group";
import type { ComponentType } from "react";
import { getHelpSection, textStyles, cn } from "@/lib/styles";

registerGroupEditor("pipRequirements", {
    metadata: {
        key: "pipRequirements",
        label: "Pip Requirements",
        description: "Install Python packages from requirements.txt file",
        icon: DocumentTextIcon,
        color: { light: "bg-blue-50 border-blue-200 hover:bg-blue-100", dark: "bg-blue-900 border-blue-700 hover:bg-blue-800" },
        iconColor: { light: "text-blue-600", dark: "text-blue-400" },
        defaultValue: {
            group: [],
            custom: "pipRequirements",
        },
        keywords: ["pip", "python", "requirements", "packages", "install"],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        component: undefined as unknown as ComponentType<any>, // Will be set by registerGroupEditor
    },
    helpContent(isDark: boolean) {
        return (
            <div className={getHelpSection(isDark).container}>
                <h3 className={getHelpSection(isDark).title}>
                    Pip Requirements Group
                </h3>
                <div className={getHelpSection(isDark).text}>
                    <p>
                        Creates a requirements.txt file and installs Python packages using pip.
                        This group handles file creation and package installation in a single step.
                    </p>
                    <div>
                        <strong>What this creates:</strong>
                        <ul className="list-disc list-inside mt-1 space-y-1">
                            <li>A file directive with your requirements.txt content</li>
                            <li>A run directive to install packages with pip</li>
                            <li>Optional cleanup of the requirements file</li>
                        </ul>
                    </div>
                    <div>
                        <strong>Use cases:</strong>
                        <ul className="list-disc list-inside mt-1 space-y-1">
                            <li>Installing specific versions of Python packages</li>
                            <li>Managing complex dependency lists</li>
                            <li>Reproducible Python environments</li>
                            <li>Installing packages with specific build flags</li>
                        </ul>
                    </div>
                    <div className={cn("border rounded-md p-2", isDark ? "bg-blue-900/40 border-blue-700/50" : "bg-blue-50 border-blue-200")}>
                        <p className={cn(textStyles(isDark, { size: 'xs', weight: 'medium' }), isDark ? "text-blue-200" : "text-blue-800")}>
                            💡 Tip: Each line in requirements should be a valid pip install specification (e.g., numpy==1.21.0, scipy{'>'}=1.7.0)
                        </p>
                    </div>
                </div>
            </div>
        )
    },
    arguments: [
        {
            name: "requirements",
            type: "text",
            required: true,
            defaultValue: "numpy==1.21.0\nscipy>=1.7.0\nmatplotlib",
            description: "Content of the requirements.txt file. Each line should contain a package specification.",
            multiline: true,
        },
        {
            name: "pip_opts",
            type: "text",
            required: false,
            defaultValue: "--no-cache-dir",
            description: "Additional options to pass to pip install command.",
        },
        {
            name: "cleanup",
            type: "boolean",
            required: false,
            defaultValue: true,
            description: "Remove the requirements.txt file after installation to reduce image size.",
        },
        {
            name: "upgrade_pip",
            type: "boolean",
            required: false,
            defaultValue: true,
            description: "Upgrade pip to the latest version before installing packages.",
        },
    ],
    updateDirective({ requirements, pip_opts, cleanup, upgrade_pip }) {
        const installCommands = [];
        
        if (upgrade_pip) {
            installCommands.push("python -m pip install --upgrade pip");
        }
        
        const pipCommand = `python -m pip install ${pip_opts || ""} -r /tmp/requirements.txt`.trim();
        installCommands.push(pipCommand);
        
        if (cleanup) {
            installCommands.push("rm /tmp/requirements.txt");
        }
        
        return {
            group: [
                {
                    file: {
                        name: "requirements.txt",
                        contents: requirements as string,
                    },
                },
                {
                    run: [
                        "cp {{ get_file(\"requirements.txt\") }} /tmp/requirements.txt",
                        ...installCommands,
                    ],
                },
            ],
            custom: "pipRequirements",
        }
    },
})