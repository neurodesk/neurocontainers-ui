import { DocumentDuplicateIcon } from "@heroicons/react/24/outline";
import { registerNeuroDockerTemplate } from "../template";

registerNeuroDockerTemplate({
    metadata: {
        key: "cat12",
        label: "CAT12",
        description: "Computational Anatomy Toolbox",
        icon: DocumentDuplicateIcon,
        color: { light: "bg-orange-50 border-orange-200 hover:bg-orange-100", dark: "bg-orange-900 border-orange-700 hover:bg-orange-800" },
        iconColor: { light: "text-orange-600", dark: "text-orange-400" },
        defaultValue: {
            template: {
                name: "cat12",
            }
        },
        keywords: ["cat12", "anatomy", "spm", "segmentation"],
        component: undefined!, // Will be set by registerNeuroDockerTemplate
    },
    name: "cat12",
    url: "https://neuro-jena.github.io/cat/",
    description: "Computational Anatomy Toolbox for SPM - structural brain MRI processing",
    binaries: {
        arguments: [
            {
                name: "version",
                type: "dropdown",
                required: true,
                options: ["12.9_R2023b", "r1933_R2017b", "r2166_R2017b"],
                description: "CAT12 version to install"
            },
            {
                name: "install_path",
                type: "text",
                required: false,
                defaultValue: "/opt/CAT12-{{ self.version }}",
                description: "Path where CAT12 will be installed",
                advanced: true
            }
        ]
    }
});