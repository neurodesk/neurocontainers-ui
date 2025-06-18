import { DocumentDuplicateIcon } from "@heroicons/react/24/outline";
import { registerNeuroDockerTemplate } from "../template";

registerNeuroDockerTemplate({
    metadata: {
        key: "miniconda",
        label: "Miniconda",
        description: "Install Miniconda, a minimal conda installer",
        icon: DocumentDuplicateIcon,
        color: "bg-green-50 border-green-200 hover:bg-green-100",
        iconColor: "text-green-600",
        defaultValue: {
            template: {
                name: "miniconda",
            }
        },
        keywords: ["conda", "miniconda", "python", "environment"],
        component: undefined!, // Will be set by registerNeuroDockerTemplate
    },
    name: "miniconda",
    url: "https://docs.conda.io/projects/miniconda/en/latest/",
    description: "Install Miniconda, a minimal conda installer",
    binaries: {
        arguments: [
            {
                name: "version",
                type: "dropdown",
                required: true,
                options: ["latest"],
                description: "Select the Miniconda version to install"
            },
            {
                name: "install_path",
                type: "text",
                required: true,
                defaultValue: "/opt/miniconda",
                description: "Path where Miniconda will be installed"
            },
            {
                name: "installed",
                type: "boolean",
                required: false,
                defaultValue: false,
                description: "Indicates if Miniconda is already installed",
                advanced: true
            },
            {
                name: "env_name",
                type: "text",
                required: false,
                defaultValue: "base",
                description: "Name of the conda environment to use",
                advanced: true
            },
            {
                name: "env_exists",
                type: "boolean",
                required: false,
                defaultValue: true,
                description: "Indicates if the conda environment already exists",
                advanced: true
            },
            {
                name: "conda_install",
                type: "array",
                required: false,
                description: "Conda packages to install"
            },
            {
                name: "pip_install",
                type: "array",
                required: false,
                description: "Pip packages to install"
            },
            {
                name: "conda_opts",
                type: "text",
                required: false,
                defaultValue: "",
                description: "Additional options for conda installation",
                advanced: true
            },
            {
                name: "pip_opts",
                type: "text",
                required: false,
                defaultValue: "",
                description: "Additional options for pip installation",
                advanced: true
            },
            {
                name: "yaml_file",
                type: "text",
                required: false,
                defaultValue: "",
                multiline: true,
                description: "YAML Contents for conda environment setup",
                advanced: true
            },
            {
                name: "mamba",
                type: "boolean",
                required: false,
                defaultValue: false,
                description: "Use Mamba instead of Conda for faster package management",
                advanced: true
            }
        ]
    },
})