import { DocumentDuplicateIcon } from "@heroicons/react/24/outline";
import { registerNeuroDockerTemplate } from "../template";

registerNeuroDockerTemplate({
    metadata: {
        key: "afni",
        label: "AFNI",
        description: "Analysis of Functional NeuroImages",
        icon: DocumentDuplicateIcon,
        color: { light: "bg-blue-50 border-blue-200 hover:bg-blue-100", dark: "bg-blue-900 border-blue-700 hover:bg-blue-800" },
        iconColor: { light: "text-blue-600", dark: "text-blue-400" },
        defaultValue: {
            template: {
                name: "afni",
            }
        },
        keywords: ["afni", "neuroimaging", "functional", "analysis"],
        component: undefined!, // Will be set by registerNeuroDockerTemplate
    },
    name: "afni",
    url: "https://afni.nimh.nih.gov",
    description: "Analysis of Functional NeuroImages - comprehensive suite of analysis tools for FMRI, structural MRI, and other brain imaging data",
    binaries: {
        arguments: [
            {
                name: "version",
                type: "dropdown",
                required: false,
                defaultValue: "latest",
                options: ["latest"],
                description: "AFNI version to install"
            },
            {
                name: "install_path",
                type: "text",
                required: false,
                defaultValue: "/opt/afni-{{ self.version }}",
                description: "Path where AFNI will be installed",
                advanced: true
            },
            {
                name: "install_r_pkgs",
                type: "boolean",
                required: false,
                defaultValue: false,
                description: "Install R packages",
                advanced: true
            },
            {
                name: "install_python3",
                type: "boolean",
                required: false,
                defaultValue: false,
                description: "Install Python 3",
                advanced: true
            }
        ]
    },
    source: {
        arguments: [
            {
                name: "version",
                type: "text",
                required: true,
                description: "AFNI version to build from source"
            },
            {
                name: "repo",
                type: "text",
                required: false,
                defaultValue: "https://github.com/afni/afni.git",
                description: "Repository URL",
                advanced: true
            },
            {
                name: "install_path",
                type: "text",
                required: false,
                defaultValue: "/opt/afni-{{ self.version }}",
                description: "Path where AFNI will be installed",
                advanced: true
            },
            {
                name: "install_r_pkgs",
                type: "boolean",
                required: false,
                defaultValue: false,
                description: "Install R packages",
                advanced: true
            },
            {
                name: "install_python3",
                type: "boolean",
                required: false,
                defaultValue: false,
                description: "Install Python 3",
                advanced: true
            }
        ]
    }
});