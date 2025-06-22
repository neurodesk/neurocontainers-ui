import { DocumentDuplicateIcon } from "@heroicons/react/24/outline";
import { registerNeuroDockerTemplate } from "../template";

registerNeuroDockerTemplate({
    metadata: {
        key: "mrtrix3",
        label: "MRtrix3",
        description: "Diffusion MRI analysis package",
        icon: DocumentDuplicateIcon,
        color: { light: "bg-violet-50 border-violet-200 hover:bg-violet-100", dark: "bg-violet-900 border-violet-700 hover:bg-violet-800" },
        iconColor: { light: "text-violet-600", dark: "text-violet-400" },
        defaultValue: {
            template: {
                name: "mrtrix3",
            }
        },
        keywords: ["mrtrix3", "diffusion", "mri", "tractography"],
        component: undefined!, // Will be set by registerNeuroDockerTemplate
    },
    name: "mrtrix3",
    url: "https://www.mrtrix.org/",
    description: "Advanced tools for the analysis of diffusion MRI data",
    binaries: {
        arguments: [
            {
                name: "version",
                type: "dropdown",
                required: true,
                options: ["3.0.4", "3.0.3", "3.0.2", "3.0.1", "3.0.0"],
                description: "MRtrix3 version to install"
            },
            {
                name: "install_path",
                type: "text",
                required: false,
                defaultValue: "/opt/mrtrix3-{{ self.version }}",
                description: "Path where MRtrix3 will be installed",
                advanced: true
            },
            {
                name: "build_processes",
                type: "text",
                required: false,
                defaultValue: "1",
                description: "Number of build processes",
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
                description: "MRtrix3 version to build from source"
            },
            {
                name: "repo",
                type: "text",
                required: false,
                defaultValue: "https://github.com/MRtrix3/mrtrix3.git",
                description: "Repository URL",
                advanced: true
            },
            {
                name: "install_path",
                type: "text",
                required: false,
                defaultValue: "/opt/mrtrix3-{{ self.version }}",
                description: "Path where MRtrix3 will be installed",
                advanced: true
            },
            {
                name: "build_processes",
                type: "text",
                required: false,
                defaultValue: "1",
                description: "Number of build processes",
                advanced: true
            }
        ]
    }
});