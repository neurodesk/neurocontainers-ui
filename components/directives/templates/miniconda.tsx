import { DocumentDuplicateIcon } from "@heroicons/react/24/outline";
import { registerNeuroDockerTemplate } from "../template";

registerNeuroDockerTemplate({
    metadata: {
        key: "miniconda",
        label: "Miniconda",
        description: "Install Miniconda, a minimal conda installer",
        icon: DocumentDuplicateIcon,
        color: { light: "bg-green-50 border-green-200 hover:bg-green-100", dark: "bg-green-900 border-green-700 hover:bg-green-800" },
        iconColor: { light: "text-green-600", dark: "text-green-400" },
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
                options: [
                    "latest",
                    "25.5.1-0",
                    "25.3.1-1",
                    "25.1.1-2",
                    "25.1.1-1",
                    "25.1.1-0",
                    "24.11.1-0",
                    "24.9.2-0",
                    "24.7.1-0",
                    "24.5.0-0",
                    "24.4.0-0",
                    "24.3.0-0",
                    "24.1.2-0",
                    "23.11.0-2",
                    "23.11.0-1",
                    "23.10.0-1",
                    "23.9.0-0",
                    "23.5.2-0",
                    "23.5.1-0",
                    "23.5.0-3",
                    "23.3.1-0",
                    "23.1.0-1",
                    "22.11.1-1",
                    "4.12.0",
                    "4.11.0",
                    "4.10.3",
                    "4.10.1",
                    "4.9.2",
                    "4.8.3",
                    "4.8.2",
                    "4.7.12.1",
                    "4.7.12",
                    "4.7.10",
                    "4.6.14",
                    "4.5.12",
                    "4.5.11",
                    "4.5.4",
                    "4.5.1",
                    "4.4.10",
                    "4.3.31",
                    "4.3.30.2",
                    "4.3.30.1",
                    "4.3.30",
                    "4.3.27.1",
                    "4.3.27",
                    "4.3.21",
                    "4.3.14",
                    "4.3.11",
                    "4.2.12",
                    "4.2.11",
                    "4.1.11",
                    "4.0.5",
                    "3.19.0",
                    "3.18.9",
                    "3.18.8",
                    "3.18.3",
                    "3.16.0",
                    "3.10.1",
                    "3.9.1",
                    "3.8.3",
                    "3.7.3",
                    "3.7.0",
                    "3.6.0",
                    "3.5.5",
                    "3.5.2",
                    "3.4.2",
                    "3.3.0",
                    "3.0.5",
                    "3.0.4",
                    "3.0.0",
                    "2.2.8",
                    "2.2.2"
                ],
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